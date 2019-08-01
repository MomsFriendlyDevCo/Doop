<script>
/**
* Extend the base Vue.prototype.$emit with Vue.prototype.$emit.broadcast()
* This is effectively the same as an $emit.down from the root node
* NOTE: This also broadcasts to app.vue
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
*/
Vue.prototype.$emit.broadcast = (msg, ...payload) => {
	app.vue.$emit.call(app.vue, msg, ...payload);
	app.vue.$emit.down.call(app.vue, msg, ...payload);
};


/**
* Extend the base Vue.prototype.$emit with Vue.prototype.$emit.down() which recurses though all children emitting a message
* NOTE: This does not include the current component level, only the children
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
*/
Vue.prototype.$emit.down = function(msg, ...payload) {
	this.$children.forEach(child => {
		child.$emit.call(child, msg, ...payload);
		child.$emit.down.call(child, msg, ...payload);
	});
};


/**
* Extend the base Vue.prototype.$emit with Vue.prototype.$emit.up() which recurses though all parents emitting a message
* NOTE: This does not include the current component level, only the parents
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
*/
Vue.prototype.$emit.up = function(msg, ...payload) {
	if (!this || !this.$parent) throw new Error('Unable to $emit.up() on non Vue component');
	var node = this;
	while (node.$parent) {
		node = node.$parent;
		node.$emit.call(node, msg, ...payload);
	}
};


/**
* Extend the base Vue.prototype.$emit with promise support
* Any function returning a promise will be waited on
* NOTE: As of 2019-07-10 (Vue 2.6.10) it is not possible to glue this as vm.$emit.promise for some reason, maybe one day this will change
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
* @returns {Promise} A promise which will resolve with the Promise.all result of all listeners
*/
Vue.prototype.$emitPromise = function(msg, ...payload) {
	var node = this;
	if (!node || !this._isVue) throw new Error('Unable to $emit.promise() on non Vue component');
	if (!node._events[msg] || !this._events[msg].length) return Promise.resolve(); // No listeners anyway

	return Promise.all(
		node._events[msg].map(e =>
			Promise.resolve(
				e.apply(node, payload)
			)
		)
	).then(responses => responses[0]);
};
</script>
