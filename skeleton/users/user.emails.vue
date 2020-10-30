<component>
/**
* Component which manages user email addresses
* This displays a simple table of email addresses with optional subscriptions next to each
* @param {array<Object>} value An object which contains the current email collection, should be of the form `[{email: String, ...: boolean}]`
* @param {array<Object>} fields Checkbox fields to display, each entity should be of the form `[{id: String, title: String, default?: true[default]/false/'firstOnly'}]`
* @emits change Emitted as `(emails)` when any of the contents changes
*/
module.exports = {
	data() { return {
		emails: [],
	}},
	props: {
		value: {type: Array, required: true},
		fields: {type: Array, required: true},
	},
	methods: {
		/**
		* Add a new email to the list
		* @param {string} [value] Optional email to populate
		* @param {boolean} [focus=true] Also set the keyboard focus to the new element
		*/
		addEmail(value, focus = true) {
			this.emails.push({
				email: value,
				..._(this.fields)
					.mapKeys(field => field.id)
					.mapValues(field =>
						field.default === undefined ? true // Assume true
						: field.default == 'firstOnly' ? this.value.length == 0
						: field.default
					)
					.value(),
			});

			if (focus) this.$nextTick(()=> $(this.$el).find('tbody input[type=email]').last().focus());
		},


		/**
		* Remove an email address by index
		* @param {number} index The index to remove
		*/
		removeEmail(index) {
			this.emails.splice(index, 1);
			this.$emit('change', this.emails);
		},
	},
	watch: {
		'$prop.value': { // Copy $props.value -> emails
			immediate: true,
			deep: true,
			handler() {
				this.emails = _.cloneDeep(this.$props.value);
			},
		},
	},
};
</component>

<template>
	<table class="table table-striped">
		<thead>
			<th class="pl-4">Email address</th>
			<th v-for="field in fields" :key="field.id" class="text-center">{{field.title}}</th>
			<th class="col-verbs"/>
		</thead>
		<tbody>
			<tr v-for="(email, emailIndex) in emails" :key="emailIndex">
				<td class="pl-4">
					<input
						v-model="email.email"
						type="email"
						class="form-control"
						@change="$emit('change', emails)"
					/>
				</td>
				<td v-for="field in fields" :key="field.id" class="text-center">
					<toggle-button
						:value="email[field.id]"
						@change="email[field.id] = $event.value; $emit('change', emails)"
					/>
				</td>
				<td>
					<a @click="removeEmail(emailIndex)" class="btn btn-link btn-link-danger far fa-times" v-tooltip="'Remove this email address'"/>
				</td>
			</tr>
			<tr v-if="!emails.length">
				<td :colspan="fields.length + 2" class="text-center text-muted p-3">
					<i class="far fa-info-circle"/>
					No email addresses specified
				</td>
			</tr>
		</tbody>
		<tfoot>
			<tr>
				<td :colspan="fields.length + 2" class="pl-4">
					<input
						:value="''"
						type="email"
						class="form-control"
						@input.capture="addEmail($event.data, true)"
						placeholder="Add email address..."
					/>
				</td>
			</tr>
		</tfoot>
	</table>
</template>
