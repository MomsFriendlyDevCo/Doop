<script lang="js" frontend>
app.component('debugHttp', {
	route: '/debug/http',
	methods: {
		testFetch(url) {
			this.$http.get(url)
				.then(res => this.$toast.success(res.data))
				.catch(this.$toast.catch)
		},
	},
});
</script>

<template>
	<div class="card py-3">
		<div class="card-body card-padding">
			<p>Simple controller showing the result of various back-end HTTP response codes and how they are automatically handled by $toast</p>
		</div>
		<div class="list-group">
			<a class="list-group-item" @click="testFetch('/api/debug/http/200')">Trigger Code 200</a>
			<a class="list-group-item" @click="testFetch('/api/debug/http/403')">Trigger Code 403</a>
			<a class="list-group-item" @click="testFetch('/api/debug/http/500')">Trigger Code 500</a>
		</div>
	</div>
</template>
