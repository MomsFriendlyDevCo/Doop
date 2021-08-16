<script lang="js" frontend>
/**
* Component which displays a multi-select control that allows user selection and optionally also raw email addresses
* This component exports a collection which resembles `{user: user._id, email: rawString}`
*
* @param {array <Object>|array <string>} selected Collection of emails that are currently selected
* @param {string} [placeholder="Enter email addresses or pick a user..."]
* @param {array} [exclude] Array of items in the form `{user: String, email: String}` of options to NOT allow within the list, can be used to exclude existing users on an invite form
* @param {number} [limit=0] Number of entries to limit to, set to zero or a negative for unlimited
*
* @param {boolean} [allowSearch=true] Allow searching of existing users
* @param {string} [searchUrl="/api/users"] Where to pull the user list from (default is composed of the url + selection of idField, labelField, emailField)
* @param {string} [userUrl] How to recieve a user record. Defaults to `${searchUrl}/:id`
* @param {string} [idField="_id"] The primary key of the user when selecting a specific user document
* @param {string} [labelField="name"] The display field of a selected user
* @param {string} [emailField="email"] The email field of the user
* @param {string} [otherFields] Other fields to fetch from the server in a CSV format if more than id, label and email are required per option
*
* @param {boolean} [allowInvite=false] Allow entering of regular email address that do not match an existing user
*
* @emits change Event emitted as `(newValue)` whenever the user changes anything, value is an collection with each item conforming to `{email: String, user?: String}` (i.e. user is optional if allowInvite is enabled)
* @emits change-emails Event emitted as  `newValue` whenever the user changes anything, value is a simple array of email addresses
*
* @slot option-loading Slot for an option that is still being fetched, note that all slots are in the internal vue-select object format
* @slot option-user Slot for an option which links against an existing user
* @slot option-email Slot for an option composed of an email address only
*
* @example
* <emails :selected="emails" @change="emails = $event"/>
*/
app.component('emails', {
	data() { return {
		options: undefined,
		userCache: {},
		searchDebounced: _.debounce(this.search, 350), // Debounced version of search()
	}},
	props: {
		selected: {type: Array},
		placeholder: {type: String, default: 'Enter email addresses or pick a user...'},
		exclude: {type: Array},
		limit: {type: Number, default: 0},

		allowSearch: {type: Boolean, default: true},
		searchUrl: {type: String, default() { return '/api/users' }},
		userUrl: {type: String, default() { return this.searchUrl + '/:id' }},
		idField: {type: String, default: '_id'},
		labelField: {type: String, default: 'name'},
		emailField: {type: String, default: 'email'},
		otherFields: {type: String, default: ''},

		allowInvite: {type: Boolean, default: false},
	},
	computed: {
		/**
		* Compute the vue-select compatible iteration list
		* @returns {array<Object>} A vue-select compatible selection list
		*/
		selectedItems() {
			return (this.selected || [])
				.map(i => {
					if (_.isObject(i) && i.user) { // Only user linkage
						var foundUser = (this.options || []).find(o => o.id == i.user);
						if (foundUser) { // We know this user from the available options data
							return {id: i.user, label: foundUser.label, email: foundUser.email};
						} else if (foundUser = this.$digest.getSync(this.userUrl.replace(':id', i.user), 'name')) { // Does $digest have the lookup cached?
							return {id: i.user, label: foundUser, email: foundUser.email};
						} else if (this.userCache[i.user]) { // Do we have this in the user cache?
							return this.userCache[i.user];
						} else { // Make a lazy fetch request to find the user and dynamically update their name
							this.$set(this.userCache, i.user, {
								loading: true,
								label: i.user,
								id: i.user,
							});

							// Make a passive request to get the users name
							this.$digest.get(this.userUrl.replace(':id', i.user))
								.then(user => {
									this.$set(this.userCache[i.user], 'label', user.name);
									this.$set(this.userCache[i.user], 'email', user.email);
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
		/**
		* Function which handles the vue-select change event
		* This function processes the incoming data and remaps it to the changes / change-emails emitters
		* @param {array<Object>} value Raw internal value to emit
		*/
		change(value) {
			console.log('Trigger change', value);

			this.$emit('change', value.map(v => v.id ? {user: v.id, email: v.email } : {email: v.label || v}));
			this.$emit('change-emails', value.map(v => v.email || v.label || v));

			this.$refs.select.search = ''; //If this isn't emptied input get clobbered by the blur function
		},


		/**
		* Perform a search against a given term
		* @param {string} term The term to search for
		* @returns {Promise} A promise which resolves when the operation has completed
		*/
		search(term) {
			if (!term) return; // Nothing to search for

			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.searchUrl
					+ (/\?/.test(this.searchUrl) ? '&' : '?') // Already contains '?' - use '&' url joiner instead
					+ `select=${this.idField},${this.labelField},${this.emailField}` // Append select= criteria
					+ (this.otherFields || '')
					+ `&q=${term}`
				)
				.then(searchUrl => this.$digest.get(searchUrl))
				.then(res => {
					var excludedEmails = new Set([ // Set of excluded email addresses
						...(this.excluded ?? []).filter(e => e[this.emailField]).map(e => e[this.emailField]), // Take from excluded[]
						this.selected.filter(s => s[this.emailField]).map(s => s[this.emailField]),
					]);
					var excludedUsers = new Set([ // Set of excluded user IDs
						...(this.excluded ?? []).filter(e => e.user).map(e => e.user),
						...this.selected.filter(s => s.user).map(s => s.user),
					]);

					this.options = res
						.filter(u => !excludedEmails.has(u[this.emailField]) && !excludedUsers.has(u[this.idField]))
						.map(u => ({
							id: u[this.idField],
							label: u[this.labelField],
							email: u[this.emailField],
						}))
				})
				.finally(()=> this.$loader.stop())
		},


		/**
		* Function to execute on blur
		* This function automatically selects any search-in progress assuming the user wanted that item
		*/
		blur() {
			var select = this.$refs.select;
			if (!select.search || !this.allowInvite) return false; // Nothing selected or not permitting custom emails, do nothing

			select.select({label: select.search});
			return false;
		},


		/**
		* Return a vue-select compatible key-map
		* @returns {Object} A vue-select key-map
		*/
		keyMap(defaultMap, vSelect) {
			var maybeAcceptInviteWrapper = this.maybeAcceptInvite.bind(this, vSelect);

			var res = {
				...defaultMap, // Use default mapping

				9: maybeAcceptInviteWrapper, // Tab
				13: maybeAcceptInviteWrapper, // Enter

				...(this.allowInvite // When allowing invites...
					? {32: maybeAcceptInviteWrapper} // Space (i.e. pressing space should have same behaviour as tab)
					: {}
				),
			};
			return res;
		},


		/**
		* Wrapper around the keymap which accepts the dropdown item under the cursor (if searching) or an email address (if valid)
		* @param {VueComponent} vSelect The vSelect element passed via keymap
		* @param {Event} e The currently executing event
		*/
		maybeAcceptInvite(vSelect, e) {
			if (!this.$refs.select.search) return; // Search is empty - user just wanting to move to next control

			// Stop all default browser behaviour for key
			e.preventDefault();

			// No invite mode - assume we are only using regular vue-select behaviour anyway
			if (!this.allowInvite) return vSelect.typeAheadSelect(); // No need to validate search vue-select handles all functionality for us

			// Is there something selected on the dropdown list that isn't the default item?
			if (
				vSelect.searching &&
				$(vSelect.$el)
					.find('ul#vs1__listbox > li')
					.toArray()
					.findIndex(listEl => $(listEl).hasClass('vs__dropdown-option--highlight'))
				> 0
			) // Item in dropdown is selected
				return vSelect.typeAheadSelect()

			if (!/^.+@.+$/.test(this.$refs.select.search)) return console.log(`Not accepting partial email addres '${this.$refs.select.search}'`);
			vSelect.typeAheadSelect()

			// Refocus search box
			$(vSelect.searchEl).focus();
		},


		/**
		* Returns if items are selectable
		* @returns {boolean} True if more items are selectable
		*/
		isSelectable() {
			return (
				this.limit < 1
				|| this.selectedItems.length < this.limit
			);
		},
	},
});
</script>

<template>
	<div class="emails">
		<v-select
			:options="options"
			:value="selectedItems"
			:placeholder="placeholder"
			multiple
			:taggable="allowInvite"
			:clear-search-on-blur="blur"
			@input="change"
			@search="searchDebounced"
			ref="select"
			:map-keydown="keyMap"
			:selectable="isSelectable"
		>
			<template #option="option">
				<i class="fas fa-user"/>
				{{option.label}}
			</template>
			<template #selected-option="option">
				<slot v-if="option.loading" name="option-loading" :option="option">
					<i class="far fa-spinner fa-spin"/>
				</slot>
				<slot v-else-if="option.id" name="option-user" :option="option">
					<i class="fas fa-user mr-1"/>
					{{option.label}}
				</slot>
				<slot v-else="option.user" name="option-email" :option="option">
					<i class="fas fa-envelope mr-1"/>
					{{option.label}}
				</slot>
			</template>
			<template slot="no-options">
				<span v-if="allowSearch && allowInvite">
					Start typing to search for people or enter an email...
				</span>
				<span v-else-if="allowSearch">
					Start typing to search for people...
				</span>
				<span v-else-if="allowEmail">
					Enter email addresses seperated by spaces...
				</span>
				<span v-else>
					ERROR: Enable allowSearch OR allowInvite
				</span>
			</template>
		</v-select>
	</div>
</template>

<style lang="scss">
.emails {
	& .vs__search::placeholder {
		color: var(--gray);
	}
}
</style>
