<script lang="js" frontend>
/**
* Customizable table component with auto data retrieval, pagnination and searching
*
* @param {string|Object} url Doop / Monoxide ReST endpoint to connect to, if this is a plain object its assumed to be an Axios compatible request (including a 'url' key) to merge with computed properties such as filters, sorting, pagination
* @param {string} [sort] Field to sort by, if omitted the rowKey is used instead
* @param {boolean} [sortAsc=true] When sorting, sort ascending (A-Z)
* @param {number} [limit=30] How many records to show per page
* @param {array} [limit_enum=[15, 30, 45, 60, 100]] Options for number of records per page
* @param {string} [limit_desc="Page"] Placeholder for goto page input
*
* @param {boolean|function} [showPagination=true] Show the pagination buttons in footer
* @param {boolean|function} [showPaginationDropdown=false] Show the limit options dropdown
* @param {boolean|function} [showPaginationGoto=false] Show number input for going directly to a page
*
* @param {boolean} [autoScroll=true] Scroll to the top of the table on refresh
* @param {string|number} [autoScrollOffset=0] Autoscroll Y offset if it needs manually tweaking, strings are automaticaly converted to numbers
* @param {boolean} [autoResetPagination=true] Detect URL changes and reset pagination when it occurs (usually the upstream component clobbering the `url` property during a search)
*
* @param {boolean|function} [cellHref=false] If a function is specified its called as `(row)` per row to determine a `v-href` compatible per-cell link
* @param {string} [rowKey="_id"] Key to use when looping over data to ensure minimal DOM re-rendering
* @param {boolean} [loadForeground=false] Use the foreground loader rather than the background one
*
* @param {string} [layout="card"] How to layout the element, ENUM: 'card' (use BS4 cards), 'none' (use no styling)
* @param {string} [entity="items"] Shorthand to quickly set various text messages (used to compose the textEmpty etc.)
* @param {string} [textEmpty="No ${entity} found"] Text to display when the table data is empty, use the slot 'state-empty' for more advanced content
* @param {string} [textLoading="Loading ${entity}..."] Text to display when the table data is loading, use the slot 'state-loading' for more advanced content
*
* @param {array<Object>} columns Column definition
* @param {string} columns.id ID of a specific column, used as the field name in dotted notation, must be unique
* @param {string} [columns.slot] The name of the Vue slot to map to the column (since Vue stuggles with dotted notation in names), defaults to camelCase
* @param {string} [column.cellClass] CSS classes to apply (overrides the column type if specified)
* @param {string} [column.title] Title of the column, if omitted the ID via _.startCase is used
* @param {string} [column.type] Optional columnType behaviour to inherit
* @param {boolean} [column.sortable=false] Whether the column can be sorted
*
* @param {Object} [columnTypes] Lookup object of column prototypes
* @param {string} [columnTypes.cellClass] CSS class to apply to the cell for the matching column type
*
* @param {string|array|Object} [tableClass="table"] CSS classes to add to the <table/> element
*
* @slot olverlay-loading Slot template to display if over the top of existing data when refreshing
* @slot state-init Slot template to display (briefly) when the table is bootstrapping
* @slot state-loading Slot template to display if table data is being loaded
* @slot state-empty Slot template to display if no data is found to display in the table
* @slot table-header Slot to template as the header area - wraps pagination and item counts
* @slot table-header-left Slot to template as the header area (far left) - wraps search controls
* @slot table-header-center Slot to template as the header area (center) - displays nothing by default
* @slot table-header-right Slot to template as the header area (far right) - displays nothing by default
* @slot table-footer Slot to template as the footer area - wraps pagination and item counts
* @slot table-footer-left Slot to template as the footer area (far left) - wraps pagination controls
* @slot table-footer-center Slot to template as the footer area (center) - displays nothing by default
* @slot table-footer-right Slot to template as the footer area (far right) - wraps item counts
* @slot COLUMN Per-column custom cell rendering, if specified each slot gets the "row" data binding
*/
app.component('vTable', {
	data() { return {
		state: 'init', // ENUM: 'loading', 'ready', 'empty', 'error'
		error: undefined, // Error from server, if any
		rows: undefined,
		rowCount: undefined,
		pages: undefined, // Number of pages based on rowCount
		reloadCount: 0, // Number of times we've reloaded, really just used to figure out if this is the first hit

		endpointFilters: {},
		endpointSort: undefined, // Inherits from $props.sort on initial refresh, changed by user after that
		endpointSortAsc: undefined, // ^^^
		endpointPage: 1,
		endpointLimit: 30,
	}},
	props: {
		url: {type: [String, Object], required: true},
		sort: {type: String},
		sortAsc: {type: Boolean, default: true},
		limit: {type: Number, default: 30},
		limit_enum: {type: Array, default: () => [15, 30, 45, 60, 100]},
		limit_desc: {type: String, default: 'Page'},

		columns: {type: Array, validator: v => v.every(i => i.id)},
		columnTypes: {type: Object, default() { /* Column types {{{ */ return {
			status: {cellClass: 'col-status text-left'},
			date: {cellClass: 'col-date text-center'},
			text: {cellClass: 'col-text text-left'},
			lookup: {cellClass: 'col-text text-center'},
			number: {cellClass: 'col-number text-right'},
			thumbnail: {cellClass: 'col-thumbnail text-center'},
			verbs: {cellClass: 'col-verbs text-right'},
		}}}, /* }}} */

		showPagination: {type: Boolean, default: true},
		showPaginationDropdown: {type: Boolean, default: false},
		showPaginationGoto: {type: Boolean, default: false},

		autoScroll: {type: Boolean, default: true},
		autoScrollOffset: {type: [Number, String], default: 0},
		autoResetPagination: {type: Boolean, default: true},

		cellHref: {type: [Boolean, Function], default: false},
		rowKey: {type: String, default: '_id'},
		loadForeground: {type: Boolean, default: false},

		layout: {type: String, default: 'card'},
		entity: {type: String, default: 'items'},
		textEmpty: {type: String, default() { return `No ${this.entity} found` }},
		textLoading: {type: String, default() { return `Loading ${this.entity}...` }},

		tableClass: {type: String, default: 'table'},
	},
	methods: {
		/**
		* Refresh the contents of the table
		* @returns {Promise} A promise which will resolve when the table has finished loading
		*/
		refresh() {
			this.$debug('refresh', this.reloadCount, this.url, this.endpointSearch);
			if (this.state == 'loading') return; // Already refreshing
			if (!this.url) return this.$debug('Skipping refresh due to falsy URL'); // No URL available yet, URL is probably dynamic - do nothing
			if (_.isPlainObject(this.url) && !this.url.url) throw new Error('No "url" key provided in v-table object');

			// Omit empty keys from url object
			if (_.isObject(this.url))
				this.$setPath(this.url, 'params', _.pickBy(this.url.params, _.identity));

			return Promise.resolve()
				.then(()=> {
					if (this.reloadCount > 0) {
						var vtBody = $(this.$el).find('.v-table-body');
						if (!vtBody.css('min-height')) // No existing min-height class
							vtBody.css('min-height', vtBody.height() + 'px'); // Force CSS height of table to lock
					}
				})
				.then(()=> this.state = 'loading')
				.then(()=> this.$loader.start(`v-table-${this._uid}`, this.loadForeground && !this.row.length))
				.then(()=> _.merge( // Calculate Axios request object
					{}, // Empty object so we don't stomp on anything
					_.isString(this.url) ? {url: this.url} : this.url, // Merge either single URL string OR entire url object
					{ // Calculate fields from v-table session - filters, search, sorting, pagination
						method: 'GET',
						params: { // Compute AxiosRequest
							...(this.endpointFilters),
							sort: (this.endpointSortAsc ? '' : '-') + this.endpointSort,
							limit: this.endpointLimit,
							skip: this.endpointLimit * (this.endpointPage - 1), // Since page numbers start at 1 we have to decrement to get the skip value
						},
					},
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
							.then(res => {
								this.rowCount = res.data.count;
								this.pages = Math.ceil(this.rowCount / this.limit);
							}),
					]);
				})
				.then(()=> this.$debug('Row data', {rows: this.rows, rowCount: this.rowCount}))
				.then(()=> this.state = this.rows.length > 0 ? 'ready' : 'empty')
				.catch(e => {
					this.$toast.catch(e);
					this.state = 'error';
					this.error = e;
				})
				.finally(()=> this.$loader.stop(`v-table-${this._uid}`))
				.finally(()=> this.reloadCount++)
		},


		/**
		* Set the sort column
		* @param {string} columnId Column to sort by
		* @param {string} [behaviour='set'] How to handle setting sort, ENUM: 'set' (just set), 'toggle' (set + toggle asc/desc order if already selected), 'asc' (set sort to asending, 'desc' (set sort to decending)
		* @returns {Promise} A promise when the data has finished refreshing
		*/
		setSort(columnId, behaviour = 'set') {
			if (!this.columns.find(c => c.id == columnId)?.sortable) return; // Abort if the column cannot be sorted

			if (behaviour == 'set') {
				this.endpointSort = columnId;
				this.endpointSortAsc = behaviour == 'desc' ? false : true;
			} else if (this.endpointSort == columnId && behaviour == 'toggle') { // Column already set and we're being asked to toggle
				this.endpointSortAsc = !this.endpointSortAsc;
			} else {
				this.endpointSort = columnId;
				this.endpointSortAsc = true;
			}
			this.$debug('setSort', columnId, behaviour, this.endpointSort, this.endpointSortAsc);

			return this.refresh();
		},


		/**
		* Navigate to a specific page + refresh
		* @param {number} page The page offset (starting at 1) to navigate to
		* @returns {Promise} A promise when the data has finished refreshing
		*/
		setPage(page) {
			this.endpointPage = page;
			return this.refresh();
		},


		/**
		* Adjust the number of items per page
		* @param {number} limit The number of items per page
		* @returns {Promise} A promise when the data has finished refreshing
		*/
		setLimit(limit) {
			this.endpointLimit = limit;
			return this.setPage(1);
		},

		/**
		* Apply any filters to output
		* @param {string} value The raw value before formatting
		* @param {function} formatter Function returning the formatted string
		* @returns {string} Final formatted string
		*/
		format(value, formatter) {
			if (typeof formatter === 'function') return formatter.call(app, value);
			return value;
		},

		/**
		* Scroll to the top of the table
		*/
		scrollIntoView() {
			$('html, body').animate({
				scrollTop: $(this.$el).position().top + +this.autoScrollOffset,
			}, {
				duration: 'slow',
				queue: false,
			});
		},
	},
	watch: {
		url() {
			if (this.autoResetPagination) {
				this.$debug('autoResetPagination');
				this.endpointPage = 1;
			}
			this.refresh();
		},
		limit: {
			immediate: true,
			handler() {
				this.endpointPage = 1;
				this.endpointLimit = this.limit;
				this.refresh();
			},
		},
	},
	created() {
		this.$debug.enable(false);
		this.$watchAll(['url', 'limit', 'columns'], this.refresh, {immediate: true, deep: true});

		// FIXME: If passed a `url` with `sort` defined this may result in 2 sort params being added.
		this.endpointSort = this.sort || this.rowKey; // Set intial sort state
		this.endpointSortAsc = this.sortAsc;
	},
});
</script>

