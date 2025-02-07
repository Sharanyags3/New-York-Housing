<script>
    import { scaleLinear } from 'd3-scale';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    // Data for Beds vs Average Price
    const bedsPoints = [
        { beds: 5, averagePrice: 4150147.7416666667 },
        { beds: 10, averagePrice: 5539555.428571428 },
        { beds: 15, averagePrice: 2137777.4 },
        { beds: 20, averagePrice: 5698000 },
        { beds: 24, averagePrice: 3066666.6666666665 },
        { beds: 30, averagePrice: 3500000 },
        { beds: 35, averagePrice: 4380000 },
        { beds: 40, averagePrice: 5980000 },
        { beds: 42, averagePrice: 10700000 },
        { beds: 50, averagePrice: 11000000 }
    ];

    const bedsXTicks = [5, 10, 15, 20, 24, 30, 35, 40, 42, 50];
    const bedsYTicks = [0, 2000000, 4000000, 6000000, 8000000, 10000000, 12000000];
    const bedsPadding = { top: 20, right: 15, bottom: 25, left: 25 };

    // Data for Baths vs Average Price
    const bathsPoints = [
        { BATH: 1, averagePrice: 476297 },
        { BATH: 2, averagePrice: 1216548 },
        { BATH: 3, averagePrice: 1699883 },
        { BATH: 4, averagePrice: 3521754 },
        { BATH: 5, averagePrice: 3369973 },
        { BATH: 6, averagePrice: 22643366 },
        { BATH: 7, averagePrice: 5866208 },
        { BATH: 8, averagePrice: 9644511 },
        { BATH: 9, averagePrice: 7458412 },
        { BATH: 10, averagePrice: 27072680 }
    ];

    const bathsXTicks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const bathsYTicks = [0, 5000000, 10000000, 15000000, 20000000, 25000000];
    const bathsPadding = { top: 20, right: 15, bottom: 25, left: 25 };

    const localityPoints = [
    { LOCALITY: 'New York', averagePrice: 2579619 },
    { LOCALITY: 'Kings', averagePrice: 864643 },
    { LOCALITY: 'Queens', averagePrice: 443008 },
    { LOCALITY: 'Richmond', averagePrice: 447581 },
    { LOCALITY: 'Bronx', averagePrice: 337656 },
    { LOCALITY: 'Brooklyn', averagePrice: 1426166 },
    { LOCALITY: 'Queens', averagePrice: 517333 },
    { LOCALITY: 'Flatbush', averagePrice: 650000 }
];

const localityXTicks = localityPoints.map((point, i) => i);
const localityYTicks = [0, 500000, 1000000, 1500000, 2000000, 2500000];
const localityPadding = { top: 10, right: 15, bottom: 25, left: 25 };

    function formatMobile(tick) {
        return "'" + tick.toString().slice(-2);
    }
    let height = 225;
    let width = 400;
    // Use the appropriate variables for Beds vs Average Price
    let yTicks = bedsYTicks;
    let yScale = scaleLinear()
        .domain([0, d3.max(bedsPoints, d => d.averagePrice)])
        .range([height - bedsPadding.bottom, bedsPadding.top]);

    
    let xScale = scaleLinear()
        .domain([0, bedsXTicks.length])
        .range([bedsPadding.left, width - bedsPadding.right]);

    let barWidth = (width - (bedsPadding.left + bedsPadding.right)) / bedsXTicks.length;
    let yTicksLocality = localityYTicks;
  let yScaleLocality = scaleLinear()
    .domain([0, d3.max(localityPoints, d => d.averagePrice)])
    .range([height - localityPadding.bottom, localityPadding.top]);

  let xScaleLocality = scaleLinear()
    .domain([0, localityXTicks.length - 1])
    .range([localityPadding.left, width - localityPadding.right]);

  let barWidthLocality = (width - (localityPadding.left + localityPadding.right)) / localityXTicks.length;
 
  let tooltip = { display: false, data: {}, x: 0, y: 0 };

