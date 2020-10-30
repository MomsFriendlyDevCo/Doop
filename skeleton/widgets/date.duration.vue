<component>
/**
* Display an allowing the user to select a time duration with some suggested values
* @param {number} [minutes] The current selection
* @param {array <Object>} options Suggested dropdown options, each array item has to conform to {title, value}
* @param {string} [dataFormat='minutes'] The input / output format metric
* @param {string} [displayFormat='minutes'] Display format to use
* @param {string} [optionsFormat='minutes'] Format used in the options collection
*
* @emits change Emitted as (newVal) where the value is in the format dicated by `dateFormat`
*/
module.exports = {
	props: {
		minutes: Number,
		options: Array,
		dataFormat: {type: String, default: 'minutes'},
		displayFormat: {type: String, default: 'minutes'},
		optionsFormat: {type: String, default: 'minutes'},
	},
	computed: {
		displayValue() {
			return moment.duration()
				.add(this.$props.minutes, this.$props.dataFormat)
				.as(this.$props.displayFormat);
		},
	},
	methods: {
		changeHandler(newVal, fromFormat) {
			// FIXME: Emit as toISOString() duration.
			this.$emit('change', 
				moment.duration()
					.add(newVal, fromFormat)
					.as(this.$props.dataFormat)
			);
		},
	},
};
</component>

<template>
	<div>
		<input
			type="number"
			:value="displayValue"
			class="form-control dropdown-toggle"
			data-toggle="dropdown"
			@change="changeHandler($event, $props.displayFormat)"
		/>
		<div v-if="$props.options && $props.options.length" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
			<a
				class="dropdown-item"
				v-for="item in $props.options"
				:key="item.value"
				@click="changeHandler(item.value, $props.optionsFormat)"
			>
				{{item.title}}
			</a>
		</div>
	</div>
</template>
