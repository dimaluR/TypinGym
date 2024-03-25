import Plotly from "plotly.js-dist-min";
import sendRequestToBackend from "./backend_gateway";

const BACKGROUND_COLOR = "#1e1e2e";
const MAIN_COLOR = "#abe9b3";
// --sub-color: #575268;
// --sub-alt-color: #292739;
const TEXT_COLOR = "#d9e0ee";
// --error-color: #f28fad;
// --error-extra-color: #e8a2af;
// --colorful-error-color: #f28fad;
// --colorful-error-extra-color: #e8a2af;

const convertLetterDurationToWpm = (duration) => 60000 / (duration * 5.1)

async function getLetterStats() {
    const route = `stats/letters`;
    try {
        const stats = await sendRequestToBackend(route);
        return stats;
    } catch (error) {
        console.log(`could not get letter stats`);
    }
}

let letterStats = await getLetterStats();
letterStats.sort((a, b) => a.mean - b.mean);

let letterDurationBoxPlotTraces = [];
for (const letter of letterStats) {
    letterDurationBoxPlotTraces.push({
        name: letter.letter,
        y: letter.durations.slice(-50).map(convertLetterDurationToWpm),
        type: "box",
        boxpoints: false,
        boxmean: true,
        line: {
            width: 1,
        },
        marker: {
            color: MAIN_COLOR,
        },
    });
}

letterStats.sort(
    (b,a) => a.error_freq - b.error_freq
);
let letterErrorFrequencyX = [];
let letterErrorFrequencyY = [];
for (const letter of letterStats) {
    letterErrorFrequencyX.push(letter.letter);
    letterErrorFrequencyY.push(letter.error_freq);
}
let letterErrorFrequencyBarTraces = [
    {
        x: letterErrorFrequencyX,
        y: letterErrorFrequencyY,
        type: "bar",
        marker: {
            color: MAIN_COLOR,
        },
        font: {
            family: "JetBrains Mono",
            color: TEXT_COLOR,
        },
        texttemplate: "%{y:d}",
        hoverinfo: "none",
    },
];


let layout_base = {
    font: {
        family: "JetBrains Mono",
        color: TEXT_COLOR,
    },
    yaxis: {
        showgrid: false,
        zeroline: false,
    },
    barmode: "overlay",
    plot_bgcolor: BACKGROUND_COLOR,
    paper_bgcolor: BACKGROUND_COLOR,
    showlegend: false,
};

const layout_box = { ...layout_base, title: "WPM (letter)", yaxis: {range: [0, 300]}};
const layout_errors = { ...layout_base, title: "Error frequency" };
Plotly.newPlot("boxes", letterDurationBoxPlotTraces, layout_box, { displayModeBar: false });
Plotly.newPlot("errors", letterErrorFrequencyBarTraces, layout_errors, { displayModeBar: false });
