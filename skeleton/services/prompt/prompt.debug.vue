<script lang="js" frontend>
app.component({
	route: '/debug/prompt',
	methods: {
		testPrompt(method, ...args) {
			this.$prompt[method](...args)
				.then(res => console.log(`$prompt.${method}`, {status: 'resolve', payload: res}))
				.catch(res => console.log(`$prompt.${method}`, {status: 'reject', payload: res}))
		},
	},
});
</script>

<template>
	<div class="py-3">
		<div id="modal-test" class="modal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<h4 class="modal-title">Modal header</h4>
						<a class="close" data-dismiss="modal"><i class="fa fa-times"></i></a>
					</div>
					<div class="modal-body">
						<p>Modal Body</p>
					</div>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="list-group">
				<a class="list-group-item" @click="testPrompt('modal', '#modal-test')">vm.$prompt.modal("#modal-test")</a>
				<a class="list-group-item" @click="testPrompt('alert', 'Hello World')">vm.$prompt.alert("Hello World")</a>
				<a class="list-group-item" @click="testPrompt('confirm', {content: 'This is a question'})">vm.$prompt.confirm({content: "This is a question"})</a>
				<a class="list-group-item" @click="testPrompt('input', {title: 'What is your name?'})">vm.$prompt.input({title: 'What is your name?'})</a>
				<a class="list-group-item" @click="testPrompt('list', {list: [{_id: 1, title: 'Foo'}, {_id: 2, title: 'Bar'}, {_id: 3, title: 'Baz'}]})">vm.$prompt.list({list: [...]})</a>
				<a class="list-group-item" @click="testPrompt('list', {url: '/api/users', field: 'name'})">vm.$prompt.list({url: '/api/users'})</a>
				<a class="list-group-item" @click="testPrompt('macgyver', {macgyver: [{type: 'mgText', id: 'testText'}]})">vm.$prompt.macgyver({macgyver: [{type: 'mgText', id: 'testText'}]})</a>
			</div>
		</div>
	</div>
</template>
