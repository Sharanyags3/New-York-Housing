<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  export let Housing;
  // Initialize the tooltip outside onMount
  let tooltip = { display: false, data: {}, x: 0, y: 0 };
  onMount(() => {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    function showTooltip(event, d) {
      const container = document.getElementById('treemap-container').getBoundingClientRect();

      // Adjust the y-coordinate based on the mouse position
    let yPosition = event.clientY - container.top + window.scrollY;
    if (event.clientY > container.height / 2) {
      // If the mouse is closer to the bottom, move the tooltip up
      yPosition -= 150; 
    }

    tooltip = {
      display: true,
      data: d.data,
      x: event.clientX - container.left + window.scrollX,
      y: yPosition,
    };
  }


    // Function to hide tooltip
    function hideTooltip() {
      tooltip = { display: false, data: {}, x: 0, y: 0 };
    }

    // append the svg object to the body of the page
    var svg = d3.select("#treemap-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Group data by LOCALITY and TYPE
    var nestedData = d3.group(Housing, d => d.LOCALITY, d => d.TYPE);

    // Convert the nested map to an array for treemap visualization
    var flattened_data = [];
    nestedData.forEach((types, locality) => {
      var children = [];
      types.forEach((values, type) => {
        children.push({
          LOCALITY: locality,
          TYPE: type,
          AVERAGE_PRICE: d3.mean(values, d => d.PRICE)
        });
      });
      flattened_data.push({
        LOCALITY: locality,
        children: children
      });
    });

    // Create hierarchy using d3.hierarchy
    var root = d3.hierarchy({ children: flattened_data })
      .sum(d => (d.children ? 0 : d.AVERAGE_PRICE));

    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
      .size([width, height])
      .paddingTop(28)
      .paddingRight(7)
      .paddingInner(3)
      (root);

    // prepare a color scale
    var color = d3.scaleOrdinal()
      .domain(flattened_data.map(d => d.LOCALITY))
      .range(d3.schemeCategory10);

    // use this information to add rectangles:
    svg
      .selectAll("g.locality")
      .data(root.children)
      .enter()
      .append("g")
      .attr("class", "locality")
      .each(function (d) {
        d3.select(this)
          .selectAll("rect")
          .data(d.children)
          .enter()
          .append("rect")
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; })
          .style("stroke", "black")
          .style("fill", function (d) { return color(d.data.LOCALITY) })
          .style("opacity", 0.8)
          .on("mouseover", (event, d) => showTooltip(event, d))
          .on("mouseout", hideTooltip);
      });


// and to add the text labels for type
svg
  .selectAll("g.locality")
  .each(function (d) {
    d3.select(this)
      .selectAll("text.type-label")
      .data(d.children.filter(child => child.data.TYPE))
      .enter()
      .append("text")
      .attr("class", "type-label")
      .attr("x", function (d) { return d.x0 + 5 })
      .attr("y", function (d) { return d.y0 + 25 })
      .text(function (d) { return d.data.TYPE }) // Display only TYPE
      .attr("font-size", function (d) {
        const fontSize = d3.scaleLinear()
          .domain([d3.min(root.leaves(), d => d.value), d3.max(root.leaves(), d => d.value)])
          .range([8, 14]);

        const textWidth = this.getComputedTextLength();

        // Reduce font size if the label overlaps
        if (textWidth > d.x1 - d.x0) {
          return `${fontSize(d.value) * (d.x1 - d.x0) / textWidth}px`;
        }

        return `${fontSize(d.value)}px`;
      })
      .attr("fill", "white");
  });
    // Add title for the Localities
    svg
      .selectAll("g.locality")
      .append("text")
      .attr("x", function (d) { return d.children[0].x0 })
      .attr("y", function (d) { return d.children[0].y0 - 5 })
      .text(function (d) { return d.data.LOCALITY })
      .attr("font-size", "14px")
      .attr("fill", function (d) { return color(d.data.LOCALITY) });

    // Add title for the Localities
    svg
      .append("text")
      .attr("x", 380)
      .attr("y", 10)
      .text("Localities and Types")
      .attr("font-size", "16px")
      .style("text-decoration", "underline")
      .attr("fill", "#3e454f");

    // Add a container for the custom tooltip
    d3.select("#treemap-container")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgb(12, 12, 12)")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("pointer-events", "none")
      .style("opacity", "0.9")
      .style("z-index", "1")
      .html(d => {
        if (tooltip.display) {
          return `
            <p>Locality: ${tooltip.data.LOCALITY}</p>
            <p>Type: ${tooltip.data.TYPE}</p>
            <p>Average Price: $${(tooltip.data.AVERAGE_PRICE / 1000000).toFixed(2)}M</p>
          `;
        }
        return "";
      })
      .style("left", `${tooltip.x}px`)
      .style("top", `${tooltip.y}px`);
  });
</script>

<style>
  .tooltip {
    position: absolute;
    background: rgb(122, 109, 109);
    border: 1px solid #ddd;
    padding: 10px;
    pointer-events: none;
    opacity: 0.9;
    z-index: 1;
  }
  .footer{
    padding: 30px;
  }
  #treemap-container {
    display: flex;
    justify-content: center;
  }

  
</style>

<div id="treemap-container">
  {#if tooltip.display}
    <div class="tooltip" style={`left: ${tooltip.x}px; top: ${tooltip.y}px;`}>
      <p>Locality: {tooltip.data.LOCALITY}</p>
      <p>Type: {tooltip.data.TYPE}</p>
      <p>Average Price: ${(tooltip.data.AVERAGE_PRICE / 1000000).toFixed(2)}M</p>
    </div>
  {/if}
</div>
<div class="footer">

</div>