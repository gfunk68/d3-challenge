var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 90,
  left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


function xScale(data, chosenXAxis) {

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([chartHeight,0]);

  return yLinearScale;

}


function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
};

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function renderStates(statesGroup, newXScale, chosenXAxis, newYScale,chosenYAxis) {

//   statesGroup.transition()
//     .duration(1000)
//     .attr("dx", d => newXScale(d[chosenXAxis]))
//     .attr("dy", d => newYScale(d[chosenYAxis]));
//   return statesGroup;
// };

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xLabel = "In Poverty (%): ";
  }
  if (chosenXAxis === 'age') {
    var xLabel = "Age (Median): ";
  }
  if (chosenXAxis === 'income') {
    var xLabel = "Household Income (Median): ";
  }
  if (chosenYAxis === "obesity") {
    var yLabel = "Obese (%): ";
  }
  if (chosenYAxis === 'smokes') {
    var yLabel = "Smokes (%): ";
  }
  if (chosenYAxis === 'healthcare') {
    var yLabel = "Lacks Healthcare (%): ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) { 
      return (`${d.state}<br>${xLabel}${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}`);
    });
  

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
 
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(data) {

  
  data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.income = +data.income;
  });


  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d[chosenYAxis])])
  //   .range([chartHeight, 0]);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);


  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("class", 'stateCircle');


   
  var statesGroup = chartGroup.selectAll('circle')
    .data(data)
    .enter()
    .append("text")
    .attr("class", 'stateText')
    .attr('dx', d => xLinearScale(d[chosenXAxis]))
    .attr('dy', d => yLinearScale(d[chosenYAxis]))
    .text(d=>d.abbr);



  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .attr("class", "active")
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .attr("class", "inactive")
    .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");


    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartHeight*2}, ${chartWidth})`)
    .attr("transform", "rotate(-90)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left+20)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left+40)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
    .attr("y", 0 - margin.left+60)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

  xLabelsGroup.selectAll("text")
  .on("click", function() {

    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      chosenXAxis = value;
      // yLinearScale = yScale(data, chosenYAxis);
      xLinearScale = xScale(data, chosenXAxis);
      xAxis = renderXAxes(xLinearScale, xAxis);
      // yAxis = renderYAxes(yLinearScale, yAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
      // statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis);

      if (chosenXAxis==='income'){
        incomeLabel
            .classed('active',true)
            .classed('inactive',false);
        povertyLabel
            .classed('active',false)
            .classed('inactive',true);
        ageLabel
            .classed('active',false)
            .classed('inactive',true);
          }
    if (chosenXAxis==='poverty'){
        povertyLabel
            .classed('active',true)
            .classed('inactive',false);
        ageLabel
            .classed('active',false)
            .classed('inactive',true);
        incomeLabel
            .classed('active',false)
            .classed('inactive',true);
          }
    if (chosenXAxis==='age'){
        ageLabel
            .classed('active',true)
            .classed('inactive',false);
        incomeLabel
            .classed('active',false)
            .classed('inactive',true);
        povertyLabel
            .classed('active',false)
            .classed('inactive',true);
          }
        }
      });

  yLabelsGroup.selectAll("text")
    .on("click", function() {

      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;
        yLinearScale = yScale(data, chosenYAxis);
        // xLinearScale = xScale(data, chosenXAxis);
        // xAxis = renderXAxes(xLinearScale, xAxis);
        yAxis = renderYAxes(yLinearScale, yAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis, chosenYAxis);
        if (chosenYAxis==='obesity'){
          obesityLabel
              .classed('active',true)
              .classed('inactive',false);
          smokesLabel
              .classed('active',false)
              .classed('inactive',true);
          healthcareLabel
              .classed('active',false)
              .classed('inactive',true);
            }
      if (chosenYAxis==='smokes'){
          smokesLabel
              .classed('active',true)
              .classed('inactive',false);
          healthcareLabel
              .classed('active',false)
              .classed('inactive',true);
          obesityLabel
              .classed('active',false)
              .classed('inactive',true);
            }
      if (chosenYAxis==='healthcare'){
          healthcareLabel
              .classed('active',true)
              .classed('inactive',false);
          obesityLabel
              .classed('active',false)
              .classed('inactive',true);
          smokesLabel
              .classed('active',false)
              .classed('inactive',true);
            }
          }
        });

}).catch(function(error) {
  console.log(error);
});
