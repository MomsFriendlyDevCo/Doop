<component>
module.exports = {
	props: {
		duration: {type: String, default: '3s'},
		colors: {type: Array, default: ()=> ['#FF0000', '#00FF00', '#0000FF']},
		background: {type: String}, // If unspecifed the first color is used
		rows: {type: Number, default: 10},
		cols: {type: Number, default: 10},
		timerOffsets: {type: Array, default: ()=> ['-1s', '-2s', '-3s', '-4s', '-5s']},
	},
	methods: {
		generateSquareStyle() {
			return {
				'animation-delay': _.sample(this.$props.timerOffsets),
				'background': _.sample(this.$props.colors),
			};
		},
	},
};
</component>

<template>
	<div
		class="splash splash-popsquares"
		:style="{
			'background': this.$props.background || this.$props.colors[0],
			'--ps-duration': this.$props.duration,
			'--ps-rows': this.$props.rows,
			'--ps-cols': this.$props.cols,
		}"
	>
		<div
			v-for="row in $props.rows"
			:key="row"
			class="popsquare-row"
		>
			<div
				v-for="col in $props.cols"
				:key="col"
				class="popsquare"
				:style="generateSquareStyle()"
				v-once
			/>
		</div>
	</div>
</template>

<style>
.splash.splash-popsquares {
	display: block;
	z-index: 100;
	overflow: hidden;
	background: #FFF;
}

.splash.splash-popsquares .popsquare-row {
	display: flex;
	flex-wrap: wrap;
	height: calc(100% / var(--ps-rows));
}

.splash.splash-popsquares .popsquare {
	flex: 1;
	animation-name: popsquares;
	animation-duration: var(--ps-duration);
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	animation-direction: alternate;
}

@keyframes popsquares {
	0% {opacity: 0}
	100% {opacity: 1}
}
</style>
