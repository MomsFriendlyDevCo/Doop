<script lang="js" frontend>
// Actual highlight worker code (needs to be shared between bind / componentUpdated) {{{
var highlightUpdate = (el, binding) => {
	var settings = {
		...(_.isString(binding.value) || _.isArray(binding.value) || _.isRegExp(binding.value) ? {highlight: binding.value} : binding.value),
		cleanup: html => html.replace(/<span class="v-highlight">(.*?)<\/span>/gs, '$1'),
		enclosure: contents => `<span class="v-highlight">${contents}</span>`,
		children: false,
		enabled: true,
		autoSplit: true,
		autoEnabled: true,
		reOptions: 'ig',
	};

	// Highlight type overloading {{{
	if (!settings.highlight && settings.autoEnabled) {
		settings.enabled = false;
	} else if (!settings.highlight) {
		throw new Error('No highlight string / array passed to v-highlight and {autoEnabled: false}');
	} else if (_.isRegExp(settings.highlight)) { // RegExp
		// Pass
	} else if (_.isString(settings.highlight) && settings.autoSplit) { // String + autoSplit
		settings.highlight = new RegExp(settings.highlight.split(/\s+/).filter(Boolean).map(RegExp.escape).join('|'), settings.reOptions);
	} else if (_.isString(settings.highlight)) { // String + !autoSplit
		settings.highlight = new RegExp(RegExp.escape(settings.highlight), settings.reOptions);
	} else if (_.isArray(settings.highlight)) { // Array<string>
		settings.highlight = new RegExp(settings.highlight.map(RegExp.escape).filter(Boolean).join('|'), settings.reOptions);
	} else {
		throw new Error('Unknown highlight type given to v-highlight');
	}
	// }}}

	(settings.children ? $(el).find(settings.children) : $(el)) // Select either just the parent + direct text content or children based on selector
		.each((index, child) => {
			var $child = $(child);
			var html = settings.cleanup($(child).html());

			if (settings.enabled)
				$(child).html(
					html.replace(settings.highlight, settings.enclosure)
				)
		})
};
// }}}

/**
* Highlight a string within any complex HTML children
* This is used to show search results against a value
*
* @param {Object|string|array<string>|RegExp} settings Either a settings object or the assumed content of `settings.highlight`
* @param {string|array<string>|RegExp} [settings.highlight] Either a single string to highlight, an array of all matches or RegExp to find matches
* @param {function} [settings.enclosure] Function called as `(contents)` which is expected to return the HTML wrapper
* @param {string|boolean} [settings.children=false] Either `false` to only scan the contents of the element or a jQuery selector to scan children recursively
* @param {boolean} [settings.autoSplit=true] Automatically split multi-word highlights into an array of strings to highlight
*/
app.directive('v-highlight', {
	bind: highlightUpdate,
	componentUpdated: highlightUpdate,
});
</script>

<style>
.v-highlight {
	background-color: var(--main-highlight);
	border-radius: 2px;
}
</style>
