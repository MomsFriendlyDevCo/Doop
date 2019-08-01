<service>
/**
* Binds a simple vm.$watchAll([props...], handler) function into the prototype scope
* This works similar to the Angular vm.$watch([...]) function
* @param {array <string>} props Named properties within `vm` to watch
* @param {function} callback The callback to run when the watch triggers
* @param {Object} [options] Additional options
* @param {boolean} [options.needAll=false] Only fire the watcher when every single member listed has a non-undefined value
* @param {boolean} [options.preventLoops=true] Assume that the watcher can effect a peer expression and that we should not keep retriggering this watch expression
*/
module.exports = function(props, callback, options) {
	var settings = {
		needAll: false,
		preventLoops: true,
		...options,
	};

	// Remap handler based on the settings {{{
	var handler;
	if (settings.needAll) { // Remap handler with extra behaviour that checks all properties first
		handler = ()=> {
			if (settings.preventLoops && this.$duringWatchAll) return; // Already updating
			if (settings.preventLoops) this.$duringWatchAll = true;
			if (props.some(p => this[p] === undefined)) return; // Not ready yet
			handler.apply(this, arguments);
			if (settings.preventLoops) this.$duringWatchAll = false;
		};
	} else { // No special treatment - just pass the callback
		handler = callback
	}
	// }}}
		
	// Attach watcher to every named prop
	props.forEach(prop => this.$watch(prop, handler.bind(null, prop)));
}
</service>
