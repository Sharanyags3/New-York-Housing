<script>
    export let mapTypes;
    export let selectedMap;
    export let onMapChange;
  
    function handleChange(event) {
      onMapChange(event.target.value);
    }
  </script>
  <style>
    label {
        color: black;
        margin-right: 8px;
    }

    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        -ms-appearance: none;
        appearance: none;
        outline: 0;
        background: black;
        background-image: none;
        border: 1px solid black;
        color: white;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
    }

    select:hover {
        background: #34495E;
    }
</style>
  
  <label for="mapType">Select Map Type:</label>
  <select id="mapType" bind:value={selectedMap} on:change={handleChange}>
    {#each mapTypes as type}
      <option value={type}>{type}</option>
    {/each}
  </select>
  