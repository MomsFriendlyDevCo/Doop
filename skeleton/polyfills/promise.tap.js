/**
* Add a method into the promise prototype that does not effect the output of a waterfall result
* @example
* Promise.resolve(1)
*   .then(v => 2)
*   .tap(v => console.log('TAP', v)) //= TAP 2
*   .then(v => console.log('RESULT', v)) //= RESULT 2
*/
Promise.prototype.tap = function(fn) {
	return this.then(v =>
		Promise.resolve(fn(v))
			.then(()=> v)
	);
};
