<script lang="js" frontend>
import Granim from 'granim';

/**
* Splash underlay layer which displays an animated gradient (requires Granim);
*
* @params {Array<Array>} [colors] Tuple of gradients to cycle between, if unspecified uses a sane default
* @params {number} [transitionInterval=3000] Time in MS between transitions
*/
app.component('splashGradientAnimation', {
	data() { return {
		granimInstance: undefined,
	}},
	props: {
		colors: {type: Array, default() { return [
			['#ff9966', '#ff5e62'],
			['#00F260', '#0575E6'],
			['#e1eec3', '#f05053'],
		] }},
		transitionInterval: {type: Number, default: 3000},
	},
	mounted() {
		this.granimInstance = new Granim({
			element: `#canvas-${this._uid}-gradient-animation`,
			direction: 'diagonal',
			isPausedWhenNotInView: true,
			stateTransitionSpeed: this.transitionInterval,
			states : {
				'default-state': {
					gradients: this.colors,
				},
			},
		});
	},
});
</script>

<template>
	<canvas
		:id="`canvas-${_uid}-gradient-animation`"
		class="splash splash-gradients"
	/>
</template>

<style>
.splash.splash-gradients {
	display: block;
	width: 100%;
	height: 100%;
}
</style>
