<script lang="js" frontend>
app.component('debugToast', {
	route: '/debug/toast',
	methods: {
		testToast(method, ...args) {
			this.$toast[method](...args);
		},

		testPromise(succeed) {
			this.$toast.async('Thinking...', {
				action: ()=> Promise.timeout(100000)
					.then(()=> succeed ? 'All good' : Promise.reject('Failed'))
			});
		},

		testConfirm() {
			// Use Snotify.confirm (no auto closing of toasts)
			this.$toast.confirm('This is a question', {
				timeout: 5000,
				showProgressBar: true,
				buttons: [
					{text: 'Yes', action: toast => console.log('Clicked Yes')},
					{text: 'No', action: ()=> console.log('Clicked No')},
				],
			});
		},


		/**
		* Use Doop wrapped version of Snotify.confirm with auto-closing
		*/
		testAsk() {
			this.$toast.ask('This is a question', {
				buttons: [
					{text: 'Yes', action: toast => console.log('Clicked Yes')},
					{text: 'No', action: ()=> console.log('Clicked No')},
				],
			});
		},


		/**
		* Same as testAsk but support promises
		*/
		testAskPromise() {
			this.$toast.ask('This is a question')
				.then(()=> console.log('vm.$toast.ask succeeded'))
				.catch(()=> console.log('vm.$toast.ask failed'))
		},
	},
});
</script>

<template>
	<div class="card">
		<div class="list-group">
			<a class="list-group-item" @click="testToast('primary', 'Hello World')">vm.$toast.primary('Hello World')</a>
			<a class="list-group-item" @click="testToast('info', 'Hello World')">vm.$toast.info('Hello World')</a>
			<a class="list-group-item" @click="testToast('simple', 'Hello World')">vm.$toast.simple('Hello World')</a>
			<a class="list-group-item" @click="testToast('success', 'Hello World')">vm.$toast.success('Hello World')</a>
			<a class="list-group-item" @click="testToast('warning', 'Hello World')">vm.$toast.warning('Hello World')</a>
			<a class="list-group-item" @click="testToast('error', 'Hello World')">vm.$toast.error('Hello World')</a>
			<a class="list-group-item" @click="testPromise(true)">vm.$toast.promise({action: PromiseThatSucceeds})</a>
			<a class="list-group-item" @click="testPromise(false)">vm.$toast.promise(Promise PromiseThatFails})</a>
			<a class="list-group-item" @click="testConfirm">vm.$toast.confirm({buttons: ...})</a>
			<a class="list-group-item" @click="testAsk">vm.$toast.ask(String, [...]})</a>
			<a class="list-group-item" @click="testAskPromise">vm.$toast.ask(String) - promise mode</a>
			<a class="list-group-item" @click="testToast('save')">vm.$toast.save()</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 'Thinking...', 25)">vm.$toast.progress('debug', 'Thinking...', 25)</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 50)">vm.$toast.progress('debug', 50)</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 100)">vm.$toast.progress('debug', 100)</a>
			<a class="list-group-item" @click="testToast('spinner', 'debug', 'Thinking...')">vm.$toast.spinner('debug', String)</a>
			<a class="list-group-item" @click="testToast('spinner', 'debug', true)">vm.$toast.spinner('debug', true)</a>
			<a class="list-group-item" @click="testToast('spinner', 'debug', false)">vm.$toast.spinner('debug', false)</a>
			<a class="list-group-item" @click="testToast('catch')">vm.$toast.catch()</a>
			<a class="list-group-item" @click="testToast('catch', {error: 'Hello World'})">vm.$toast.catch({error: 'Hello World'})</a>
		</div>
	</div>
</template>
