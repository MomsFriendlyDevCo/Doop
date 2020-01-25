<script>
app.ready.then(()=> {
	/**
	* Display a MacGyver form
	* This function inherits all properties from dialog() but sets various sane defaults
	* @see $prompt.dialog()
	* @param {Object} options An options object
	* @param {Object|array} options.macgyver The MacGyver form to display
	* @param {string} [options.title='Input required'] The title of the dialog
	* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
	*/
	Vue.services().$prompt.macgyver = options => {
		return Vue.services().$prompt.dialog({
			title: 'Input required',
			dialogClose: 'reject', // Reject if the user had second thoughts
			component: 'promptMacgyver',
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
					click: ()=> Vue.services().$prompt.close(true, Vue.services().$prompt.settings.value),
				}],
			},
			...options,
		});
	};
});
</script>

<component>
module.exports = {
	methods: {
		change(value) {
			this.$prompt.settings.value = value;
		},
	},
};
</component>

<template>
	<div>
		<mg-form
			:config="$prompt.settings.macgyver"
			:data="$prompt.settings.value"
			@change="change"
		/>
	</div>
</template>
