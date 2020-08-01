<directive>
/**
* Check permissions and remove element if not allowed.
*/
module.exports = {
	inserted(el, binding, vnode) {
		if (!binding.value) return;

		var $el = $(el);
		var $session = Vue.services().$session;
		if (!$session.hasPermission(binding.value)) $el.remove();
	},
};
</directive>
