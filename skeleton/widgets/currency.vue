<component>
/**
* Component to display a Bootstrap compatible currency selection input box
* BUGFIX: Mask doesn't work correctly until https://github.com/probil/v-mask/pull/455 has been merged into v-mask
*
* @param {string|number|Date} [value] The initial value to display
* @param {string} [prefix="$"] Currency prefix to display
* @param {number} [min=0] The minimum value to allow
* @param {boolean} [mask=true] Apply the currency formatting mask
*
* @emits change Emitted as `(newValue)` when the currency value changes
*
* @example Display a currency selection box
* <currency :value="someValue" @change="someValue = $event">
*/
module.exports = {
	props: {
		value: {type: [Date, Number, String]}, // Value may be blank
		min: {type: Number, default: 0},
		prefix: {type: String, default: '$'},
		mask: {type: Boolean, default: true},
	},
	data() { return {
		valueDisplay: undefined,
	}},
	methods: {
		changeHandler(e) {
			this.$emit('change', parseFloat(e.target.value));
		},
	},
	watch: {
		'$props.value': {
			immediate: true,
			handler() {
				this.valueDisplay = Math.round(this.value);
			},
		},
	},
};
</component>

<template>
	<div class="input-group mb-3">
		<div class="input-group-prepend">
			<span class="input-group-text">
				{{$props.prefix}}
			</span>
		</div>
		<input
			type="number"
			class="form-control"
			:value="valueDisplay"
			:min="$props.min"
			@input="changeHandler"
		>
	</div>
</template>
