<script lang="js" frontend>
app.component({
	route: '/debug/loader',
	methods: {
		testLoader(method, ...args) {
			this.$loader[method](...args);
		},
	},
});
</script>

<template>
	<div class="card py-3">
		<div class="list-group">
			<a class="list-group-item" @click="testLoader('start')">vm.$loader.start()</a>
			<a class="list-group-item" @click="testLoader('startBackground')">vm.$loader.startBackground()</a>
			<a class="list-group-item" @click="testLoader('stop')">vm.$loader.stop()</a>
			<a class="list-group-item" @click="testLoader('start', 'debug1')">vm.$loader.start("debug1")</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug1')">vm.$loader.stop("debug1")</a>
			<a class="list-group-item" @click="testLoader('startBackground', 'debug2')">vm.$loader.startBackground("debug2")</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug2')">vm.$loader.stop("debug2")</a>
			<a class="list-group-item" @click="testLoader('start', 'debug3', false)">vm.$loader.start("debug3", false)</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug3')">vm.$loader.stop("debug3")</a>
		</div>
	</div>
</template>
