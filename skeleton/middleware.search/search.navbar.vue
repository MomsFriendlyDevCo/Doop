<component>
module.exports = {
	data() { return {
		searchHasFocus: false,
		searchQuery: this.$route.query.q,
		showHelper: false, // Whether the helper area is visible, use setHelperVisibility() to change
		helper: {
			search: '',
			after: undefined,
			before: undefined,
			statusInvoice: false,
			statusProcessing: false,
			statusCompleted: false,
			payment: 'all',
		},
	}},
	methods: {
		/**
		* Submit the search form
		*/
		submit() {
			const search = { path: '/orders' };

			if (this.searchQuery) {
				search.query = {q: this.searchQuery};
			}
			this.$router.push(search).catch(_.noop);
			this.setHelperVisibility(false)
		},


		/**
		* Set the visiblity of the helper
		* @param {boolean|string} [state='toggle'] Either the visibility boolean or 'toggle' to switch
		*/
		setHelperVisibility(state = 'toggle') {
			this.showHelper = state == 'toggle' ? !this.showHelper : !!state;

			if (this.showHelper) {
				// Hook into global body click handler
				this.$timeout(()=> $('body').on('click', '*', this.handleBodyClick), 250); // Let DOM settle then bind to clicking outside the area to close
				app.vue.$on('$beforeRoute', this.handleRoute);
			} else {
				// Destroy global body click handler
				$('body').off('click', '*', this.handleBodyClick);
				app.vue.$off('$beforeRoute', this.handleRoute);
			}
		},


		/**
		* Decode the active search into helper values
		*/
		decodeSearch() {
			this.helper = _.chain(this.searchQuery || '')
				// Split into array preserving quotes {{{
				.thru(v => v.match(/\\?.|^$/g))
				.reduce((p, c) => {
					if (c == '"') {
						p.quote ^= 1;
					} else if (!p.quote && c == ' ') {
						p.a.push('');
					} else {
						p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
					}
					return  p;
				}, {a: ['']})
				.get('a')
				.filter()
				// }}}
				.reduce((helper, i) => {
					if (i.startsWith('after:')) {
						helper.after = moment(i.substring(6)).toDate();
					} else if (i.startsWith('before:')) {
						helper.before = moment(i.substring(7)).toDate();
					} else if (i.startsWith('is:')) {
						var statuses = i.substring(3).split(/\s*,\s*/);
						helper.statusInvoice = statuses.includes('invoice');
						helper.statusProcessing = statuses.includes('processing');
						helper.statusCompleted = statuses.includes('completed');
					} else if (i.startsWith('payment:')) {
						helper.payment = i.substr(8);
					} else { // Don't recognise as a token - throw onto fuzzy searching pile
						helper.search.push(i);
					}
					return helper;
				}, {
					..._.mapValues(this.helper, ()=> undefined), // Copy of helper values with everything set to undefined
					search: [], // Array version of generic search (joined later)
				})
				.thru(v => _.set(v, 'search', v.search.join(' '))) // Join generic search terms back up again
				.value();
		},


		/**
		* Encode the helper values into a search string
		*/
		encodeSearch() {
			this.searchQuery = [
				this.helper.search,
				this.helper.after ? `after:${moment(this.helper.after).format('YYYY-MM-DD')}` : '',
				this.helper.before ? `before:${moment(this.helper.before).format('YYYY-MM-DD')}` : '',
				this.helper.statusInvoice || this.helper.statusProcessing || this.helper.statusCompleted
					? 'is:' + [
						this.helper.statusInvoice && 'invoice',
						this.helper.statusProcessing && 'processing',
						this.helper.statusCompleted && 'completed',
					].filter(s => s).join(',')
					: '',
				this.helper.payment && this.helper.payment != 'all' ? `payment:${this.helper.payment}` : '',
			].filter(i => i).join(' ')
		},


		/**
		* Detect and handle top level body clicks
		* Close the dialog if the click is detected anywhere outside the DOM element tree
		*/
		handleBodyClick(e) {
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			if (!$(e.target).parents('.app-search-helper').toArray().length) { // Helper is not in DOM tree upwards - user clicked outside open search helper area
				e.stopPropagation();
				this.setHelperVisibility(false);
			}
		},

		/**
		* Detect and handle routing while the search helper is open
		*/
		handleRoute(data) {
			if (!this.showHelper) return; // Helper is invisible anyway - disguard
			this.setHelperVisibility(false);
		},
	},
	watch: {
		'$route.query.q': { // React to router changes by populating the search query
			immediate: true,
			handler() {
				this.searchQuery = this.$route.query.q;
				this.decodeSearch();
			},
		},
		helper: {
			deep: true,
			handler() {
				this.encodeSearch();
			},
		},
	},
	beforeDestroy() {
		this.setHelperVisibility(false); // Clean up body click handlers
	},
};
</component>

