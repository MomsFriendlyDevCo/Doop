<service>
/**
* The loader is really just https://www.npmjs.com/package/@momsfriendlydevco/loader
* See the above link for documentation
*/
module.exports = Loader;
</service>

<component>
module.exports = {
	route: '/debug/loader',
	methods: {
		testLoader(method, ...args) {
			this.$loader[method](...args);
		},
	},
};
</component>

<template>
	<div class="card">
		<div class="list-group">
			<a class="list-group-item" @click="testLoader('start', 'debug1')">vm.$loader.start("debug1")</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug1')">vm.$loader.stop("debug1")</a>
			<a class="list-group-item" @click="testLoader('startBackground', 'debug2')">vm.$loader.startBackground("debug2")</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug2')">vm.$loader.stop("debug2")</a>
			<a class="list-group-item" @click="testLoader('start', 'debug3', false)">vm.$loader.start("debug3", false)</a>
			<a class="list-group-item" @click="testLoader('stop', 'debug3')">vm.$loader.stop("debug3")</a>
		</div>
	</div>
</template>
