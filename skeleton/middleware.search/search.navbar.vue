<component>
module.exports = {
	data() { return {
		searchQuery: this.$route.query.q,
	}},
	methods: {
		submit() {
			this.$router.push({path: '/widgets', query: {q: this.searchQuery}});
		},
	},
	watch: {
		'$route.query.q': { // React to router changes by populating the search query
			immediate: true,
			handler() {
				this.searchQuery = this.$route.query.q;
			},
		},
	},
};
</component>

<template>
	<form @submit.prevent="submit" role="search">
		<input v-model="searchQuery" type="text" placeholder="Search..." class="form-control">
		<a @click="submit"><i class="fa fa-search"/></a>
	</form>
</template>
