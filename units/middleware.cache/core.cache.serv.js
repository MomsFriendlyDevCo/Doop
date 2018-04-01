angular
	.module('app')
	.factory('$cache', function($http, $q, $window) {
		var $cache = this;


		/**
		* Get cache data
		* This is really just a wrapper around $window.localStorage.getItem() with a JSON decoder
		* @param {string} key The key to retrieve
		* @param {*} [fallback] The fallback to use instead of undefined
		* @returns {*} The value of the cached data
		*/
		$cache.get = (key, fallback) => {
			var val = $window.localStorage.getItem(key);
			return angular.isUndefined(val) ? fallback : JSON.parse(val);
		};


		/**
		* Quickly get whether a cache key is set
		* This is a slightly quicker version of get() in that we don't need to decode the JSON data - just check if its there
		* @param {string} key The key to check the existance of
		* @returns {boolean} A boolean true if the key exists within the cache
		*/
		$cache.has = key => !angular.isUndefined($window.localStorage.getItem(key));


		/**
		* Set cache data
		* This is realyl just a wrapper around $window.localStorage.setItem() with a JSON encoder
		* @param {string} key The cache key to set
		* @param {*} value The value to set (must be a JSON compatible type)
		*/
		$cache.set = (key, value) => $window.localStorage.setItem(key, JSON.stringify(value));


		/**
		* Attempt to fetch a URL via $http, caching its contents (and eTag) via localStorage
		* @param {string} [url] The GET URL to fetch
		* @param {Object} options The $http compatible object (can include `url` if omitted as the first argument)
		* @param {string} [options.id] The ID of the requested to cache against, if omitted the URL is used
		* @returns {Promise} A promise which will resolve either with the cached content or the fetched content or reject with an error code
		*/
		$cache.fetch = function(url, options) {
			// Argument mangling {{{options
			if (angular.isString(url) && angular.isUndefined(options)) {
				options = {url: url};
			} else if (angular.isString(url) && angular.isObject(options)) {
				options.url = url;
			} else if (angular.isObject(url)) {
				options = url;
				if (!options.url) throw new Error('Must specify url when calling $cache.get as an object');
			}
			// }}}
			// Error checking {{{
			if (!options.url) throw new Error('No URL specified');
			// }}}
			// Populate HTTP headers {{{
			var id = options.id || options.url || url;
			var settings = _.defaults(options, {
				id,
				method: 'GET',
				headers: {
					etag: $cache.has(`${id}-etag`) && $cache.has(id)
						? $cache.get(`${id}-etag`)
						: undefined,
				},
			});
			// }}}
			// Provide queued promise if we're asking for the same ID {{{
			if ($cache.$fetching[settings.id]) return $cache.$fetching[settings.id];
			// }}}

			// Make request {{{
			return $cache.$fetching[settings.id] = $q(function(resolve, reject) {
				$http(settings)
					.catch(err => {
						if (err.status != 304) reject(err); // Ignore 'Not Modified' messages
					})
					.then(res => {
						if (angular.isUndefined(res) && $cache.has(settings.id)) { // 304 - Asset tree on server is not modified - use local cache instead
							resolve($cache.get(settings.id));
						} else if (angular.isUndefined(res)) { // 304 - But we don't have any local storage!
							console.warn('Server gave 304 to our etag request but we have no local storage! This shouldnt happen!');
						} else { // Got data - serve it and stash in local storage
							$cache.set(settings.id, res.data);
							$cache.set(`${settings.id}-etag`, res.headers('etag'));
							resolve(res.data);
						}
					})
					.finally(()=> delete $cache.$fetching[settings.id])
			});
			// }}}
		};


		/**
		* Similar to fetch but this function returns a fetching factory which will resolve with a new promise each time it is called
		* @param {string} [url] The GET URL to bind to
		* @param {Object} options The $http compatible object (can include `url` if omitted as the first argument)
		* @param {string} [options.id] The ID of the requested to cache against, if omitted the URL is used
		* @returns {Object} An Angular + ngResource compatible request object
		*/
		$cache.resource = (url, options) => ()=> ({$promise: $cache.fetch(url, options)});


		/**
		* Cache of items we are currently fetching
		* This is stored so if we make two simultanious requests for the same data we can force them to use the same resolver
		* @var {Object} Object of Promises
		*/
		$cache.$fetching = {};

		return $cache;
	})
