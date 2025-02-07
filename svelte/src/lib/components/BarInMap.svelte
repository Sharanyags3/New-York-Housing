<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    export let selectedLocality;
    const data=[
{SUBLOCALITY: 'Manhattan', TYPE: 'Condo', averagePrice: 4541000},
{SUBLOCALITY: 'Manhattan', TYPE: 'Co-op', averagePrice: 1861500},
{SUBLOCALITY: 'Manhattan', TYPE: 'Condop', averagePrice: 1065000},
{SUBLOCALITY: 'Brooklyn', TYPE: 'Co-op', averagePrice: 449623},
{SUBLOCALITY: 'Brooklyn', TYPE: 'Condo', averagePrice: 1266131},
{SUBLOCALITY: 'Brooklyn', TYPE: 'House', averagePrice: 989750},
{SUBLOCALITY: 'Brooklyn', TYPE: 'Townhouse', averagePrice: 1835000},
{SUBLOCALITY: 'Brooklyn', TYPE: 'Multi-family ', averagePrice: 1910571},
{SUBLOCALITY: 'The Bronx', TYPE: 'Co-op', averagePrice: 286732},
{SUBLOCALITY: 'The Bronx', TYPE: 'Condo', averagePrice: 492511},
{SUBLOCALITY: 'The Bronx', TYPE: 'House', averagePrice: 1294000},
{SUBLOCALITY: 'The Bronx', TYPE: 'Pending', averagePrice: 317133},
{SUBLOCALITY: 'The Bronx', TYPE: 'Townhouse', averagePrice: 588000},
{SUBLOCALITY: 'Queens', TYPE: 'Co-op', averagePrice: 352316},
{SUBLOCALITY: 'Queens', TYPE: 'Condo', averagePrice: 684193},
{SUBLOCALITY: 'Queens', TYPE: 'Pending', averagePrice: 476651},
{SUBLOCALITY: 'Queens', TYPE: 'Multi-family ', averagePrice: 1800000},
{SUBLOCALITY: 'Queens', TYPE: 'House', averagePrice: 899000},
{SUBLOCALITY: 'Staten Island', TYPE: 'Condo', averagePrice: 398279},
{SUBLOCALITY: 'Staten Island', TYPE: 'Multi-family ', averagePrice: 1424694},
{SUBLOCALITY: 'Staten Island', TYPE: 'Co-op', averagePrice: 311900},
{SUBLOCALITY: 'Staten Island', TYPE: 'Contingent', averagePrice: 307817},
{SUBLOCALITY: 'Staten Island', TYPE: 'Townhouse', averagePrice: 549999}
    ];
  
    let barChartContainer;
  
    onMount(() => {
    createBarChart();
  });

  // Declare a reactive statement to update the chart when selectedLocality changes
  $: {
    if (selectedLocality) {
      createBarChart();
    }
  }

  function createBarChart() {
    const localityData = data.filter(item => item.SUBLOCALITY === selectedLocality);
    const groupedData = localityData.reduce((groups, item) => {
      const key = item.TYPE;
      if (!groups[key]) {
        groups[key] = { count: 0, totalPrice: 0 };
      }
      groups[key].count++;
      groups[key].totalPrice += item.averagePrice;
      return groups;
    }, {});

    const averagePrices = Object.entries(groupedData).map(([type, data]) => {
      const avgPrice = data.totalPrice / data.count;
      return { type, avgPrice };
    });

    const barChartSvg = d3.select(barChartContainer);

    const margin = { top: 20, right: 20, bottom: 70, left: 50 };
    const width = 300 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom; // Increase the height

    barChartSvg.selectAll('*').remove();

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(averagePrices.map(d => d.type));

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(averagePrices, d => d.avgPrice)]);

    // X-axis
    barChartSvg.append('g')
      .attr('transform', `translate(${margin.left},${height + margin.top})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)') // Rotate x-axis labels for better visibility
      .style('text-anchor', 'end');

    // Y-axis
    barChartSvg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(y).tickFormat(d3.format('.2s'))) // Use d3.format('.2s') for concise labels
    .selectAll('.tick text') // Select all tick labels
    .text((d) => `${d / 1000000}M`);

    // Bars
    barChartSvg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .selectAll('rect')
      .data(averagePrices)
      .enter().append('rect')
      .attr('x', d => x(d.type))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.avgPrice))
      .attr('height', d => height - y(d.avgPrice))
      .attr('fill', '#7fbf7b')
      .attr('opacity',0.8);
  }
</script>


<!-- Bar chart container -->
<svg bind:this={barChartContainer} id="bar-chart-svg" width="100%" height="250"></svg>