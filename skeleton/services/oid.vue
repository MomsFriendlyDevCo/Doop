<script lang="js" frontend>
/**
* Utility functions to attach, detach and generally manage meta Object IDs
* This service exists because sometimes it may be necessary to attach tracking information into a Vue object which needs to be removed before it gets thrown at the server
*
* @example Glue oids into a collection of widgets
* this.$oid.attachCollection(this.widgets)
*
* @example Remove the same OIDs before sending them to the server
* this.$http.post('/api/widgets', {widgets: this.$oid.deoid(this.widgets)})
*/

app.service('$oid', function() {
	var $oid = {};

	$oid.settings = {
		key: '$id', // What key to use when attaching to objects
		deoidMatcher: /^$id/, // 'OID' like keys to remove from objects
		prefix: '$id_',
		suffix: '',
		counter: 0,
		padding: 4,
		padChar: '0',
	};


	/**
	* Fetch the next allocatable OID
	* @returns {string} The next unique OID
	*/
	$oid.next = ()=> $oid.settings.prefix + _.padStart(++$oid.settings.counter, $oid.settings.padding, $oid.settings.padChar) + $oid.settings.suffix;


	/**
	* Safely allocate an OID to an object
	* @param {Object} obj The object to allocate the OID to
	* @returns {string} The allocated OID
	*/
	$oid.attach = obj => app.set(obj, $oid.settings.key, $oid.next());


	/**
	* Same as $oid.attach but attaches to an entire collection
	* @param {Array} col The collection to attach to
	* @returns {Array} The input collection
	*/
	$oid.attachCollection = col => {
		col.forEach(c => {
			if (!_.isObject(c)) throw new Error('Attempting to attach OID to a non object in collection');
			$oid.attach(c);
		});
		return col;
	};


	/**
	* Deep clone the object removing all OIDs
	* This function creates a deep clone using _.cloneDeep but removes all OIDlike items
	* @param {*} doc Input object to scan
	* @returns {Object} Deeply cloned copy of doc with all OIDlike items removed
	*/
	$oid.deoid = doc => {
		var cloner = (v, k) => {
			if (_.isObject(v)) { // Handle object traversal ourselves
				return _.cloneDeepWith(v, _.omitBy(v, (v2, k2) => !$oid.settings.deoidMatcher.test(k2)));
			} // Implied else - let Lodash handle it
		};

		return _.cloneDeepWith(doc, cloner);
	};

	return $oid;
});
</script>