onMount(() => {
  function showTooltip(event, data) {
    tooltip = {
      display: true,
      data: data,
      x: event.clientX,
      y: event.clientY,
    };

    console.log('Tooltip Data:', tooltip); // Log tooltip data to the console
  }

  function hideTooltip() {
    tooltip = { display: false, data: {}, x: 0, y: 0 };
    console.log('Tooltip Hidden');
  }

  const bars = document.querySelectorAll('.bar');
  bars.forEach((bar, index) => {
    bar.addEventListener('mouseover', (event) => {
      const point = bedsPoints[index];
      showTooltip(event, { bed: point.beds, averagePrice: point.averagePrice });
    });

    bar.addEventListener('mouseout', hideTooltip);
  });
});
</script>
<div class="tooltip" style="opacity: 0;"></div>
<!-- Beds vs Average Price -->
<div class="bed-chart" style="float: left;margin-top: 20px;">
    <h4>Beds vs Average Price</h4>
    <svg transform="translate(30, 10)">
		<!-- y axis -->
		<g class="axis y-axis">
			{#each yTicks as tick}
				<g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
					<line x2="100%" />
					<text y="-4">{tick / 1000000}M</text>
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each bedsPoints as point, i}
				<g class="tick" transform="translate({xScale(i)},{height})">
					<text x={barWidth / 2} y="-9">{width > 380 ? point.beds : formatMobile(point.beds)}</text>
				</g>
			{/each}
		</g>

		<g class="bars">
			{#each bedsPoints as point, i}
				<rect
                    data-bed={point.beds}
                    data-averageprice={point.averagePrice}
					x={xScale(i) + 2}
					y={yScale(point.averagePrice)}
					width={barWidth - 4}
					height={yScale(0) - yScale(point.averagePrice)}
				/>
			{/each}
		</g>
	</svg>
</div>

<!-- Baths vs Average Price -->
<div class="bath-chart" style="float: left; margin-left: 20px;margin-top: 20px;">
    <h4>Baths vs Average Price</h4>
    <svg transform="translate(50, 10)">
        <!-- y axis -->
        <g class="axis y-axis">
            {#each bathsYTicks as tick}
                <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
                    <line x2="100%" />
                    <text y="-4">{tick / 1000000}M</text>
                </g>
            {/each}
        </g>

        <!-- x axis -->
        <g class="axis x-axis">
            {#each bathsPoints as point, i}
                <g class="tick" transform={`translate(${xScale(i)},${height})`}>
                    <text x={barWidth / 2} y="-9">{width > 380 ? point.BATH : formatMobile(point.BATH)}</text>
                </g>
            {/each}
        </g>

        <g class="bars">
            {#each bathsPoints as point, i}
                <rect
                    data-bath={point.BATH}
                    data-averageprice={point.averagePrice}
                    x={xScale(i) + 2}
                    y={yScale(point.averagePrice)}
                    width={barWidth - 4}
                    height={height - yScale(point.averagePrice) - bathsPadding.bottom}
                />
            {/each}
        </g>
    </svg>
</div>
<!-- Localities vs Average Price -->
<div class="locality-chart" style="margin: 20px auto 20px;">
    <h4>Localities vs Average Price</h4>
    <svg transform="translate(0, 0)">
        <!-- y axis -->
        <g class="axis y-axis">
            {#each localityYTicks as tick}
                <g class="tick tick-{tick}" transform="translate(0, {yScaleLocality(tick)})">
                    <line x2="100%" />
                    <text y="-4">{tick / 1000000}M</text>
                </g>
            {/each}
        </g>

        <!-- x axis -->
        <g class="axis x-axis">
            {#each localityPoints as point, i}
                <g class="tick" transform={`translate(${xScaleLocality(i)},${height})`}>
                    <text x={barWidthLocality / 1.2} y="-7">{point.LOCALITY}</text>
                </g>
            {/each}
        </g>

        <g class="bars">
            {#each localityPoints as point, i}
                <rect
                    data-locality={point.LOCALITY}
                    data-averageprice={point.averagePrice}
                    x={xScaleLocality(i) + 18}
                    y={yScaleLocality(point.averagePrice)}
                    width={barWidthLocality - 4}
                    height={height - yScaleLocality(point.averagePrice) - localityPadding.bottom}
                />
            {/each}
        </g>
    </svg>
</div>



<style>
    h4 {
      text-align: left;
      color: black;
      margin-left: 50px;
    }
  
    .bed-chart,
    .bath-chart,
    .locality-chart {
      width: 80%;
      max-width: 400px;
    }
  
    .bed-chart {
      margin-right: 200px;
      margin-left: 20px;
    }
  
    .locality-chart {
      margin: 20px auto;
    }
  
    svg {
      position: relative;
      width: 100%;
      height: 275px;
    }
  
    .tick {
      font-family: Helvetica, Arial;
      font-size: 0.725em;
      font-weight: 200;
    }
  
    .tick line {
      stroke: #b4afaf;
      stroke-dasharray: 2;
    }
  
    .tick text {
      fill: #4b4949;
      text-anchor: start;
    }
  
    .tick.tick-0 line {
      stroke-dasharray: 0;
    }
  
    .x-axis .tick text {
      text-anchor: middle;
      font-size: 12px;
    }
  
    .bars rect {
      fill: rgb(41, 78, 189);
      stroke: none;
      opacity: 0.80;
    }
  
    .tooltip {
    position: absolute;
    background: rgb(152, 121, 121);
    border: 1px solid #ddd;
    padding: 10px;
    pointer-events: none;
    opacity: 0.9;
    z-index: 1;
    transform: translate(-50%, -50%);
    }
  </style>
  
  
  <div class="tooltip" style={`left: ${tooltip.x + bedsPadding.left}px; top: ${tooltip.y + bedsPadding.top}px; display: ${tooltip.display ? 'block' : 'none'}`}>
    {#if tooltip.display}
      <!-- <p>Bed: {tooltip.data.bed}</p> -->
      <p>Average Price: ${(tooltip.data.averagePrice / 1000000).toFixed(2)}M</p>
    {/if}
  </div>
 