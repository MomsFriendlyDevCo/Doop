<script lang="js" frontend>
/**
* Exports a helper function which provides dirty checking against an object
*
* The return value is the input value wrapped in a proxy with extra properties / methods:
*
* '$isDirty' (bool)
* '$original' (original object)
* `$changed(key)` (returns a boolean if the specified key has changed)
* `$clear()` (sets the dirty bit to false, reimages the object and returns the new value. Effectively recreating the proxy)
* `$diff` (object difference by key)
* `$assign(newObject)` Splice one object into the one being monitored, does not call $clear() automatically
* `$drop()` Drop all existing keys for the object - sets the object state to empty, does not call $clear() automatically
* `$overwrite(newObject)` Overwrite all keys of an object without breaking its pointer - convenience wrapper for $drop() + $assign(newObject) + $clear()
*
* NOTE: This function uses 'lazy' dirty checking which locks as 'dirty' on the first detected change. Changing the value BACK will not reset this
*
* @param {Object} src The source object to wrap
* @returns {Proxy} A proxy wrapped object suitable for dirty checking
*/
app.service('$dirtyChecker', function() {
	var $dirtyChecker = function(src) {
		var originalDoc = _.cloneDeep(src);
		var isDirty = false; // Dirty lock, when changed this locks in place

		var $changed = key => !_.isEqual(originalDoc[key], _.toPlainObject({value: src[key]}).value);

		return new Proxy(src, {
			get: (obj, prop) => {
				if (prop == '$isDirty') {
					if (isDirty) { // Already declared as dirty
						return true;
					} else if (!_.isEqual(originalDoc, _.toPlainObject(obj))) { // Has changed?
						isDirty = true;
						return true;
					} else { // Still clean
						return false;
					}
				} else if (prop == '$original') {
					return originalDoc;
				} else if (prop == '$changed') {
					return $changed;
				} else if (prop == '$clear') {
					return ()=> {
						originalDoc = _.cloneDeep(obj);
						isDirty = false;
						return obj;
					};
				} else if (prop == '$diff') {
					return _.pickBy(src, (v, k) => $changed(k));
				} else if (prop == '$assign') {
					return newObj => {
						app.vue.prototype.$assign(obj, newObj);
						return obj;
					};
				} else if (prop == '$drop') {
					return ()=> {
						for (var k in obj) {
							app.delete(obj, k);
						}
						return obj;
					};
				} else if (prop == '$overwrite') {
					return newObj => {
						for (var k in obj) {
							app.delete(obj, k);
						}
						app.vue.prototype.$assign(obj, newObj);
						originalDoc = _.cloneDeep(obj);
						isDirty = false;
						return obj;
					};
				} else { // Drop through to direct access for everything else
					return obj[prop];
				}
			},
		});
	};


	/**
	* Convenience function to wrap both app.set() + vm.$dirtyChecker() together
	* @example Set and dirty check a value
	* vm.$dirtyChecker.set(this, 'someKey', {foo: 1});
	*/
	$dirtyChecker.set = (target, key, src) => app.set(target, key, $dirtyChecker(src));

	return $dirtyChecker;
});
</script>
