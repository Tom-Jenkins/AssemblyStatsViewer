// =============================== //
//
// Main JavaScript Script
//
// =============================== //

// Import JS from modules
import * as bootstrap from "bootstrap";
import { formatUserInput, processDataFromAPI } from "./processDataFromAPI";
import { renderTable, assemblyTable, highlightValue, formatNumberWithCommas } from "./renderTable";
import { renderBusco, echartsPlot } from "./renderBusco";

// ------------------- //
// Main Function
// ------------------- //

// API parameters
// https://www.ncbi.nlm.nih.gov/datasets/docs/v2/reference-docs/rest-api/#get-/genome/accession/-accessions-/dataset_report
const api = "dataset_report";
const version = "v2alpha";
const filters = "filters.reference_only=true&filters.assembly_source=all&filters.has_annotation=false&filters.exclude_paired_reports=true&filters.exclude_atypical=false&filters.assembly_version=current&filters.assembly_level=chromosome&filters.assembly_level=contig&filters.assembly_level=scaffold&filters.assembly_level=complete_genome";

// Fetch assembly stats from NCBI API using esearch and esummary
async function fetchAssemblyStats() {

    try {
        // Declare variable(s)
        let numTaxonReportsToFetch, finalReportsArray, accessionResponse, accessionResults, taxonResponse, taxonResults;
        let numAccessionReports = 0;
        let numTaxonReports = 0;
        const accessionSearchBox = document.getElementById("accession-search-box");
        const taxonSearchBox = document.getElementById("taxon-search-box");

        // Maximum number of reports to return
        let returnMax = 20; // NCBI API default = 20 

        // Activate loading spinner
        document.getElementById("show-results-button").insertAdjacentHTML("beforeend", `
            <div id="spinner" class="spinner-border text-primary" role="status"></div>
        `);

        // Hide any warning messages on UI
        document.getElementById("assembly-warning-message").classList.add("hidden");
        document.getElementById("api-warning-message").classList.add("hidden");
        document.getElementById("top20-warning-message").classList.add("hidden");

        // Hide clipboard, download and highlight buttons
        document.getElementById("clipboard-button").classList.add("hidden");
        document.getElementById("download-button").classList.add("hidden");
        document.getElementById("highlight-button").classList.add("hidden");


        // 1. Accession: Fetch information from NCBI Datasets v2 REST API
        if (accessionSearchBox.value !== "") {

            // Format user input from UI
            // Output is a string in the format: xxxx%2Cyyyy%2Czzzz
            const accessionQuery = formatUserInput(accessionSearchBox).join("%2C");

            // API fetch request
            const accessionUrl = `https://api.ncbi.nlm.nih.gov/datasets/${version}/genome/accession/${accessionQuery}/${api}?${filters}&page_size=${returnMax}`;
            accessionResponse = await fetch(accessionUrl);
            // console.log(accessionResponse);
            if (!accessionResponse.ok) throw new Error(`Error in API response: ${accessionResponse.statusText}`);
            accessionResults = await accessionResponse.json();
            // console.log(accessionResults);

            // Get the total number of reports found using accession query
            numAccessionReports = accessionResults.total_count;
        };        

        
        // 2. Taxon: Fetch information from NCBI Datasets v2 REST API
        // Only execute when taxon text box is not empty and when the number of accession reports is less than 20.
        if (taxonSearchBox.value !== "" && numAccessionReports < 20) {
            
            // Format user input from UI
            // Output is a string in the format: xxxx%2Cyyyy%2Czzzz
            const taxonQuery = formatUserInput(taxonSearchBox).join("%2C");

            // Subtract the number of accession reports by the return max variable
            numTaxonReportsToFetch = returnMax - numAccessionReports;
            // console.log(numTaxonReportsToFetch);

            // API fetch request
            const taxonUrl = `https://api.ncbi.nlm.nih.gov/datasets/${version}/genome/taxon/${taxonQuery}/${api}?${filters}&page_size=${numTaxonReportsToFetch}`;
            taxonResponse = await fetch(taxonUrl);
            // console.log(taxonResponse);
            if (!taxonResponse.ok) throw new Error(`Error in API response: ${taxonResponse.statusText}`);
            taxonResults = await taxonResponse.json();
            // console.log(taxonResults);

            // Get the total number of reports found using taxon query
            numTaxonReports = taxonResults.total_count;            
        };


        // If the user enters valid accession and taxon queries, combine results
        if (accessionSearchBox.value !== "" && accessionResponse.ok && taxonSearchBox.value !== "" && taxonResponse.ok) {
            finalReportsArray = accessionResults.reports.concat(taxonResults.reports);
        };

        // If the user enters only an valid accession query
        if (accessionSearchBox.value !== "" && accessionResponse.ok && taxonSearchBox.value === "") {
            finalReportsArray = accessionResults.reports;
        };

        // If the user enters only an valid taxon query        
        if (taxonSearchBox.value !== "" && taxonResponse.ok && accessionSearchBox.value === "") {
            finalReportsArray = taxonResults.reports;
        };
        // console.log(finalReportsArray);
    

        // 4. Process results object and extract assembly stats information
        const assemblyStats = processDataFromAPI(finalReportsArray);
        // console.log(assemblyStats);


        // Deactivate loading spinner
        document.getElementById("spinner").remove();

        // Activate warning message on UI if more than 20 reports are found
        if ((numAccessionReports+numTaxonReports) > 20) document.getElementById("top20-warning-message").classList.remove("hidden");


        // 5. Render tabulator table to UI
        renderTable(assemblyStats);

        // 6. Render BUSCO barchart to UI
        renderBusco(assemblyStats);

    } catch(err) {
        console.error(err);

        // Deactivate loading spinner
        document.getElementById("spinner").remove();

        // Activate API warning message on UI
        document.getElementById("api-warning-message").classList.remove("hidden");
    }
};


