<script lang="js" frontend>
/**
* Overload `v-href` to act like `<router-link/>` for regular elements and also help with table rows
* NOTE: This directive uses $router.go() behind the scenes so see its API definition on what you can pass as an object
*
* @param {string|number|Object|function} location The URL to navigate to or the number of steps forward / backward to navigate, if this is a function it is executed inline
* @see go() for other parameters
* @param {boolean} [stop=true] Fire event.stopPropagation() on click
* @param {boolean} [prevent=true] Fire event.preventDefault() on click, disabling this will likely cause the link to be clicked twice
* @param {boolean} [allowTab=true] Allow middle clicking to open a new tab by adding a `href` attribute to `<a/>` tags
*
* @param {boolean} [modifier.window] Sets {target: '_blank'} - i.e. open in a new tab / window
* @param {boolean} [modifier.nostop] Sets {stop: false} - i.e. prevent `e.stopPropagation()` by default
*
*
* @example Make <a/> tags act like `<router-link/>`
* <a v-href="'/link/to/somewhere'">Text</a>
*
* @example Make <a/> tags link somewhere with a fancy transition
* <a v-href="{href: '/widgets', transition: 'slide-right'}">Text</a>
*
* @example Simple table links
* <table>
*   <tr v-for="widget in widgets" v-href="`/widgets/${widget._id}`">
*     <td>{{widget.title}}</td> <!-- This element gets an <a/> wrapper -->
*     <td><a href="/somewhere">Something</td> <!-- This element doesn't -->
*   </tr>
* </table>
*/
app.directive('v-href', {
	bind(el, binding) {
		var settings = {
			stop: true,
			prevent: true,
			allowTab: true,
			...(typeof binding.value == 'string' ? {href: binding.value} : binding.value),
		};

		// TODO: :href is able to respond to changes, this binding does not.
		// i.e. :href="`/collection/edit/${collection._id}`" vs v-href="`/collection/edit/${collection._id}`"

		// Profess modifiers into settings
		if (binding.modifiers.window) settings.target = "_blank";
		if (binding.modifiers.nostop) settings.stop = false;

		if (settings.url) {
			console.warn('[DEPRECIATED] Do not pass `v-href="{url}"` property to v-href. Use `v-href="{href}"` for URL', settings.url);
			settings.href = settings.url;
		}

		if (!settings.href) return; // Nothing to bind to - URL will presumably be provided in update cycle

		settings.url = settings.href; // Copy href binding for the sake of vm.$router.{push,replace}

		var $el = $(el);

		switch ($el.prop('tagName')) {
			case 'A':
				$el.addClass('v-href');
				$el.first().off('click').on('click', e => {
					if (settings.prevent) e.preventDefault();
					if (settings.stop) e.stopPropagation();
					app.router.go(settings);
				});

				if (settings.allowTab && typeof settings.href == 'string') $el.attr('href', settings.href)
				break;
			case 'TR':
				$el.children('td').each((i, td) => {
					var $td = $(td);
					if ($td.find('a').length) return; // Already has an <a/>

					if (typeof settings.href == 'string') $td.wrapInner(`<a` + (settings.allowTab && settings.href ? ` href="${settings.href}"` : '') + '></a>')

					$td
						.addClass('clickable')
						.off('click')
						.on('click', 'a', e => {
							if (settings.prevent) e.preventDefault();
							app.router.go(settings);
						})
				});
				break;
			default:
				throw new Error(`Cannot attach v-href to unhandled <${$el.prop('tagName')}/> tag`);
		}
	},

	componentUpdated(el, binding) {
		app.directive('href').bind(el, binding);
	},
});
</script>
