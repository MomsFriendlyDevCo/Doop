<script lang="js" frontend>
/**
* Indicate that an element can accept any element of a valid tag
* Any draggable element is droppable onto a corresponding v-droppable directive
* @param {object} droppable Droppable options
* @param {string|array} [droppable.tag='droppable'] The tag or array of tags to accept for this element
* @param {function} [droppable.handler] Function to call as ($dragDrop.data.data) when the user drops a valid item onto this droppable area
* @param {function} [droppable.handlerInvalid] Function to call as when the user attempted to drop the element on an invalid drop area
* @param {boolean} [droppable.dropFiles=false] Accept external files in the drop area, if files are dropped the handler is fired with `{files: FileList}`
*
* NOTE: When an item is being dragged over (and its valid) the class `droppable-hover` is applied
*/
app.directive('v-droppable', {
	bind(el, binding) {
		var $dragDrop = app.service.$dragDrop;
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


		// Handle file drops
		if (binding.value && binding.value.dropFiles) {
			if (!binding.value.handler) console.warn('v-droppable{dropFiles:true} is set but no {handler} is specified - this will accept files but do nothing!');

			$el
				.on('dragover', e => { // Reply each tick that we will accept the file contents
					e.stopPropagation();
					e.preventDefault();
				})
				.on('dragenter', e => { // Apply hover effect on enter
					e.stopPropagation(); // Prevent document recieving dragenter (prevents guide overwriting style)
					$el.addClass('droppable-hover')
				})
				.on('dragleave', e => { // Remove hover effect on leave
					e.stopPropagation(); // Prevent document recieving dragleave (prevents guide overwriting style)
					$el.removeClass('droppable-hover');
				})
				.on('drop', e => { // Accept dropped file contents
					e.preventDefault();
					e.stopPropagation();
					$el.removeClass('droppable-hover');
					if (binding.value.handler) binding.value.handler({files: e.originalEvent.dataTransfer.files});
				})
				.on('dropgroup-files', (e, files) => { // Special case for dealing with redirected drop events from within a v-drop-group
					$el.removeClass('droppable-hover');
					if (binding.value.handler) binding.value.handler({files});
				})
		}
	},
});
</script>

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
