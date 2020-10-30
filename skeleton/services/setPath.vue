<script>
/**
* Set a dotted notation or array path to a set value
* This function will correctly populate any missing entities, calling vm.$set on each traversal of the path
* Passing undefined as a value removes the key (unless removeUndefined is set to false)
*
* @param {Object} [target] The target to set the path of, if omitted the `vm` object is used as the base for traversal 
* @param {string|array} path The path to set within the target / vm
* @param {*} value The value to set
* @param {Object} [options] Additional options
* @param {boolean} [options.arrayNumeric=true] Process numeric path segments as arrays
* @param {boolean} [options.removeUndefined=true] If undefined is specified as a value the key is removed instead of being set
* @param {boolean} [options.debug=false] Also print out debugging information when setting the value
* @returns {Object} The set value, like $set()
*
* @example Set a deeply nested path within a target object
* vm.$setPath(this, 'foo.bar.baz', 123); // this.$data.foo.bar.baz = 123
*
* @example Set a deeply nested path, with arrays, assuming VM as the root node
* vm.$setPath('foo.1.bar', 123); // vm.$data.foo = [{bar: 123}]
*/
Vue.prototype.$setPath = function(target, path, value, options) {
	// Argument mangling {{{
	if (_.isString(target) || _.isArray(target) || value === undefined) { // called as (path, value)
		[target, path, value, options] = [this, target, path, value];
	} else if (!_.isObject(target)) {
		throw new Error('Cannot use $setPath on non-object target');
	}
	// }}}

	var settings = {
		arrayNumeric: true,
		debug: false,
		removeUndefined: true,
		...options,
	};

	if (settings.debug) console.debug('[$setPath]', path, '=', value, {target, options});

	var node = target;
	if (!path) throw new Error('Cannot $setPath with undefined path');
	(_.isString(path) ? path.split('.') : path).some((chunk, chunkIndex, chunks) => {
		if (chunkIndex == chunks.length - 1) { // Leaf node
			if (settings.removeUndefined && value === undefined) {
				this.$unset(node, chunk);
			} else {
				this.$set(node, chunk, value);
			}
		} else if (node[chunk] === undefined) { // This chunk (and all following chunks) does't exist - populate from here
			chunks.slice(chunkIndex, chunks.length - 1).forEach(chunk => {
				if (settings.arrayNumeric && isFinite(chunk)) {
					this.$set(node, chunk, []);
				} else {
					this.$set(node, chunk, {});
				}
				node = node[chunk];
			});
			this.$set(node, chunks[chunks.length - 1], value);
			return true;
		} else {
			node = node[chunk];
			return false;
		}
	});

	return value;
};
</script>
