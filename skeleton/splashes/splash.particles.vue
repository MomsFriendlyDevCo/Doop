<script>
app.component('splashParticles', {
	data() { return {
		pgHandle: undefined,
	}},
	props: {
		// See https://github.com/jnicol/particleground
		dotColor: {type: String, default: '#CCCCCC'},
		lineColor: {type: String, default: '#CCCCCC'},
		minSpeedX: {type: Number, default: 0.1},
		maxSpeedX: {type: Number, default: 0.7},
		minSpeedY: {type: Number, default: 0.1},
		maxSpeedY: {type: Number, default: 0.7},
		directionX: {type: String, default: 'center'}, // ENUM: center, left, right
		directionY: {type: String, default: 'center'}, // "
		density: {type: Number, default: 10000},
		particleRadius: {type: Number, default: 4},
		lineWidth: {type: Number, default: 1},
		proximity: {type: Number, default: 100},
		parallax: {type: Boolean, default: false}, // Follow the mouse
		parallaxMultiplier: {type: Number, default: 5},
		curvedLines: {type: Boolean, default: true},
	},
	mounted() {
		$.getScript('/splashes/jquery.particleground.js', ()=> {
			this.pgHandle = particleground(this.$el, this.$props);
		});
	},
	beforeDestroy() {
		this.pgHandle.destroy();
	},
});
</script>

<template>
	<div class="splash splash-particles"/>
</template>

<style>
.splash.splash-particles {
	display: block;
	z-index: 100;
	overflow: hidden;
	background: #FFF;
}
</style>
