<component>
/**
* Extremely simple component which fetches a single point of data from the server and displays it
* EITHER the collection + ID OR the url must be specified
* If the return value from the server is an array the first item in the array is assumed to be the one we're interested in
*
* It is also possible to force this element to display values using the emitter events `digest.force.{class,icon,text,valid}`
*
* @param {string} [url] The URL to fetch data from (instead of specifying `collection` + `id`)
* @param {string} [field="title"] Field to display the title of
* @param {string} [label] Use this label before fetching a remote one, if specifed the entity is treated as valid (including valid class and icon)
* @param {boolean} [lazy=true] If true, fetching will be defered until the element is actually shown within the content area
* @param {string} [lazyParents='#main, body'] jQuery compatible string listing the intersection parents to probe for when lazy==true, the first one found is assumed to be the parent
* @param {string} [lazyParentsDisable='.modal'] jQuery compatible string which, if matched disables lazy loading (defaults to inside modals by default)
* @param {string} [classValid] Apply this class to the element if the returned value is truthy
* @param {string} [classInvalid] Apply this class to the element if the return value is falsy
* @param {string} [textValid] Overrding text to display if the element is valid, if set the response is ignored and this is used as the display instead
* @param {string} [textInvalid] What display text to use if the response was invalid
* @param {string} [iconValid] Optional icon to display next to the context when loaded
* @param {string} [iconInvalid] Optional icon to display next to the `textInvalid` text when an error occurs
* @param {boolean} [ignoreErrors=false] Ignore all thrown errors, if false they will be routed into this.$toast.catch
*
* @example Fetch a specific URL and extract a key
* <digest url="/api/some/url" key="widgets"></digest>
*
* @example Force all child digests to be invalid
* this.$emit.down('digest.force.valid', false)
*/
module.exports = {
	data: ()=> ({
		displayContent: '',
		displayClass: undefined,
		isLazy: false,
		loading: true,
		useLabel: true, // Whether to display the $props.label content if its present, set to false on incomming events or overrides
	}),
	props: {
		url: {type: String, required: true},
		field: {type: String, default: "title"},
		label: {type: String},
		lazy: {type: Boolean, default: true},
		lazyParents: {type: String, default: '#main, body'},
		lazyParentsDisable: {type: String, default: '.modal'},
		classValid: {type: String},
		classInvalid: {type: String},
		textInvalid: {type: String},
		iconValid: {type: String},
		iconInvalid: {type: String},
		ignoreErrors: {type: Boolean, default: false},
	},
	methods: {
		refresh() {
			this.loading = true;
			if (this.useLabel && this.$props.label) { // Use label instead of fetching remote?
				this.displayContent = this.$props.label;
				this.displayIcon = this.$props.iconValid;
				this.loading = false;
			} else { // Fetch remote data
				this.$digest.get(this.$props.url, this.$props.field)
					.then(value => {
						this.displayContent = this.$props.textValid || value;
						this.displayIcon = this.$props.iconValid;
						if (this.$props.classValid) this.displayClass = this.$props.classValid;
					})
					.catch(err => {
						this.displayContent = this.$props.textInvalid;
						this.displayIcon = this.$props.iconInvalid;
						if (this.$props.classInvalid) this.displayClass = this.$props.classInvalid;
						if (!this.$props.ignoreErrors) this.$toast.catch(err);
					})
					.finally(()=> this.loading = false)
			}
		},
	},
	created() {
		this.$on('digest.force.class', c => this.displayClass = c);
		this.$on('digest.force.icon', i => this.displayIcon = i);
		this.$on('digest.force.text', t => {
			this.useLabel = false;
			this.displayContent = t;
		});
		this.$on('digest.force.valid', v => {
			if (v) {
				this.displayClass = this.$props.classValid;
				this.displayIcon = this.$props.iconValid;
				this.displayContent = this.$props.textValid;
			} else {
				this.displayClass = this.$props.classValid;
				this.displayIcon = this.$props.iconValid;
				this.displayContent = this.$props.textInvalid;
			}
		});
	},
	mounted() {
		// Check we can use Lazy observing
		if ($(this.$el).parents(this.$props.lazyParentsDisable).length) this.isLazy = false;

		// Bind an interesection observer to fire a callback when the element appears on screen {{{
		if (this.isLazy) {
			var intersectionObserver = new IntersectionObserver(data => {
				this.refresh();
				intersectionObserver.disconnect();
				intersectionObserver = null;
			}, {
				root: $(this.$el).closest(this.$props.lazyParents)[0],
				rootMargin: '100px',
				threshold: 0.1,
			});
			intersectionObserver.observe(this.$el);
		} else {
			this.refresh();
		}
		// }}}
	},
	watch: {
		url() { // Update when URL changes
			this.refresh();
		},
	},
};
</component>

