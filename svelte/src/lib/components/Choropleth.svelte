<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { geoMercator, geoPath } from 'd3-geo';
  import { feature } from 'topojson-client';
  import BarInMap from './BarInMap.svelte';

  export let Housing;
  let mapContainer;
  let selectedLocality = null;
  let barChartContainer;
  let BarMap;
  let mapGroup;
  let colorScale;

  onMount(() => {
    createMap();
  });

  function createMap() {
    if (!mapContainer || !Housing) return;

    const width = 500;
    const height = 600;
    const svg = d3
      .select(mapContainer)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .call(d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed))
      .append('g');

    mapGroup = svg.append('g');
    const projection = geoMercator()
      .center([-73.94, 40.70])
      .scale(60000)
      .translate([width * 0.6, height / 2]);

    const path = geoPath().projection(projection);

    d3.json('/new-york-city-boroughs.geojson').then((mapData) => {
      const features = mapData.features;

      const groupedData = groupDataByLocality(Housing);
      const averagePrices = calculateAveragePrices(groupedData);
      const sortedData = averagePrices.sort((a, b) => a.avgPrice - b.avgPrice);

      colorScale = d3
        .scaleThreshold()
        .domain([400000, 800000, 1200000])
        .range(['#fef0d9', '#fdcc8a', '#e34a33', '#b30000']);

      drawMap(features, path, averagePrices);
      createLegend(colorScale);
    });
  }

  // Legend creation
  function createLegend(colorScale) {
    const legendContainer = document.createElement('div');
    legendContainer.classList.add('legend-container');

    // Define legend color and labels
    const legendData = [
      { color: '#fef0d9', label: '0-400,000$' },
      { color: '#fdcc8a', label: '400,000-800,000$' },
      { color: '#e34a33', label: '800,000-1,200,000$' },
      { color: '#b30000', label: '1,200,000$ or more' },
    ];

    // Append legend items
    legendData.forEach((item) => {
      const legendItem = document.createElement('div');
      legendItem.classList.add('legend-item');

      const legendColor = document.createElement('div');
      legendColor.classList.add('legend-color');
      legendColor.style.backgroundColor = item.color;

      const legendLabel = document.createElement('div');
      legendLabel.textContent = item.label;
      legendItem.style.width = '250px'; 
      legendItem.style.color="black";
      legendItem.appendChild(legendColor);
      legendItem.appendChild(legendLabel);

      legendContainer.appendChild(legendItem);
      
  
    });
    
    // Append legend container to the map container's parent
    mapContainer.parentNode.appendChild(legendContainer);
  }

  function groupDataByLocality(data) {
    return data.reduce((groups, item) => {
      const key = item.SUBLOCALITY;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  function calculateAveragePrices(groupedData) {
    return Object.entries(groupedData).map(([SUBLOCALITY, items]) => {
      const totalPrice = items.reduce((sum, item) => sum + item.PRICE, 0);
      const avgPrice = totalPrice / items.length;
      return { SUBLOCALITY, avgPrice };
    });
  }

  function drawMap(features, path, averagePrices) {
    mapGroup
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', (d) => {
        const avgPriceEntry = averagePrices.find(
          (item) => item.SUBLOCALITY === d.properties.name
        );

        if (avgPriceEntry) {
          return colorScale(avgPriceEntry.avgPrice);
        } else {
          console.warn(`No data found for locality: ${d.properties.name}`);
          return 'gray';
        }
      })
      .style('stroke', 'black')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        handleLocalityClick(d);
      });
  }

  function handleLocalityClick(d) {
    console.log('Clicked Data:', d);
    if (d && d.properties && d.properties.name) {
      const localityName = d.properties.name;
      console.log('Locality Name:', localityName);
      selectedLocality = localityName;

      if (!BarMap) {
        const barChartContainer = document.getElementById('bar-chart-container');
        if (barChartContainer) {
          BarMap = new BarInMap({
            target: barChartContainer,
            props: { selectedLocality, data: Housing },
          });
        }
      } else {
        BarMap.$set({ selectedLocality, data: Housing });
      }

      showModal();
    } else {
      console.warn('Invalid data for the clicked locality');
    }
  }

  function zoomed(event) {
    svg.attr('transform', event.transform);
  }

  function showModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
  }

  function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
    selectedLocality = null;
  }
</script>

<style>
 

  .map-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative; /* Add this to create a positioning context */
  }

  .map {
    width: 60%;
  }

  :global(.legend-container) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: absolute;
    bottom: 10px;
    right: 10px;
  }

  :global(.legend-item) {
    display: flex;
    margin-bottom: 5px;
  }

  :global(.legend-color) {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }

  .modal {
    width: 40%;
    box-sizing: border-box;
    padding: 70px;
    color: black;
  }
</style>

<div class="map-container">
  <div bind:this={mapContainer} class="map"></div>
  <!-- The Modal -->
  <div id="myModal" class="modal">
    <!-- Modal content -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- <span class="close" on:click="{() => closeModal()}">&times;</span> -->
    {#if selectedLocality}
      <p>Locality: <b>{selectedLocality}</b></p>
      <div bind:this={barChartContainer} id="bar-chart-container"></div>
    {/if}
  </div>
</div>
