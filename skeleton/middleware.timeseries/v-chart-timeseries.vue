<script lang="js" frontend>

import * as d3 from 'd3';

app.component('v-chart-timeseries', {
	data() { return {
		chartData: undefined,
	}},
	props: {
		data: {type: Object},
		url: {type: [String, Object]}, // Either a URL as string or Axios request object
		options: {type: Object},
	},
	methods: {
		refresh() {
			if (!this.url) return; // No need to pull in data feed
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> _.isObject(this.url) ? this.$http(this.url) : this.$http.get(this.url))
				.then(res => this.chartData = res.data)
				.finally(()=> this.$loader.stop())
				.catch(this.$toast.catch)
		},
		update() {
			if (!this.chartData) return;

			const timeLabels = this.chartData.labels;
			const valueLabels = this.chartData.datasets.map(d => d.label);

			// TODO: Bind events to Vue 
			// The v-chart exposing a @selected-segement event would be good

			/*
			// NOTE: Alternative server dictated colors.
			const backgroundColors = this.chartData.datasets.map(d => d.backgroundColor)
			console.log('backgroundColors', backgroundColors);

			const borderColors = this.chartData.datasets.map(d => d.borderColor)
			console.log('borderColors', borderColors);
			*/

			// Incoming data schema
			// FIXME: D3 will ~stomp~ overlay the last "May" when used as a key
			/*
			{
				"boundaries": [
					"2020-05-24T14:00:00.000Z","2020-06-24T00:30:00.000Z","2020-07-24T11:00:00.000Z","2020-08-23T21:30:00.000Z","2020-09-23T08:00:00.000Z","2020-10-23T18:30:00.000Z","2020-11-23T05:00:00.000Z","2020-12-23T15:30:00.000Z","2021-01-23T02:00:00.000Z","2021-02-22T12:30:00.000Z","2021-03-24T23:00:00.000Z","2021-04-24T09:30:00.000Z","2021-05-24T20:00:00.000Z"
				],
				"labels": [
					"May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"
				],
				"datasets": [
					{
						"label": "Planned",
						"backgroundColor": "#63c7c2",
						"data": [...]
					},
					...
				]
			}
			*/

			// Object of Arrays
			const dataByValueLabel = this.chartData.datasets
				.map(d => ({ [d.label]: d.data }))
				.reduce((acc, cur) => _.merge(acc, cur));
			/*
			{
				Accepted: [0, 0, 1, 0, 1, 2, 0, 4, 1, 1, 2, 3, 0],
				Actioned: [3, 2, 0, 1, 0, 1, 2, 1, 1, 1, 1, 0, 0],
				...
			}
			*/

			// Array of Objects
			const dataByTimeIndex = timeLabels.map((timeLabel, i) => {
				let obj = {
					// FIXME: Rely on ordering being the same?
					boundary: this.chartData.boundaries[i],
					label: timeLabel,
				};
				valueLabels.forEach(valueLabel => obj[valueLabel] = dataByValueLabel[valueLabel][i]);
				return obj;
			});
			/*
			[
				{
					label: "May",
					Accepted: 0,
					Actioned: 0,
					...
				}
			]
			*/

			const svg = d3.select(this.$el).select('svg');

			// We recalculate with window resize events so that both width and height can be responsive
			const height = this.$el.clientHeight;
			const width = this.$el.clientWidth;
			const margin = {
				left: 5,
				right: 5,
				top: 15,
				bottom: 15,
			};
			const padding = {
				x: 0.8, // The inner padding specifies the proportion of the range that is reserved for blank space between bands; a value of 0 means no blank space between bands, and a value of 1 means a bandwidth of zero.
				y: 5, // Pixels
			};
			svg.attr('viewBox', [0, 0, width, height]);
			// NOTE: "xMidYMid meet" may be used so long as height/width are set to match the initial aspect ratio
			svg.attr('preserveAspectRatio', 'none');

			const formatValue = x => isNaN(x) ? 'N/A' : app.filter.currency(x);

			const stack = d3.stack()
				.keys(valueLabels)
				.order(d3.stackOrderNone)
				.offset(d3.stackOffsetNone);

			const series = stack(dataByTimeIndex);

			// Scales {{{
			const x = d3.scaleBand()
				.domain(dataByTimeIndex.map(d => d.label))
				.range([margin.left, width - margin.right])
				.padding(padding.x);

			const yPaddingTotal = padding.y * valueLabels.length - 1;

			const y = d3.scaleLinear()
				.domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
				// Reduce total height to allow for padding
				.rangeRound([height - margin.bottom, margin.top + yPaddingTotal]);

			/*
			// NOTE: Alternative server dictated colors.
			const backgroundColor = d3.scaleOrdinal()
				.domain(series.map(d => d.key))
				.range(backgroundColors)
				.unknown('#ccc');

			const borderColor = d3.scaleOrdinal()
				.domain(series.map(d => d.key))
				.range(borderColors)
				.unknown('#ccc');
			*/
			// }}}

			// Axis {{{
			const xAxis = d3.axisBottom(x)
    			.tickValues(timeLabels);

			svg.selectAll('g.x-axis')
				.attr('transform', 'translate(0,'+ (height - 20) +')')
        		.call(xAxis);
			// }}}

			// Bars {{{
			const bar = svg
				.selectAll('g.bar')
				.data(series);

			let yBase = [];

			// TODO: join enter/update/exit pattern to handle resolution switch updates
			bar.join('g')
				.attr('class', d => 'bar bar-' + d.key.toLowerCase())
				/*
				// NOTE: Alternative server dictated colors.
				.attr('fill', d => backgroundColor(d.key))
				.attr('stroke', d => borderColor(d.key))
				.attr('stroke-width', 1)
				*/
				.selectAll('rect')
				.data(d => d)
				.join('rect')
				.attr('x', d => x(d.data.label))
				.attr('y', function(d, i) {
					const key = d3.select(this.parentNode).datum().key;
					if (yBase.length - 1 < i) yBase[i] = 0;
					if (d.data[key] > 0) yBase[i] += padding.y;
					return y(d[1]) - yBase[i];
				})
				.attr('height', d => y(d[0]) - y(d[1]))
				.attr('width', x.bandwidth())
				.on('click', (e, d) => this.$emit('selected', {
					key: d3.select(e.target.parentNode).datum().key,
					...d.data
				}))
				.append('title')
				.text(function(d, i) {
					const key = d3.select(this.parentNode.parentNode).datum().key;
					return `${d.data.label} ${key}\n${formatValue(d.data[key])}`;
				});
			// }}}
		},
	},
	created() {
		this.$debug.prefix('v-chart-timeseries').enable(false);
	},
	mounted() {
		// Initialise SVG/Axis {{{
		d3.select(this.$el)
			.append('svg')
			.append('g')
				.attr('class', 'x-axis');
		// }}}

		this.$watch('$props.data', () => {
			if (!this.$props.data) return;

			this.$debug('$watch.data', this.data);
			this.chartData = this.$props.data;
		}, {immediate: true});

		this.$watch('$props.url', () => {
			this.$debug('$watch.url', this.url);
			this.refresh();
		}, {immediate: true});

		this.$watch('$data.chartData', () => {
			this.$debug('$watch.chartData', this.chartData);
			this.update();
		}, {immediate: false, deep: true});

		window.addEventListener('resize', this.update);
	},
});
</script>

<template>
	<div class="v-chart-timeseries"></div>
</template>

<style lang="scss">
.v-chart-timeseries {
	height: 100%;
    width: 100%;

	svg {
		height: 100%;
		width: 100%;
	}
}
</style>
