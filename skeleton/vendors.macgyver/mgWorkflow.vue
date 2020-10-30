<macgyver name="mgWorkflow">
/**
* Workflow component
* Allows changing of an ENUM field based on a predefined set of rules.
*/

module.exports = {
	meta: {
		title: 'Workflow',
		icon: 'fa fa-chevron-square-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	props: {
		required: {type: 'mgToggle', default: false},
		default: {type: 'mgText', title: 'Default'},
		enum: {
			type: 'mgTable',
			title: 'List items',
			default: () => [],
			items: [
				{id: 'id', type: 'mgText', required: true},
				{id: 'title', type: 'mgText', required: true},
				{id: 'icon', type: 'mgIcon'},
				{
					id: 'spec',
					type: 'mgCode',
					height: '150px',
					convert: true,
					syntax: 'json',
				},
			],
		},
		rules: {
			type: 'mgTable',
			title: 'Rules',
			default: () => '',
			items: [
				{id: 'query', type: 'mgShorthand', required: true},
				{id: 'allow', type: 'mgText', required: true},
			],
		},
	},
	data() { return {
		spec: [
			{
				type: 'mgChoiceDropdown',
				id: 'value',
				title: 'Selection',
				required: true,
				enum: [],
			},
			// TODO: Hide when not defined
			{
				type: 'mgTable',
				id: 'forms',
				title: 'Forms',
				allowAdd: false,
				allowDelete: false,
				rowNumbers: false,
				items: [
					{id: 'value', type: 'mgText', required: true},
					// FIXME: What type should this be? mgForm isn't an mgComponent...
					{id: 'form', type: 'mgCode', required: true},
					{id: 'user', type: 'mgText', required: true},
					{id: 'created', type: 'mgDatetime', required: true},
				],
			},
			
		],
	}},
	created() {
		this.$debugging = true;

		// Initialise object from injected prototype default
		if (!_.isObject(this.data)) {
			this.data = {
				value: this.data || '',
				forms: [],
			};
			this.$mgForm.$emit('changeItem', {path: this.$props.$dataPath, value: this.data});
		}

		this.$watchAll(['$props.enum', '$mgForm.data'], ()=> {
			this.$debug('watch', this.$props.enum, this.$dataPath, _.clone(this.$mgForm.data), _.clone(this.$data));

			// TODO: Always allow self hardcoded or configured that way?
			var rule = this.$props.rules && this.$props.rules.find(rule => {
				var expression = rule.query;
				try {
					expression = JSON.parse(expression);
				} catch (e) {
					this.$debug('Suppress', e, expression);
				}
				this.$debug('shorthand', _.clone(expression));

				// Convert string to single clause
				if (_.isString(expression)) expression = {[this.$dataPath]: {value: expression}};
				// Convert array to multiple clauses
				if (_.isArray(expression)) expression = { $or: expression.map(value => ({[this.$dataPath]: {value: value}})) };
				this.$debug('expression', _.clone(expression));

				return (sift(expression, [this.$mgForm.data]).length > 0);
			});
			this.$debug('rule', rule);
			if (!rule) return this.$setPath(this.$data, 'spec.0.enum', this.$props.enum);

			var options = this.$props.enum.filter(item => {
				this.$debug('item', item, this.data);
				if (_.isString(rule.allow)) return (rule.allow === item.id);
				if (_.isArray(rule.allow)) return (rule.allow.indexOf(item.id) !== -1);
				if (_.isObject(rule.allow) && rule.allow.id) return (rule.allow.id === item.id);
				return (item.id === this.data.value);
			});
			this.$setPath(this.$data, 'spec.0.enum', options);
		}, {deep: true, immediate: true});
	},
	methods: {
		refreshSelected() {
			this.$debug('refreshSelected', this.data);
			/*
			this.$nextTick(()=> {
				this.$debug('refreshSelected', JSON.stringify(this.$children[0].value), this.$children[0].value.id, this.data);
				if (this.$children && this.$children[0])
					this.$children[0].value = this.$props.enum.find(e => e.id === this.data) || this.data;
			});
			*/
		},
		changeItemHandler(e) {
			this.$debug('changeItem', e);

			switch (e.path) {
				case 'value':
					var option = this.$props.enum.find(o => o.id === e.value);
					this.$debug('option', option);

					// TODO: Multiple options with Promise.all
					if (option && option.spec) {
						Vue.services().$prompt.macgyver({
							// TODO: Grab fields `title` from the spec
							// FIXME: Should a component know it's `id` and `title`?
							body: 'Update ' + this.$dataPath + ' to ' + e.value + '?',
							macgyver: option.spec,
						})
						.then(res => {
							this.data.forms.push({
								value: e.value,
								form: res,
								user: this.$session.data._id,
								created: new Date(),
							});
						})
						//.catch(() => this.refreshSelected()); // Revert
					} else {
						this.$debug('$setPath else', this.data, e.path, e.value);
						this.$setPath(this.data, e.path, e.value, {debug: this.$debugging});
					}
					break;
				default:
					this.$debug('$setPath default', this.data, e.path, e.value);
					this.$setPath(this.data, e.path, e.value, {debug: this.$debugging});
			}

		},
	},
};
</macgyver>

<template name="mgWorkflow">
	<div class="mg-workflow">

		<mg-form
			:config="spec"
			:data="data"
			@changeItem="changeItemHandler"
		/>

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
