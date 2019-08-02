<directive>
/**
* Indicate that an element is draggable based on a tag
* Any draggable element is droppable onto a corresponding v-droppable directive
* @param {Object} draggable The draggable object definition
* @param {string} [draggable.tag='droppable'] The tag of the droppable that can accept this object
* @param {*} [draggable.data] Optional data payload to pass to the droppable element
* @param {string} [draggable.title] The title to display when dragging
* @param {string|function} [draggable.template] Either a HTML template to use for the ghost dragger element or a function, called as (data) which returns the HTML. Templates always have the attributes `id=droppable` assigned automatically
*
* @example
* <a v-draggable="{data: 123}" class="btn btn-primary">Drag me...</a>
* <div v-droppable="{handler: dropHandler}" class="alert alert-secondary">Drop me here</div>
*/
module.exports = {
	bind(el, binding) {
		var $el = $(el);
		$el
			.addClass('draggable')
			.on('mousedown', e => Vue.services().$dragDrop.start(binding.value))
	},
};
</directive>

<style>
body.dragging {
	cursor: grabbing;
}

.draggable {
	cursor: grab;
	user-select: none;
}
</style>
