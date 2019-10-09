<service singleton>
/**
* PublishSubscribe service for Vue
* This service subscribes to a URL (or allows multiple components to subscribe to the same URL) and pages the endpoint to refresh data
*
* There are two ways to use this service:
*
* 1. Subscribe to an endpoint (`vm.$pubSub.subscribe(url)`) then bind to its data - `{{$pubSub.data[url]}}`
*
* 2. Use the `<pub-sub :url="url"/>` component with a slot
*
*/
module.exports = function() {
	var $pubSub = this;
	$pubSub.$debugging = true;


	/**
	* Fast lookup object for all URL => data values
	* @var {Object}
	*/
	$pubSub.data = {};


	/**
	* Lookup object for all current subscriptions
	* The key is the URL with the value as a subscription object
	* @var {Object}
	*/
	$pubSub.subscriptions = {
		/*
		url: {
			url: String,
			pollDelay: Number,
			controllers: Set, // controller _uid's subscribed to this pubSub
			timer: Object, // Timer handle
			postMangle: res => res.data, // Post progressing for the HTTP request
		},
		*/
	};


	/**
	* Subscribe to a URL endpoint
	* The endpoint will be paged every `pollDelay` until unsubscription
	* Unsubscription occurs automatically when the parent component is destroyed
	* @param {string} url The URL endpoint to subscribe to
	* @param {Object} [options] Additional options
	* @param {boolean} [options.immediate=true] Whether to invoke a fetch from the endpoint immediately
	* @param {number} [options.pollDelay=2000] Time in milliseconds between polls, this does not include fetch time
	* @param {function} [options.postMangle] How to mangle incomming AxiosResponse objects into a usable data set, defaults to just extracting `res.data`
	* @param {string} [options.subscriptionId=this._uid] How to reference this component
	* @param {boolean} [options.autoUnsubscribe] If true, listens for the `.on('$destroy')` custom event and unsubcribes
	*/
	$pubSub.subscribe = function(url, options) {
		if (!url) throw new Error('Cannot subscribe to empty URL');

		var settings = {
			immediate: true,
			pollDelay: 2000,
			postMangle: res => res.data,
			subscriptionId: this._uid,
			autoUnsubscribe: true,
			...options,
		};

		if ($pubSub.subscriptions[url]) { // Already exists
			$pubSub.subscriptions[url].controllers.add(settings.subscriptionId);
		} else {
			this.$debug('New subscription to', url, {subId: settings.subscriptionId});
			Vue.set($pubSub.subscriptions, url, {
				url,
				pollDelay: settings.pollDelay,
				postMangle: settings.postMangle,
				controllers: new Set([settings.subscriptionId]),
			});

			if (settings.immediate) {
				$pubSub.poll(url);
			} else {
				sub.timer = setTimeout(()=> $pubSub.poll(sub.url), $pubSub.pollDelay);
			}
		}

		if (settings.autoUnsubscribe) {
			if (!this._events) return this.$debug('FIXME: Cannot autoUnsubscribe against non-Vue component', {vm: this});
			this.$on('$destroy', ()=> $pubSub.unsubscribe(sub.url, settings.subscriptionId))
		}
	};


	/**
	* Invoke a subscribed URL poll immediately
	* This will pull in the latest data and reset all pending timers
	*/
	$pubSub.poll = function(url) {
		var sub = $pubSub.subscriptions[url];
		if (!sub) throw new Error(`Attempting to poll non-existant subscription to URL "${url}"`);

		clearTimeout(sub.timer);

		this.$debug('Poll', url);
		this.$http.get(sub.url)
			.then(res => sub.postMangle(res))
			.then(res => Vue.set($pubSub.data, sub.url, res))
			// .finally(()=> sub.timer = setTimeout(()=> $pubSub.poll(sub.url), sub.pollDelay))
	};


	/**
	* Unsubscribe from a URL endpoint by its unique url
	* This API is called automatically when a parent component is destroyed
	* @param {string} url The URL to unsubscribe from
	* @param {string} [subscriptionId=this._uid] The reference of the current component unsubscribing
	*/
	$pubSub.unsubscribe = function(url, subscriptionId) {
		if (!$pubSub.subscriptions[url]) return; // Not subscribed anyway

		this.$debug('Unsubscribe from', url, {subId: subscriptionId});
		$pubSub.subscriptions[url].controllers.delete(subscriptionId);

		if (!$pubSub.subscriptions[url].controllers.size) { // No more subscribers - remove it
			clearTimeout($pubSub.subscriptions[url].timer);
			Vue.delete($pubSub.subscriptions, url);
			Vue.delete($pubSub.data, url);
		}
	};

	return $pubSub;
};
</service>

<component>
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
module.exports = {
	props: {
		url: String,
		pollDelay: Number,
	},
	mounted() {
		this.$pubSub.subscribe(this.$props.url, {
			uid: this._uid,
			pollDelay: this.pollDelay,
			subscriptionId: this._uid,
		});
	},
};
</component>

<template>
	<div>
		<slot v-if="$pubSub.data[$props.url]" name="default" :data="$pubSub.data[$props.url]">
			<pre>Subscribed to {{$props.url}}: {{$pubSub.data[$props.url]}}</pre>
		</slot>
	</div>
</template>
