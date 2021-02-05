<script lang="js" frontend>
/**
* Extension for $prompt that adds list selection
* @param {Object} [options] Options to use when displaying the prompt
* @param {array} [options.list] The list contents to display (specify either `list` or `url`)
* @param {string} [options.url] The URL to pull the list contents from
* @param {string} [options.field="title"] The field to display in the list, this can also be a CSV of fields to pull, the first is always the display and the rest are included in the data feed
* @param {number} [options.limit=30] Number of records to retrieve on each page view
* @param {string|boolean} [options.sort=true] Whether to sort the fields, if Boolean true the same field as `field` is used as the sort criteria
* @param {string} [options.searchMethod='regex'] How to search on the API endpoint. ENUM: 'regex' (use Mongo $regex method), 'q' (allow fuzzy searching)
* @returns {Promise<Object>} The selected full item (i.e. you need to extract the specific field you want yourself)
*/
app.ready.then(()=> {
	app.service.$prompt.list = options => app.service.$prompt.dialog({
		list: [],
		url: undefined,
		field: 'title',
		limit: 30,
		sort: true,
		searchMethod: 'regex',

		title: 'Select an option',
		component: 'promptListComponent',
		buttons: null,
		dialogClose: 'reject',
		...options,
	});
})
</script>
