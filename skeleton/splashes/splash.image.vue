<script>
/**
* Draw a simple covering image splash
* @param {string} url URL image to display
* @param {string|Object} [imageStyle] Additional CSS styles to apply to the image such as `{filter: 'contrast(0.5)'}`
*/
app.component('splashImage', {
	data: ()=> ({
	}),
	methods: {
	},
	props: {
		url: {type: String, required: true},
		imageStyle: {type: [String, Object]},
	},
});
</script>

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
