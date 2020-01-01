<component>
/**
* Draw a simple covering image splash
* @param {string} url URL image to display
* @param {string|Object} [imageStyle] Additional CSS styles to apply to the image such as `{filter: 'contrast(0.5)'}`
*/
module.exports = {
	data: ()=> ({
	}),
	methods: {
	},
	props: {
		url: {type: String, required: true},
		imageStyle: {type: [String, Object]},
	},
};
</component>

<template>
	<div 
		class="splash splash-image"
		:style="[{'background-image': `url('${$props.url}')`}, $props.imageStyle]"
	/>
</template>

<style>
.splash.splash-image {
	display: block;
	z-index: 100;
	background-size: cover;
}
</style>
