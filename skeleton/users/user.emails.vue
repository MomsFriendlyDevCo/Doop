<script lang="js" frontend>
/**
* Component which manages user email addresses
* This displays a simple table of email addresses with optional subscriptions next to each
* @param {array<Object>} value An object which contains the current email collection, should be of the form `[{email: String, ...: boolean}]`
* @param {array<Object>} fields Checkbox fields to display, each entity should be of the form `[{id: String, title: String, default?: true[default]/false/'firstOnly'}]`
* @emits change Emitted as `(emails)` when any of the contents changes
*/
app.component('userEmails', {
	data() { return {
		emails: [],
	}},
	props: {
		value: {type: Array, required: true},
		fields: {type: Array, required: true},
		user: {type: String},
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


		editEmailSignature(email) {
			// Already has a valid pointer - redirect to edit it
			if (email.signature) return this.$router.go(`/emailSignatures/${email.signature}`);

			// No existing signature - create stub then throw to edit
			return this.$http.post(`/api/emailSignatures`, {
				user: this.user,
				email: email.email,
			})
				.then(({data}) => email.signature = data._id)
				.then(()=> {
					this.$emit('change', this.emails)
					this.$emit('saveUser', this.emails)
				})
				.then(()=> this.$router.go(`/emailSignatures/${email.signature}`))
				.catch(this.$toast.catch)
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
});
</script>

<template>
	<table class="table table-striped">
		<thead>
			<th class="pl-4">Email address</th>
			<th v-for="field in fields" :key="field.id" class="text-center">{{field.title}}</th>
			<th v-if="$props.user" class="col-verbs"/>
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
					<v-toggle
						:value="email[field.id]"
						@change="email[field.id] = $event.value; $emit('change', emails)"
					/>
				</td>
				<td v-if="$props.user">
					<a @click="editEmailSignature(email)" class="btn btn-link far fa-file-signature" v-tooltip="'Edit email signature'"></a>
				</td>
				<td>
					<a @click="removeEmail(emailIndex)" class="btn btn-link btn-link-danger far fa-times" v-tooltip="'Remove this email address'"/>
				</td>
			</tr>
			<tr v-if="!emails.length">
				<td :colspan="fields.length + ($props.user ? 3: 2)" class="text-center text-muted p-3">
					<i class="far fa-info-circle"/>
					No email addresses specified
				</td>
			</tr>
		</tbody>
		<tfoot>
			<tr>
				<td :colspan="fields.length + ($props.user ? 3 : 2)" class="pl-4">
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
