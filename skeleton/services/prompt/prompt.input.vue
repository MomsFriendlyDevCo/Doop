<script>
/**
* Extension for $prompt that adds simple text input
* @param {Object} [options] Options to use when displaying the prompt
* @param {string} [options.title="Input text"] Title of the prompt window
* @param {string} [options.default=""] Default value of the input box
* @param {string} [options.placeholder=""] Placeholder for the input box
*
* @example Prompt for a users name
* vm.$prompt.input({title: 'What is your name'}).then(response => ...)
*/
app.ready.then(()=> {
	Vue.services().$prompt.input = options => Vue.services().$prompt.dialog({
		title: 'Input text',
		body: '',
		placeholder: '',
		component: 'promptInput',
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
				click: ()=> Vue.services().$prompt.resolve(Vue.services().$prompt.settings.value),
			}],
		},
		dialogClose: 'reject',
		...options,
	});
})
</script>

<component>
module.exports = {
	methods: {
		keydown(e) { // Reject when the user presses escape
			if (e.which === 27) this.$prompt.reject();
		},
		submit() { // Accept the promise when the user submits the form (Enter or whatever)
			return this.$prompt.resolve(this.$prompt.settings.value);
		},
	},
};
</component>

<template>
	<form class="form-horizontal" @submit.prevent="submit()">
		<div class="form-group row">
			<div class="col-12">
				<div class="input-group">
					<input
						type="search"
						v-model="$prompt.settings.value"
						class="form-control"
						:placeholder="$prompt.settings.placeholder"
						@keydown="keydown"
						autofocus
					/>
				</div>
			</div>
		</div>
	</form>
</template>
