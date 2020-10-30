<directive>
/**
* Check permissions and remove element if not allowed.
*
* @example Check for a single permission
* <div v-permissions="'debug'">
*
* @example Ensure user has all listed permissions
* <div v-permissions="['debug','foo']">
*
* @example Ensure user has any of the listed permissions
* <div v-permissions.any="['debug','foo']">
*
* @example Customise query to include further conditions
* <div v-permissions="{ $or: [{'debug': false},{'foo': true}]}">
*/
module.exports = {
	bind(el, binding, vnode) {
		var permission = binding.value;

		var removeEl = () => {
			$el.html('');
			[...el.attributes].forEach(attr => el.removeAttribute(attr.name));
			$el.data('remove', true);
		};

		var $el = $(el);
		var $session = Vue.services().$session;
		//$session.$debugging = true;
		$session.$debug('permissions', permission, binding.arg, $session.hasPermission(permission));
		if (binding.arg === 'any' && !$session.hasPermission.any(permission)) return removeEl();
		if (!$session.hasPermission(permission)) return removeEl();
	},
	inserted(el, binding, vnode) {
		var $el = $(el);
		if ($el.data('remove')) $el.remove();
	},
};
</directive>
