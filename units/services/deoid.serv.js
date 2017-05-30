/**
* $deoid
* Simple service function to flatten all OID items while deep-cloning the incomming object
* This function will take any data structure and flatten all complex pointer objects (containing a `_id` key) into only the value of the ID key
*
* @param {*} i The item to remove OIDs from and clone
* @return {*} A deep-clone of the originally provided object
* @author Matt Carter <m@ttcarter.com>
* @date 2017-05-30
* @example
* $deoid({title: 'Foo', widget: {_id: 123, ...}, users: [{_id: 456, ...}, {_id: 789}]})
* //=> {title: 'Foo', widget: 123, users: [456, 768]}
*/
angular.module('app')
.service('$deoid', function() {
	var cloner = i => {
		if (_.isArray(i)) {
			return i.map(x => cloner(x));
		} else if (_.isObject(i) && !_.isUndefined(i._id)) {
			return _.clone(i._id);
		} else if (_.isObject(i)) {
			return _.mapValues(i, v => cloner(v));
		} else {
			return _.clone(i);
		}
	};

	return item => _.cloneWith(item, cloner);
});
