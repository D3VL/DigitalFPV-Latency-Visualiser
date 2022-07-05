const { default: srtParser2 } = require("srt-parser-2")
const parser = new srtParser2();

const zoomPlugin = require('chartjs-plugin-zoom').default;

const {
    Chart,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip
} = require('chart.js')

Chart.register(
    // ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip
);
Chart.register(zoomPlugin)

const zoomOptions = {
    pan: {
        enabled: true,
    },
    zoom: {
        wheel: {
            enabled: true
        },
        mode: 'y',
    },
};

const signalScatterGraph = new Chart(document.getElementById('signalScatterGraph'), {
    type: 'scatter',
    data: [],
    options: {
        plugins: {
            zoom: zoomOptions
        }
    }
});

const timeSeriesGraph = new Chart(document.getElementById('timeSeriesGraph'), {
    type: 'line',
    data: [],
    options: {
        plugins: {
            zoom: zoomOptions
        }
    }
});

const distributionGraph = new Chart(document.getElementById('distributionGraph'), {
    type: 'bar',
    data: [],
    options: {
        plugins: {
            zoom: zoomOptions
        }
    }
});


const keyNormalMap = {
    Signal: "strength",
    CH: "channel",
    FlightTime: "time",
    SBat: "uavBatteryVoltage",
    GBat: "gogglesBatteryVoltage",
    Delay: "delay",
    Bitrate: "bitrate",
    Distance: "distance",
    signal: "strength",
    ch: "channel",
    flightTime: "time",
    uavBat: "uavBatteryVoltage",
    glsBat: "gogglesBatteryVoltage",
    delay: "delay",
    bitrate: "bitrate"
}

function parseSrt(rawSrt) {
    const srt = parser.fromSrt(rawSrt);

    const flightData = srt.map((item) => {

        const splitText = item.text.split(" ");
        const dataObject = {}

        for (const text of splitText) {
            const keyvalue = text.split(":");

            const overrideKey = keyNormalMap[keyvalue[0]];
            if (!overrideKey) continue;

            dataObject[overrideKey] = parseFloat(keyvalue[1])
        }

        return {
            ...item,
            type: (item.text[0] === "S") ? "Avatar" : "DJI",
            data: dataObject
        }
    })

    return flightData;
}

function sortScatterData(a, b) {
    if (a.data.delay > b.data.delay) return 1;
    if (a.data.delay < b.data.delay) return -1;
    return 0;
}

function displayFlightData(flightData) {
    // set scattergraph data

    let x_axis = 0;
    const scatterDataRejiggered = [...flightData].sort(sortScatterData).map((item) => ({
        x: x_axis++,
        y: item.data.delay
    }))
    const signalScatterGraphData = {
        datasets: [{
            label: 'Signal Delay',
            data: scatterDataRejiggered
        }],
    };

    signalScatterGraph.data = signalScatterGraphData;
    console.log(signalScatterGraphData)
    signalScatterGraph.update();

    const timeSeriesGraphData = {
        labels: [...flightData.map(i => i.id)],
        datasets: [
            {
                label: 'Signal Strength',
                data: [...flightData.map(i => i.data.strength)],
                // fill: false,
                borderColor: '#26547C',
                // tension: 0.1
                hidden: true,
            }, {
                label: "Channel",
                data: [...flightData.map(i => i.data.channel)],
                borderColor: 'rgb(75, 192, 192)',
                hidden: true,
            }, {
                label: "Time",
                data: [...flightData.map(i => i.data.time)],
                borderColor: '#ef476f',
                hidden: true,
            }, {
                label: "Air Battery Voltage",
                data: [...flightData.map(i => i.data.uavBatteryVoltage)],
                borderColor: '#16f6e0',
                hidden: true,
            }, {
                label: "Ground Battery Voltage",
                data: [...flightData.map(i => i.data.gogglesBatteryVoltage)],
                borderColor: '#06d6a0',
                hidden: true,
            },
            {
                label: "Latency",
                data: [...flightData.map(i => i.data.delay)],
                borderColor: '#ef476f',
            },
            {
                label: "Bitrate",
                data: [...flightData.map(i => i.data.bitrate)],
                borderColor: '#ffd166',
                hidden: true,
            }
        ]
    }

    timeSeriesGraph.data = timeSeriesGraphData;
    console.log(timeSeriesGraphData)
    timeSeriesGraph.update()


    const distributionGraphData = {
        labels: ["0-5ms", "5-15ms", "15-25ms", "25-35ms", "35-40ms", "40-50ms", "50-100ms", "100-200ms", ">= 200ms"],
        datasets: [
            {
                label: "RESULTS",
                data: [
                    flightData.filter(i => (i.data.delay < 5)).length || 0,
                    flightData.filter(i => (i.data.delay <= 15 && i.data.delay > 5)).length || 0,
                    flightData.filter(i => (i.data.delay <= 25 && i.data.delay > 15)).length || 0,
                    flightData.filter(i => (i.data.delay <= 35 && i.data.delay > 25)).length || 0,
                    flightData.filter(i => (i.data.delay <= 40 && i.data.delay > 35)).length || 0,
                    flightData.filter(i => (i.data.delay <= 50 && i.data.delay > 40)).length || 0,
                    flightData.filter(i => (i.data.delay <= 100 && i.data.delay > 50)).length || 0,
                    flightData.filter(i => (i.data.delay <= 200 && i.data.delay > 100)).length || 0,
                    flightData.filter(i => (i.data.delay > 200)).length || 0
                ],
                borderColor: '#ef476f',
                backgroundColor: '#ef476f'

            }
        ]
    }

    distributionGraph.data = distributionGraphData;
    console.log(distributionGraphData)
    distributionGraph.update()
}



// read the contents of a file input
const readInputFile = (inputElement, callback) => {
    const reader = new FileReader();
    reader.onload = () => {
        callback(reader.result)
    };
    reader.readAsText(inputElement.files[0]);
};

// create a file input and destroy it after reading it
const openFile = (callback) => {
    var el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.style.display = 'none';
    document.body.appendChild(el);
    el.onchange = () => {
        readInputFile(el, (data) => {
            callback(data)
            document.body.removeChild(el);
        })
    }
    el.click();
}

module.exports = {
    openFile,
    parseSrt,
    displayFlightData
}