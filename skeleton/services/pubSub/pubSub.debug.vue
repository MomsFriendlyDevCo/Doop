<script lang="js" frontend>
/**
* PubSub component
* This component really just binds against a URL and provides a simple method of echo'ing data without subscribing to a specific data key
* @param {string} url The URL to subscribe to
* @param {number} [pollDelay=2000] The poll delay used when setting up the initial subscription
*
* @slot [default] Exposed as `({data})`
*
* @example Simple subscription to a widget (note we use desctructing to rewrite `data` -> `widget`)
* <pub-sub :url="`/api/widgets/${widget._id}`">
*   <template #default="{data: widget}">
*     <pre>{{widget}}</pre>
*   </template>
* </pub-sub>
*/
app.component('debugPubSub', {
	props: {
		url: {type: String, required: true},
		pollDelay: {type: Number, default: 2000},
		onPoll: {type: Function},
	},
	beforeDestroy() {
		this.$pubSub.unsubscribe(this.$props.subscribedUrl, this._uid);
	},
	watch: {
		'$props.url': {
			immediate: true,
			handler(newVal, oldVal) {
				Promise.resolve()
					.then(()=> oldVal && this.$pubSub.unsubscribe(oldVal, this._uid)) // UnSubscribe to anything we may already be subscribed to
					.then(()=> this.$pubSub.subscribe(this.$props.url, {
						autoUnsubscribe: false, // We take care of this in the components lifecycle
						subscriptionId: this._uid,
						pollDelay: this.$props.pollDelay,
						onPoll: this.$props.onPoll,
					}))
			},
		},

	},
});
</script>

<template>
	<div>
		<slot v-if="$pubSub.data[$props.url]" name="default" :data="$pubSub.data[$props.url]">
			<pre>Subscribed to {{$props.url}}: {{$pubSub.data[$props.url]}}</pre>
		</slot>
	</div>
</template>
