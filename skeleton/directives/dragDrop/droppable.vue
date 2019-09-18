<directive>
/**
* Indicate that an element can accept any element of a valid tag
* Any draggable element is droppable onto a corresponding v-droppable directive
* @param {object} droppable Droppable options
* @param {string|array} [droppable.tag='droppable'] The tag or array of tags to accept for this element
* @param {function} [droppable.handler] Function to call as ($dragDrop.data.data) when the user drops a valid item onto this droppable area
* @param {function} [droppable.handlerInvalid] Function to call as when the user attempted to drop the element on an invalid drop area
*
* NOTE: When an item is being dragged over (and its valid) the class `droppable-hover` is applied
*/
module.exports = {
	bind(el, binding) {
		var $dragDrop = Vue.services().$dragDrop;
		var $el = $(el);

		$el
			.addClass('droppable')
			.on('mouseenter', e => {
				if (
					$dragDrop.isDragging
					&& $dragDrop.data
					&& ( // Tag checking
						(!binding.value.tag) // No tag
						|| _.castArray($dragDrop.data.tag).some(t => t == $dragDrop.data.tag) // At least one tag matches
					)
				) {
					$el.addClass('droppable-hover');
				}
			})
			.on('mouseleave', e => {
				$el.removeClass('droppable-hover');
			})
			.on('mouseup', e => {
				$el.removeClass('droppable-hover');
				if (!$dragDrop.isDragging) return; // User did mouse up when not dragging anything

				if ( // Check drop validity
					$dragDrop.isDragging
					&& $dragDrop.data
					&& ( // Tag checking
						(!binding.value.tag) // No tag
						|| _.castArray($dragDrop.data.tag).some(t => t == $dragDrop.data.tag) // At least one tag matches
					)
				) {
					if (binding.value.handler) binding.value.handler($dragDrop.data.data);
					$dragDrop.accept(); // Dropped onto valid drop area tag
				} else {
					if (binding.value.handlerInvalid) binding.value.handlerInvalid();
					$dragDrop.cancel(); // Dropped onto invalid drop area tag
				}
			});
	},
};
</directive>

<style>
#droppable {
	pointer-events: none;
	display: block;
	z-index: 1000;
	position: absolute;
	box-shadow: 3px 3px 5px rgba(0,0,0,.6);
	cursor: grabbing;
	opacity: 0.8;
}

#droppable i {
	margin-right: 10px;
}

.droppable.droppable-hover {
	border: 2px solid var(--primary);
}
</style>
