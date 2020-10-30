<macgyver name="mgLookup">
/**
* Collection lookup component
*/
module.exports = {
	meta: {
		title: 'Lookup',
		icon: 'fa fa-chevron-square-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	props: {
		enumUrl: {type: 'mgUrl', vueType: ['string', 'object'], help: 'Data feed URL to fetch choice values from'},
		optionKeyPath: {
			type: "mgText",
			default: "_id",
			help: "Path within data feed for options key"
		},
		optionLabelPath: {
			type: "mgText",
			default: "meta.title",
			help: "Path within data feed for options label"
		},
		placeholder: {type: 'mgText', help: 'Ghost text to display when there is no value'},
		required: {type: 'mgToggle', default: false, help: 'One choice must be selected'},
		focus: {type: 'mgToggle', default: false, help: 'Auto-focus the element when it appears on screen'},
	},
	data() { return {
		data: {},
	}},
	methods: {
		changeHandler(e) {
			this.$debug('changeHandler', e);
			this.data = e;
			return Promise.resolve()
			// TODO: Ability to retrieve the full document, we already have it in the dropdown data, but here we only have the id.
			/*
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/templates/${e}`))
				.then(res => {
					// TODO: Ensure this is targetting `meta.title`
					// FIXME: Defaults have issues more broadly?
					//this.$setPath(res.data, 'body.items.0.default', () => 'foo');
					//this.$setPath(res.data, 'body.items.0.default', 'foo');
					//res.data.meta.title
					this.$data.data = res.data.form;
				})
				.then(()=> this.loading = false)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
			*/
		},

	},
	created() {
		this.$debugging = true;

		//return this.refresh();
	},
};
</macgyver>

<template name="mgLookup">
	<div class="mg-lookup">

		<mg-choice-autocomplete
			enumSource="url"
			:enumUrl="$props.enumUrl"
			:placeholder="$props.placeholder"
			:required="$props.required"
			:focus="$props.focus"
			:option-key-path="$props.optionKeyPath"
			:option-label-path="$props.optionLabelPath"
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
