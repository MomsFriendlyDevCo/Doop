<script lang="js" frontend>
/**
* Publish-Subscribe service for Vue
* This service subscribes to a URL (or allows multiple components to subscribe to the same URL) and pages the endpoint to refresh data
*
* There are two ways to use this service:
*
* 1. Subscribe to an endpoint (`vm.$pubSub.subscribe(url)`) then bind to its data - `{{$pubSub.data[url]}}`
*
* 2. Use the `<pub-sub :url="url"/>` component with a slot
*
*/
app.service('$pubSub', function() {
	var $pubSub = {};

	this.$debug = this.$debug.new('$pubSub').enable(false);


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
	* @param {function} [options.onPoll] Function to run when a poll event occurs. Called as `(data)`
	*/
	$pubSub.subscribe = function(url, options) {
		if (!url) throw new Error('Cannot subscribe to empty URL');

		var settings = {
			immediate: true,
			pollDelay: 2000,
			postMangle: res => res.data,
			subscriptionId: this._uid,
			autoUnsubscribe: true,
			onPoll: undefined,
			...options,
		};

		if ($pubSub.subscriptions[url]) { // Already exists
			this.$debug('Existing subscription to', url, {subId: settings.subscriptionId});
			$pubSub.subscriptions[url].controllers.add(settings.subscriptionId);
		} else {
			this.$debug('New subscription to', url, {subId: settings.subscriptionId, ...settings});
			app.set($pubSub.subscriptions, url, {
				url,
				pollDelay: settings.pollDelay,
				postMangle: settings.postMangle,
				controllers: new Set([settings.subscriptionId]),
				onPoll: settings.onPoll,
				timer: setTimeout(()=> $pubSub.poll(sub.url), settings.pollDelay),
			});

			if (settings.immediate) $pubSub.poll(url);
		}

		if (settings.autoUnsubscribe) {
			if (!this._events) return this.$debug('FIXME: Cannot autoUnsubscribe against non-Vue component', {vm: this});
			this.$on('$destroy', ()=> $pubSub.unsubscribe(url, settings.subscriptionId))
		}
	};


	/**
	* Invoke a subscribed URL poll immediately
	* This will pull in the latest data and reset all pending timers
	* @returns {Promise} A promise which will resolve with the returned data
	*/
	$pubSub.poll = function(url) {
		var sub = $pubSub.subscriptions[url];
		if (!sub) throw new Error(`Attempting to poll non-existant subscription to URL "${url}"`);

		clearTimeout(sub.timer);

		this.$debug('Poll', url);
		return this.$http.get(sub.url)
			.then(res => sub.postMangle(res))
			.then(res => app.set($pubSub.data, sub.url, res))
			.then(res => sub.onPoll && sub.onPoll(res))
			.finally(()=> {
				if (!$pubSub.subscriptions[url]) return; // We were unsubscribed while still working - exit with no reschedule
				sub.timer = setTimeout(()=> $pubSub.poll(sub.url), sub.pollDelay);
			})
	};


	/**
	* Unsubscribe from a URL endpoint by its unique url
	* This API is called automatically when a parent component is destroyed
	* @param {string} url The URL to unsubscribe from
	* @param {string} [subscriptionId=this._uid] The reference of the current component unsubscribing, if no ID is given all controllers are force unsubscribed
	*/
	$pubSub.unsubscribe = function(url, subscriptionId) {
		var sub = $pubSub.subscriptions[url];
		if (!sub) return; // Not subscribed anyway

		if (subscriptionId) sub.controllers.delete(subscriptionId);

		if (!subscriptionId || !sub.controllers.size) { // No more subscribers - remove it
			this.$debug('Unsubscribe from', url, {subId: subscriptionId});
			clearTimeout(sub.timer);
			app.delete($pubSub.subscriptions, url);
			app.delete($pubSub.data, url);
		} else {
			this.$debug('Partial unsubscribe from', url, {subId: subscriptionId, remainingControllers: sub.size});
		}
	};

	return $pubSub;
});
</script>