// ------------------- //
// Event Handling
// ------------------- //

// Select elements from DOM
const showResultsButton = document.getElementById("show-results-button");
const downloadButton = document.getElementById("download-button");
const clipboardButton = document.getElementById("clipboard-button");
const highlightButton = document.getElementById("highlight-button");

// Execute searchAssemblyIDs() function on click of button
showResultsButton.addEventListener("click", (e) => {
    e.preventDefault();

    // Check that text area is not empty, then execute function
    const accessionText = document.getElementById("accession-search-box").value;
    const taxonText = document.getElementById("taxon-search-box").value;
    if (accessionText !== "" ||  taxonText !== "") fetchAssemblyStats();
});

// Download table on click of button
downloadButton.addEventListener("click", (e) => {
    e.preventDefault();
    assemblyTable.download("csv", "assemblytable.csv");
});

// Copy table to clipboard on click of button
clipboardButton.addEventListener("click", (e) => {
    e.preventDefault();
    assemblyTable.copyToClipboard("all");
})

// Highlight 'best' values for each statistic on click of button
highlightButton.addEventListener("click", (e) => {
    e.preventDefault();

    // Select element from DOM
    const assemblyTableElement = document.getElementById("assembly-stats-table");

    // Columns to highlight
    const columns = ["contigN50", "contigL50", "contigCount", "coverage", "scaffoldN50", "scaffoldL50", "scaffoldCount"];

    // Check if any of its children have the table-highlight class
    const isClassInChildren = Array
        .from(assemblyTableElement.querySelectorAll("*"))
        .some(child => child.classList.contains("table-highlight"));

    // Activate table highlight if false
    if (!isClassInChildren) {

        // Use a loop to highlight value for each stat
        for (let i = 0; i < columns.length; i++) {
            assemblyTable.updateColumnDefinition(columns[i], {
                formatter: highlightValue,
            })
        };
    };
    
    // Deactivate table highlight if true
    if (isClassInChildren) {

        // Get all child elements of the parent
        const childElements = assemblyTableElement.querySelectorAll("*");

        // Remove the table-highlight class from all children
        childElements.forEach(function (child) {
            child.classList.remove("table-highlight");
        });
    };   
});

// Resize ECharts plot when screen size changes
window.onresize = function() {

    // Select element from DOM
    const buscoBarchart = document.getElementById("busco-barchart");

    // Execute only when a busco barchart has been rendered
    if (buscoBarchart.textContent !== "") echartsPlot.resize();
};
