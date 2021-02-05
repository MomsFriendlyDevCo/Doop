<script lang="js" frontend>
/**
* Extremely simple component which fetches a single point of data from the server and displays it
* EITHER the collection + ID OR the url must be specified
* If the return value from the server is an array the first item in the array is assumed to be the one we're interested in
*
* It is also possible to force this element to display values using the emitter events `digest.force.{class,icon,text,valid}`
*
* @param {string|Object} [url] The URL or AxiosRequest to fetch data (instead of specifying `collection` + `id`)
* @param {string} [field="title"] Field to display the title of, if using slots specify "*" to populate `data` with the raw data object
* @param {string} [filter] Optional Vue filter to run the result through before outputting
* @param {string} [label] Use this label before fetching a remote one, if specifed the entity is treated as valid (including valid class and icon)
* @param {boolean} [lazy=true] If true, fetching will be defered until the element is actually shown within the content area
* @param {string} [lazyParents='#main, body'] jQuery compatible string listing the intersection parents to probe for when lazy==true, the first one found is assumed to be the parent
* @param {string} [lazyParentsDisable='.modal'] jQuery compatible string which, if matched disables lazy loading (defaults to inside modals by default)
* @param {string} [classValid] Apply this class to the element if the returned value is truthy
* @param {string} [classInvalid] Apply this class to the element if the return value is falsy
* @param {string|function} [textValid] Either overriding text to display if the element is valid, or a function to call with the server response which returns the mangled output
* @param {string|function} [textInvalid] As with `textValid` this is either overriding text or a function to mangle a server response
* @param {string} [iconValid] Optional icon to display next to the context when loaded
* @param {string} [iconInvalid] Optional icon to display next to the `textInvalid` text when an error occurs
* @param {boolean} [ignoreErrors=false] Ignore all thrown errors, if false they will be routed into this.$toast.catch
* @param {string} [hashMethod='urlField] How to cache the digest result, see the $digest service for more info
*
* @slot [loading] What to display when loading - defaults to a FA5 loading spinner. Bindings are `{config}`
* @slot [display] What to display when data is loaded. Bindings are `{config, data, displayContent}`
*
* @example Fetch a specific URL and extract a key
* <digest url="/api/some/url" key="widgets"/>
*
* @example Force all child digests to be invalid
* this.$emit.down('digest.force.valid', false)
*
* @example Pull in a full data record and template the responses
* <digest
*   field="*"
*   :url="`/api/widgets/${input.file}`"
* >
*   <template #loading>
*     <i class="far fa-spinner fa-spin"/>
*     Loading widget information...
*   </template>
*   <template #display="{data: widget}">
*     <strong class="d-block">{{widget.title}}</strong>
*     <small class="d-block">{{widget.description}}</small>
*   </template>
* </digest>
*/
app.component('digest', {
	data: ()=> ({
		data: undefined,
		displayContent: '',
		displayClass: undefined,
		isLazy: false,
		loading: true,
		useLabel: true, // Whether to display the $props.label content if its present, set to false on incomming events or overrides
	}),
	props: {
		url: {type: [Object, String], required: true},
		field: {type: String, default: "title"},
		filter: {type: String},
		label: {type: String},
		lazy: {type: Boolean, default: true},
		lazyParents: {type: String, default: '#main, body'},
		lazyParentsDisable: {type: String, default: '.modal'},
		classValid: {type: String},
		classInvalid: {type: String},
		textValid: {type: [String, Function]},
		textInvalid: {type: [String, Function]},
		iconValid: {type: String},
		iconInvalid: {type: String},
		ignoreErrors: {type: Boolean, default: false},
		hashMethod: {type: String, defualt: 'urlField', validator: v => ['urlField', 'url', 'urlQuery'].includes(v)},
	},
	methods: {
		refresh() {
			this.loading = true;
			if (this.useLabel && this.$props.label) { // Use label instead of fetching remote?
				this.displayContent = this.$props.label;
				this.displayIcon = this.$props.iconValid;
				this.loading = false;
			} else { // Fetch remote data
				this.$digest.get(this.$props.url, this.$props.field, {hashMethod: this.$props.hashMethod})
					.then(value => {
						this.data = value;
						this.displayContent = typeof this.$props.textValid == 'string' ? this.$props.textValid
							: typeof this.$props.textValid == 'function' ? this.$props.textValid(value)
							: value;

						if (this.$props.filter) this.displayContent = app.filter(this.$props.filter)(this.displayContent);

						this.displayIcon = this.$props.iconValid;
						if (this.$props.classValid) this.displayClass = this.$props.classValid;
					})
					.catch(err => {
						this.displayContent = typeof this.$props.textInvalid == 'string' ? this.$props.textInvalid
							: typeof this.$props.textInvalid == 'function' ? this.$props.textInvalid(err)
							: err.statusText ? err.statusText
							: err;
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
});
</script>

<template>
	<div class="digest">
		<slot v-if="loading" name="loading" :config="$props">
			<i class="far fa-spinner fa-spin"/>
		</slot>
		<slot v-else name="display" :config="$props" :data="data" :displayContent="displayContent">
			<div :class="displayClass">
				<i v-if="displayIcon" :class="displayIcon"/>
				{{displayContent}}
			</div>
		</slot>
	</div>
</template>

<style>
.digest > span > i {
	margin-right: 2px;
}
</style>

<script lang="js" frontend>
app.service('$digest', function() {
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
	* @param {string|Object} [url] The URL or AxiosRequest to fetch, if not speicifed in the options object
	* @param {string} [field] Optional field to restrict the response to, if omitted the entire raw response is set, use the special case "*" to return only the data portion (implies `{rawResponse: false}`)
	* @param {object} [options] Additional options to pass
	* @param {string} [options.url] Alternate method to specify the URL
	* @param {string|undefined} [options.field] The field to retrieve or the special case "*" for everything
	* @param {string} [options.hash] Hashing string to use when caching, automatically calculated from the URL + field if omitted
	* @param {string} [options.hashMethod='urlField] How to hash + cache the digest result. ENUM: 'urlField' (use both url + field as hash), 'url' (use URL only disguarding other fields - useful if all endpoints are the same with but the field being different)
	* @returns {Promise} A promise which will resolve with either the specificly requested field value or the Axios response for the request
	*/
	$digest.get = (url, field, options) => {
		// Argument mangling {{{
		if (
			typeof url == 'string' && typeof field == 'string' // Called as (url, field)
			|| typeof url == 'string' && field === undefined && options === undefined // Called as (url)
			|| typeof url == 'object' && typeof field == 'string' // Called as (axiosOptions, field)
		) {
			// Pass
		} else if (typeof url == 'string' && typeof field == 'object') { // Called as (url, options)
			[url, field, options] = [url, undefined, field];
		} else if (typeof url == 'object') { // Called as (options)
			[url, field, options] = [options.url, options.field, options];
		} else {
			throw new Error(`Unknown call signature for $digest.get(${typeof url}, ${typeof field}, ${typeof options})`);
		}
		// }}}
		var settings = _.defaults(options, {
			url,
			field: field === '*' ? undefined : field, // Either use the provided field name or set to undefined if the special case "*"
			hash: undefined, // Set below
			rawResponse: true,
			hashMethod: 'urlField',
		});

		// Determine hash to use {{{
		settings.hash = settings.hash ? settings.hash // Hash pre-computed for us - use that
			: settings.hashMethod == 'urlField' && typeof url == 'string' ? `${url}@${settings.field || '*'}` // url is a string and we have a valid field - combine
			: settings.hashMethod == 'urlField' && typeof url == 'object' ? `${url.url}@${settings.field || '*'}` // url is an Axios endpoint - use URL po
			: settings.hashMethod == 'url' && typeof url == 'string' ? url // url is a string and we have a valid field - combine
			: settings.hashMethod == 'url' && typeof url == 'object' ? url.url // url is an Axios endpoint - use URL po
			: settings.hashMethod == 'urlQuery' && typeof url == 'string' ? false // url + query - not supported yet
			: settings.hashMethod == 'urlQuery' && typeof url == 'object' ? `${url.url}?${_.map(url.params || {}, (v, k) => `${k}=${v}`).join('&')}` // url is an Axios endpoint - collapse params into a string
			: false;
		if (settings.hash === false) throw new Error('Unable to determine hash method with digest input or hash method not supported yet');
		// }}}

		var digestPromise; // Which promise we need to attach to
		if (
			$digest.cache[settings.hash] // We already have a cache entry
			&& !$digest.hasExpired($digest.cache[settings.hash].created) // ... and its still valid
		) {
			digestPromise = $digest.cache[settings.hash].promise; // Use cached promise
		} else {
			$digest.cache[settings.hash] = { // Create new request
				created: new Date(),
				value: undefined,
				promise: (
					typeof url == 'object'
						? this.$http(url) // Passed full Axios request - use it as is
						: this.$http.get(url, { // Passed URL + [field] - Break into URL + options
							...(settings.field ? {params: {select: settings.field}} : null)
						})
				).then(({data}) => { // Mangle response into just the cachable part + perform some sanity checks
					$digest.cache[settings.hash].value = data; // Cache server response

					if (!settings.field) return data; // No field specified - return entire data response

					// Validation checking in dev mode
					if (_.isArray(data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got an array`);
					if (!_.isObject(data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got a non-object`);
					if (_.isEmpty(data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got empty object`);

					return data;
				})
			};
			digestPromise = $digest.cache[settings.hash].promise; // Return the promise part only
		}

		return digestPromise // Attach to either the cached promise or the new one...
			.then(data => { // Pick the specific field value if requested, otherwise return full response
				if (!settings.field) {
					return data;
				} else if (/,/.test(settings.field)) { // Given a CSV of fields - use the first one
					var useField = settings.field.split(/\s*,\s*/, 2)[0];
					if (!data[useField]) throw new Error(`Expected the field "${useField}" (as first field of CSV "${settings.field}") in single document response from URL "${url}". Got keys: ${Object.keys(data).join(', ')}`);
					return data[useField];
				} else { // Extract single key specified by settings.field
					if (!_.has(data, settings.field)) throw new Error(`Expected the field "${settings.field}" in single document response from URL "${url}". Got keys: ${Object.keys(data).join(', ')}`);
					return data[settings.field];
				}
			})
	};


	/**
	* Sync version of $digest.get cache fetcher
	* This either succeeds with the cached value or returns undefined - no new request for data is made
	* @param {string} url URL to request from
	* @param {string} [field] Specific field requested, if any
	* @returns {*} Either the cached value (with optional sub-key) or undefined
	*/
	$digest.getSync = (url, field) => {
		var hash = field ? url + '@' + field : url;
		return $digest.cache[hash] && field ? $digest.cache[hash].value[field] // Asked for field
			: $digest.cache[hash] ? $digest.cache[hash].value // Asked for entire data
			: undefined;
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
});
</script>
