<script lang="js" frontend>
app.service('$dragDrop', function() {
	var $dragDrop = this;

	$dragDrop.isDragging = false;
	$dragDrop.data; // Holder for when we are in a drag event

	$dragDrop.dropableEl; // jQ object for the created droppable ghost

	$dragDrop.start = data => {
		$dragDrop.cancel(); // Cancel existing handlers

		$dragDrop.data = {
			tag: 'droppable',
			data: {},
			title: undefined,
			template: data =>
				'<div class="droppable btn btn-primary">'
					+ `<i class="${data.icon || 'far fa-arrows'}"></i>`
					+ data.title
				+ '</div>',
			...data,
		};

		$dragDrop.droppableEl = $(
			_.isString($dragDrop.data.template)
				? $dragDrop.data.template
				: $dragDrop.data.template($dragDrop.data)
		)
			.attr('id', 'droppable')
			.appendTo('body');

		$(document)
			.on('mousemove', $dragDrop.mouseMove)
			.on('mouseup', ()=> setTimeout($dragDrop.cancel, 100)); // Give the droppable area time to accept the drop before cancelling it

		if ($dragDrop.data && $dragDrop.data.tag)
			$('body').addClass(['dragging', `dragging-${$dragDrop.data.tag}`]);

		$dragDrop.isDragging = true;
	};

	$dragDrop.cancel = ()=> $dragDrop.stop(false);
	$dragDrop.accept = ()=> $dragDrop.stop(true);

	$dragDrop.stop = (accept = false) => {
		if (!$dragDrop.isDragging) return;

		$dragDrop.droppableEl.remove();
		$dragDrop.isDragging = false;

		$(document)
			.off('mousemove', $dragDrop.mouseMove)
			.off('mouseup', $dragDrop.cancel);

		if ($dragDrop.data && $dragDrop.data.tag)
			$('body').removeClass(['dragging', `dragging-${$dragDrop.data.tag}`])

		app.set($dragDrop, 'data', undefined);
	};

	$dragDrop.mouseMove = e =>
		$dragDrop.droppableEl.offset({left: e.pageX - 20, top: e.pageY - 20});

	return $dragDrop;
});
</script>
