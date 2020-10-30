<component>
/**
* Check permissions on a session object
* @param {String/Array/Object} allow String, Array or SIFT of required permissions
* @param {String/Boolean} any When checking for an array of permissions use OR rather than AND logic

* @example Check for a single permission
* <permissions allow="debug">
*   <div class="card">
*     <div class="card-header">
*       Permissions (Wrapped)
*     </div>
*     <div class="card-body">
*       string
*     </div>
*   </div>	
* </permissions>
*
* @example Ensure user has all listed permissions
* <permissions :allow="['debug','foo']">
*   <div class="card">
*     <div class="card-header">
*       Permissions (Wrapped)
*     </div>
*     <div class="card-body">
*       array (all)
*     </div>
*   </div>	
* </permissions>
*
* @example Ensure user has any of the listed permissions
* <permissions :allow="['debug','foo']" any="true">
*   <div class="card">
*     <div class="card-header">
*       Permissions (Wrapped)
*     </div>
*     <div class="card-body">
*       array (any)
*     </div>
*   </div>	
* </permissions>
*
* @example Customise query to include further conditions
* <permissions :allow="{ $or: [{'debug': false},{'foo': true}]}">
*   <div class="card">
*     <div class="card-header">
*       Permissions (Wrapped)
*     </div>
*     <div class="card-body">
*       SIFT
*     </div>
*   </div>
* </permissions>

*/
module.exports = {
	props: {
    allow: {type: [String,Array,Object], required: true},
    any: {type:[String,Boolean], required: false},
	},
	functional: true,
	render: function (createElement, context) {
		
		var $session = Vue.services().$session;
		//$session.$debugging = true;
		$session.$debug('permissions', context.props.allow, context.props.any, $session.hasPermission(context.props.allow));
		if (context.props.allow.any && !$session.hasPermission.any(context.props.allow)) return;
		if (!$session.hasPermission(context.props.allow)) return;
		// Transparently pass any attributes, event listeners, children, etc.
		return createElement('div', context.data, context.children)
	},
};
</component>
