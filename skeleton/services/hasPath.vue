<script lang="js" frontend>
/**
* Return whether a dotted notation or array path exists within the target
* This function acts very similar to the Lodash `_.has()` function
* This is just a thin wrapper for this.$getPath()
*
* @param {Object} [target] The target to check the path of, if omitted the `vm` object is used as the base for traversal 
* @param {string|array} path The path to scan within the target / vm
* @returns {boolean} Whether the specififed path exists within the object
*
* @example Check a deeply nested path within a target object
* vm.$hasPath(this, 'foo.bar.baz'); // True if this.$data.foo.bar.baz exists
*
* @example Check a deeply nested path, with arrays, assuming VM as the root node
* vm.$hasPath('foo.1.bar'); // True if vm.$data.foo exists
*/
app.mixin({
	methods: {
		$hasPath(target, path) {
			// Argument mangling {{{
			if (_.isString(target) || _.isArray(target)) { // called as (path)
				[target, path] = [this, target];
			} else if (!_.isObject(target)) {
				throw new Error('Cannot use $hasPath on non-object target');
			}
			// }}}

			return this.$getPath(target, path, undefined) !== undefined;
		},
	},
});
</script>
