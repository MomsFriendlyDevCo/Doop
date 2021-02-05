<script lang="js" frontend>
/**
* Extension for $prompt that adds simple text input
* @param {Object} [options] Options to use when displaying the prompt
* @param {string} [options.title="Input text"] Title of the prompt window
* @param {string} [options.default=""] Default value of the input box
* @param {string} [options.placeholder=""] Placeholder for the input box
* @param {string} [options.prefix=""] Optional prefix for the input element
* @param {string} [options.sufffix=""] Optional suffix for the input element
*
* @example Prompt for a users name
* vm.$prompt.input({title: 'What is your name'}).then(response => ...)
*/
app.ready.then(()=> {
	app.service.$prompt.input = options => app.service.$prompt.dialog({
		title: 'Input text',
		body: '',
		placeholder: '',
		component: 'promptInputComponent',
		value: options.default || '',
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
				click: ()=> app.service.$prompt.resolve(app.service.$prompt.settings.value),
			}],
		},
		dialogClose: 'reject',
		...options,
	});
})
</script>
