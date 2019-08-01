<component>
/**
* Draw a simple solid background color
* @param {string} [color="white"] The background color type
*/
module.exports = {
	data: ()=> ({
	}),
	methods: {
	},
	props: {
		background: {type: String, default: 'white'},
	},
};
</component>

<template>
	<div class="splash splash-solid" :class="`splash-solid-${$props.background}`"/>
</template>

<style>
.splash.splash-solid {
	display: block;
	z-index: 100;
	overflow: hidden;
}

.splash.splash-solid.splash-solid-white {
	background: #FFF;
}
</style>