<template>
	<div v-bind="$attrs" class="v-table" :class="layout == 'card' && 'card'">
		<!-- Header {{{ -->
		<div :class="layout == 'card' && 'card-header'">
			<slot name="table-header">
				<div class="v-table-header">
					<slot name="table-header-left"/>
					<slot name="table-header-center"/>
					<slot name="table-header-right"/>
				</div>
			</slot>
		</div>
		<!-- }}} -->
		<!-- Body loading overlay {{{ -->
		<slot v-if="state == 'loading'" name="overlay-loading">
			<div class="v-table-overlay-loading text-center">
				<div>
					<i class="v-table-overlay-loading-spinner far fa-4x fa-spinner fa-spin"/>
					<div class="v-table-overlay-loading-text ">
						{{textLoading}}
					</div>
				</div>
			</div>
		</slot>
		<!-- }}} -->
		<!-- Body + table element {{{ -->
		<div class="v-table-body" :class="layout == 'card' && 'card-body'">
			<table v-if="state == 'ready' || (state == 'loading' && rows && rows.length > 0)" :class="tableClass">
				<thead>
					<tr>
						<th v-for="col in columns" :key="col.id" :class="col.cellClass || col.type && _.get(columnTypes, [col.type, 'cellClass'])">
							<a @click="setSort(col.id, 'toggle')" :class="!col.sortable && 'no-click'">
								{{col.title || _.startCase(col .id)}}
								<i v-if="endpointSort == col.id" :class="endpointSortAsc ? 'far fa-sort-amount-down-alt text-primary' : 'far fa-sort-amount-up-alt text-primary'"/>
							</a>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in rows" :key="row[rowKey]">
						<td v-for="col in columns" :key="col.id" :class="col.cellClass || col.type && _.get(columnTypes, [col.type, 'cellClass'])">
							<a v-href="cellHref ? cellHref(row) : false" :class="!cellHref && 'no-click'">
								<slot :name="col.slot || _.camelCase(col.id)" :row="row">
									{{format(_.get(row, col.id), col.format)}}
								</slot>
							</a>
						</td>
					</tr>
				</tbody>
				<tfoot>
				</tfoot>
			</table>
			<slot v-else-if="state == 'empty'" name="state-empty">
				<div class="v-table-state-empty alert alert-warning">
					{{textEmpty}}
				</div>
			</slot>
			<slot v-else-if="state == 'loading'" name="state-loading"/>
			<slot v-else-if="state == 'error'" name="state-error">
				<div class="v-table-state-error alert alert-danger">
					<h3>An error has occured</h3>
					<pre>{{error}}</pre>
				</div>
			</slot>
			<slot v-else-if="state == 'init'" name="state-init"/>
			<div v-else class="alert alert-danger">Invalid state {{state}}</div>
		</div>
		<!-- }}} -->
		<!-- Footer {{{ -->
		<div :class="layout == 'card' && 'card-footer'">
			<slot name="table-footer">
				<div class="v-table-footer">
					<slot name="table-footer-left">
						<div class="v-table-pagination" v-if="showPagination">
							<pagination
								:value="endpointPage"
								:max="pages"
								@change="setPage($event).then(scrollIntoView)"
							/>

							<!-- Goto page {{{ -->
							<div v-if="showPaginationGoto" class="input-group ml-2" v-tooltip="'Go to page'">
								<input type="number" class="form-control" min="1" step="1"
									:max="pages"
									:placeholder="limit_desc"
									@keyup.enter="setPage(parseInt($event.target.value)).then(scrollIntoView)"
								/>
							</div>
							<!-- }}} -->

							<!-- Per page {{{ -->
							<div v-if="showPaginationDropdown" class="dropdown ml-2" v-tooltip="'Items per page'">
								<a class="btn btn-primary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									{{endpointLimit}}
								</a>

								<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
									<a v-for="(option, index) in limit_enum" :key="index" class="dropdown-item"
										href="" @click.prevent="setLimit(option).then(scrollIntoView)"
										:class="{ active:  (option == endpointLimit)}">
										{{option}}
									</a>
								</div>
							</div>
							<!-- }}} -->
						</div>
					</slot>
					<slot name="table-footer-center"/>
					<slot name="table-footer-right">
						<div class="text-muted">
							Displaying
							{{entity}}
							{{limit * (endpointPage-1) + 1 | number}}
							-
							{{Math.min(rowCount, limit * (endpointPage)) | number}}
							of
							{{rowCount | number}}
						</div>
					</slot>
				</div>
			</slot>
		</div>
		<!-- }}} -->
	</div>
