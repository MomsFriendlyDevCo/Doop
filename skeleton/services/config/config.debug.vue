<script lang="js" frontend>
app.component({
	route: '/debug/config',
	data() {
		return {
			$config: this.$config,
		};
	},
});
</script>

<template>
	<div class="card py-3">
		<div class="card-body">
			<pre>{{$config}}</pre>
		</div>
	</div>
</template>
