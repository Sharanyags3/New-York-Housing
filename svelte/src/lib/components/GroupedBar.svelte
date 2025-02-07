<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let Housing;
  let avgPrice;
  // Define the desired values for TYPE and LOCALITY
  const desiredTypes = ['Condo for sale', 'House for sale', 'Townhouse for sale', 'Co-op for sale', 'Multi-family home for sale'];
  const desiredLocalities = ['Bronx County', 'Kings County', 'New York County', 'Queens County'];
  
  // Filter the Housing data based on the desired values
  const filteredHousing = Housing.filter(d => desiredTypes.includes(d.TYPE) && desiredLocalities.includes(d.LOCALITY));
  
  // Group the filtered data by locality and type and calculate the average price
  const groupedData = d3.group(filteredHousing, d => d.LOCALITY, d => d.TYPE);
  const averagePrices = [];
  
  groupedData.forEach((localityData, locality) => {
    localityData.forEach((typeData, type) => {
      const totalPrice = d3.sum(typeData, d => d.PRICE);
      const count = typeData.length;
      const averagePrice = count > 0 ? totalPrice / count : null;

      averagePrices.push({
        locality,
        type,
        averagePrice
      });
    });
  });

  // Calculate the mean for all types in Bronx County
const bronxAllTypesPrices = averagePrices.filter(d => d.locality === 'Bronx County' && d.type !== 'Multi-family home for sale');
const bronxAllTypesMean = bronxAllTypesPrices.length > 0
  ? d3.mean(bronxAllTypesPrices, d => d.averagePrice)
  : null;

// Calculate the mean for 'Multi-family home for sale' in Bronx County
const bronxMultiFamilyHomeIndex = averagePrices.findIndex(d => d.locality === 'Bronx County' && d.type === 'Multi-family home for sale');

if (bronxMultiFamilyHomeIndex !== -1) {
  averagePrices[bronxMultiFamilyHomeIndex].averagePrice = bronxAllTypesMean;
} else {
  // If the entry for 'Multi-family home for sale' in Bronx County doesn't exist, add it to averagePrices
  averagePrices.push({
    locality: 'Bronx County',
    type: 'Multi-family home for sale',
    averagePrice: bronxAllTypesMean
  });
}

// Calculate the mean for all types in Queens County
const queensAllTypesPrices = averagePrices.filter(d => d.locality === 'Queens County' && d.type !== 'Townhouse for sale');
const queensAllTypesMean = queensAllTypesPrices.length > 0
  ? d3.mean(queensAllTypesPrices, d => d.averagePrice)
  : null;

// Calculate the mean for 'Townhouse for sale' in Queens County
const queensTownhouseIndex = averagePrices.findIndex(d => d.locality === 'Queens County' && d.type === 'Townhouse for sale');

if (queensTownhouseIndex !== -1) {
  averagePrices[queensTownhouseIndex].averagePrice = queensAllTypesMean;
} else {
  // If the entry for 'Townhouse for sale' in Queens County doesn't exist, add it to averagePrices
  averagePrices.push({
    locality: 'Queens County',
    type: 'Townhouse for sale',
    averagePrice: queensAllTypesMean
  });
}


  const marginGroupedBar = { top: 50, right: 30, bottom: 70, left: 70 };
  const widthGroupedBar = 750 - marginGroupedBar.left - marginGroupedBar.right;
  const heightGroupedBar = 400 - marginGroupedBar.top - marginGroupedBar.bottom;

  // Map original labels to desired labels for x-axis
  const typeLabelsMap = {
    'Condo for sale': 'Condo',
    'House for sale': 'House',
    'Townhouse for sale': 'Townhouse',
    'Co-op for sale': 'Co-op',
    'Multi-family home for sale': 'Multi-family home',
  };
  
  const xGroupedBar = d3.scaleBand()
    .domain(averagePrices.map(d => typeLabelsMap[d.type] || d.type))
    .range([0, widthGroupedBar])
    .paddingInner(0.3) // Adjust the inner padding
    .paddingOuter(0.3); // Adjust the outer padding
  
  const yGroupedBar = d3.scaleLinear()
    .domain([0, d3.max(averagePrices, d => d.averagePrice)])
    .range([heightGroupedBar, 0]);
  
    const colorMap = {
    'New York County': '#ca0020',
    'Kings County': '#2c7bb6',
    'Bronx County': '#008837',
    'Queens County': '#fdb863',
  };
  const legendData = Object.entries(colorMap);


  const colorGroupedBar = d3.scaleOrdinal()
    .range(Object.values(colorMap))
    .domain([...new Set(averagePrices.map(d => d.locality))]);

  
  const xAxisGroupedBar = d3.axisBottom(xGroupedBar);
  const yAxisGroupedBar = d3.axisLeft(yGroupedBar);
  
 // Add a state variable to track the tooltip content and position
 let tooltip = { display: false, data: {} };

