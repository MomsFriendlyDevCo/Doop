<macgyver name="mgTemplate">
/**
* Form Template Selection component
*/

module.exports = {
	meta: {
		title: 'Form Template',
		icon: 'fa fa-chevron-square-down',
		category: 'Choice Selectors',
		preferId: true,
		shorthand: ['choice', 'choose', 'dropdown', 'pick'],
	},
	props: {
		required: {type: 'mgToggle', default: false},
	},
	data() { return {
		enum: [],
		data: {},
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.loading = true)
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/templates?sort=title`))
				.then(res => this.$data.enum = res.data.map(i => ({
					id: i._id,
					title: i.meta.title,
				})))
				.then(()=> this.loading = false)
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop());
		},
		changeHandler(e) {
			return Promise.resolve()
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
		}
	},
	created() {
		this.$debugging = true;

		return this.refresh();
	},
};
</macgyver>

<template name="mgTemplate">
	<div class="mg-template">

		<mg-choice-dropdown
			:enum="$data.enum"
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
