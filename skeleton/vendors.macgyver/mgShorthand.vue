<macgyver name="mgShorthand">
/**
* Query component
* Support for [string, array, object] query definitions.
* String are treated as a single item.
* Arrays are treated as an OR query.
* Objects are a full SIFT query.
*/
module.exports = {
	meta: {
		title: 'Mixed Query',
		icon: 'fa fa-filter',
		category: 'Data display',
		preferId: true,
	},
	props: {
		required: {type: 'mgToggle', default: false},
		default: {type: 'mgText', title: 'Default'},
	},
	data() { return {
		formData: {},
		spec: [
			{
				type: 'mgChoiceDropdown',
				id: 'type',
				title: 'Type',
				required: true,
				enum: [
					{ id: 'string', title: 'String' },
					{ id: 'array', title: 'Array' },
					{ id: 'object', title: 'Query' },
				]
			},
			{
				type: 'mgText',
				id: 'query_string',
				title: 'Query',
				showIf: e => e.type === 'string'
			},
			{
				type: 'mgCode',
				id: 'query_array',
				title: 'Query',
				height: '100px',
				syntax: 'json',
				convert: false,
				showIf: e => e.type === 'array'
			},
			{
				//type: 'mgQuery',
				type: 'mgCode',
				id: 'query_object',
				title: 'Query',
				height: '100px',
				syntax: 'json',
				convert: false,
				showIf: e => e.type === 'object'
			}
		],
	}},
	created() {
		this.$debugging = true;

		var type = 'string';
		try {
			var expression = JSON.parse(this.data);
			if (_.isArray(expression)) {
				type = 'array';
			} else {
				type = typeof this.data;
			}
		} catch (e) {
			this.$debug('Suppress', e, expression);
		}

		this.formData = {
			type: type,
			query_array: new Array(),
			query_object: new Object(),
			query_string: new String(),
		};
		if (!_.isEmpty(this.data)) this.$setPath(this.formData, 'query_' + type, this.data);
	},
	methods: {
		changeItemHandler(e) {
			this.$debug('changeItem', e.path, e.value);

			this.$setPath(this.$data.formData, e.path, e.value);

			if (e.path.indexOf('query') === 0) this.data = e.value;
		},
	},
};
</macgyver>

<template name="mgShorthand">
	<div class="mg-sift">

		<mg-form
			:config="spec"
			:data="formData"
			@changeItem="changeItemHandler"
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