</template>

<style lang="scss">
.v-table {
	min-height: 350px;

	/* Pagination {{{ */
	& .pagination {
		margin-bottom: 0;
	}
	/* }}} */

	/* Footer {{{ */
	& .v-table-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	/* }}} */

	/* Loading overlay {{{ */
	& .v-table-overlay-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		opacity: 0.7;
		position: absolute;
		left: 0px;
		top: 0px;
		right: 0px;
		border: 0px;
		background: var(--white);
		z-index: 10;

		& .v-table-overlay-loading-spinner {
			margin-bottom: 25px;
			font-size: 120px;
		}
	}
	/* }}} */
}

/* Sticky thead hacks - Experiment in progress - MC 2021-07-11 {{{ */
body {
	overflow-x: initial !important; /* Override theme o-x for body */
}

#wrapper, .content-page {
	overflow: initial !important; /* Override theme wrappers */
}

.v-table {
	& thead {
		position: sticky;
		top: 0px;
		z-index: 1000;
		background: #FFF;
		box-shadow: 0 1px 2px -1px rgb(0 0 0 / 40%);

		/* Correct .col-status from collapsing to just hiding its text element */
		& th.col-status, & th.col-verbs {
			visibility: visible;

			& > * { /* Rely on the next level down being a wrapped <a.no-click/> and just hide it */
				display: none;
			}
		}

		& th.col-status > a {
			display: none;
		}
	}
}
/* }}} */
</style>
