<script lang="js" frontend>
app.component({
	route: '/debug/session',
});
</script>

<template>
	<div class="card">
		<div class="card-body">
			<pre>{{$session.data}}</pre>
		</div>
	</div>
</template>
