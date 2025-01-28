// =============================== //
//
// Render Assembly Comparison Table
//
// =============================== //

// Import JS from modules
import { TabulatorFull as Tabulator } from "tabulator-tables";

// Declare Tabulator variable
export let assemblyTable;

// ------------------- //
// Main function: input is an assembly stats object {assembly1, {statA: value, statB: value, statC: value}}
// ------------------- //
export function renderTable(stats) {

    // Render Tabulator table
    assemblyTable = new Tabulator("#assembly-stats-table", {
        data: Object.values(stats),
        selectableRows: false,
        layout: "fitDataTable",
        movableColumns: true,
        columns: [
            // {title:"Assembly ID", field:"assemblyName"},
            // {title: "#", field:"", formatter:"rownum"},
            {title:"Accession", field:"accession", formatter: addAccessionHyperlinks, resizable: false},
            {title:"Species", field:"speciesName", resizable: false},
            {title:"Level", field:"assemblyLevel", resizable: false},
            {title:"Contig N50", field:"contigN50", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Contig L50", field:"contigL50", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Contig Count", field:"contigCount", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Total Length", field:"totalLength", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"GC %", field:"gc", hozAlign:"right", sorter:"number", resizable: false},
            {title:"Coverage", field:"coverage", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Scaffold N50", field:"scaffoldN50", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Scaffold L50", field:"scaffoldL50", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},
            {title:"Scaffold Count", field:"scaffoldCount", hozAlign:"right", formatter: formatNumberWithCommas, sorter:"number", resizable: false},  
        ],
        initialSort:[
            {column:"assemblyLevel", dir:"asc"},
            {column:"speciesName", dir:"asc"},
        ],
        clipboard: true,
    });

    // Activate clipboard and download buttons
    document.getElementById("clipboard-button").classList.remove("hidden");
    document.getElementById("download-button").classList.remove("hidden");
    document.getElementById("highlight-button").classList.remove("hidden");
};


// ------------------- //
// Function: highlight 'best' value for each statistic on table
// ------------------- //
export function highlightValue(cell) {

    // Get column object and column heading of cell
    const column = cell.getColumn();
    const columnHeading = cell.getField();

    // Highest value: N50 and coverage
    if (columnHeading === "contigN50" || columnHeading === "coverage" || columnHeading === "scaffoldN50") {

        // Check if the cell value is the highest in its column
        const highestValue = column.getCells().reduce(function (acc, cell) {
            const cellValue = parseInt(cell.getValue());
            return cellValue > acc ? cellValue : acc;
        }, Number.NEGATIVE_INFINITY);
        
        // Apply a CSS class if the cell value is the highest in its column
        column.getCells().forEach(function (cell) {
            const cellValue = parseInt(cell.getValue());
            if (cellValue === highestValue) {
                cell.getElement().classList.add("table-highlight");
            } else {
                cell.getElement().classList.remove("table-highlight");
            }
        });
    };

    // Lowest value: L50, contig count and scaffold count
    if (columnHeading === "contigL50" || columnHeading === "contigCount" || columnHeading === "scaffoldL50" || columnHeading === "scaffoldCount") {

        // Check if the cell value is the lowest in its column
        const lowestValue = column.getCells().reduce(function (acc, cell) {
            const cellValue = parseInt(cell.getValue());
            return cellValue < acc ? cellValue : acc;
        }, Number.POSITIVE_INFINITY);
        
        // Apply a CSS class if the cell value is the lowest in its column
        column.getCells().forEach(function (cell) {
            const cellValue = parseInt(cell.getValue());
            if (cellValue === lowestValue) {
                cell.getElement().classList.add("table-highlight");
            } else {
                cell.getElement().classList.remove("table-highlight");
            }
        });
    };

    // Return the value of the cell
    return formatNumberWithCommas(cell);
};


// ------------------- //
// Function: format larger numbers with commas
// ------------------- //
function formatNumberWithCommas(cell) {

    // Get value and column heading of cell
    const value = cell.getValue();
    const columnHeading = cell.getField();

    // Do this for coverage column
    if (columnHeading === "coverage") {

        // If undefined, convert value to n/a
        return value === undefined ? "n/a" : value;
    };

    // Do this for everthing else
    if (columnHeading !== "coverage") {

        // If not undefined, convert to a number then use toLocaleString() to format the number with commas
        return value !== undefined ? parseInt(value).toLocaleString() : "n/a";
    };
};


// ------------------- //
// Function: add hyperlinks to accession numbers
// ------------------- //
function addAccessionHyperlinks(cell) {

    // Get the cell value
    let accession = cell.getValue();
    // console.log(accession);

    // Return a hyperlink for each cell
    return `<a target="_blank" href="https://www.ncbi.nlm.nih.gov/datasets/genome/${accession}">${accession}</a>`;
};
