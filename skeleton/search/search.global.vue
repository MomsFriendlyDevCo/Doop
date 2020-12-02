<component>
/**
* Wrapped version of the searchInput VueComponent instance that works specifically for global searches
*/
module.exports = {
	data() { return {
		tags: [
			{
				title: 'User',
				tag: 'user',
				type: 'digest',
				digest: {
					field: 'name',
					url: '/api/users',
					iconValid: 'fas fa-user',
					textInvalid: 'Invalid user',
					selectText: 'Search users...',
					title: 'Select user...',
				},
			},
			{
				title: 'Customer',
				tag: 'customer',
				type: 'digest',
				digest: {
					field: 'name',
					url: '/api/customers',
					iconValid: 'far fa-user',
					textInvalid: 'Invalid customer',
					selectText: 'Search customers...',
					title: 'Search customers',
					searchMethod: 'q',
				},
			},
			{
				title: 'Order date',
				type: 'dateRange',
				tag: 'date',
				startOnlyTag: 'after',
				endOnlyTag: 'before',
			},
			{
				title: 'Status',
				type: 'checkboxes',
				tag: 'is',
				options: [
					'invoice',
					'processing',
					'completed',
					'returnProcessing',
					'returnCompleted',
					'deleted',
				],
			},
			{
				title: 'Payment',
				type: 'radios',
				tag: 'payment',
				options: [
					'all',
					'settled',
					'partial',
					'unpaid',
				],
			},
			{
				title: 'Payment method',
				type: 'checkboxes',
				tag: 'paymentMethod',
				options: this.orderUtils.paymentMethods,
			},
			{
				title: 'Reports',
				type: 'checkboxes',
				tag: 'report',
				options: [
					'endOfDay',
				],
			},
		],
	}},

	beforeCreate() {
		this.$instance('orderUtils'); // Load this.orderUtils isomorphic functions
	},

	watch: {
		'$route.query.q': { // React to router changes by populating the search query
			immediate: true,
			handler() {
				this.searchQuery = this.$route.query.q;
				// FIXME: Maybe reset query here?
			},
		},
	},
};
</component>

<template>
	<search-input
		ref="searchInput"
		redirect="/orders"
		:tags="tags"
	/>
</template>

<style>
/* Search search area when search has content {{{ */
.app-search .search-input.has-content .search-input-fuzzy {
	width: calc(100vw - 500px) !important;
	background: var(--white);
	color: var(--dark);
}

.app-search .search-input .search-input-fuzzy::placeholder {
	color: var(--white) !important;
}

.app-search .search-input.has-content .search-input-verbs > a {
	color: var(--dark);
}

.app-search .search-input:not(.has-content) .search-input-fuzzy {
	color: var(--muted) !important;
}
/* }}} */

/* Global theme overrides {{{ */
.app-search {
	min-width: 400px;
}

.app-search .search-input .search-input-verbs a {
	position: initial;
	color: var(--white);
}
/* }}} */

/* <search-input/> overrides {{{ */
.app-search .search-input .search-input-verbs {
	right: 4px;
	top: 20px;
}
/* }}} */
</style>
