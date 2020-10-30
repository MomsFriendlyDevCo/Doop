<macgyver name="mgPermissionsList">
/**
* Permissions List component
*/
module.exports = {
	meta: {
		title: 'Permissions List',
		icon: 'fa fa-chevron-square-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	props: {
		required: {type: 'mgToggle', default: false},
		enum: {
			type: 'mgTable',
			title: 'List items',
			default: () => [],
			items: [
				{id: 'id', type: 'mgText', required: true},
				{id: 'title', type: 'mgText', required: true},
			],
		},
	},
	methods: {
		changeHandler(path, e) {
			this.$debug('changeHandler', path, e.value);
			this.$setPath(this.data, path, e.value);
		}
	},
	created() {
		this.$debugging = true;
	},
};
</macgyver>

<template name="mgPermissionsList">
	<div class="mg-permissions-list">

		<div v-for="item in $props.enum" :key="item.id" class="form-group row m-b-0">
			<div class="col-11 col-form-label">
				<toggle-button
					:value="$data.data[item.id]"
					@change="changeHandler(item.id, $event)"
				/>
				{{item.title}}
			</div>
		</div>

		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>

	</div>
</template>
