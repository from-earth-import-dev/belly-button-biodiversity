function buildGauge(wfreq) {
  var data = [
    {
      type: "indicator",
      mode: "gauge+number+delta",
      value: wfreq,
      title: { text: "Wash Frequency", font: { size: 24 } },
      delta: { reference: 2, increasing: { color: '#009900' }, decreasing: { color: '#990000'} },
      gauge: {
        axis: { range: [null, 9], tickwidth: 1, tickcolor: "darkblue" },
        bar: { color: "darkblue" },
        bgcolor: "white",
        borderwidth: 2,
        bordercolor: "gray",
        steps: [
          { range: [0, 1], color: "#E5FFCC" },
          { range: [1, 2], color: "#CCFF99" },
          { range: [2, 3], color: "#B2FF66" },
          { range: [3, 4], color: "#99FF33" },
          { range: [4, 5], color: "#80FF00" },
          { range: [5, 6], color: "#66CC00" },
          { range: [6, 7], color: "#4C9900" },
          { range: [7, 8], color: "#336600" },
          { range: [8, 9], color: "#193300" },
        ],
        threshold: {
          line: { color: "#990000", width: 4 },
          thickness: 0.75,
          value: 2
        }
      }
    }
  ];


  var layout = { width: 400, height: 400 };
  Plotly.newPlot('gauge', data, layout);
}

function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel
  var url = `/metadata/${sample}`
  // Use `d3.json` to fetch the metadata for a sample
  d3.json(url).then(function(metadata) {
    var panel = d3.select("#sample-metadata");
    var metaObj = Object.entries(metadata); 

    panel.html("");
    
    metaObj.forEach(function(data){
      panel.append('p').text(`${data[0]}: ${data[1]}`)

    buildGauge(metadata.WFREQ)
    })
  })
}

var sampleDataArr = [];

function topTen(data) {
  for (var i = 0; i < data.otu_ids.length; i++) {
    var tempObj = {'otu_id': '', 'otu_label': '', 'sample_value': ''};
    tempObj['otu_id'] = data.otu_ids[i];
    tempObj['otu_label'] = data.otu_labels[i];
    tempObj['sample_value'] = data.sample_values[i];
    sampleDataArr.push(tempObj);
  }
}

function buildCharts(sample) {
  var url = `/samples/${sample}`;
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(url).then(function(sampleData) {
    var bubbleData = [{
      x: sampleData.otu_ids,
      y: sampleData.sample_values,
      mode: 'markers',
      marker: {
        size: sampleData.sample_values,
        color: sampleData.otu_ids
      },
      text: sampleData.otu_labels
    }];

    var bubbleLayout = {
      showlegend: false,

    };

    topTen(sampleData);

    var sortedSamples = sampleDataArr.sort((a, b) => b.sample_value - a.sample_value).slice(0,9);

    var pieValues = sortedSamples.map(obj => obj.sample_value);
    var pieLabels = sortedSamples.map(obj => obj.otu_id);
    var pieHovertext = sortedSamples.map(obj => obj.otu_label); 

    var pieData = [{
      values: pieValues,
      labels: pieLabels,
      hovertext: pieHovertext,
      type: 'pie'
    }];

    var pieLayout = {
      title: "Top Ten Samples"
    }

    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
    Plotly.newPlot('pie', pieData, pieLayout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
