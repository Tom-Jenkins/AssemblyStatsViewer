// =============================== //
//
// Render BUSCO Barchart
//
// =============================== //

// Import JS from modules
import * as echarts from "echarts";

// Initiate echarts variable
export let echartsPlot;

// Function to convert busco proportions to integer counts
function prop2counts(total, proportion) {
    const count = (total * proportion).toFixed(0);
    return count;
};

// Array of busco categories
const buscoCategories = ["Complete", "Duplicated", "Fragmented", "Missing"];

// ------------------- //
// Main function: input is an assembly stats object
// ------------------- //
export function renderBusco(stats) {

    // Extract busco objects and store as an array
    const buscos = Object.values(stats).map(id => id.busco);
    // console.log(buscos);

    // Get other data from stats object
    const assemblyAccessions = Object.values(stats).map(id => id.accession);
    const speciesNames = Object.values(stats).map(id => id.speciesName);
    // console.log(speciesNames);

    // Get other data from busco array
    const lineage = buscos.map(id => id.busco_lineage);
    const version = buscos.map(id => id.busco_ver);
    const count = buscos.map(id => id.total_count);
    // console.log(count);

    // Get total number of BUSCOs across all busco objects
    const buscoTotal = Math.max(...buscos.map(x => x.total_count).filter(x => parseInt(x))); // extract then filter only numbers
    // console.log(buscoTotal);
    
    // Array containing BUSCO values for each category
    const buscoSingleCopy = buscos.map(x => prop2counts(x.total_count, x.single_copy));
    const buscoDuplicated = buscos.map(x => prop2counts(x.total_count, x.duplicated));
    const buscoFragmented = buscos.map(x => prop2counts(x.total_count, x.fragmented));
    const buscoMissing = buscos.map(x => prop2counts(x.total_count, x.missing));

    // Combine into single array
    const buscoAll = [buscoSingleCopy, buscoDuplicated, buscoFragmented, buscoMissing];
    // console.log(buscoAll);

    // Create an echarts series object for each busco category
    // Format:
    // {
        // name: "complete-single-copy",
        // type: "bar",
        // stack: "total",
        // label: {
        //     show: true
        // },
        // emphasis: {
        //     focus: "series"
        // },
        // data: [assembly1, assembly2, ..., assemblyN]
    // }
    let buscoSeries = [];
    for (let i = 0; i < buscoCategories.length; i++) {
        buscoSeries.push({
            name: buscoCategories[i],
            type: "bar",
            stack: "total",
            label: {
                show: true,
            },
            emphasis: {
                focus: "series",
            },
            data: [
                ...buscoAll[i]
            ]
        });
    };
    // console.log(buscoSeries);

    // Dynamically set height of echarts html container
    const buscoContainer = document.getElementById("busco-barchart");
    const buscoHeight = buscos.length < 9 ? 500 : 800;
    buscoContainer.style.height = `${buscoHeight}px`;
    
    // Check if echartsPlot is already initialized
    if (!echartsPlot) {
        // Initiate echarts instance
        echartsPlot = echarts.init(buscoContainer);
        echartsPlot.resize();
    };  

    // Echarts stacked bar chart configuration options
    let option = {

        // TITLE
        // title: {
        //     text: "BUSCO",
        //     top: "20",
        // },

        // XAXIS
        xAxis: {
            type: "value",
            // data: assemblyAccessions,
            max: buscoTotal,
        },

        // YAXIS
        yAxis: {
            type: "category",
            data: assemblyAccessions,
            name: "BUSCO Completeness",
            nameTextStyle: {
                fontSize: 15,
                align: "left",
            }
        },

        // COLOURS
        color: ["#2CBBEF", "#0099CF", "#F3E600", "#FF343E"],

        // TOOLTIP
        tooltip: {
            trigger: "axis",
            position: function (point, params, dom, rect, size) {
                var tooltipWidth = size.contentSize[0]; // Tooltip width
                var tooltipHeight = size.contentSize[1]; // Tooltip height
                var x = point[0] - tooltipWidth / 2; // Center horizontally
                var y = point[1] - tooltipHeight - 10; // Just above the mouse point with a small gap
                return [x, y];
            },
            axisPointer: {
              // Use axis to trigger tooltip
              type: "shadow",
            },
            formatter: function(params) {

                // HTML content for tooltip
                let tooltipContent = ``;
                // console.log(params)
                // console.log(params[0].dataIndex)

                // Get busco count for lineage
                const buscoCount = parseInt(params[0].data) + parseInt(params[1].data) + parseInt(params[2].data) + parseInt(params[3].data);

                // Format busco assessment: e.g. XXX (X%)
                const formatSingleCopy = `${params[0].data} (${(params[0].data / buscoCount *100).toFixed(1)}%)`;
                const formatDuplicated = `${params[1].data} (${(params[1].data / buscoCount *100).toFixed(1)}%)`;
                const formatFragmented = `${params[2].data} (${(params[2].data / buscoCount *100).toFixed(1)}%)`;
                const formatMissing = `${params[3].data} (${(params[3].data / buscoCount *100).toFixed(1)}%)`;

                tooltipContent += `
                    <span class="fw-bold fs-6 my-1">${params[0].name} (<em>${speciesNames[params[0].dataIndex]}</em>)</span>
                    <p style="margin-top: 10px; margin-bottom: 0;">
                        <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params[0].color}"></span>
                        <span>${buscoCategories[0]}: <strong>${isNaN(params[0].data) ? "No Data" : formatSingleCopy}</strong></span>
                    </p>
                    <p style="margin-top: 2px; margin-bottom: 0;">
                        <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params[1].color}"></span>
                        <span>${buscoCategories[1]}: <strong>${isNaN(params[1].data) ? "No Data" : formatDuplicated}</strong></span>
                    </p>
                    <p style="margin-top: 2px; margin-bottom: 0;">
                        <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params[2].color}"></span>
                        <span>${buscoCategories[2]}: <strong>${isNaN(params[2].data) ? "No Data" : formatFragmented}</strong></span>
                    </p>
                    <p style="margin-top: 2px; margin-bottom: 10px;">
                        <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params[3].color}"></span>
                        <span>${buscoCategories[3]}: <strong>${isNaN(params[3].data) ? "No Data" : formatMissing}</strong></span>
                    </p>
                `;

                // If additional data available then add this to tooltip
                if (lineage[params[0].dataIndex] !== "") {
                    tooltipContent += `<span class=fw-bold style="font-size: 0.8rem">${lineage[params[0].dataIndex]} (<em>N</em>=${count[params[0].dataIndex]}) BUSCO v${version[params[0].dataIndex]}</span>`    
                };
                return tooltipContent;
            },
        },

        // LEGEND
        legend: {
            selectedMode: false,
        },

        // GRID
        grid: {
            top: 90,
            // bottom: "",
            left: "10%",
            // right: "",
        },

        // TOOLBOX FEATURES
        toolbox: {
            show: true,
            itemSize: 20,
            orient: "vertical",
            top: 60,
            right: "1%",               
            feature: {
                dataView: {
                    readOnly: true,
                    buttonColor: "var(--bs-primary)",
                },
                saveAsImage: {
                    type: "png",
                    name: "BUSCO",
                    title: "Save as PNG",
                    pixelRatio: 10,
                }
            },
        },

    };

    // SERIES
    option.series = buscoSeries;

    // Display the chart using the configuration options
    echartsPlot.setOption(option);
};

