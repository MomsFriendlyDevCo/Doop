<component>
/**
* Provide a set of hoverable buttons which copy everything under this DOM element
*
* @param {array|string} verbs Collection to verb buttons to display, specify a collection of verbs (array), a single verb (object) or strings (to use prototypes)
* @param {string} buttions.class Class to use for the button
* @param {function} buttons.click Click event to fire when the button is clicked
* @param {string} [buttons.tooltip] Optional tooltip for each button
*
* @slow default Child DOM elements to wrap
* @slot buttons Additional buttons to display after the default slot
*
* @example Show a simply copy verb when hovering over some text
* <hover-verbs :verbs="['copy']">Hello World</hover-verbs>
*
* @example Show a custom menu of verbs, overriding all in built styles + copy button
* <hover-verbs :verbs="[{class: 'btn far fa-search', tooltip: 'Search'}, 'copy']">Hello World</hover-verbs>
*/
module.exports = {
	data() { return {
		content: undefined, // Calculated on hover (so Vue can change the binding in the slot if needed)
		prototypes: { // Simple prototype mappings we support
			copy: {
				class: 'btn btn-sm btn-light far fa-copy',
				tooltip: 'Copy to clipboard',
				click() {
					this.$clipboard.copy(this.content)
						.then(()=> this.$toast.success('Copied to clipboard'))
						.catch(e => this.$toast.error(`Error copying - ${e.toString()}`))
				},
			},
		},
	}},
	props: {
		verbs: {type: [Array, String, Object], required: true},
		showOnEmpty: {type: Boolean, default: false},
	},
	methods: {
		hoverIn() {
			this.content = $(this.$el)
				.text()
				.replace(/^\s+/, '') // Trim start
				.replace(/\s+$/, '') // Trim end

			$(this.$el).toggleClass('hasContent', this.showOnEmpty == true ? true : !!this.content);
		},
	},
	computed: {
		/**
		* Tidy up the incomming verb list, converting single object/strings to arrays + injecting prototypes
		*/
		calculatedVerbs() {
			return _.castArray(this.verbs)
				.map(verb =>
					_.isString(verb) ? {...this.prototypes[verb], click: this.prototypes[verb].click.bind(this)} // Use a prototype
					: verb // Assume the user is passing us the full verb structure
				)
		},
	},
};
</component>

<template>
	<div
		class="hover-verbs"
		@mouseover="hoverIn"
	>
		<slot name="default"/>
		<div class="hover-verbs-items">
			<slot name="verbs">
				<a
					v-for="verb in calculatedVerbs"
					:class="verb.class"
					v-tooltip="verb.tooltip"
					@click.prevent.stop="verb.click"
				/>
			</slot>
		</div>
	</div>
</template>

<style>
.hover-verbs {
	display: block;
	position: relative;
}

.hover-verbs .hover-verbs-items {
	display: none; /* Hide by default, overridden if the item has content (see .hasContent) */
	position: absolute;
	top: 0px;
	margin-right: 0;
	right: -10px;
	opacity: 0.5;
	transition: opacity 0.25s ease-out;
}

.hover-verbs .hover-verbs-items > .btn.btn-sm {
	padding: 3px;
}

.hover-verbs .hover-verbs-items > .btn + .btn {
	margin-left: 2px;
}

.hover-verbs.hasContent:hover .hover-verbs-items {
	display: block;
	float: right;
}

.hover-verbs.hasContent .hover-verbs-items:hover {
	opacity: 1;
}
</style>
