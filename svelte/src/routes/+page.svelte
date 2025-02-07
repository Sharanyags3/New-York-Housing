<script>
  import GroupedBar from "../lib/components/GroupedBar.svelte";
  import SmallMultiples from "$lib/components/SmallMultiples.svelte";
   import Map from "$lib/components/Map.svelte";
  import Choropleth from "$lib/components/Choropleth.svelte";
  import Treemap from "$lib/components/Treemap.svelte";
  import Select from "$lib/components/select.svelte";
  import propertyImage from '../assets/property.jpg';

  export let data;
  let dataToShow;
  let showModal = false;
  let modalData = {};

  let mapTypes = ['Choropleth', 'Scatterplot'];
  let selectedMap = 'Choropleth';

  function handleShowModal(event) {
    modalData = event.detail;
    console.log('Data to Show:', modalData);
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }
  function handleMapChange(newMap) {
    selectedMap = newMap;
  }
</script>

<style>
  /* Add your styling here */
  .intro-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .intro-text {
    width: 60%; /* Adjust the width of the text container */
    margin-left: 20px; /* Adjust the margin as needed */
  }

  .property-image {
    width: 350px;
    margin-right: 10px;
    margin-top: 20px;
  }
  .grouped-text{
    margin-left: 20px;
  }
  .small-bar-chart{
    margin-left: 20px;
  }
  .map-text{
    color: black;
    margin-left: 20px;
    margin-right: 10px;
    margin-bottom: 30px;
  }
  .treemap-text{
    color:black;
    padding: 20px;
  }
  
</style>


<div class="intro-container">
  <div class="intro-text">
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <p style="color: black;">The decision to invest in real estate in New York is a significant consideration, shaped by many of factors. From the bustling streets of Manhattan to the diverse neighborhoods of Brooklyn,
      each borough and each county presents a unique real estate landscape.Expensive and New York City are two words that often go hand in hand,
       especially when it comes to real estate. The city is still one of the most expensive places to rent in the country. The aim of the below visualizations is to help you understand if it is worth buying a property 
       in NYC and if yes, what are the various factors that matter to take the decisions. 
      </p>
    </div>
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img src={propertyImage} alt="Property Image" class="property-image" />
  </div>
  <br>
 
<div class="grouped-text">
<p style="color: black;">The grouped bar chart offers a comprehensive overview of the real estate landscape in four key New York counties—Bronx, Kings (Brooklyn), New York (Manhattan), and Queens. 
  By categorizing various property types, including Condo, House, Townhouse, Co-op, and Multi-family home, the chart sheds light on the average prices within each county. </p>
<div class="grouped-bar-chart">
  <GroupedBar Housing={data.props.Housing} />
</div>
</div>
<div class="small-bar-chart">
  <p style="color: black;">Here we can see how the <b>price</b> of any propety depends on many factors such as the number of beds,bathrooms and also in which locality the property is.</p>
  <SmallMultiples Housing={data.props.Housing} />
</div>
<div class="maps">
  <div class="map-text">
    <p>Discover New York's real estate trends with our interactive maps. Use the Choropleth map to explore average prices in different localites.If you are intersted in a particular area or want more information,
       switch to the Scatter Plot which includes property details like individual prices, square footage, number of bedrooms and bathrooms.</p>
  </div>
  <Select {mapTypes} {selectedMap} onMapChange={handleMapChange} />
  <br>
  <br>
  {#if selectedMap === 'Choropleth'}
    <Choropleth Housing={data.props.Housing} on:showModal={handleShowModal} />
  {:else if selectedMap === 'Scatterplot'}
    <Map Housing={data.props.Housing} on:showModal={handleShowModal} dataToShow={dataToShow} closeModal={closeModal} />
  {/if}
</div>
<br>
<br>
<div class="treemap">
  <div class="treemap-text">
    <p>This treemap visualizes average housing prices based on locality and type in a given dataset. Each rectangle
       represents a locality, subdivided into types, with color indicating different localities. </p>
  </div>
  <Treemap Housing={data.props.Housing} />
</div>
