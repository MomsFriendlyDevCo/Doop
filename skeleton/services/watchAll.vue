<script lang="js" frontend>
/**
* Binds a simple vm.$watchAll([props...], handler) function into the prototype scope
* This works similar to the Angular vm.$watch([...]) function
* @param {array <string|array>} props Named properties within `vm` to watch, dotted notation or array notation is supported
* @param {function} callback The callback to run when the watch triggers
* @param {Object} [options] Additional options
* @param {boolean} [options.deep=false] Recurse into deep object/array sets
* @param {boolean} [options.immediate=false] Execute the callback immediately on register, needAll can cause the callback not to fire if all required paths are not available yet
* @param {boolean} [options.needAll=false] Only fire the watcher when every single member listed has a non-undefined value
* @param {boolean} [options.needAllLock=true] After accepting all paths in `needAll`, ALWAYS call the callback in future, even if the values become undefined. Set to falsy to always check for the paths presence
* @param {boolean} [options.preventLoops=true] Assume that the watcher can effect a peer expression and that we should not keep retriggering this watch expression
*/
app.mixin({
	methods: {
		$watchAll(props, callback, options) {
			var settings = {
				needAll: false,
				needAllLock: true,
				preventLoops: true,
				deep: false,
				immediate: false,
				...options,
			};

			// Remap handler based on the settings {{{
			var handler;
			if (settings.needAll) { // Remap handler with extra behaviour that checks all properties first
				var seenAll = false; // Whether at some point we have seen all values
				handler = ()=> {
					if (settings.needAllLock && seenAll) return callback.apply(this, arguments);
					if (settings.preventLoops && this.$duringWatchAll) return; // Already updating
					if (settings.preventLoops) this.$duringWatchAll = true;
					if (props.some(p => !this.$hasPath(p))) { // Not ready yet
						this.$duringWatchAll = false;
						return;
					} else {
						seenAll = true;
					}
					callback.apply(this, arguments);
					if (settings.preventLoops) this.$duringWatchAll = false;
				};
			} else { // No special treatment - just pass the callback
				handler = callback
			}
			// }}}

			// Attach watcher to every named prop
			props.forEach(prop => this.$watch(prop, handler.bind(null, prop), {deep: settings.deep}));

			// Run handler immediately if needed
			if (settings.immediate) handler();
		},
	},
});
</script>
