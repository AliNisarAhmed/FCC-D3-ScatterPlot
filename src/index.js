// Resources consulted: 
    // https://www.freecodecamp.org/forum/t/scatterplot-test-8/221758
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

import * as d3 from 'd3';

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// Resources referred
// d3.format and d3.timeFormat
// https://docs.python.org/3/reference/lexical_analysis.html#grammar-token-digit

fetch(url)
  .then(res => res.json())
  .then(data => drawScatterGraph(data));

  function drawScatterGraph(incomingData) {
    // console.log(incomingData);

    const svg = d3.select('svg').attr('class', 'svg');

    const parseTime = d3.timeParse("%M:%S");  // from string to Date
    const formatTime = d3.timeFormat("%M:%S");  // from Date to a string

    incomingData.forEach(d => {
      const parsedTime = d.Time.split(':');
      // This was needed to resolve the "y-axis values not aligning" issue, even though I had used a Date Object as data-yvalue
      // FCC test required the Date object in a specific format (weird!)
      d.Date = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));  
      // d.Date = parseTime(d.Time);
    })

    // console.log(incomingData[0].Date);

    // const xMax = d3.max(incomingData, d => d.Year);
    // const xMin = d3.min(incomingData, d => d.Year);
    const xExtent = d3.extent(incomingData, d => d.Year);
    // const yExtent = d3.extent(incomingData, d => d.Date);
    const yMax = d3.max(incomingData, d => d.Date);
    const yMin = d3.min(incomingData, d => d.Date);

    // console.log(yMax);
    // console.log(yMin);

    const xScale = d3.scaleTime()
      .domain(xExtent)
      .range([40, 500])
      .nice();   // .nice() puts a value on the last tick of the scale 

    // console.log("1995: ", xScale(2014));


    const yScale = d3.scaleTime()
      .domain([yMin, yMax])
      .range([40, 500])
      .nice();

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .ticks(14)
      .tickFormat(d3.format(4))
        // format the date to 4 digits, else it was displaying 1994 as .994
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(14)
      .tickFormat(formatTime);  // to get the time in the required format

    svg.append('g').attr('id', "x-axis")
      .attr('transform', `translate(0, ${500})`)
      .call(xAxis);

    svg.append('g').attr('id', 'y-axis')
      .attr('transform', `translate(40, 0)`)
      .call(yAxis);

    // LEGEND BOX

    const legend = svg.append('g').attr("id", "legend")
      .style("fill", "black")
      .attr('transform', "translate(400, 200)")
      // .attr("z-index", 10);

    // console.log(legend);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('Riders with doping allegations')
      .style('font-size', "13px")

    legend.append('rect')
      .attr('width', "20px")
      .attr('height', "20px")
      .attr('x', 170)
      .attr('y', -15)
      .style('fill', "orangered");

    legend.append('text')
      .attr('x', 0)
      .attr('y', 30)
      .text('No doping allegations')
      .style('font-size', "13px")

    legend.append('rect')
      .attr('width', "20px")
      .attr('height', "20px")
      .attr('x', 170)
      .attr('y', 15)
      .style('fill', "LimeGreen");


    // TOOLTIP

    let tooltip = d3.select('body').append('div')
      .attr("id", "tooltip")
      .style('opacity', 0);

    const circles = svg.selectAll('circle').data(incomingData).enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 7)
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d.Date))
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => d.Date)
      .attr('yvalue', d => d.Time)
      .style('fill', d => d.Doping ? "orangered" : "LimeGreen")
      .on("mouseenter", function (d) {
        // console.log(d);
        d3.select("#tooltip")
          .attr('data-year', d.Year)
          .style('opacity', .9)
          .html(`
              ${d.Name} - ${d.Nationality} <br />
              Year: ${d.Year} - Time: ${d.Time}
              ${d.Doping ? `<br />${d.Doping}` : ''}
            `)
          .style('left', `${d3.event.x + 10}px`)
          .style('top', `${d3.event.y}px`)
          .transition()
          .duration(200)
      })
      .on('mouseleave', function(d) {
        d3.select("#tooltip")
          .style('top', 0)
          .style('left', 0)
          .style('opacity', 0);
      })
  }