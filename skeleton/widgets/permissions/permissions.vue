<component>
/**
* Check permissions before rendering contents
* @param {String/Array/Object} allow String, Array or SIFT of required permissions
*/
module.exports = {
	props: {
		allow: {type: [String,Array,Object], required: true},
	},
	functional: true,
	render: function (createElement, context) {
		var $session = Vue.services().$session;
		if (!$session.hasPermission(context.props.allow)) return;
		// Transparently pass any attributes, event listeners, children, etc.
		return createElement('div', context.data, context.children);
	},
};
</component>