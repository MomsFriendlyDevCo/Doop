mfdc-cache
==========
Micro-caching framework for Monoxide.

This library exposes a collection of simple APIs to assit with caching. These are especially useful to cache remote API responses.

```javascript
	db.requestCaches.runConditional(
		'a-remote-operation',
		{foo: 'foo!', bar: 'baz!'}, // A big fancy query (will be hashed in a-z order)
		function(next) { // A big costly function that will be slow
			var mySlowResponse = {/* Something complex */};
			next(null, mySlowResponse);
		},
		function(err, res) { // What we eventually have to run with a response
			// Res should now be a cached value
		}
	);
```


API
===
This module will return a [Monoxide Collection](https://github.com/hash-bang/Monoxide) with the following additional API methods.

db.requestCaches.runConditional(type, query, freshCallback, callback)
---------------------------------------------------------------------
Searches the database for a hashed version of query and if not found uses `freshCallback(next)` to return the value. All subsequent values will be cached.
This function can be thought of as the following pseudo code:

```javascript
if(/* Figure out if cache exists*/) {
	callback(response);
} else {
	freshCallback(callback);
}
```

If the cache response is found callback is called instead, bypassing the request.
This function will also check the expiry of the request.


db.requestCaches.clean([cb])
----------------------------
Remove all expired cache entries from the database collection.

If you wish to remove *all* entries use `db.requestCaches.nuke()`

This function can also be called via gulp with:

```
gulp requestCaches:clean
```


db.requestCache.nuke([cb])
--------------------------
Remove **all** cache entries from the database even if they are still valid.

```
gulp requestCaches:nuke
```
