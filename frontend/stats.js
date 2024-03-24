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

let traces = [];
for (const letter of letterStats) {
    traces.push({
        name: letter.letter,
        y: letter.durations.slice(-50).map((d) => 60000 / (d * 5.1)),
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
let error_bars_x = [];
let error_bars_y = [];
for (const letter of letterStats) {
    error_bars_x.push(letter.letter);
    error_bars_y.push(letter.error_freq);
}
let error_bars = [
    {
        x: error_bars_x,
        y: error_bars_y,
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

let durations_lines = [];
for (const letter of letterStats) {
    if (letter.occurances < 40){
        continue
    }
    durations_lines.push({
        name: letter.letter,
        y: letter.duration_moving_averages.map((d) => 60000 / (d * 5.1)),
        type: "line",
        line: {
            width: 1,
        },
        marker: {
            color: MAIN_COLOR,
        },
    });
}
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
const layout_durations = { ...layout_base, title: "WPM (letter) mean" };
Plotly.newPlot("boxes", traces, layout_box, { displayModeBar: false });
Plotly.newPlot("errors", error_bars, layout_errors, { displayModeBar: false });
Plotly.newPlot("durations", durations_lines, layout_durations, { displayModeBar: false });
