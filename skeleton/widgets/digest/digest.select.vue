<component>
/**
* Wrapper around digest which supports lazy loading any entity based on an API endpoint
* @param {string} url The URL endpoint to retrieve data from
* @param {string} [docUrl] Overriding URL to use to pull the selected document, if this differs from the regular URL, use `:id` or `:selected` as a replacement for the incomming `selected` property
* @param {string} field CSV of fields to display, first field is used as display, others are to indicate that server should provide them in the data object (see emitters), ID us automatically implied
* @param {string} [label] Use this label before fetching a remote one, if specifed the entity is treated as valid (including valid class and icon)
* @param {string} [idField="_id"] The primary key of the selected document
* @param {string} [selected] The ID of the document that is currently selected
* @param {string} [selectText='Select...'] Prompt text to display when no item is selected
* @param {boolean} [editable=true] Whether the component should be in an editable state
* @param {booean} [allowRemove=true] Whether to allow the user to remove the current selection
* @param {booean} [ignoreErrors=false] Whether to not print errors into $toast.error
* @param {string} [title=selectText] The title of the dialog, defaults to `selectText`
* @param {string|boolean} [sort=true] Whether to sort the documents, boolean true uses the same field as `field`
* @param {number} [limit=30] The number of documents to pull from the server in each batch
* @param {string} [iconValid] The icon to display when the entity is valid
* @param {string} [iconInvalid] The icon to display when the entity is invalid
* @param {string|boolean} [add=false] Allow adding of new items, note that only the `field` is created with new records. If this is a string the POST will be sent to that URL instead of `url`
* @param {string} [addTitle="Enter the title of the new item"] Title text to display when adding a new item
* @param {string} [addDefault=""] Default value when adding a new item
* @param {object} [addPost] Additional POST structure to send when creating the item
* @emits change Emitted as `(id, document)` when the user changes the selection - can be undefined if the user cleared the field
* @emits changeData Emitted as `(document)` (i.e. the whole data) as a convenience method to bind to the entire data array
* @emits changeFIELD Emitted for each field in the resultant document with fields as camelCase with first leter caps, for example {_id: 123, label: 'hello'} emits 'changeUserId' + 'changeLabel'
*/
module.exports = {
	props: {
		url: {type: String, required: true},
		docUrl: {type: String},
		idField: {type: String, default: '_id'},
		field: {type: String, required: true},
		label: {type: String},
		selected: {type: String},
		selectText: {type: String, default: 'Select...'},
		editable: {type: Boolean, default: true},
		allowRemove: {type: Boolean, default: true},
		ignoreErrors: {type: Boolean, default: false},
		title: {type: String},
		field: {type: String, default: 'title'},
		limit: {type: Number, default: 30},
		sort: {type: [Boolean, String], default: true},
		iconValid: {type: String},
		iconInvalid: {type: String},
		textInvalid: {type: String},
		add: {type: [Boolean, String], default: false},
		addPost: {type: Object},
		addTitle: {type: String, default: 'Enter the title of the new item'},
		addDefault: {type: String, default: ''},
	},
	data() { return {
		list: undefined,
	}},
	methods: {
		emitChanges(selected) { // Trigger all emitters - change, changeData, changeFIELD etc.
			this.$emit('change', selected[this.$props.idField], selected); // Allow bindings to @change to update
			this.$emit('changeData', selected);

			// Emit for each document field
			Object.keys(selected).forEach(f => this.$emit('change' + _.chain(f).camelCase().upperFirst().value(), selected[f]));
		},
		select() {
			if (!this.$props.editable) return;
			return Promise.resolve()
				.then(()=> this.$prompt.list({
					title: this.$props.title || this.$props.selectText,
					url: this.$props.url,
					field: Array.from(new Set(this.$props.field.split(/\s*,\s*/).concat([this.$props.idField]))).join(','),
					sort: this.$props.sort,
					limit: this.$props.limit,
					buttons: !this.$props.add // Display 'Add new' button if adding is enabled
						? {left: [], center: [], right: []}
						: {left: [], center: [], right: [
							{
								id: 'add',
								title: 'Add new',
								class: 'btn btn-primary',
								method: 'resolve',
							},
						]},
				}))
				.then(selected => {
					if (selected !== 'add') return selected; // User selected something from the list - not trying to create a new item

					// FIXME: This needs replacing with this.$prompt.text when that interface is implemented
					var newText = prompt(this.$props.addTitle, this.$props.addDefault);

					if (newText === null) throw 'CANCEL';
					return this.$http.post(_.isString(this.$props.add) ? this.$props.add : this.$props.url, {
						[this.$props.field.split(/\s*,\s*/, 1)[0]]: newText,
						...this.$props.addPost,
					}).then(res => res.data); // Should resolve with the newly created record
				})
				.then(selected => {
					this.emitChanges(selected);

					// Instruct the digest element to change its display
					this.$emit.down('digest.force.valid', true);
					this.$emit.down('digest.force.text', selected[this.$props.field.split(/\s*,\s*/, 1)[0]]);
				})
				.catch(()=> {}) // Ignore user cancelling
		},
		remove() {
			this.emitChanges({}); // Allow bindings to @change to update
		},
	},
};
</component>

<template>
	<div class="digest-select btn-group">
		<a @click.stop="select()" :class="$props.editable ? 'btn btn-light' : 'nonclickable'">
			<digest
				v-if="$props.selected"
				:label="$props.label"
				:url="$props.docUrl ? $props.docUrl.replace(/:(id|selected)/g, $props.selected) : $props.url + '/' + $props.selected"
				:field="$props.field"
				:icon-valid="$props.iconValid"
				:icon-invalid="$props.iconInvalid"
				:text-invalid="$props.textInvalid"
				:ignore-errors="$props.ignoreErrors"
			/>
			<span v-else>{{$props.selectText}}</span>
		</a>
		<a @click.stop="remove()" v-if="$props.selected && $props.editable && $props.allowRemove" class="btn btn-light btn-hover-danger p-2">
			<i class="far fa-times"/>
		</a>
	</div>
</template>

<style>
.digest-select .btn {
	line-height: 1rem;
	display: flex;
	align-items: center;
}

/* Disabled state {{{ */
.disabled .digest-select {
	pointer-events: none;
}
.disabled .digest-select .btn {
	border: 0;
	background: transparent;
	text-align: left;
}

.disabled .digest-select .btn-hover-danger {
	display: none;
}
/* }}} */
</style>
