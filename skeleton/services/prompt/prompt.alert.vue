<script lang="js" frontend>
app.ready.then(()=> {
	/**
	* Display a general alert dialog
	* This function inherits all properties from dialog() but sets various sane defaults suitable for a simple message
	* @see $prompt.dialog()
	* @param {Object|string} options Either an options object or the body text of the alert
	* @param {string} [options.title='Alert'] The title of the alert
	* @param {string} [options.body='Be alerted'] The body of the alert message
	* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
	*/
	app.service.$prompt.alert = options => {
		if (_.isString(options)) options = {title: options};
		return app.service.$prompt.dialog({
			title: 'Alert',
			body: 'Be alerted',
			dialogClose: 'resolve', // Alerts dont ever reject
			buttons: {
				center: [{
					id: 'close',
					title: 'Close',
					method: 'resolve',
				}],
			},
			...options,
		});
	};
});
</script>
