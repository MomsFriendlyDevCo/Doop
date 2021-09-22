<script lang="js" frontend>
app.component({
	route: '/debug/dirtyChecker',
	data() { return {
		data: undefined,
	}},
	methods: {
		reset() {
			this.$dirtyChecker.set(this, 'data', {
				foo: 'Foo!',
				bar: 123,
				baz: [1, 2, 3],
				quz: {quz2: {quz3: [1, 2, {quz4: 5}]}},
			});
		},
		changeFoo() {
			this.data.foo = _.sample(['foo', 'Foo', 'foo!', 'Foo!']);
		},
		changeBar() {
			this.data.bar = _.random(1, 999);
		},
		changeBaz() {
			this.$set(this.data, 'baz', _.times(_.random(1, 5), ()=> _.random(1, 9)));
		},
		changeQuz() {
			this.data.quz.quz2.quz3[2].quz4 = _.random(100, 999);
		},
	},
	created() {
		this.reset();
	},
});
</script>

<template>
	<div class="row py-3">
		<div class="col-xs-12 col-md-6">
			<div class="card">
				<div class="card-body">
					<div class="form-group row">
						<label class="col-4 col-form-label">Is Dirty?</label>
						<div class="col-8 col-form-label">
							{{data.$isDirty}}
						</div>
					</div>
					<div class="form-group row">
						<label class="col-4 col-form-label">Original</label>
						<div class="col-8 col-form-label">
							{{data.$original}}
						</div>
					</div>
					<div class="form-group row">
						<label class="col-4 col-form-label">Diff</label>
						<div class="col-8 col-form-label">
							<pre>{{data.$diff}}</pre>
						</div>
					</div>
				</div>
				<div class="list-group">
					<a class="list-group-item" @click="changeFoo()">Change Foo</a>
					<a class="list-group-item" @click="changeBar()">Change Bar</a>
					<a class="list-group-item" @click="changeBaz()">Change Baz</a>
					<a class="list-group-item" @click="changeQuz()">Change Quz</a>
					<a class="list-group-item" @click="changeFoo(); changeBar(); changeBaz(); changeQuz()">Change All</a>
					<a class="list-group-item" @click="data.$clear()">Clear</a>
					<a class="list-group-item" @click="data.$assign({quark: 1})">Assign Quark</a>
					<a class="list-group-item" @click="data.$overwrite({flarp: 1})">Overwrite Flarp</a>
					<a class="list-group-item" @click="data.$drop()">Drop</a>
					<a class="list-group-item" @click="reset()">Reset</a>
				</div>
			</div>
		</div>
		<div class="col-xs-12 col-md-6">
			<div class="card">
				<div class="card-body">
					<pre>{{data}}</pre>
				</div>
			</div>
		</div>
	</div>
</template>
