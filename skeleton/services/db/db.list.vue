<script lang="js" frontend>
/**
* Display a collection layout based on its schema data
* @param {number} [columnLimit=10] Max number of columns to consider when trying to determine what columns to display
* @param {array<string>} [columnTypes] What column types to consider when computing visible columns (_id is always included)
* @param {string} [entityName] How to refer to the collection as a plural
* @param {string} [sort] Default field to sort by, if omitted the best-guess is used
* @param {array<regexp>} [sortHigh] High priority column name matchers to move to the front of the column list
*/
app.component({
	route: '/debug/db/:collection',
	data() { return {
		meta: undefined,
	}},
	props: {
		columnLimit: {type: Number, default: 10},
		columnTypes: {type: Array, default: ()=> ['string', 'number', 'date', 'boolean']},
		entityName: {type: String},
		sort: {type: String},
		sortHigh: {type: Array, default: ()=> [/^_id$/, /^ref$/i, /^title/i, /^name/i, /^created$/i, /^edited/i]},
	},
	computed: {
		/**
		* Compute v-table columns from meta schema
		* @returns {array<Object>} v-table Compatible column structure
		*/
		columns() {
			if (!this.meta) return []; // Not ready yet
			return _(this.meta)
				.pickBy((item, k) => k == '_id' || this.columnTypes.includes(item.type))
				.map((v, k) => ({
					id: k,
					title: _.startCase(k),
					type:
						v.type == 'objectid' ? 'string'
						: ['string', 'number', 'date'].includes(v.type) ? v.type // Passthru types
						: 'string' // Fallback to strings
				}))
				.sortBy(item => this.sortHigh.some(re => re.test(item.id)) ? `!!!!${item.id}` : item.id)
				.slice(0, this.columnLimit)
				.value()
		},


		/**
		* Compute which field to sort by
		* See the function logic to see how this uses the "best guess" system"
		* @returns {string} Default field to sort by
		*/
		sortField() {
			return [ // Queue up functions to try, the first one to return truthy wins
				// Use $props.sort if its specified
				()=> this.sort,

				// Use first indexed string
				()=> this.columns.find(c => c.type == 'string' && c.index),

				// Use first indexed field
				()=> this.columns.find(c => c.index),

				// Fall back to "_id"
				()=> '_id',
			]
				.map(f => f())
				.find(f => f);
		},
	},
	methods: {
		/**
		* Refresh meta data to display the collection information
		* @returns {Promise} A promise which will resolve when the data has loaded
		*/
		refresh() {
			return Promise.resolve()
				.then(()=> this.$loader.start())
				.then(()=> this.$http.get(`/api/db/${this.$route.params.collection}/meta`))
				.then(({data}) => this.meta = data)
				.then(()=> this.$sitemap.setBreadcrumbs([
					{title: 'Admin', href: '/admin'},
					{title: 'DB', href: '/admin/db'},
					{title: this.$route.params.collection, href: `/admin/db/${this.$route.params.collection}`},
				]))
				.finally(()=> this.$loader.stop())
				.catch(this.$toast.catch)
		},


		/**
		* Try to guess the entity name from the collection name
		* @returns {string}
		*/
		entity() {
			if (this.entityName) { // Specified in props
				return this.entityName;
			} else if (/s$/.test(this.$route.params.collection)) { // Looks like a plural anyway
				return this.$route.params.collection;
			} else { // Just slam 's' on the end
				return `${this.$route.params.collection}s`;
			}
		},
	},
	created() {
		this.refresh();
	},
});
</script>

<template>
	<div v-if="meta" class="card">
		<div class="card-header">
			<h2>{{$route.params.collection}}</h2>
		</div>
		<div class="card-body">
			<v-table
				:url="`/api/db/${$route.params.collection}`"
				:columns="columns"
				:sort="sortField"
				:cell-href="row => `/debug/db/${$route.params.collection}/${row._id}`"
				entity="entity"
			/>
			<pre>COLS: {{columns}}</pre>
		</div>
	</div>
</template>
