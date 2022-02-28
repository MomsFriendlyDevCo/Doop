<script lang="js" frontend>
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
	<div class="search-global">
		<search-input
			ref="searchInput"
			redirect="/search"
			:tags="tags"
		/>
	</div>
</template>

<style lang="sass">
/* Search search area when search has content {{{ */
/*
.search-global .search-input.has-content .input-group {
	width: calc(100vw - 500px) !important;
	background: var(--white);
	color: var(--dark);
}

.search-global .search-input .search-input-fuzzy::placeholder {
	color: var(--white) !important;
}

.search-global .search-input.has-content .search-input-verbs > a,
.search-global .search-input.has-content .search-input-verbs > button {
	color: var(--dark);
}

.search-global .search-input:not(.has-content) .search-input-fuzzy {
	color: var(--muted) !important;
}
*/
/* }}} */

/* Global theme overrides {{{ */
/*
.search-global {
	min-width: 400px;
}

.search-global .search-input .search-input-verbs a,
.search-global .search-input .search-input-verbs button {
	position: initial;
	color: var(--white);
}
*/
/* }}} */

/* <search-input/> overrides {{{ */
/*
.search-global .search-input .search-input-verbs {
	right: 4px;
	top: 20px;
}
*/
/* }}} */
</style>