onMount(() => {
  d3.select('.x-axis-grouped-bar').call(xAxisGroupedBar)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");
  d3.select('.y-axis-grouped-bar').call(yAxisGroupedBar);
});

function showTooltip(event, d) {
  const container = event.currentTarget.getBoundingClientRect();
  tooltip = {
    display: true,
    data: d,
    x: event.clientX - container.left,
    y: event.clientY - container.top,
  };
}

function hideTooltip() {
  tooltip = { display: false, data: {}, x: 0, y: 0 };
}

  
</script>

<style>
  /* Add your styling here */
  .rect-grouped-bar {
    stroke: #303030;
  }

  .axis-label-grouped-bar {
    font-size: 13px;
    font-weight: bold;
    color: black;
  }
  g.axis-label-grouped-bar text {
    font-size: 16px; /* Increase font size for axis labels */
    font-weight: bold;
    color: black;
  }


  .tooltip {
    position: absolute;
    background-color: white !important; /* Use !important to override other styles */
    border: 1px solid #2d2d2d;
    padding: 10px;
    pointer-events: none;
    opacity: 0.9;
    z-index: 1;
    color: black !important; /* Use !important to override other styles */
  }
  svg {
    position: relative;
  }
</style>

<svg width={widthGroupedBar + marginGroupedBar.left + marginGroupedBar.right + 250} height={heightGroupedBar + marginGroupedBar.top + marginGroupedBar.bottom}>
  <!-- Add a container for the grouped bar chart -->
  <g transform={`translate(${marginGroupedBar.left + 50},${marginGroupedBar.top})`}>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    {#each averagePrices as { locality, type, averagePrice }}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <rect
        let:bar
        x={xGroupedBar(typeLabelsMap[type] || type) + xGroupedBar.bandwidth() / averagePrices.length * averagePrices.findIndex(d => d.locality === locality)}
        y={yGroupedBar(averagePrice)}
        width={(xGroupedBar.bandwidth() / averagePrices.length) + 8} 
        height={heightGroupedBar - yGroupedBar(averagePrice)}
        fill={colorGroupedBar(locality)}
        class="rect-grouped-bar"
        on:mouseover={() => showTooltip(event, { locality, type, averagePrice })}
        on:mouseout={hideTooltip}
      >
      <title>{`Locality: ${locality}\nType: ${type}\nAverage Price: $${averagePrice > 1000000 ? (averagePrice / 1000000).toFixed(2) + 'M' : averagePrice.toFixed(2)}`}</title>
    </rect>
    {/each}

    <!-- X-axis label -->
    <g transform={`translate(${widthGroupedBar / 2}, ${heightGroupedBar + marginGroupedBar.top + 10})`} class="axis-label-grouped-bar">
      <text text-anchor="middle" fill="black">Type</text>
    </g>

    <!-- Y-axis label -->
    <g transform={`translate(${-marginGroupedBar.left + 0}, ${heightGroupedBar / 2}) rotate(-90)`} class="axis-label-grouped-bar">
      <text text-anchor="middle" fill="black">Average Price</text>
    </g>

    <g class="x-axis-grouped-bar" style="color: black;" transform={`translate(0, ${heightGroupedBar})`}></g>
    <g class="y-axis-grouped-bar" style="color: black;"></g>

    <!-- Add a container for the custom tooltip -->
    {#if tooltip.display}
    <div class="tooltip" style={`left: ${tooltip.x}px; top: ${tooltip.y}px; background-color: white; color: black;`}>
      <p>Locality: {tooltip.data.locality}</p>
      <p>Type: {tooltip.data.type}</p>
      <p>Average Price: ${(tooltip.data.averagePrice / 1000000).toFixed(2)}M</p>
    </div>
    {/if}
  </g>

<!-- Add a container for the legend -->
<g transform={`translate(${widthGroupedBar + marginGroupedBar.left + 20},${marginGroupedBar.top})`}>
  <!-- Legend data with locality names and colors -->
  {#each [['New York County', '#ca0020'], ['Kings County', '#2c7bb6'], ['Bronx County', '#008837'], ['Queens County', '#fdb863']] as [locality, color], index}
    <g transform={`translate(0, ${(index * 30)})`}>
      <rect width="20" height="20" fill={color} />
      <text x="30" y="12" style="font-size: 14px; alignment-baseline: middle; text-anchor: start; fill: black;">{locality}</text>
    </g>
  {/each}
</g>

</svg>