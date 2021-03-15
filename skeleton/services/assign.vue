<script lang="js" frontend>
/**
* Add a simple multi-setter which works as a combination of Object.assign() and Vues vm.$set
* @param {Object} [target] The target to set the merged objects into, if only one object is passed (i.e. no target) the root scope is assumed
* @param {Object} [payload...] Objects to merge into target
* @returns {Object} The target object
*
* @example Patch an object with new keys
* vm.$assign(this.widget, {id: 123, name: 'My widget'})
*/
app.mixin({
	methods: {
		$assign(target, ...payload) {
			// Argument munging {{{
			if (!payload.length && typeof target == 'object') [target, payload] = [this, [target]]; // If no payload assume the first arg just needs merging into `this`
			// }}}

			payload.forEach(pl => {
				Object.keys(pl).forEach(k => {
					app.set(target, k, pl[k]);
				});
			});

			return target;
		},
	},
});
</script>
