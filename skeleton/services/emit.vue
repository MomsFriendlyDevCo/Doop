<script>
var methods = {}; // Method's to glue onto vm.$emit

/**
* Extend the base Vue.prototype.$emit with Vue.prototype.$emit.broadcast()
* This is effectively the same as an $emit.down from the root node
* NOTE: This also broadcasts to app.vue
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
*/
app.broadcast = methods.broadcast = (msg, ...payload) => {
	app.vue.$emit.call(app.vue, msg, ...payload);
	app.vue.$emit.down.call(app.vue, msg, ...payload);
};


/**
* Extend the base Vue.prototype.$emit with Vue.prototype.$emit.down() which recurses though all children emitting a message
* NOTE: This does not include the current component level, only the children
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
* @returns {VueComponent} This chainable VM
*/
methods.down = function(msg, ...payload) {
	this.$children.forEach(child => {
		child.$emit.call(child, msg, ...payload);
		child.$emit.down.call(child, msg, ...payload);
	});

	return this;
};


/**
* Extend the base methods.$emit with Vue.prototype.$emit.up() which recurses though all parents emitting a message
* NOTE: This does not include the current component level, only the parents
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
* @returns {VueComponent} This chainable VM
*/
methods.up = function(msg, ...payload) {
	if (!this || !this.$parent) throw new Error('Unable to $emit.up() on non Vue component');
	var node = this;
	while (node.$parent) {
		node = node.$parent;
		node.$emit.call(node, msg, ...payload);
	}

	return this;
};


/**
* Extend the base Vue.prototype.$emit with promise support
* Any function returning a promise will be waited on
* NOTE: As of 2019-07-10 (Vue 2.6.10) it is not possible to glue this as vm.$emit.promise for some reason, maybe one day this will change
* @param {string} msg The name of the event to emit
* @param {*} [payload...] The payload of the event
* @returns {Promise} A promise which will resolve with the Promise.all result of all listeners
*/
methods.promise = function(msg, ...payload) {
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


/**
* Return if anything is listening to a given event
* This is useful if the event broadcast would involve some non-trivial processing and it would be beneficial to skip if nothing is listening anyway
* @param {string} msg The name of the event to emit
* @returns {boolean} Boolean true if any matching listener is present
*/
methods.hasListeners = function(msg) {
	if (!this || !this.$parent) throw new Error('Unable to $emit.hasSubscribers() on non Vue component');
	return (
		this._events[msg]
		&& this._events[msg].length > 0
	);
};


/**
* Auto emit a message on a timer
* If any listener returns a promise it is waited on
* @param {string} msg The name of the event to emit
* @param {*} [payload...] Optional additional payload for the event
* @param {number} interval When to schedule the event, required and must be numeric
* @returns {VueComponent} This chainable VM
*/
methods.schedule = function(msg, ...payload) {
	if (!this || !this.$parent) throw new Error('Unable to $emit.schedule() on non Vue component');
	if (!this.$emit.scheduleHandles) this.$emit.scheduleHandles = {};

	var interval = payload.pop();
	if (typeof interval != 'number') throw new Error('Last argument to $emit.auto must be a numeric interval');

	this.$emit.scheduleHandles[msg] = {
		message: msg,
		payload,
		interval,
		timer: undefined,
		reschedule: ()=> {
			this.$emit.scheduleHandles[msg].timer = setTimeout(()=> {
				if (!this || !this.$emit.scheduleHandles[msg]) return console.log('Timer event for destroyed VueComponent');
				this.$emit.promise(this.$emit.scheduleHandles[msg].message, ...this.$emit.scheduleHandles[msg].payload)
					.then(()=> this.$emit.scheduleHandles[msg].reschedule)
			}, this.$emit.scheduleHandles[msg].interval);
		},
	};
	this.$emit.scheduleHandles[msg].reschedule(); // Schedule initial timer

	return this;
};


/**
* Release an scheduled emitter
* If called with no arguments all scheduled timers are released
* This function is called automatically whenever a VM is being destroyed
* @param {string|array<string>} [msgs] Messages to unschedule, if omitted all are assumed
* @returns {VueComponent} This chainable VM
*/
methods.unschedule = function(msgs) {
	if (!this.$emit.scheduleHandles) return; // Nothing scheduled anyway
	_.castArray(msgs || Object.keys(this.$emit.scheduleHandles))
		.forEach(msg => {
			clearTimeout(this.$emit.scheduleHandles[msg]);
			delete this.$emit.scheduleHandles[msg];
		})
};


Vue.mixin({
	beforeCreate() {
		this.$emit = this.$emit.bind(this); // Rebind $emit to this vm so we get the right context

		// Long-winded version of _.mapValues() where we remap each method to a binding of this VM
		Object.assign(this.$emit, Object.fromEntries(
			Object.entries(methods).map(i =>
				[i[0], i[1].bind(this)]
			)
		));
	},
	beforeDestroy() {
		this.$emit.unschedule();
	},
});
</script>
