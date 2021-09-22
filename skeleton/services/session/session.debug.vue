<script lang="js" frontend>
app.component({
	route: '/debug/session',
});
</script>

<template>
	<div class="card py-3">
		<div class="card-body">
			<pre>{{$session.data}}</pre>
		</div>
	</div>
</template>
