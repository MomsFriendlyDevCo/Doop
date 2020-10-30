<component>
module.exports = {
	data() { return {
		selectedLocal: undefined,
		selectedMerged: undefined,
	}},
	route: '/debug/users',
};
</component>

<template>
	<div class="card">
		<div class="card-body form-horizontal">
			<!-- Local users only {{{ -->
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Local user select</label>
				<div class="col-sm-6 form-control-plaintext">
					<digest-select
						:selected="selectedLocal"
						field="name"
						url="/api/users"
						doc-url="/api/users/:id"
						class-valid="badge badge-primary"
						icon-valid="fas fa-user"
						class-invalid="badge badge-danger"
						text-invalid="Invalid user"
						class="col-sm-8 form-control-plaintext"
						select-text="Search accounts..."
						title="Search existing accounts"
						:allow-remove="false"
						@change="selectedLocal = $event"
					/>
				</div>
				<div class="col-sm-3">
					<pre>Value: {{selectedLocal || 'none'}}</pre>
				</div>
			</div>
			<!-- }}} -->
			<!-- Merged (all) users {{{ -->
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Merged user select</label>
				<div class="col-sm-6 form-control-plaintext">
					<digest-select
						:selected="selectedMerged"
						field="name"
						url="/api/users/merged"
						doc-url="/api/users/merged/:id"
						search-method="q"
						class-valid="badge badge-primary"
						icon-valid="fas fa-user"
						class-invalid="badge badge-danger"
						text-invalid="Invalid user"
						class="col-sm-8 form-control-plaintext"
						select-text="Search accounts..."
						title="Search existing accounts"
						:allow-remove="false"
						@change="selectedMerged = $event"
					/>
				</div>
				<div class="col-sm-3">
					<pre>Value: {{selectedMerged || 'none'}}</pre>
				</div>
			</div>
			<!-- }}} -->
		</div>
	</div>
</template>
