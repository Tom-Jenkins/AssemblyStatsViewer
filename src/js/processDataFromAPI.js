// =============================== //
//
// Process Data From NCBI API
//
// =============================== //

// Empty busco object
const emptyBusco = {
    busco_lineage: "",
    busco_ver: "",
    complete: "-",
    single_copy: "-",
    duplicated: "-",
    fragmented: "-",
    missing: "-",
    total_count: "-",
};

// ------------------- //
// Function: get user input text from UI and return an array
// ------------------- //
export function formatUserInput(element) {

    // Extract user text
    const userText = element.value;

    // Convert xxxx\nyyyy\nzzzz format to an array
    const userArray = userText.split("\n");

    // Return array
    return userArray;
};

// ------------------- //
// Function: input is an array of objects [{accession: accession, ...}, {accession: accession, ...},]
// ------------------- //
export function processDataFromAPI(stats) {

    // Store summary statistics
    let accession = stats.map(report => report.accession);
    let speciesName = stats.map(report => report.organism.organism_name);
    let assemblyType = stats.map(report => report.assembly_info.assembly_type);
    let assemblyLevel = stats.map(report => report.assembly_info.assembly_level);
    let coverage = stats
        .map(report => report.assembly_stats.genome_coverage)
        .map(num => num !== undefined ? parseInt(num) : num);
    let gc = stats.map(report => report.assembly_stats.gc_percent);
    let contigCount = stats.map(report => report.assembly_stats.number_of_contigs);
    let contigN50 = stats.map(report => report.assembly_stats.contig_n50);
    let contigL50 = stats.map(report => report.assembly_stats.contig_l50);
    let scaffoldCount = stats.map(report => report.assembly_stats.number_of_scaffolds);
    let scaffoldN50 = stats.map(report => report.assembly_stats.scaffold_n50);
    let scaffoldL50 = stats.map(report => report.assembly_stats.scaffold_l50);
    let totalLength = stats.map(report => report.assembly_stats.total_sequence_length);
    let ungappedLength = stats.map(report => report.assembly_stats.total_ungapped_length);
    // console.log(coverage)

    // Store busco results if available
    const busco = stats.map(report => {

        // If busco exist, extract the object and store in the busco array
        if (report.annotation_info && report.annotation_info.busco) {
            return report.annotation_info.busco;
        // If it does not exist, return the empty busco object
        } else {
            return emptyBusco;
        }
    });
    // console.log(busco)

    // Declare empty object to store all data
    let masterObj = {};

    // Add data to master object containing data for all assembly IDs
    for (let i = 0; i < stats.length; i++) {
        masterObj[accession[i]] = {
            accession: accession[i],
            speciesName: speciesName[i],
            assemblyType: assemblyType[i],
            assemblyLevel: assemblyLevel[i],
            coverage: coverage[i],
            gc: gc[i],
            contigCount: contigCount[i],
            contigN50: contigN50[i],
            contigL50: contigL50[i],
            scaffoldCount: scaffoldCount[i],
            scaffoldN50: scaffoldN50[i],
            scaffoldL50: scaffoldL50[i],
            totalLength: totalLength[i],
            ungappedLength: ungappedLength[i],
            busco: busco[i],
        };
    };
    // console.log(masterObj);

    // Return master object
    // Output is an object with the following structure:
    // {assembly1, {statA: value, statB: value, statC: value}}
    // {assembly2, {statA: value, statB: value, statC: value}}
    return masterObj;
};
