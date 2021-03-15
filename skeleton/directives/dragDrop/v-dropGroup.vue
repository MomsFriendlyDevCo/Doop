<script lang="js" frontend>
/**
* Install a drop-group for all child elements
* A drop group can apply a style when any drag event starts for child elements and can redirect misplaced drops to the nearest element
* Any draggable element is droppable onto a corresponding v-droppable directive
* @param {object} options Droppable options
* @param {boolean} [options.dropGuide=true] Highlight all child v-droppable components on drag events
* @param {function} [options.handlerInvalid] Function to run similar to v-droppable{handler} if the user drops in the v-drop-group but not on any item - i.e. an invalid drop area, if omitted dropped items will be handled by the browser (usually showing the file contents if the dropped item was a file). Called as `(event)`
* @param {boolean} [options.dropClosest=false] Redirect dropping to the closest droppable element if the user drops outside the valid drop zone
* @param {number} [options.maxDistance=400] Maximum distance to be considered 'close'. Set to zero to use infinite distance
*/
app.directive('v-dropGroup', {
	bind(el, binding) {
		var $el = $(el);
		var settings = {
			dropGuide: true,
			handlerInvalid: false,
			dropClosest: false,
			maxDistance: 400,
			...binding.value,
		};

		$el.addClass('drop-group');

		// dropGuide {{{
		if (settings.dropGuide) {
			$el
				.on('dragover', e => $el.addClass('drop-guide'))
				.on('dragleave', e => $el.removeClass('drop-guide'))
		}
		// }}}


		// dropClosest (Must be before handlerInvalid due to it firing event chains first) {{{
		if (settings.dropClosest) {
			var childTargets; // Calculated when drag starts
			var childClosest; // Calculated closest child during a dragOver event, may be null if none

			$el
				.on('dragenter', e => {
					childTargets = $el
						.find('.droppable')
						.toArray()
						.map(child => {
							var $child = $(child);
							var pos = $child.offset();
							return {
								$child,
								x: pos.left + $child.height() / 2,
								y: pos.top + $child.width() / 2,
							};
						})
				})
				.on('dragleave', e => {
					childTargets.forEach(child => child.$child.removeClass('drop-closest'));
				})
				.on('dragover', e => {
					e.preventDefault();
					e.stopPropagation();

					childClosest = childTargets
						.map(child => ({
							...child,
							distance: Math.sqrt(Math.pow(child.x - e.pageX, 2) + Math.pow(child.y - e.pageY, 2)),
						}))
					 	.reduce((closest, child) =>
							!closest || child.distance < closest.distance
								? child
								: closest
						, null)

					if (settings.maxDistance > 0 && childClosest.distance > settings.maxDistance) childClosest = false; // Closest child is too far away

					// Set drop-closest only on the closest child target, disable it on all others
					childTargets.forEach(child => child.$child.toggleClass('drop-closest', childClosest && child.$child == childClosest.$child));
				})
				.on('drop', e => {
					childTargets.forEach(child => child.$child.removeClass('drop-closest'));
					if (childClosest) { // Redirect drop to closest child
						e.dropHandled = true; // Mark event has dealt with so handlerInvalid doesn't also fire
						e.preventDefault();
						e.stopPropagation();
						childClosest.$child.trigger('dropgroup-files', [e.originalEvent.dataTransfer.files]);
						$el.removeClass('drop-guide');
					}
				})
		}
		// }}}

		// handerInvalid {{{
		if (settings.handlerInvalid) {
			$el
				.on('dragover', e => {
					e.preventDefault();
					e.stopPropagation();
				})
				.on('drop', e => {
					if (e.dropHandled) return; // Already handled by dropClosest
					$el.removeClass('drop-guide');
					return settings.handlerInvalid(e);
				})
		}
		// }}}
	},
});
</script>

<style>
/* drop-guide {{{ */
.drop-group.drop-guide .droppable {
	border: 2px dotted var(--primary);
}
/* }}} */

/* drop-closest {{{ */
.drop-group .droppable.drop-closest {
	border: 2px solid var(--primary); /* NOTE That if drop-guides is enabled all other elements will have a dashed border */
}
/* }}} */
</style>
