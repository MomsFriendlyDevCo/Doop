<script lang="js" frontend>
app.component({
	route: '/debug/v-validate',
	methods: {
		hasAVowel(val) { // Silly validation function which returns a promise response should the value contain a vowel
			return new Promise(resolve =>
				setTimeout(()=> // Think about this for a while
					resolve(
						/[aeiou]/.test(val) ? true
							: 'Value must contain a vowel'
					)
				, 100)
			);
		},
	},
});
</script>

<template>
	<div>
		<div class="card">
			<div class="card-header">Validation rule types</div>
			<div class="card-body">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="required: true" v-validate="{rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="regExp: /[a-z]/" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="[{regExp: /[a-z]/, err: 'Must be only lower case a-z'}]"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="satisfies: hasAVowel" v-validate="{rules: {satisfies: hasAVowel}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{rules: {satisfies: hasAVowel}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="email" class="form-control" placeholder="endpoint /api/users/count?email=:value" v-validate="{rules: {endpoint: '/api/users/count?email=:value'}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="email" class="form-control" v-validate="{rules: {endpoint: '/api/users/count?email=:value'}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="email" class="form-control" placeholder="endpoint /api/users?email=:value with custom payload" v-validate="{rules: {required: true, endpoint: {url: '/api/users?email=:value', expect: []}, err: 'User already exists'}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="email" class="form-control" v-validate="{rules: {required: true, endpoint: {url: '/api/users?email=:value', expect: []}, err: 'User already exists'}}"/&gt;</pre>
					</div>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="card-header">Validation layouts</div>
			<div class="card-body">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: title" v-validate="{immediate: true, layout: 'title', rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'title', rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: tooltip" v-validate="{immediate: true, layout: 'tooltip', tooltip: {placement: 'right'}, rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'tooltip', tooltip: {placement: 'right'}, rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<input type="text" class="form-control" placeholder="layout: help" v-validate="{immediate: true, layout: 'help', rules: {required: true}}"/>
					</div>
					<div class="col-sm-12 col-md-6">
						<pre>&lt;input type="text" class="form-control" v-validate="{immediate: true, layout: 'help', rules: {required: true}}"/&gt;</pre>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
