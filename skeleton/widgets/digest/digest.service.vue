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
	* @param {string} [url] The URL to fetch, if not speicifed in the options object
	* @param {string} [field] Optional field to restrict the response to, if omitted the entire raw response is set, use the special case "*" to return only the data portion (implies `{rawResponse: false}`)
	* @param {object} [options] Additional options to pass
	* @param {string} [options.url] Alternate method to specify the URL
	* @param {string|undefined} [options.field] The field to retrieve or the special case "*" for everything
	* @param {string} [options.hash] Hashing string to use when caching, automatically calculated from the URL + field if omitted
	* @returns {Promise} A promise which will resolve with either the specificly requested field value or the Axios response for the request
	*/
	$digest.get = (url, field, options) => {
		// Argument mangling {{{
		if (
			typeof url == 'string' && typeof field == 'string'
			|| typeof url == 'string' && field === undefined && options === undefined
		) { // Called as full function // (url) only
			// Pass
		} else if (typeof url == 'string' && typeof field == 'object') { // Called as (url, options)
			[url, field, options] = [url, undefined, field];
		} else if (typeof url == 'object') { // Called as (options)
			[url, field, options] = [options.url, options.field, options];
		} else {
			throw new Error(`Unknown call signature for $digest.get(${typeof url}, ${typeof field}, ${typeof options})`);
		}
		// }}}
		var settings = {
			url,
			field: field === '*' ? undefined : field, // Either use the provided field name or set to undefined if the special case "*"
			hash: undefined, // Set below
			rawResponse: true,
			...options,
		};
		settings.hash = settings.hash ? settings.hash : settings.field ? `${url}@${settings.field}` : url;

		if (
			$digest.cache[settings.hash] // We already have a cache entry
			&& !$digest.hasExpired($digest.cache[settings.hash].created) // ... and its still valid
		) return $digest.cache[settings.hash].promise;

		$digest.cache[settings.hash] = {
			created: new Date(),
			value: undefined,
			promise: this.$http.get(url, {
				...(settings.field ? {params: {select: settings.field}} : null)
			})
				.then(res => { // Pick the specific field value if requested, otherwise return full response
					if (!settings.field) return res.data; // No field specified - return entire data response

					if (_.isArray(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got an array`);
					if (!_.isObject(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got a non-object`);
					if (_.isEmpty(res.data)) throw new Error(`Expected a single object response rendering a <digest/> from URL "${url}" - got empty object`);
					if (/,/.test(settings.field)) { // Given a CSV of fields - use the first one
						var useField = settings.field.split(/\s*,\s*/, 2)[0];
						if (!res.data[useField]) throw new Error(`Expected the field "${useField}" (as first field of CSV "${settings.field}") in single document response from URL "${url}". Got keys: ${Object.keys(res.data).join(', ')}`);
						return res.data[useField];
					} else { // Extract single key specified by settings.field
						if (!_.has(res.data, settings.field)) throw new Error(`Expected the field "${settings.field}" in single document response from URL "${url}". Got keys: ${Object.keys(res.data).join(', ')}`);

						return res.data[settings.field];
					}
				})
				.then(payload => $digest.cache[settings.hash].value = payload),
		};

		return $digest.cache[settings.hash].promise;
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
});
</script>
