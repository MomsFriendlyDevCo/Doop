<script>
/**
* Component which displays a multi-select control that allows user selection and optionally also raw email addresses
* This component exports a collection which resembles `{user: user._id, email: rawString}`
*
* @param {array <Object>|array <string>} selected Collection of emails that are currently selected
* @param {string} [idField="_id"] The primary key of the user when selecting a specific user document
* @param {string} [labelField="name"] The display field of a selected user
* @param {string} [emailField="email"] The email field of the user
* @param {string} [placeholder="Enter email addresses or pick a user..."]
* @param {string} [digestUrl="/api/users"] Where to pull the user list from (default is composed of the url + selection of idField, labelField, emailField)
* @emits change Event emitted as `newValue` whenever the user changes anything, value is an collection with each item conforming to {user,email}
* @emits change-emails Event emitted as  `newValue` whenever the user changes anything, value is a simple array of email addresses
*
* @example
* <emails :selected="emails" @change="emails = $event"/>
*/
app.component('emails', {
	data() { return {
		options: undefined,
		userCache: {},
	}},
	props: {
		selected: {type: Array},
		idField: {type: String, default: '_id'},
		labelField: {type: String, default: 'name'},
		emailField: {type: String, default: 'email'},
		placeholder: {type: String, default: 'Enter email addresses or pick a user...'},
		userUrl: {type: String, default() { return `/api/users?select=${this.$props.idField},${this.$props.labelField},${this.$props.emailField}` }},
	},
	computed: {
		selectedItems() {
			return (this.$props.selected || [])
				.map(i => {
					if (_.isObject(i) && i.user) { // Only user linkage
						var foundUser = (this.options || []).find(o => o.id == i.user);
						if (foundUser) { // We know this user from the available options data
							return {id: i.user, label: foundUser.label};
						} else if (foundUser = this.$digest.getSync(`/api/users/${i.user}`, 'name')) { // Does $digest have the lookup cached?
							return {id: i.user, label: foundUser};
						} else if (this.userCache[i.user]) { // Do we have this in the user cache?
							return this.userCache[i.user];
						} else { // Make a lazy fetch request to find the user and dynamically update their name
							this.$set(this.userCache, i.user, {
								loading: true,
								label: i.user,
								id: i.user,
							});

							// Make a passive request to get the users name
							this.$digest.get(`/api/users/${i.user}`, 'name')
								.then(name => {
									this.$set(this.userCache[i.user], 'label', name);
									this.$set(this.userCache[i.user], 'loading', false);
								});

							return this.userCache[i.user];
						}
					} else if (_.isObject(i) && i.email) { // Only email
						return {label: i.email};
					} else if (_.isString(i)) { // List of emails
						return {label: i};
					} else {
						return;
					}
				})
				.filter(i => i);
		},
	},
	methods: {
		change(value) {
			this.$emit('change', value.map(v => v.id ? {user: v.id} : {email: v.label}));
			this.$emit('change-emails', value.map(v => v.email || v.label));
		},
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$digest.get(this.$props.userUrl))
				.then(res => this.options = res.map(u => ({
					id: u[this.$props.idField],
					label: u[this.$props.labelField],
					email: u[this.$props.emailField],
				})))
				.finally(()=> this.$loader.stop())
		},
		lazyRefresh() {
			if (!this.options) return this.refresh();
		},
	},
});
</script>

<template>
	<div class="emails">
		<v-select
			:options="options"
			:value="selectedItems"
			:placeholder="$props.placeholder"
			multiple
			taggable
			select-on-tab
			@input="change"
			@search:focus="lazyRefresh()"
		>
			<template slot="option" slot-scope="option">
				<i class="fas fa-user"/>
				{{option.label}}
			</template>
			<template slot="selected-option" slot-scope="option">
				<i :class="option.loading ? 'fa fa-spinner fa-spin' : 'fas fa-user m-r-5'"/>
				<span v-if="!option.loading">{{option.label}}</span>
			</template>
		</v-select>
	</div>
</template>

<style>
.emails .vs__search::placeholder {
	color: var(--gray);
}
</style>
