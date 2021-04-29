<script lang="js" frontend>
/**
* Rotate between different text values on screen in an artistic way
* @param {Array<string>} options Options to rotate between
* @param {string} [direction='forwards'] Direction of options to traverse ENUM: 'random', 'forwards'
* @param {number} [interval=150] Time between ticks to animate
* @param {number} [pause=500] Time between options to pause
*/
app.component('textRotate', {
	data() { return {
		tickHandle: undefined,
		isDeleting: false,
		text: '',
		offset: 0,
		option: 0,
	}},
	props: {
		options: {type: Array, required: true, validator: v => v.every(i => typeof i == 'string')},
		direction: {type: String, default: 'forwards', validator: v => ['random', 'forwards'].includes(v)},
		interval: {type: Number, default: 150},
		pause: {type: Number, default: 1000},
	},
	methods: {
		tick() {
			var isPausing = false;
			clearTimeout(this.tickHandle);

			if (this.isDeleting) {
				this.offset -= 1;
				if (this.offset < 0) this.rotate();
			} else {
				this.offset += 1;
				if (this.offset > this.options[this.option].length) {
					isPausing = true;
					this.isDeleting = true;
				}
			}
			this.text = this.options[this.option].substr(0, this.offset) || '&nbsp;';

			this.tickHandle = setTimeout(this.tick, isPausing ? this.pause : this.interval);
		},

		rotate() {
			this.isDeleting = false;
			this.offset = 0;
			this.text = '';
			if (this.direction == 'forwards') { // Forward direction only
				this.option += 1;
				if (this.option >= this.options.length) this.option = 0;
			} else { // Random direction
				var candidate;
				do {
					candidate = _.random(0, this.options.length-1);
				} while (candidate == this.option); // Skip currently selected
				this.option = candidate;
			}
		},

		setOption(option = 0) {
			this.option = option;
			this.text = this.options[option];
			this.offset = this.options[option].length;
			this.isDeleting = true;
		},
	},

	mounted() {
		this.setOption(); // Populate initial text
		this.tick();
	},

	beforeDestroy() {
		clearTimeout(this.tickHandle);
	},
});
</script>


<template>
	<div
		class="text-rotate"
		v-html="text"
	/>
</template>


<style>
.text-rotate {
	display: inline-block;
	margin: 0 5px;
	color: grey;
	border-right: 0.08em solid #F26921;
	border-bottom: 2px dashed #F26921;
}
</style>
