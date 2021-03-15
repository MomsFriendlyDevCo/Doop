<script lang="js" frontend>
import orderUtils from '/orders/orderUtils';

/**
* Wrapped version of the searchInput VueComponent instance that works specifically for global searches
*/
app.component('searchGlobal', {
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
				title: 'Status',
				type: 'checkboxes',
				tag: 'is',
				options: [
					'invoice',
					'processing',
					'completed',
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
});
</script>

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
