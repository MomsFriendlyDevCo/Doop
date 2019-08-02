<service singleton>
module.exports = function() {
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
					+ '<i class="far fa-arrows"></i>'
					+ data.title
				+ '</div>',
			...data,
		};

		console.log('dragData', $dragDrop.data.data);
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

		$('body').addClass('dragging');

		$dragDrop.isDragging = true;
	};


	$dragDrop.cancel = ()=> $dragDrop.stop(false);
	$dragDrop.accept = ()=> $dragDrop.stop(true);


	$dragDrop.stop = (accept = false) => {
		if (!$dragDrop.isDragging) return;

		$dragDrop.droppableEl.remove();
		$dragDrop.isDragging = false;
		Vue.set($dragDrop, 'data', undefined);

		$(document)
			.off('mousemove', $dragDrop.mouseMove)
			.off('mouseup', $dragDrop.cancel);

		$('body').removeClass('dragging');
	};


	$dragDrop.mouseMove = e =>
		$dragDrop.droppableEl.offset({left: e.clientX - 20, top: e.clientY - 20});


	return $dragDrop;
};
</service>

<component>
module.exports = {
	route: '/debug/dragDrop',
	data() { return {
	}},
	methods: {
		droppedUser(data) {
			this.$toast.success(`Dropped ${data.name}`);
		},
		managerTemplate(data) {
			return '<div class="droppable btn btn-danger">'
				+ '<i class="fas fa-user-tie"/></i>'
				+ data.title
			+ '</div>'
		},
	},
};
</component>

<template>
	<div class="row">
		<div class="col-md-6">
			<div class="card">
				<div class="card-header">
					<h2>Draggable</h2>
				</div>
				<div class="card-body">
					<div class="btn-group">
						<a class="btn btn-light btn-xl" v-draggable="{tag: 'debug-user', data: {name: 'Joe Random'}, title: 'Joe Random'}">
							<i class="far fa-user"/>
							Joe Random
						</a>
						<a class="btn btn-light btn-xl" v-draggable="{tag: 'debug-user', data: {name: 'Jane Quark'}, title: 'Jane Quark'}">
							<i class="far fa-user"/>
							Jane Quark
						</a>
						<a class="btn btn-light btn-xl" v-draggable="{tag: 'debug-user', data: {name: 'Phil Space'}, title: 'Phil Space'}">
							<i class="far fa-user"/>
							Phil Space
						</a>
						<a class="btn btn-danger btn-xl" v-draggable="{tag: 'debug-user', data: {name: 'Mike Manager'}, title: 'Mike Manager', template: managerTemplate}">
							<i class="far fa-user-tie"/>
							Mike Manager
						</a>
					</div>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card">
				<div class="card-header">
					<h2>Droppable</h2>
				</div>
				<div class="card-body">
					<div class="alert alert-secondary d-flex align-items-center justify-content-center" style="width: 100%; height: 300px" v-droppable="{tag: 'debug-user', handler: droppedUser}">
						<div>Drop area</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
