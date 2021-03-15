<script lang="js" frontend>
/**
* Get a dotted notation or array path
* This function acts very similar to the Lodash `_.get()` function
*
* @param {Object} [target] The target to get the path of, if omitted the `vm` object is used as the base for traversal 
* @param {string|array} path The path to scan within the target / vm
* @param {*} [fallback=undefined] Fallback value to use if the path is not found
* @returns {*} Either the found value at the path endpoint or the fallback value
*
* @example Get a deeply nested path within a target object
* vm.$getPath(this, 'foo.bar.baz'); // The value of this.$data.foo.bar.baz
*
* @example Get a deeply nested path, with arrays, assuming VM as the root node and a fallback
* vm.$getPath('foo.1.bar', 123); // The value of vm.$data.foo OR 123 if it doesnt exist
*/
app.mixin({
	methods: {
		$getPath(target, path, fallback) {
			// Argument mangling {{{
			if (_.isString(target) || _.isArray(target)) { // called as (path, fallback)
				[target, path, fallback] = [this, target, path];
			} else if (!_.isObject(target)) {
				throw new Error('Cannot use $getPath on non-object target');
			}
			// }}}

			var node = target;
			return (_.isString(path) ? path.split('.') : path).find((chunk, chunkIndex, chunks) => {
				if (node[chunk] === undefined) { // Endpoint or path waypoint doesn't exist
					return fallback;
				} else if (chunkIndex == chunks.length - 1) { // At leaf node
					return node[chunk];
				} else { // Keep traversing down branch node
					node = node[chunk];
				}
			});
		},
	},
});
</script>
