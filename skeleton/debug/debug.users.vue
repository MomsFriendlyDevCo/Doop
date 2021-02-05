<script lang="js" frontend>
app.component({
	data() { return {
		selected: undefined,
	}},
	route: '/debug/users',
});
</script>

<template>
	<div class="card">
		<div class="card-body form-horizontal">
			<!-- Local users only {{{ -->
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">User select</label>
				<div class="col-sm-6 form-control-plaintext">
					<digest-select
						:selected="selected"
						field="name"
						url="/api/users"
						doc-url="/api/users/:id"
						class-valid="badge badge-primary"
						icon-valid="fas fa-user"
						class-invalid="badge badge-danger"
						text-invalid="Invalid user"
						class="col-sm-8 form-control-plaintext"
						select-text="Search users..."
						title="Search existing users"
						:allow-remove="false"
						@change="selected = $event"
					/>
				</div>
				<div class="col-sm-3">
					<pre>Value: {{selected || 'none'}}</pre>
				</div>
			</div>
			<!-- }}} -->
		</div>
	</div>
</template>
