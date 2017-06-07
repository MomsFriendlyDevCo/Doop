/**
* $deoid
* Simple service function to flatten all OID items while deep-cloning the incomming object
* This function will take any data structure and flatten all complex pointer objects (containing a `_id` key) into only the value of the ID key
*
* @param {*} i The item to remove OIDs from and clone
* @param {Object} [options] Additional options to pass
* @param {boolean} [optons.ignoreRoot=true] Ignore the first level of the first object passed (i.e. if being given an object don't flatten it into a string, but flatten its children)
* @return {*} A deep-clone of the originally provided object
* @author Matt Carter <m@ttcarter.com>
* @date 2017-05-30
* @example
* $deoid({title: 'Foo', widget: {_id: 123, ...}, users: [{_id: 456, ...}, {_id: 789}]})
* //=> {title: 'Foo', widget: 123, users: [456, 768]}
*/
angular.module('app')
.service('$deoid', function() {
	var isUsable = (v, k) =>
		(typeof k == 'string' && k.charAt(0) != '$') &&
		typeof v != 'function'; // Value is not a function

	var cloner = i => {
		if (_.isArray(i)) {
			return i.map(x => cloner(x));
		} else if (_.isObject(i) && !_.isUndefined(i._id)) {
			return _.clone(i._id);
		} else if (_.isObject(i)) {
			return _(i)
				.pickBy(isUsable)
				.mapValues(v => cloner(v))
				.value();
		} else {
			return _.clone(i);
		}
	};

	return function(item, options) {
		var settings = _.defaults(options, {
			ignoreTopMost: true,
		});

		if (settings.ignoreTopMost && (!_.isArray(item) && _.isObject(item))) {
			return _.cloneWith(_.omit(item, '_id'), cloner);
		} else {
			return _.cloneWith(item, cloner);
		}
	};
});
