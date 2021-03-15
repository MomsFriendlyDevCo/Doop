<script lang="js" frontend>
app.component('promptMacgyverComponent', {
	mounted() {
		this.$prompt.settings.macgyverForm = this.$refs.form;
	},
});
</script>

<template>
	<div>
		<mg-form
			ref="form"
			:form="$prompt.settings.form"
			:config="$prompt.settings.macgyver"
			:data="$prompt.settings.value"
			@change="$set($prompt.settings, 'value', $event)"
		/>
	</div>
</template>
