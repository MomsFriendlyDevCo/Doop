<script lang="js" frontend>
/**
* Indicate that an element is draggable based on a tag
* Any draggable element is droppable onto a corresponding v-droppable directive
* @param {Object|string} draggable The draggable object definition, if this is a string it is assumed as shorthand for `binding.tag`
* @param {string} [draggable.tag='droppable'] The tag of the droppable that can accept this object
* @param {*} [draggable.data] Optional data payload to pass to the droppable element
* @param {string} [draggable.title] The title to display when dragging
* @param {string} [draggable.icon="far fa-arrows"] Default icon to use when dragging, assuming the default template
* @param {function} [draggable.handler] Function to call as (data, $el) when dragging starts
* @param {string|function} [draggable.template] Either a HTML template to use for the ghost dragger element or a function, called as (data) which returns the HTML. Templates always have the attributes `id=droppable` assigned automatically
* @param {boolean|function <boolean>} [draggable.enabled] Sync function to determine if this element is draggable (only evaluated on bind at this stage)
* @param {number} [draggable.minTime=100] Minimum amount of time before recognising that this is a drag event, used to determine between a click and drag event
*
* NOTE: When a drag operation is activated the body has the classes `dragging` and `dragging-${tag}` added to it
*
* @example
* <a v-draggable="{data: 123}" class="btn btn-primary">Drag me...</a>
* <div v-droppable="{handler: dropHandler}" class="alert alert-secondary">Drop me here</div>
*/
app.directive('v-draggable', {
	bind(el, binding) {
		var settings = {
			enabled: true,
			minTime: 100,
			handler: (data, $el) => {},
			...(_.isObject(binding.value) ? binding.value : {tag: binding.value}),
		};

		// draggable.enabled property {{{
		if (_.isFunction(settings.enabled)) {
			if (!settings.enabled()) return; // Function returned falsy
		} else if (!settings.enabled) { // Don't bind if falsy
			return;
		} // Implied else: continue on to bind
		// }}}

		var dragStartTimer; // Handle to the drag timer, stared during mousedown

		var $el = $(el);
		$el
			.addClass('draggable')
			.on('mousedown', e => {
				if (e.button != 0) return; // Ignore all but left mouse buttons
				dragStartTimer = setTimeout(()=> {
					settings.handler(binding.value, $el);
					app.service.$dragDrop.start(binding.value);
				}, settings.minTime);
			})
			.on('mouseup', ()=> {
				if (dragStartTimer) clearTimeout(dragStartTimer);
			})
	},
});
</script>

<style>
body.dragging {
	cursor: grabbing;
}

.draggable {
	cursor: grab;
	user-select: none;
}
</style>
