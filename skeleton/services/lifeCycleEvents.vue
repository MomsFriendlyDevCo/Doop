<script>
/**
* Glue some simple events to Vue components during their lifecycle
*
* @emits $destroy Emitted as (_uid) whenever a component is about to be destroyed
*/
Vue.mixin({
	beforeDestroy() {
		this.$emit('$destroy', this._uid);
	},
});
</script>
