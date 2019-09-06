<service>
/**
* Stub of basic Loader for dumber loaders like the Vue.services() set rather than components (which is handled below via mixin)
*/
module.exports = Loader;
</service>

<script>
/**
* The loader is really just a wrapper for @momsfriendlydevco/loader
* @url https://www.npmjs.com/package/@momsfriendlydevco/loader
*
*/
Vue.mixin({
	beforeCreate() {
		// Instanciate each loader with this components unique ID prefix
		this.$loader = {
			...Loader,

			/**
			* Signal that a process is starting
			* @param {string} [id=vm._uid] A unique ID to assign to this loader, if omitted vm._uid is used
			* @param {boolean} [foreground] Specify that the foreground loader type should be used
			*/
			start: (id, foreground) => {
				if (typeof id == 'string') {
					return Loader.start(id, foreground);
				} else {
					return Loader.start(this._uid, foreground);
				}
			},

			/**
			* Shortcut to start a process in the background
			* @param {string} [id=vm._uid] A unique ID to assign to this loader, if omitted vm._uid is used
			*/
			startBackground: id => Loader.start(id || this._uid, false),

			/**
			* Signal that a process has finished
			* @param {string} [id=vm._uid] A unique ID to stop, if omitted vm._uid is used
			*/
			stop: id => Loader.stop(id || this._uid),
		};
	},
});
</script>

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