<template>
	<div class="digest">
		<i v-if="loading" class="fa fa-spinner fa-spin"></i>
		<span v-else :class="displayClass">
			<i v-if="displayIcon" :class="displayIcon"/>
			{{displayContent}}
		</span>
	</div>
</template>

<style>
.digest > span > i {
	margin-right: 2px;
}
</style>

<service singleton>
module.exports = function() {
	var $digest = this;

	$digest.settings = {
		expire: 1000 * 30, // Time in ms to consider a digest pull expired, default 30s
		cleanTimer: 1000 * 120, // Time in ms on when to perform a cache clean - expired items are still repulled on each Get but not removed
	};


	/**
	* Array of resolve(ing|ed) promises for URL + field requests
	* @var {Object <Object>} Each key is the hash with each value as an object containing `{promise, created}`
	* @param {Promise} promise The promise being performed, this may or may not already have resolved
	* @param {Date} created The time that the request was made, used to expire the cache entry
	* @param {undefined|*} value The resolved value of the cache object, set later
	*/
	$digest.cache = {};


	/**
	* Utility function to examine if a data (in the past) should be considered expired
	* @param {Date} date The date in the past to examine
	*/
	$digest.hasExpired = date => date + $digest.settings < new Date();


	/**
	* Lazily fetch a URL and hold it in a memory cache until it expires
	* NOTE: Requesting an expired cache entry will automatically cause it to be re-fetched
	* @param {string} url The URL to fetch
	* @param {string} [field] Optional field to restrict the response to
	* @returns {Promise} A promise which will resolve with either the specificly requested field value or the Axios response for the request
	*/
	$digest.get = (url, field) => {
		var hash = field ? url + '@' + field : url;
		if (
			$digest.cache[hash] // We already have a cache entry
			&& !$digest.hasExpired($digest.cache[hash].created) // ... and its still valid
		) return $digest.cache[hash].promise;

		$digest.cache[hash] = {
			created: new Date(),
			value: undefined,
			promise: this.$http.get(field ? `${url}?select=${field}` : url)
				.then(res => { // Pick the specific field value if requested, otherwise return full response
					if (field) { // Extract single field
						if (_.isArray(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got an array`);
						if (!_.isObject(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got a non-object`);
						if (_.isEmpty(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got empty object`);
						if (!_.has(res.data, field)) throw new Error(`Expected the field "${field}" in single document response from URL "${url}. Got keys: ${Object.keys(res.data).join(', ')}`);

						return res.data[field];
					} else { // Return entire Axios response
						return res;
					}
				})
				.then(payload => $digest.cache[hash].value = payload),
		};

		return $digest.cache[hash].promise;
	};


	$digest.getSync = (url, field) => {
		var hash = field ? url + '@' + field : url;
		return $digest.cache[hash] ? $digest.cache[hash].value : undefined;
	};


	/**
	* Timer handle for the clean process
	* @var {Object}
	*/
	$digest._cleanTimer;


	/**
	* Perform an idle-sweep of the cache system and clean out expired items
	*/
	$digest.clean = ()=> {
		clearTimeout($digest._cleanTimer);

		Object.keys($digest.cache).forEach(k => {
			if ($digest.hasExpired($digest.cache[k].created))
				delete $digest.cache[k];
		});

		$digest._cleanTimer = setTimeout($digest.clean, $digest.settings.cleanTimer);
	};
	$digest._cleanTimer = setTimeout($digest.clean, $digest.settings.cleanTimer); // Setup initial timer


	return $digest;
};
</service>
