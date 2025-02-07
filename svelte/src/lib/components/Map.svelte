<script>
  import { onMount, createEventDispatcher } from "svelte";
  import * as d3 from "d3";
  import { geoMercator, geoPath } from "d3-geo";
  import { feature } from "topojson-client";

  

  let isValidData;
  let price;
  let type;
  let beds;
  let baths;
  let propertySQFT;
  let address;

  const dispatch = createEventDispatcher();

  export let Housing;
  let mapContainer;
  // Group the data by sublocality
  const groupedData = d3.group(Housing, (d) => d.SUBLOCALITY);

  // Create a function to randomly select n points from an array
  function getRandomPoints(array, n) {
    const shuffled = array.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  // Filter and flatten the data to keep only 30 random points for each sublocality
  const filteredHousing = Array.from(groupedData.values()).flatMap(
    (sublocalityGroup) => getRandomPoints(sublocalityGroup, 90)
  );

  onMount(() => {
    createCombinedMap();
  });

  function createCombinedMap() {
    if (!mapContainer || !Housing) return;

    // Set up map dimensions
    const mapWidth = mapContainer.clientWidth;
    const mapHeight = 900; // Adjust the height as needed

    // Create SVG container for the map with viewBox
    const svg = d3
      .select(mapContainer)
      .append("svg")
      .attr("width", "100%")
      .attr("height", mapHeight)
      .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .call(d3.zoom().on("zoom", zoomed));

    // Create a group for the map features
    const mapGroup = svg.append("g");

    // Create a group for the scatter plot points
    const scatterGroup = svg.append("g");

    // Projection for the map
    const projection = geoMercator()
      .center([-73.94, 40.7])
      .scale(70000)
      .translate([mapWidth / 2, mapHeight / 2]);

    // Path generator
    const path = geoPath().projection(projection);

    // Load map data (GeoJSON)
    d3.json("/new-york.geojson").then((mapData) => {
      // Extract features from the GeoJSON
      const mapFeatures = mapData.features;

      // Draw map features
      mapGroup
        .selectAll("path")
        .data(mapFeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "lightgray") // Map color
        .style("stroke", "black");
    });

    // Define a function to exclude outliers
    function excludeOutliers(data, factor = 1.5) {
      const q1 = d3.quantile(data, 0.25);
      const q3 = d3.quantile(data, 0.75);
      const iqr = q3 - q1;
      const lowerBound = q1 - factor * iqr;
      const upperBound = q3 + factor * iqr;
      return data.filter((d) => d >= lowerBound && d <= upperBound);
    }

    // Get the minimum and maximum PRICE values excluding outliers
    const [minPrice, maxPrice] = d3.extent(
      excludeOutliers(Housing.map((d) => d.PRICE))
    );

    // Normalize PRICE values to a range between 0 and 1
    const normalizePrice = d3
      .scaleLinear()
      .domain([minPrice, maxPrice])
      .range([0, 1]);

    // Apply a logarithmic scale to normalized PRICE values
    const logScale = d3
      .scaleLog()
      .domain([Math.max(1, minPrice), maxPrice])
      .range([0, 1]);

    // Define a threshold color scale for logarithmic PRICE values
    const colorScale = d3
      .scaleThreshold()
      .domain([0.2, 0.4, 0.6, 0.8, 1].map(logScale))
      .range([
        "#a1d76a",
        "#fee090",
        "#91bfdb",
        "#fc8d59",
        "#b35806",
        "#b2182b",
      ]);

    // Draw scatter plot with color-coded markers
    scatterGroup
      .selectAll("circle")
      .data(filteredHousing)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.LONGITUDE, d.LATITUDE])[0])
      .attr("cy", (d) => projection([d.LONGITUDE, d.LATITUDE])[1])
      .attr("r", 5)
      .attr("fill", (d) => {
        const normalizedPrice = normalizePrice(d.PRICE);
        const logNormalizedPrice = logScale(normalizedPrice);
        const color = colorScale(logNormalizedPrice);
        return color;
      })
      .style("cursor", "pointer")
      .on("click", (event, d) => showDetailsModal(d));

    function zoomed(event) {
      mapGroup.attr("transform", event.transform);
      scatterGroup.attr("transform", event.transform);
    }

    function hideDiv(id) {
      console.log("hide div clicked");
      document.getElementById(id).style.display = "block";
    }

    function showDetailsModal(data) {
      isValidData = data && "PRICE" in data;
      price = isValidData ? data.PRICE : null;
      type = isValidData ? data.TYPE : null;
      beds = isValidData ? data.BEDS : null;
      baths = isValidData ? data.BATH : null;
      propertySQFT = isValidData ? data.PROPERTYSQFT : null;
      address = isValidData ? data.FORMATTED_ADDRESS : null;

      console.log("Show Details Modal:", data); // Log the received data for debugging

      if (isValidData) {
        dispatch("showModal", {
          price,
          type,
          beds,
          baths,
          propertySQFT,
          address,
        });
      }
      document.getElementById("model-data-container1").style.display = "block";
    }
  }
</script>

<div class="combined-map-container">
  <div bind:this={mapContainer} class="combined-map" />
  <div
    class="modal-container"
    id="model-data-container1"
    style="display: none;"
  >
    {#if isValidData}
      <!-- Modal content -->

      <button class="close-button"
        on:click={function () {
          document.getElementById("model-data-container1").style.display =
            "none";
        }}>X</button
      >

      <div>
        {#if price >= 1000000}
          <p>Price: {price / 1000000}M $</p>
        {:else}
          <p>Price: {price}$</p>
        {/if}
      </div>
      <p>Type: {type}</p>
      <p>Beds: {beds}</p>
      <p>Baths: {baths}</p>
      <p>Property SQFT: {propertySQFT}</p>
      <p>Address: {address}</p>

      
      <script>
        document.getElementById("model-data-container1").style.display =
          "block";
      </script>
    {/if}
  </div>
</div>

<style>
  
  .combined-map-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px; /* Set a maximum width as needed */
    margin: 0 auto; /* Center the container horizontally */
  }

  .combined-map {
    width: 70%; /* Adjust the width of the map */
  }

  .modal-container {
    width: 30%; /* Adjust the width of the modal */
    box-sizing: border-box;
    padding: 20px;
    margin-top: 250px;
    color: black;
    height: 350px;
    border: 2px solid #000000c1;
    background-color: rgba(207, 81, 81, 0.24);
    z-index: 1;
  }

  .close-button {
    float: right;
    right: 12px;
  }

  
</style>