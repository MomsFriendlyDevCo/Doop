<component>
/**
* Customized version of the <vue-bootstrap4-table/> component which works in a specifically Doop compatible way
*
* Differences from vue-bootstrap4-table:
*
* - Sensible base config
* - `url` prop automatically links against a Monoxide backend, pulls data and adds pagination
* - `cellHref` adds automatic `v-href` directive around all cell contents (based on its usual logic of skipping if an <a/> tag is present)
* - `columns` array definition now includes meta 'type' field which sets various behaviours in bulk. e.g. `{type: 'text'}` sets correct CSS classes and text alignment
* - Search is included (assumes you have a backend 'text' index)
*
*
* All properties and slots of this component are identical to the vue-bootstrap4-table component with the exception of the below which adds Doop specific behaviour
*
* @url https://rubanraj54.gitbook.io/vue-bootstrap4-table/usage
* @param {string} url Doop / Monoxide ReST endpoint to connect to
* @param {Object} columns Column definitions
* @param {Object} config Overall table definition
*
* @slot [columnId] The per-cell rendering of a specific row. Row data available as `props.row`
* @slot [column_columnId] COlumn header rendering of a specific column definition
*/
module.exports = {
	data() { return {
		rows: [],
		rowCount: 0,
	}},
	props: {
		url: {type: String, required: true},
		cellHref: {type: Function},
		columns: {type: Array, required: true}, // Defaults + type mangling applied in computedColumns
		config: {type: Object, default: ()=> ({})}, // Defaults applied in computedConfig()
		search: {type: Boolean, default: false},
	},
	computed: {
		computedConfig() { // Apply Doop / Monoxide defaults to base config structure
			return {
				card_mode: true,
				show_refresh_button: false,
				show_reset_button: false,
				server_mode: true,
				per_page: 30,
				global_search: {
					...this.$props.config.global_search,
					visibility: this.$props.search,
					placeholder: 'Search...',
					searchOnPressEnter: true,
				},
				...this.$props.config,
			};
		},
		computedColumns() { // Rewrite base columns config so we can avoid being explicit in most cases
			return this.$props.columns.map(v => {
				switch (v.type) {
					case 'status':
						v.column_classes = v.row_classes = 'col-status';
						break;
					case 'date':
						v.column_classes = 'col-date';
						break;
					case 'text':
						v.column_classes = v.row_classes = 'col-text';
						v.row_text_alignment = 'text-left';
						break;
					case 'number':
						v.column_classes = v.row_classes = 'col-number';
						v.row_text_alignment = 'text-right';
						break;
					case 'verbs':
						v.column_classes = v.row_classes = 'col-verbs';
						break;
					default: if (v.type) throw new Error(`Unknown column type "${v.type}"`);
				}
				return v;
			});
		},
	},
	methods: {
		refresh(query) {
			if (!this.$props.url) return; // No URL available yet, URL is probably dynamic - do nothing

			return Promise.resolve()
				.then(()=> this.$loader.startBackground(!this.rows))
				.then(()=> ({params: { // Compute AxiosRequest
					...(query?.filters),
					...(query?.global_search ? {q: query.global_search} : null), // Add search functionality
					...(query?.sort && query.sort.length ? {sort: query?.sort.join(',')} : null),
					limit: query?.per_page || this.config?.per_page || 30,
					skip: ((query?.page || 1) - 1) * (query?.per_page || this.config?.per_page || 30),
				}}))
				.then(req => { this.$debug('AxiosRequest', req); return req })
				.then(req => {
					// Calculate endpoint URLs {{{
					var endpointQuery = new URL(this.$props.url, window.location.href);

					var endpointCount = new URL(this.$props.url, window.location.href);
					endpointCount.pathname += '/count';
					// }}}

					Promise.all([
						// Fetch matching rows
						this.$http.get(endpointQuery.toString(), req)
							.then(res => this.rows = res.data),

						// Count potencial rows (i.e. the count based on query)
						this.$http.get(endpointCount.toString(), {
							...req,
							params: _.omit(req.params, ['sort', 'limit', 'skip', 'select', 'populate']), // Omit meta fields from count or they are included as filters
						})
							.then(res => this.rowCount = res.data.count),
					]);
				})
				.then(()=> this.$debug('Row data', {rows: this.rows, rowCount: this.rowCount}))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
	render(h) {
		return h('vue-bootstrap4-table', {
			props: {
				rows: this.rows,
				totalRows: this.rowCount,
				columns: this.computedColumns,
				config: this.computedConfig,
			},
			on: {
				'on-change-query': this.refresh,
			},
			scopedSlots: _(this.$scopedSlots)
				.mapValues((func, slot) => {
					if (slot == 'pagination-info' || slot.startsWith('column_')) return slot; // Don't screw with column / pagination slot definitions
					return props => h('a', {
						directives: [{
							name: 'href',
							value: this.$props.cellHref(props.row),
						}],
					}, func(props));
				})
				.value(),
		});
	},
	created() {
		this.$debugging = true;
	},
};
</component>
