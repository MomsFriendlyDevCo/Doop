<directive>
/**
* Overload `v-href` to act like `<router-link/>` for regular elements and also help with table rows
* NOTE: This directive uses $router.go() behind the scenes so see its API definition on what you can pass as an object
*
* @example Make <a/> tags act like `<router-link/>`
* <a v-href="'/link/to/somewhere'">Text</a>
*
* @example Make <a/> tags link somewhere with a fancy transition
* <a v-href="{url: '/widgets', transition: 'slide-right'}">Text</a>
*
* @example Simple table links
* <table>
*   <tr v-for="widget in widgets" v-href="`/widgets/${widget._id}`">
*     <td>{{widget.title}}</td> <!-- This element gets an <a/> wrapper -->
*     <td><a href="/somewhere">Something</td> <!-- This element doesn't -->
*   </tr>
* </table>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);

		// Calculate the "simple" url we are redirecting to, if we have one
		var url = binding.value && _.isObject(binding.value) && binding.value.url && _.isString(binding.value.url) ? binding.value.url
			: binding.value && _.isString(binding.value) ? binding.value
			: undefined;
		
		switch ($el.prop('tagName')) {
			case 'A':

				if (!$el.hasClass('v-href')) {
					$el.addClass('v-href');
					$el[0].addEventListener('click', e => {
						e.preventDefault();
						app.router.go(binding.value);
					});
				}

				$el.attr('href', url)
				break;
			case 'TR':
				$el.children('td').each((i, td) => {
					var $td = $(td);
					if ($td.find('a').length) return; // Already has an <a/>
					$td
						.wrapInner(`<a` + (url ? ` href="${url}"` : '') + '></a>')
						.addClass('clickable')
						.on('click', 'a', e => {
							e.preventDefault();
							app.router.go(binding.value);
						})
				});
				break;
			default:
				throw new Error(`Cannot attach v-href to unhandled <${$el.prop('tagName')}/> tag`);
		}
	},
	componentUpdated(el, binding) {
		Vue.directive('href').bind(el, binding);
	},
};
</directive>
