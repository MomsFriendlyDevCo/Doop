<component>
module.exports = {
	data() { return {
		searchQuery: this.$route.query.q,
		showHelper: false,
		helper: {
			search: '',
			after: undefined,
			before: undefined,
			statusDraft: false,
			statusQuote: false,
			statusInvoice: false,
			statusProcessing: false,
			statusCompleted: false,
		},
	}},
	methods: {
		/**
		* Submit the search form
		*/
		submit() {
			this.$router.push({path: '/orders', query: {q: this.searchQuery}});
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
						helper.statusDraft = statuses.includes('draft');
						helper.statusQuote = statuses.includes('quote');
						helper.statusInvoice = statuses.includes('invoice');
						helper.statusProcessing = statuses.includes('processing');
						helper.statusCompleted = statuses.includes('completed');
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
				this.helper.statusDraft || this.helper.statusQuote || this.helper.statusInvoice || this.helper.statusProcessing || this.helper.statusCompleted
					? 'is:' + [
						this.helper.statusDraft && 'draft',
						this.helper.statusQuote && 'quote',
						this.helper.statusInvoice && 'invoice',
						this.helper.statusProcessing && 'processing',
						this.helper.statusCompleted && 'completed',
					].filter(s => s).join(',')
					: '',
			].filter(i => i).join(' ')
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
};
</component>

<template>
	<form @submit.prevent="submit" role="search">
		<input v-model="searchQuery" type="text" placeholder="Search orders..." class="form-control">
		<a @click="submit" class="far fa-search"/>
		<a @click="showHelper = !showHelper" class="far fa-chevron-down"/>
		<div class="app-search-helper form-horizontal container" :class="showHelper && 'open'">
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
				<div class="col-sm-9 form-inline">
					<div class="form-check mr-3">
						<input v-model="helper.statusDraft" class="form-check-input" type="checkbox" id="searchHelperStatusDraft"/>
						<label class="form-check-label" for="searchHelperStatusDraft">Draft</label>
					</div>
					<div class="form-check mr-3">
						<input v-model="helper.statusQuote" class="form-check-input" type="checkbox" id="searchHelperStatusQuote"/>
						<label class="form-check-label" for="searchHelperStatusQuote">Quote</label>
					</div>
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
			<div class="form-group row d-flex justify-content-end px-2">
				<button @click="submit" type="button" class="btn btn-primary">Search</button>
			</div>
		</div>
	</form>
</template>

<style>
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
</style>
