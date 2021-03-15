/**
* Resolve promises similar to Promise.all() but preserve object keys
*
* @param {Object<function>} promises An object where each value is a resolvable promise
* @returns {Promise} A promise which will resolve/reject based on the completion of the given promise factories being resolved
* @url https://github.com/MomsFriendlyDevCo/Nodash
*
* @example Evaluate a promise object
* Promise.allObject(
*   fooPromise: aPromiseFromSomewhere(),
*   barPromise: aPromiseFromSomewhere(),
* )
* .then(output => ...) // output = {fooPromise: result, barPromise: result}
*/
Promise.allObject = promises => Promise.all(
	Object.values(promises)
)
	.then(result => {
		var keys = Object.keys(promises);
		return Object.fromEntries(
			result.map((value, offset) => [keys[offset], value])
		)
	});
