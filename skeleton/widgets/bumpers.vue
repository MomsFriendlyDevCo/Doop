<script lang="js" frontend>
/**
* Component to wrap left/right bumpers arounnd a parent element
*
* @param {Object} [selected] Currently selected object
* @param {array<Object>} [options] Collection of available options
* @param {string} [optionKey="_id"] Key within options / selected to match the selected item within options
*
* @emits change Emitted as `(newOption)` when the user hits a bumper
* @emits prev Emitted as `(newOption)` when the user navigates to the previous item
* @emits next Emitted as `(newOption)` when the user navigates to the next item
*/
app.component('bumpers', {
	props: {
		selected: {type: Object},
		options: {type: Array},
		optionKey: {type: String, default: '_id'},
	},
	computed: {
		/**
		* Calculate the `documentSelected` offset within `documents`
		* @returns {number|boolean} The offset of `documentSelected` or `false` if not valid
		*/
		documentOffset() {
			return !this.selected ? false // No active document
				: this.options.findIndex(d => d._id == this.selected[this.optionKey]);
		},
	},
	methods: {
		goNext() {
			var newOption = this.options[this.documentOffset+1];
			this.$emit('change', newOption);
			this.$emit('next', newOption);
		},

		goPrev() {
			var newOption = this.options[this.documentOffset-1];
			this.$emit('change', newOption);
			this.$emit('prev', newOption);
		},
	},
});
</script>

<template>
	<div class="bumpers">
		<a
			v-show="selected && documentOffset > 0"
			class="bumper bumper-left far fa-chevron-left"
			@click="goPrev"
		/>
		<a
			v-show="selected && options && documentOffset < options.length - 1"
			class="bumper bumper-right far fa-chevron-right"
			@click="goNext"
		/>
	</div>
</template>

<style lang="scss">
.bumpers {
	& .bumper {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 42px;
		color: var(--dark);
		background: #eee;
		opacity: 0.1;
		transition: opacity 0.5s ease-out;

		position: absolute;
		top: calc(50% - 75px);
		height: 150px;
		width: 80px;
		left: 0px;
		right: 0px;
		z-index: 1;

		&.bumper-left {
			left: 0px;
			right: auto;
			border-top-right-radius: 50%;
			border-bottom-right-radius: 50%;
		}

		&.bumper-right {
			right: 0px;
			left: auto;
			border-top-left-radius: 50%;
			border-bottom-left-radius: 50%;
		}

		&:hover {
			opacity: 0.7;
		}
	}
}
</style>
