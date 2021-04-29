<script lang="js" frontend>
/**
* Generic "This is loading" notification area
*/
app.component('loading', {
	props: {
		text: {type: String, default: 'Loading...'},
	},
});
</script>

<template>
	<div class="loading-area d-flex justify-content-center align-items-center">
		<i class="far fa-spinner fa-spin mr-2"/>
		{{text}}
	</div>
</template>

<style>
.loading-area {
	height: 50px;
}
</style>
