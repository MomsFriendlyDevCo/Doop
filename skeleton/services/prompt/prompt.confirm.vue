<script lang="js" frontend>
app.ready.then(()=> {
	/**
	* Prompt with confirm / cancel buttons
	* This function inherits all properties from dialog() but sets various sane defaults suitable for a confirmation prompt
	* @see $prompt.dialog()
	* @param {Object|string} options Either an options object or the body text of the confirmation
	* @param {string} [options.title='Confirm action'] The title of the dialog
	* @param {string} [options.body='Are you sure you want to do this?'] The body of the dialog
	* @param {boolean} [options.isHtml=false] Whether the dialog body should be rendered as HTML (must be $sce compilable)
	* @param {array} [options.buttons=Confirm + Cancel]
	* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
	*/
	app.service.$prompt.confirm = options => {
		if (_.isString(options)) options = {body: options};
		return app.service.$prompt.dialog({
			title: 'Confirm action',
			body: 'Are you sure you want to do this?',
			dialogClose: 'reject', // Reject if the user had second thoughts
			buttons: {
				left: [{
					id: 'cancel',
					title: 'Cancel',
					method: 'reject',
					class: 'btn btn-danger',
					icon: 'fa fa-times',
				}],
				right: [{
					id: 'confirm',
					title: 'Confirm',
					method: 'resolve',
					class: 'btn btn-success',
					icon: 'fa fa-check',
				}],
			},
			...options,
		});
	};
});
</script>
