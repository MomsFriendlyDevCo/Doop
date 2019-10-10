// NOTE: Because of how JavaScript initalizes `new Array([1, 2, 3])` vs `[1, 2, 3]` the flat functiononly works on the former case
//
Object.defineProperty(Array.prototype, 'flatMap', {
	configurable: true,
	value: function flatMap (callback) {
		return Array.prototype.map.apply(this, arguments).flat();
	},
	writable: true
});
