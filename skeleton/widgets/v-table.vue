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
* @param {string|Object} url Doop / Monoxide ReST endpoint to connect to, if this is a plain object its assumed to be an Axios compatible request (including a 'url' key) to merge with computed properties such as filters, sorting, pagination
* @param {string} [view="table"] How to display the table. ENUM: "table", "directory"
* @param {function} [cellHref] Function called as `(row)` which can optionally return a link to wrap each cell as a link. Uses `v-href` internally so any of its values are supported
* @param {string} [text-empty="No items found"] Message to display when no items are found after loading FIXME: Not yet implemented
* @param {string} [text-loading="Loading..."] Message to display when loading
* @param {boolean} [loadForeground=true] Use the foreground (covering) loader when loading the first time. Disable this if the table should show inline with a loading message (specified by text-loading)
* @param {object|function} [directoryMap] Mapping of row keys to directory keys `{title, subTitle, icon}` if a function this is run as `(row)`
* @param {boolean} [useSearchQuery=true] If searching is enabled, accept the initial search query from $route.query.q
*
* @param {Object} columns Column definitions
* @param {Object} [columns.INDEX.macgyver] MacGyver rendering method to override the slot definition
* @param {function} [columns.INDEX.macgyver.onChange] Function to execute when the column value changes. Called as `(props, newVal)`, get the full row data as normal with `props.row`
*
* @param {Object} config Overall table definition
* @param {string} [config.sortBy] Override sort detection to use the named field instead of auto-detecting based on the first sortable field
*
*
* @slot [columnId] The per-cell rendering of a specific row. Row data available as `props.row`
* @slot [column_columnId] Column header rendering of a specific column definition
*
* @example Set up column definitions within a controller
* data() { return {
*	columns: [
*		{type: 'status', name: 'status'},
*		{type: 'text', label: 'Title', name: 'title', sort: true},
*		{type: 'date',label: 'Created', name: 'created,},
*		{type: 'date', label: 'Last edited', name: 'edited'},
*		{type: 'verbs', name: 'verbs'},
* 	],
* }}
*
* @example Show an interactive list of widgets within a template
* <v-table
* 	url="/api/widgets"
* 	:columns="columns"
* 	:cell-href="row => `/widgets/${row._id}`"
* 	:search="true"
* 	text-empty="No widgets found"
* 	text-loading="Loading widgets..."
* >
* 	<template #status="props">
* 		<i v-if="props.row.status == 'active'" class="fas fa-circle text-success" v-tooltip="'Widget is active'"/>
* 		<i v-else-if="props.row.status == 'deleted'" class="fas fa-circle text-warning" v-tooltip="'Widget has been deleted'"/>
* 		<i v-else class="fas fa-question-circle text-warning" v-tooltip="'Widget status is unknown'"/>
* 	</template>
* 	<template #title="props">
* 		{{props.row.title}}
* 	</template>
* 	<template #created="props">
* 		<date :date="props.row.created"/>
* 	</template>
* 	<template #edited="props">
* 		<date :date="props.row.edited"/>
* 	</template>
* </v-table>
*/
module.exports = {
	data() { return {
		rows: [],
		rowCount: 0,
		state: 'pending', // ENUM: 'pending', 'loading', 'ready'
		lastQuery: undefined,
	}},
	props: {
		url: {type: [String, Object], required: true},
		view: {type: String, default: 'table'},
		cellHref: {type: Function},
		columns: {type: Array, required: true}, // Defaults + type mangling applied in computedColumns
		config: {type: Object, default: ()=> ({})}, // Defaults applied in computedConfig()
		search: {type: Boolean, default: false},
		directoryMap: {type: [Object,Function]},
		useSearchQuery: {type: Boolean, default: true},
		textLoading: {type: String, default: 'Loading...'},
		loadForeground: {type: Boolean, default: true},
	},
	computed: {
		computedConfig() { // Apply Doop / Monoxide defaults to base config structure
			return {
				card_mode: true,
				show_refresh_button: false,
				show_reset_button: false,
				server_mode: true,
				per_page: 30,
				per_page_options: [5, 10, 30, 100, 500, 1000],
				highlight_row_hover_color: 'var(--gray-light)',
				global_search: {
					...this.$props.config.global_search,
					visibility: this.$props.search,
					placeholder: 'Search...',
					searchOnPressEnter: true,
					...(this.$props.useSearchQuery && this.$route.query.q // Populate initial search query if useSearchQuery is enabled
						? {init: {value:  this.$route.query.q}}
						: null
					),
				},
				...this.$props.config,
			};
		},
		computedColumns() { // Rewrite base columns config so we can avoid being explicit in most cases
			var sortedBy = this.computedConfig?.sortBy; // Final result of the column we sorted by

			return this.$props.columns.map((v, i) => {
				// Process `{sort: true}` into setting the initial sort order for the first sortable item (unless 'sortBy' is set in config)
				if (
					(!sortedBy && v.sort) // First discovered sortable column in auto-detect mode
					|| (v.name == sortedBy) // Nominated column to sort by
				) {
					sortedBy = v.name; // Prevent applying sort again
					v.initial_sort = true;
				}

				// Apply type shortcuts
				switch (v.type) {
					case 'status':
						v.column_classes = v.row_classes = 'col-status';
						v.column_text_alignment = v.row_text_alignment = 'text-left';
						break;
					case 'date':
						v.column_classes = 'col-date';
						v.column_text_alignment = v.row_text_alignment = 'text-center';
						break;
					case 'text':
						v.column_classes = v.row_classes = 'col-text';
						v.column_text_alignment = v.row_text_alignment = 'text-left';
						break;
					case 'lookup':
						v.column_classes = v.row_classes = 'col-text';
						v.column_text_alignment = v.row_text_alignment = 'text-center';
						break;
					case 'number':
						v.column_classes = v.row_classes = 'col-number';
						v.column_text_alignment = v.row_text_alignment = 'text-right';
						break;
					case 'thumbnail':
						v.column_classes = v.row_classes = 'col-thumbnail';
						v.column_text_alignment = v.row_text_alignment = 'text-center';
						break;
					case 'verbs':
						v.column_classes = v.row_classes = 'col-verbs';
						v.column_text_alignment = v.row_text_alignment = 'text-right';
						break;
					default: if (v.type) throw new Error(`Unknown column type "${v.type}"`);
				}

				return v;
			});
		},
	},
	methods: {
		refresh(query) {
			if (this.state == 'loading') return; // Already refreshing
			if (!this.$props.url) return; // No URL available yet, URL is probably dynamic - do nothing
			if (_.isPlainObject(this.$props.url) && !this.$props.url.url) throw new Error('No "url" key provided in v-table object');

			// Check that vue-bootstrap4-table didn't get caught in a refresh loop by comparing against the last query
			if (this.lastQuery && query && _.isEqual(query, this.lastQuery)) return;
			this.lastQuery = query;

			return Promise.resolve()
				.then(()=> this.state = 'loading')
				.then(()=> this.$loader.start(`v-table-${this._uid}`, this.$props.loadForeground && !this.rows.length))
				.then(()=> _.merge( // Calculate Axios request object
					{ // Calculate fields from v-table session - filters, search, sorting, pagination
						method: 'GET',
						params: { // Compute AxiosRequest
							...(query?.filters),
							...(query?.global_search ? {q: query.global_search} : null), // Add search functionality
							...(query?.sort && query.sort.length ? {sort: query?.sort.map(i => _.isString(i) ? i : `${i.order == 'asc' ? '' : '-'}${i.name}`).join(',')} : null),
							limit: query?.per_page || this.config?.per_page || 30,
							skip: ((query?.page || 1) - 1) * (query?.per_page || this.config?.per_page || 30),
						}
					},
					_.isString(this.$props.url) ? {url: this.$props.url} : this.$props.url, // Merge either single URL string OR entire url object
				))
				.then(req => { this.$debug('AxiosRequest', req); return req })
				.then(req => {
					// Calculate endpoint URLs {{{
					var endpointQuery = new URL(req.url, window.location.href);

					var endpointCount = new URL(req.url, window.location.href);
					endpointCount.pathname += '/count';
					// }}}

					return Promise.all([
						// Fetch matching rows
						this.$http({...req, url: endpointQuery.toString()})
							.then(res => this.rows = res.data),

						// Count potencial rows (i.e. the count based on query)
						this.$http({
							...req,
							url: endpointCount.toString(),
							params: _.omit(req.params, ['sort', 'limit', 'skip', 'select', 'populate']), // Omit meta fields from count or they are included as filters
						})
							.then(res => this.rowCount = res.data.count),
					]);
				})
				.then(()=> this.$debug('Row data', {rows: this.rows, rowCount: this.rowCount}))
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop(`v-table-${this._uid}`))
				.finally(()=> this.state = 'ready')
		},
	},
	render(h) {
		if (this.$props.view == 'table') {
			console.log('STATE', this.state);
			if (['pending', 'loading'].includes(this.state)) {
				return h('div', {class: 'card'}, [
					h('div', {class: 'card-body p-4'}, [
						h('div', {
							class: 'text-center h3',
						}, [
							h('i', {class: 'far fa-spinner fa-spin mr-2'}),
							h('span', this.$props.textLoading),
						])
					])
				]);
			} else if (this.state == 'ready') {
				return h('vue-bootstrap4-table', {
					ref: 'table',
					class: 'v-table',
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
							// Don't screw with column / pagination slot definitions
							if (slot == 'pagination-info' || slot.startsWith('column_')) return func;

							// Wrap with cellHref property?
							if (this.$props.cellHref) return props => h('a', {
								directives: [{
									name: 'href',
									value: this.$props.cellHref(props.row),
								}],
							}, func(props));

							// Fell though all other render methods - let Vue handle the raw slot render
							return func;
						})
						.thru(cols => {
							this.$props.columns
								.filter(col => col.macgyver)
								.forEach(col => {
									cols[col.name] = props => {
										return h('mgForm', {
											props: {
												config: col.macgyver,
												data: {
													[col.name]: props.row[col.name],
												},
											},
											on: {
												changeItem: col.macgyver.onChange ?
													e => col.macgyver.onChange(props, e.value)
													: undefined,
											},
										});
									};
								});

							return cols;
						})
						.set('sort-asc-icon', ()=> h('i', {class: 'fas fa-sort-down ml-1'}))
						.set('sort-desc-icon', ()=> h('i', {class: 'fas fa-sort-up ml-1'}))
						.set('no-sort-icon', ()=> h('i', {class: 'fal fa-sort ml-1'}))
						.value(),
				});
			} else {
				throw new Error(`Unknown v-table state "${this.state}"`);
			}
		} else if (this.$props.view == 'directory') {
			if (this.state == 'pending') this.refresh(); // Kick off first load if we havn't already done so

			return h('directory', {
				props: {
					root: {
						children:
							_.isPlainObject(this.$props.directoryMap) ? this.rows.map(row =>
								_.mapValues(this.$props.directoryMap, (v, k) => row[v])
							)
							: _.isFunction(this.$props.directoryMap) ? this.rows.map(this.$props.directoryMap)
							: this.$props.cellHref ? this.rows.map(row => ({...row, href: this.$props.cellHref(row)}))
							: this.rows,
					},
				},
			});
		} else {
			throw new Error(`Unsupported view "${this.$props.view}"`);
		}
	},
	watch: {
		'$props.url'() { // React to URL changes by refreshing
			this.refresh();
		},
		'$route.query.q'() { // Watch router query and update if change detected
			if (!this.$props.useSearchQuery) return; // Ignoring search query anyway
			$(this.$el).find('.row.no-gutters input.form-control').val(this.$route.query.q); // There is no sane way to override the form search box contents
			this.$refs.table.updateGlobalSearchHandler(this.$route.query.q); // Tell the table to refresh
		},
	},
	created() {
		this.$debugging = false;

		// Start initial load loop
		this.refresh({ // Try to guess the first query so we don't make a duplicate when v-table wakes up and makes the same exact refresh request
			sort: this.$props.columns.find(c => c.sort == true).name || 'title',
			limit: this.$props.config?.per_page || 30,
			skip: 0,
		});
	},
};
</component>

<style>
.v-table .card-header {
	display: none;
}

.v-table table th {
	border-top: none;
}

.v-table .col-number {
	width: 100px;
}

.v-table .col-thumbnail {
	width: 50px;
}

.v-table .col-thumbnail img {
	max-width: 50px;
	max-height: 50px;
}
</style>
