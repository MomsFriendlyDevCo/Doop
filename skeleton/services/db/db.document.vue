<script lang="js" frontend>
/**
* Edit a specific database document
*/
app.component({
	route: '/debug/db/:collection/:id',
	data() { return {
		doc: undefined,
	}},
	methods: {
		/**
		* Refresh document data
		* @returns {Promise} A promise which will resolve when the data has loaded
		*/
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/db/${this.$route.params.collection}/${this.$route.params.id}`))
				.then(({data}) => this.doc = data)
				.then(()=> this.$sitemap.setBreadcrumbs([
					{title: 'Admin', href: '/admin'},
					{title: 'DB', href: '/admin/db'},
					{title: this.$route.params.collection, href: `/admin/db/${this.$route.params.collection}`},
					{title: `#${this.doc._id}`, href: `/admin/db/${this.$route.params.collection}/${this.doc._id}`},
				]))
				.finally(()=> this.$loader.stop())
				.catch(this.$toast.catch)
		},


		/**
		* Save the document (actually patch it rather than clobber)
		* @returns {Promise} A promise which will resolve when the data has saved
		* @param {Object} [options] Additional options to use when saving
		* @param {boolean|string} [options.notification=false] Show a notification confirming the save, can also be 'auto' for an auto-save like notification
		* @param {boolean|string} [options.redirect=false] Redirect to order root / elsewhere post save
		* @param {boolean} [options.lockUI=true] Remove the FAB buttons while saving
		* @param {boolean} [options.refresh=true] Accept the post server state of the order - refreshing data
		* @returns {Promise} A promise which will resolve when the order has saved (or has been bypassed if lazy + no changes)
		*/
		save(options) {
			var settings = {
				notification: false,
				redirect: false,
				lockUI: true,
				refresh: true,
				...options,
			};

			return Promise.resolve()
				.then(()=> settings.lockUI && this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/db/${this.$route.params.collection}/${this.$route.params.id}`, this.doc))
				.then(({data}) => {
					if (settings.refresh) this.doc = data;
				})
				.then(status =>
					_.isString(settings.notification) ? this.$toast.success(settings.notification)
					: settings.notification === true ? this.$toast.success('Document saved')
					: null
				)
				.then(()=> settings.redirect && this.$router.push(_.isString(settings.redirect) ? settings.redirect : `/debug/db/${this.$route.params.collection}`))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	created() {
		this.refresh();
	},
});
</script>

<template>
	<div v-if="doc">
		<!-- FAB buttons {{{ -->
		<div class="btn-group-float">
			<a @click="save({redirect: true})" class="btn btn-icon btn-sm btn-circle btn-success far fa-arrow-left" v-tooltip="'Save and return to list'"/>
			<a @click="save" class="btn btn-icon btn-lg btn-circle btn-success far fa-check" v-tooltip="'Save'"/>
			<a @click="refresh" class="btn btn-xs btn-icon btn-circle btn-danger far fa-redo" v-tooltip="'Revert to last saved version'"/>
		</div>
		<!-- }}} -->
		<div class="card">
			<div class="card-header">
				<h2>{{$route.params.id}}</h2>
			</div>
			<div class="card-body">
				<v-json v-model="doc"/>
			</div>
		</div>
	</div>
</template>