<template>
	<form @submit.prevent="submit" role="search" :class="searchHasFocus && 'app-search-focus'">
		<input
			v-model="searchQuery"
			type="text"
			placeholder="Search orders..."
			class="form-control app-search-input"
			@keydown.enter="submit"
			@focus="searchHasFocus = true"
			@blur="searchHasFocus = false"
		/>
		<a @click="submit" class="far fa-search"/>
		<a @click="setHelperVisibility('toggle')" class="far fa-chevron-down"/>
		<div class="app-search-helper form-horizontal container pt-1" :class="showHelper && 'open'">
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Search</label>
				<div class="col-sm-9">
					<input v-model="helper.search" type="text" class="form-control"/>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Date</label>
				<div class="col-sm-4">
					<v-date v-model="helper.after" @selected="helper.before = $event" :clear-button="true"/>
				</div>
				<div class="col-sm-1">to</div>
				<div class="col-sm-4">
					<v-date v-model="helper.before" :clear-button="true"/>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Status</label>
				<div class="col-sm-9 form-inline form-control-plaintext">
					<div class="form-check mr-3">
						<input v-model="helper.statusInvoice" class="form-check-input" type="checkbox" id="searchHelperStatusInvoice"/>
						<label class="form-check-label" for="searchHelperStatusInvoice">Invoice</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.statusProcessing" class="form-check-input" type="checkbox" id="searchHelperStatusProcessing"/>
						<label class="form-check-label" for="searchHelperStatusProcessing">Processing</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.statusCompleted" class="form-check-input" type="checkbox" id="searchHelperStatusCompleted"/>
						<label class="form-check-label" for="searchHelperStatusCompleted">Completed</label>
					</div>
				</div>
			</div>
			<div class="form-group row">
				<label class="col-sm-3 col-form-label">Payment</label>
				<div class="col-sm-9 form-inline form-control-plaintext">
					<div class="form-check mr-3">
						<input v-model="helper.payment" class="form-check-input" type="radio" id="searchHelperPaymentAll" name="searchHelperPayment" value="all"/>
						<label class="form-check-label" for="searchHelperPaymentAll">All</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.payment" class="form-check-input" type="radio" id="searchHelperPaymentSettled" name="searchHelperPayment" value="settled"/>
						<label class="form-check-label" for="searchHelperPaymentSettled">Settled</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.payment" class="form-check-input" type="radio" id="searchHelperPaymentPartial" name="searchHelperPayment" value="partial"/>
						<label class="form-check-label" for="searchHelperPaymentPartial">Partial</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.payment" class="form-check-input" type="radio" id="searchHelperPaymentUnpaid" name="searchHelperPayment" value="unpaid"/>
						<label class="form-check-label" for="searchHelperPaymentUnpaid">Unpaid</label>
					</div>
				</div>
			</div>
			<div class="form-group row d-flex justify-content-end px-2">
				<button @click="submit" type="button" class="btn btn-primary">Search</button>
			</div>
		</div>
	</form>
</template>

<style>
/* Search input area {{{ */
.app-search .app-search-focus input.app-search-input {
	background: var(--white);
	color: var(--dark);
}

.app-search .app-search-focus > a.far {
	color: var(--dark);
}

.app-search input.app-search-input::placeholder {
	color: var(--muted) !important;
}
/* }}} */

/* Search helper {{{ */
.navbar-custom .menu-left {
	overflow: visible;
}

.app-search .app-search-helper {
	display: none;
	width: 400px;
	z-index: 1000;
	background: #FFF;
	position: absolute;
	border: 1px solid var(--secondary);
	border-bottom-left-radius: 5px;
	border-bottom-right-radius: 5px;
}

.app-search .app-search-helper .form-control,
.app-search .app-search-helper .form-control:focus {
	color: var(--gray-dark);
	border-bottom: 1px solid var(--secondary);
	border-radius: 0px;
	width: 100%;
	padding: 0;
}

.app-search .app-search-helper .vdp-datepicker {
	border-bottom: 1px solid var(--secondary);
}

.app-search .app-search-helper .vdp-datepicker input {
	border: none;
	width: 100%;
}

.app-search .app-search-helper .vdp-datepicker .vdp-datepicker__clear-button {
	position: absolute;
	right: 0px;
}

.app-search .app-search-helper.open {
	display: block;
}
/* }}} */

/* Button placement {{{ */
.app-search .form-control, .app-search .form-control:focus {
	width: 400px;
}

.app-search a.fa-search {
	left: auto;
	right: 30px;
}

.app-search a.fa-chevron-down {
	left: auto;
	right: 5px;
}
/* }}} */

/* Theme fixes {{{*/
.app-search .digest-select a {
	position: inherit;
	top: initial;
	left: initial;
	height: auto;
	line-height: 1;
	width: auto;
}
.app-search .digest-select a.btn-hover-danger {
	flex-grow: 0;
	color: inherit;
	border-radius: 0;
	width: 31px;
}
/* }}} */
</style>
