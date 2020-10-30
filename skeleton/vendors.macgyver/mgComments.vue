<macgyver name="mgComments">
/**
* Comments component
* // TODO: UI for adding comments.
*/
module.exports = {
	meta: {
		title: 'Comments',
		icon: 'fa fa-chevron-square-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	props: {
		required: {type: 'mgToggle', default: false},
	},
	data() { return {
		items: [
			{id: 'value', type: 'mgText', required: true},
			{id: 'comment', type: 'mgText', required: true},
			{id: 'user', type: 'mgText', required: true},
			{id: 'created', type: 'mgDatetime', required: true},
		],
	}},
	methods: {
		changeHandler(e) {
			this.$debug('changeHandler', e);
		}
	},
	created() {
		this.$debugging = true;
	},
};
</macgyver>

<template name="mgComments">
	<div class="mg-comments">

		<mg-table
			v-model="data"
			:items="items"
			:allowAdd="false"
			:allowDelete="false"
			:rowNumbers="false"
			@change="changeHandler"
		/>

		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{data}}</pre>
			</div>
		</div>

	</div>
</template>
