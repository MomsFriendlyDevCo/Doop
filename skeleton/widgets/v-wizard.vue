<script lang="js" frontend>
/**
* Component which displays a simple step-by-step wizard
*
* Features:
*           - Handles next, previous wizard progression
*           - `autofocus` on attributes per pane is honored (also `[data-autofocus-method="select"] as with Bootstrap
*
* @param {string} [start] Optional ID of the step to start from, if omitted the first step is used
*
* @param {array<Object>} steps The steps of the wizard
* @param {string} steps.id The ID of the current step
* @param {function} [steps.onStart] Async function to exeute when moving to this step
* @param {function} [steps.onEnd] Async function to exeute when moving out of this step
*
* @slot step-${STEP} Specify the template of a given slot, by ID
*
* @example Simple wizard asking for an email + name
* <v-wizard :steps="[{id: 'email'}, {id: 'name', onEnd: submitFunction}]">
*   <template #step-email> ... template to ask for email... </template>
*   <template #step-name> ... template to ask for name... </template>
* </v-wizard>
*/
app.component('vWizard', {
	data() { return {
		step: undefined,
	}},
	props: {
		start: {type: String},
		steps: {type: Array, required: true},
	},
	methods: {
		/**
		* Progress the step to the next in the logical sequence from the current
		* @returns {Promise} A promise which resolves when the operation has completed
		*/
		stepNext() {
			this.$debug('stepNext from', this.step);
			return this.stepGo();
		},


		/**
		* Arbitrary movement from one step to another
		* @param {string} [to] The named ID of the step to move to, if omitted the next step from the current one is assumed
		* @param {string|boolean} [from] The step moving from, if unspecified the current step is used, if `false` move from functionality like onEnd is disabled
		* @returns {Promise} A promise which resolves when the operation has completed
		*/
		stepGo(to, from) {
			var stepThis, stepThisIndex, stepNext;

			return Promise.resolve()
				// Find current step (if any) {{{
				.then(()=> {
					if (from === false) {
						// Pass
					} else if (from) {
						stepThisIndex = this.steps.findIndex(s => s.id == from);
						if (stepThisIndex < 0) throw new Error(`Unable to determine step to move from "${from}"`);
						stepThis = this.steps[stepThisIndex];
					} else {
						stepThisIndex = this.steps.findIndex(s => s.id == this.step);
						if (stepThisIndex < 0) throw new Error('Unable to determine current step');
						stepThis = this.steps[stepThisIndex];
					}
				})
				// }}}
				// Find next step {{{
				.then(()=> {
					if (to) {
						stepNext = this.steps.find(s => s.id == to);
						if (!stepNext) throw new Error(`Invalid step to move to "${to}"`);
					} else {
						stepNext = this.steps[stepThisIndex + 1];
					}

					this.$debug('Move from step', stepThis ? stepThis.id : 'NONE', '->', stepNext.id);
				})
				// }}}
				.then(()=> stepNext ? this.step = stepNext.id : stepThis.id)
				// Execute onEnd + onStart {{{
				.then(()=> stepThis && _.isFunction(stepThis.onEnd) && stepThis.onEnd())
				.then(()=> stepNext && _.isFunction(stepNext.onStart) && stepNext.onStart())
				// }}}
				.then(()=> this.$nextTick()) // Wait for everything to settle
				.then(()=> $(this.$el) // Handle [autofocus]
					.find('[autofocus]')
					.first()
					.each((index, el) => {
						var $el = $(el);
						if ($el.data('autofocus-method') == 'select') { // Use select method
							setTimeout(()=> {
								console.log('SELECT', $el);
								$el.select()
							}, 250);
						} else {
							$el.focus();
						}
					})
				)
		},
	},
	created() {
		this.$debug.prefix('v-wizard').enable(false);
		this.stepGo(this.start || this.steps[0].id, false); // Kick off navigation
	},
});
</script>

<template>
	<div class="v-wizard">
		<div class="step">
			<slot
				:name="`step-${step}`"
				:stepGo="stepGo"
				:stepNext="stepNext"
				class="step"
			>
				<p>FIXME: Step contents are unspecified</p>
				<p>Set up <code>&lt;template #step-{{step}}="{stepNext}"/&gt;</code> in your template to override</p>
			</slot>
		</div>
	</div>
</template>
