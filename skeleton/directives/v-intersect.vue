<script lang="js" frontend>
/**
* Intersection observer for lazy loading or otherwise reacting when an element becomes visible
*
* @VueModifier once When given sets `{once: true}`
*
* @param {Object|function} options The options of the intersect, if a function is give it is assumed as the value of `options.handler`
* @param {function} handler The function to run on intersect
* @param {boolean} [once=false] Only run the intersection once then remove observation, can also be specified as a modifier
* @param {number} [delay=0] Delay a given number of milliseconds before running the handler
* @param {boolean} [isVisible=true] Check the visibility of the element, only firing the handler if the element is in any way visible
* @param {number} [minRatio] The minimum ratio of visibility before running the handler
* @param {Object} [observer] Other IntersectionObserver parameters to pass when creating the initial instance
*
*/
app.directive('v-intersect', {
	bind(el, binding) {
		var $el = $(el);
		var settings = {
			handler: _.isFunction(binding.value) ? binding.value : v => {},
			once: binding.modifiers.once ?? false,
			delay: 0,
			isVisible: true,
			minRatio: undefined,
			observer: {
				root: null,
				rootMargin: '0px',
				threshold: [0.0, 0.75],
			},
			...(_.isObject(binding.value) ? binding.value : null),
		};

		var observer = new IntersectionObserver(
			(entries) => {
				var entry = entries[0];
				if (settings.minRatio !== undefined && entry.intersectionRatio < settings.minRatio) return; // Not enough ratio - ignore call
				if (settings.isVisible && !entry.isIntersecting) return; // Want visible but is not yet visible

				// Call the handler (optionally after a delay)
				setTimeout(settings.handler, settings.delay);

				if (settings.once) observer.disconnect();
			},
			settings.observer,
		);

		observer.observe(el);
	},
});
</script>
