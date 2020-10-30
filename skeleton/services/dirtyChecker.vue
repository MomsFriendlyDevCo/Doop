<service singleton>
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
module.exports = function() {
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
						Vue.prototype.$assign(obj, newObj);
						return obj;
					};
				} else if (prop == '$drop') {
					return ()=> {
						for (var k in obj) {
							Vue.delete(obj, k);
						}
						return obj;
					};
				} else if (prop == '$overwrite') {
					return newObj => {
						for (var k in obj) {
							Vue.delete(obj, k);
						}
						Vue.prototype.$assign(obj, newObj);
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
	* Convenience function to wrap both Vue.set() + vm.$dirtyChecker() together
	* @example Set and dirty check a value
	* vm.$dirtyChecker.set(this, 'someKey', {foo: 1});
	*/
	$dirtyChecker.set = (target, key, src) => Vue.set(target, key, $dirtyChecker(src));

	return $dirtyChecker;
};
</service>

<component>
module.exports = {
	route: '/debug/dirtyChecker',
	data() { return {
		data: undefined,
	}},
	methods: {
		reset() {
			this.$dirtyChecker.set(this, 'data', {
				foo: 'Foo!',
				bar: 123,
				baz: [1, 2, 3],
				quz: {quz2: {quz3: [1, 2, {quz4: 5}]}},
			});
		},
		changeFoo() {
			this.data.foo = _.sample(['foo', 'Foo', 'foo!', 'Foo!']);
		},
		changeBar() {
			this.data.bar = _.random(1, 999);
		},
		changeBaz() {
			this.$set(this.data, 'baz', _.times(_.random(1, 5), ()=> _.random(1, 9)));
		},
		changeQuz() {
			this.data.quz.quz2.quz3[2].quz4 = _.random(100, 999);
		},
	},
	created() {
		this.reset();
	},
};
</component>

<template>
	<div class="row">
		<div class="col-xs-12 col-md-6">
			<div class="card">
				<div class="card-body">
					<div class="form-group row">
						<label class="col-4 col-form-label">Is Dirty?</label>
						<div class="col-8 col-form-label">
							{{data.$isDirty}}
						</div>
					</div>
					<div class="form-group row">
						<label class="col-4 col-form-label">Original</label>
						<div class="col-8 col-form-label">
							{{data.$original}}
						</div>
					</div>
					<div class="form-group row">
						<label class="col-4 col-form-label">Diff</label>
						<div class="col-8 col-form-label">
							<pre>{{data.$diff}}</pre>
						</div>
					</div>
				</div>
				<div class="list-group">
					<a class="list-group-item" @click="changeFoo()">Change Foo</a>
					<a class="list-group-item" @click="changeBar()">Change Bar</a>
					<a class="list-group-item" @click="changeBaz()">Change Baz</a>
					<a class="list-group-item" @click="changeQuz()">Change Quz</a>
					<a class="list-group-item" @click="changeFoo(); changeBar(); changeBaz(); changeQuz()">Change All</a>
					<a class="list-group-item" @click="data.$clear()">Clear</a>
					<a class="list-group-item" @click="data.$assign({quark: 1})">Assign Quark</a>
					<a class="list-group-item" @click="data.$overwrite({flarp: 1})">Overwrite Flarp</a>
					<a class="list-group-item" @click="data.$drop()">Drop</a>
					<a class="list-group-item" @click="reset()">Reset</a>
				</div>
			</div>
		</div>
		<div class="col-xs-12 col-md-6">
			<div class="card">
				<div class="card-body">
					<pre>{{data}}</pre>
				</div>
			</div>
		</div>
	</div>
</template>
