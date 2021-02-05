<script lang="js" frontend>
app.ready.then(()=> {
	/**
	* Display a MacGyver form
	* This function inherits all properties from dialog() but sets various sane defaults
	*
	* The loaded mgForm ref is available as $prompt.settings.macgyverForm during onShow
	* @see $prompt.dialog()
	* @param {Object} options An options object
	* @param {Object|array} options.macgyver The MacGyver form to display
	* @param {string} [options.form] Optional mgForm reference name
	* @param {Object} [options.value] Optional MacGyver form values
	* @param {string} [options.title='Input required'] The title of the dialog
	* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
	*/
	app.service.$prompt.macgyver = options => {
		if (options.form && typeof options.form != 'string') throw new Error('$prompt.macgyver({form}) must be a string, use {macgyver} to pass form config');
		return app.service.$prompt.dialog({
			title: 'Input required',
			dialogClose: 'reject', // Reject if the user had second thoughts
			component: 'promptMacgyverComponent',
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
					class: 'btn btn-success',
					icon: 'fa fa-check',
					click: ()=> app.service.$prompt.close(true, app.service.$prompt.settings.value),
				}],
			},
			value: {},
			...options,
		});
	};
});
</script>
