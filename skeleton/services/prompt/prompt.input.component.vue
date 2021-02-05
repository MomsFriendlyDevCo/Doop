<script lang="js" frontend>
app.component('promptInputComponent', {
	methods: {
		keydown(e) { // Reject when the user presses escape
			if (e.which === 27) this.$prompt.reject();
		},
		submit() { // Accept the promise when the user submits the form (Enter or whatever)
			return this.$prompt.resolve(this.$prompt.settings.value);
		},
	},
});
</script>

<template>
	<form class="form-horizontal" @submit.prevent="submit()">
		<div class="form-group row">
			<div class="col-12">
				<div class="input-group">
					<div v-if="$prompt.settings.prefix" class="input-group-prepend">
						<span class="input-group-text">
							{{$prompt.settings.prefix}}
						</span>
					</div>
					<input
						type="search"
						v-model="$prompt.settings.value"
						class="form-control"
						:placeholder="$prompt.settings.placeholder"
						@keydown="keydown"
						autofocus
						data-autofocus-method="select"
					/>
					<div v-if="$prompt.settings.suffix" class="input-group-append">
						<span class="input-group-text">
							{{$prompt.settings.suffix}}
						</span>
					</div>
				</div>
			</div>
		</div>
	</form>
</template>
