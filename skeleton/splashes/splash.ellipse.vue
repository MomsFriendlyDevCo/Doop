<component>
/**
* Draw a simple Ellipse background
* @param {string} [color="dark"] The background color type
*/
module.exports = {
	data: ()=> ({
	}),
	methods: {
	},
	props: {
		background: {type: String, default: 'dark'},
	},
};
</component>

<template>
	<div class="splash splash-ellipse" :class="`splash-ellipse-${$props.background}`"/>
</template>

<style>
.splash.splash-ellipse {
	display: block;
	z-index: 100;
	overflow: hidden;
}

.splash.splash-ellipse.splash-ellipse-dark {
	background: radial-gradient(ellipse at center, #bfbfbf 0%, #000000 100%);
}

.splash.splash-ellipse.splash-ellipse-light {
	background: radial-gradient(ellipse at center, #bfbfbf 0%, #000000 100%);
}
</style>
