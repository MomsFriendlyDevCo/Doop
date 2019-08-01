<script>
/**
* Add a simple multi-setter which works as a combination of Object.assign() and Vues vm.$set
* @param {Object} target The target to set the merged objects into
* @param {Object} [payload...] Objects to merge into target
* @returns {Object} The target object
*
* @example Patch an object with new keys
* vm.$assign(this.widget, {id: 123, name: 'My widget'})
*/
Vue.prototype.$assign = (target, ...payload) => {
	payload.forEach(pl => {
		Object.keys(pl).forEach(k => {
			Vue.set(target, k, pl[k]);
		});
	});
	return target;
};
</script>
