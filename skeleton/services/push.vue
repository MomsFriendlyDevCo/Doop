<script>
/**
* Push one or more items into an array, creating the array if it does not already exist
* This is largely because of the awkwardness of pushing items into an array within Vue where the new items are now already wrapped as getters / setters
*
* @param {Object} target The target object to push into
* @param {string} key The key of the object representing the array root
* @param {*} payload...
* @returns {Object} The root array after modification
*/
Vue.prototype.$push = function(target, key, ...payload) {
	if (!target[key]) { // Initial array setter
		Vue.set(target, key, payload);
	} else { // Append to existing array
		Vue.set(target, key, [...target[key], ...payload]);
	}

	return target[key];
};
</script>
