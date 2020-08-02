<script>
/**
* High level service which provides an extendable stub to glue filter functions, available to all components
*
* @example Get a startCased string (within a controller)
* vm.$filters.startCase(this.stringToStartCase)
*
* @example Get a startCased string (within a template)
* {{stringToStartCase |> $filters.startCase}}
*/
app.service('filter', {
	methods: {}, // Empty initially but expected to be populated by subsequent app.filter calls
});


/**
* Add app.filter(id, spec) functionality
* This really just reroutes `app.filter(id, spec)` => `app.service('filter').methods`
* @param {string} id The filter ID
* @param {function} [func] If specified declares the filter function, if omtited this simply returns the function by its ID if any
* @returns {function} The filter function created / fetched
*/
app.filter = (id, func) => app.service('filter').methods[id] = func;
</script>
