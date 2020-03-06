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
		var settings = {
			...(typeof binding.value == 'object' ? binding.value : null),
			href:
				typeof binding.value == 'string' ? binding.value
				: binding.value ? binding.value.href
				: null,
		};

		if (settings.url) {
			console.warn('[DEPRECIATED] Do not pass `v-href="{url}"` property to v-href. Use `v-href="{href}"` for URL', settings.url);
			settings.href = settings.url;
		}

		if (!settings.href) return; // Nothing to bind to - URL will presumably be provided in update cycle

		settings.url = settings.href; // Copy href binding for the sake of vm.$router.{push,replace}

		var $el = $(el);

		switch ($el.prop('tagName')) {
			case 'A':
				if (!$el.hasClass('v-href')) {
					$el.addClass('v-href');
					$el[0].addEventListener('click', e => {
						e.preventDefault();
						e.stopPropagation();
						app.router.go(settings);
					});
				}

				if (typeof settings.href == 'string') $el.attr('href', settings.href)
				break;
			case 'TR':
				$el.children('td').each((i, td) => {
					var $td = $(td);
					if ($td.find('a').length) return; // Already has an <a/>

					if (typeof settings.href == 'string') $td.wrapInner(`<a` + (settings.href ? ` href="${settings.href}"` : '') + '></a>')

					$td
						.addClass('clickable')
						.on('click', 'a', e => {
							e.preventDefault();
							app.router.go(settings);
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
