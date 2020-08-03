<script>
var $dragDrop = {};

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

	Vue.set($dragDrop, 'data', undefined);
};

$dragDrop.mouseMove = e =>
	$dragDrop.droppableEl.offset({left: e.pageX - 20, top: e.pageY - 20});

app.service('$dragDrop', $dragDrop);
</script>

<script>
app.component({
	route: '/debug/dragDrop',
	methods: {
		droppedOutput(data) {
			if (data.files) { // Droped external files?
				this.$toast.success('Dropped files: ' + Array.from(data.files).map(file => file.name).join(', '));
			} else {
				this.$toast.success(`Dropped ${data.name}`);
			}
		},
		droppedInvalid(e) {
			e.preventDefault();
			this.$toast.warning('Cant drop that there');
		},
		managerTemplate(data) {
			return '<div class="droppable btn btn-danger">'
				+ '<i class="fas fa-user-tie"/></i>'
				+ data.title
			+ '</div>'
		},
	},
});
</script>

<template>
	<div class="row">
		<!--
		<div class="col-md-6">
			<div class="card">
				<div class="card-header">
					<h2>v-draggable</h2>
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
					<h2>v-droppable</h2>
				</div>
				<div class="card-body">
					<div
						class="alert alert-secondary d-flex align-items-center justify-content-center"
						style="width: 100%; height: 300px"
						v-droppable="{
							tag: 'debug-user',
							handler: droppedOutput,
							dropFiles: true,
						}"
					>
						<div class="text-center">
							Drop area<br/>
							<small class="text-muted">(also accepts file drops)</small>
						</div>
					</div>
				</div>
			</div>
		</div>
		-->
		<div class="col-12 mt-1">
			<div class="card"
				v-drop-group="{
					dropGuide: true,
					handlerInvalid: droppedInvalid,
					dropClosest: true,
					maxDistance: 400,
				}"
			>
				<div class="card-header">
					<h2>v-drop-group</h2>
				</div>
				<div class="card-body">
					A drop-group gathers v-droppable elements together and applies common properties like drop-guides
				</div>
				<div class="card-body">
					<div class="row">
						<div v-for="$index in 16" class="col-md-3">
							<div
								class="alert alert-secondary d-flex align-items-center justify-content-center b-1"
								style="width: 100%; height: 150px"
								v-droppable="{
									tag: 'debug-user',
									handler: droppedOutput,
									dropFiles: true,
								}"
							>
								Drop area {{$index}}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
