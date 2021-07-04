<script lang="js" frontend>
import {VueMaskDirective} from 'v-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
app.directive(VueMaskDirective);


/**
* Component to display a Bootstrap compatible currency selection input box
* BUGFIX: Mask doesn't work correctly until https://github.com/probil/v-mask/pull/455 has been merged into v-mask
*
* @param {string|number|Date} [value] The initial value to display
* @param {string} [prefix="$"] Currency prefix to display
* @param {number} [min=0] The minimum value to allow
* @param {number} [max=0] The maximum value to allow
* @param {number} [step=1] Value to increment / decrement by using arrow keys
*
* @emits change Emitted as `(newValue)` when the currency value changes
*
* @example Display a currency selection box
* <currency :value="someValue" @change="someValue = $event">
*/
app.component('currency', {
	data() { return {
		currencyMask: createNumberMask({
			prefix: '', // We handle prefix in display anyway
			allowDecimal: true,
			includeThousandsSeparator: true,
			allowNegative: this.min < 0,
		}),
	}},
	props: {
		value: {type: [Date, Number, String]}, // Value may be blank
		min: {type: Number},
		max: {type: Number},
		step: {type: Number, default: 1},
		prefix: {type: String, default: '$'},
	},
	methods: {
		/**
		* Event handler emitted by the input.change handler
		* @params {Event} e Raw DOM event
		*/
		change(e) {
			var newVal = parseFloat(e.target.value.replace(/[^0-9\.]+/g, ''));
			if (this.max !== undefined && newVal > this.max) newVal = this.max;
			if (this.min !== undefined && newVal < this.min) newVal = this.min;

			this.$emit('change', newVal);
		},


		/*
		* Increment / decrement handler for values
		*/
		increment(amount = 1) {
			this.change({target: {value: '' + (this.value + amount)}});
		},
	},
});
</script>

<template>
	<div class="input-group">
		<div class="input-group-prepend">
			<span class="input-group-text">
				{{$props.prefix}}
			</span>
		</div>
		<input
			type="text"
			class="form-control"
			:value="value"
			@input="change"
			v-mask="currencyMask"
			@keyup.up.prevent="increment(1)"
			@keyup.down.prevent="increment(-1)"
		>
	</div>
</template>
