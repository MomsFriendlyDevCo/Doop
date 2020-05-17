<directive>
/**
* Quick and dirty directive to bind datalists to input boxes
* Data lists are a browser supported method to provide suggested dropdown list data to input elements
*
* @param {Object} options The options to process
* @param {string} options.url Where to pull the data to populate the list, the default expected payload is an array of strings
* @param {boolean} [options.lazy=false] If lazy only pull in data when the user clicks, otherwise preemptively try to fetch the data list feed
* @param {boolean} [options.autoComplete=true] When pressing any of the ASCII keycodes in `autoCompleteKeyCodes`, select the first viable option
* @param {array<number>} [options.autoCompleteKeyCodes] List of keycodes to auto complete on, defaults to only tab + enter (`[9, 13]`)
* @param {function} [options.fetch] Called as `(settings)` when fetching the data feed, loads data from the URL and creates a `<datalist id="{settings.dListId}"/>`
* @param {string} [options.dlistId] The data list ID to generate, if unspecified the URL is mutated into something semi-unique
*
* @example Show a text box with suggested data loaded from a URL
* <input v-model="myData" v-datalist="{url: '/api/widgets'}"/>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);
		var isLoading = false;

		if (!_.isPlainObject(binding)) throw new Error('v-datalist directive requires a single object binding');

		var settings = {
			url: undefined,
			dlistId: undefined,
			lazy: false,
			autoComplete: true,
			autoCompleteKeyCodes: [9, 13],
			fetch: settings=> Vue.services().$http.get(settings.url)
				.then(res => {
					// Make a dummy list in case anything else asks for data while we're loading
					var dlist = $(`<datalist id="${settings.dlistId}"></datalist>`).appendTo($('body'));
					$el.attr('list', settings.dlistId);

					res.data.forEach(item => dlist.append(`<option value="${item}">`));
				}),
			...binding.value,
		};
		if (!settings.url) throw new Error('v-datalist requires a URL option to be specified');
		if (!settings.dlistId) settings.dlistId = 'datalist-' + settings.url.toLowerCase().replace(/[^a-z0-9\-]+/g, '');
		if (!settings.lazy) settings.fetch(settings);

		$el
			.on('click', ()=> {
				if (!$el.hasClass('v-datalist-loaded')) { // No data yet loaded
					if (isLoading) return; // Already loading
					isLoading = true;

					var existingDlist = $(`datalist#${settings.dlistId}`);
					if (existingDlist.length) { // Found existing Dlist loaded by something else
						$el.attr('list', settings.dlistId);
					} else { // No existing Dlist - go load it
						settings.fetch(settings);
					}
				}
			})
			.on('keydown', e => {
				if (!settings.autoComplete) return; // Auto complete is disabled
				if (!settings.autoCompleteKeyCodes.includes(e.which)) return; // Key code is not set to auto complete
				var inputVal = e.target.value.toLowerCase();

				var selectOption = Array.from($(`datalist#${settings.dlistId}`)[0].options)
					.map(oEl => oEl.value)
					.find(option => option.toLowerCase().includes(inputVal)) // Select first matching option

				if (selectOption) e.target.value = selectOption;
			})
	},
};
</directive>
