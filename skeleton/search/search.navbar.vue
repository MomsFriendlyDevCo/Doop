<component>
module.exports = {
	data() { return {
		searchQuery: this.$route.query.q,
		helper: {
			search: '',
			after: undefined,
			before: undefined,
			//statusDraft: false,
			//statusQuote: false,
			//statusInvoice: false,
			//statusProcessing: false,
			//statusCompleted: false,
		},
	}},
	methods: {
		/**
		* Submit the search form
		*/
		submit() {
			this.$router.push({path: '/search', query: {q: this.searchQuery}}).catch(_.noop);
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
						console.warn('is: not implemented');
						//var statuses = i.substring(3).split(/\s*,\s*/);
						//helper.statusDraft = statuses.includes('draft');
						//helper.statusQuote = statuses.includes('quote');
						//helper.statusInvoice = statuses.includes('invoice');
						//helper.statusProcessing = statuses.includes('processing');
						//helper.statusCompleted = statuses.includes('completed');
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
				/*
				this.helper.statusDraft || this.helper.statusQuote || this.helper.statusInvoice || this.helper.statusProcessing || this.helper.statusCompleted
					? 'is:' + [
						this.helper.statusDraft && 'draft',
						this.helper.statusQuote && 'quote',
						this.helper.statusInvoice && 'invoice',
						this.helper.statusProcessing && 'processing',
						this.helper.statusCompleted && 'completed',
					].filter(s => s).join(',')
					: '',
				*/
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
	mounted() {
		// Prevent input fields from closing dropdown.
		$('.dropdown-menu').find('input').click(function (e) {
			e.stopPropagation();
		});
	},
};
</component>

<template>
	<form class="app-search" @submit.prevent="submit" role="search">
		<div class="app-search-box dropdown">
			<div class="input-group">
				<input v-model="searchQuery" autocomplete="off" type="search" class="form-control" placeholder="Search..." id="top-search">
				<div class="input-group-append">
					<button class="btn" type="submit">
						<i class="fe-search"></i>
					</button>
				</div>
			</div>
			<div class="dropdown-menu dropdown-lg" id="search-dropdown">

				<div class="dropdown-header noti-title">
					<h5 class="text-overflow mb-2">Filters</h5>
				</div>

				<div class="form-group dropdown-item notify-item">
					<label for="search-field-date-after">After</label>
					<input v-model="helper.after" type="date" class="form-control" aria-describedby="search-field-date-after-help" id="search-field-date-after"/>
					<small id="search-field-date-after-help" class="sr-only form-text text-muted">Show results created after this date.</small>
				</div>

				<div class="form-group dropdown-item notify-item">
					<label for="search-field-date-before">Before</label>
					<input v-model="helper.before" type="date" class="form-control" aria-describedby="search-field-date-before-help" id="search-field-date-before"/>
					<small id="search-field-date-before-help" class="sr-only form-text text-muted">Show results created before this date.</small>
				</div>

				<!--
				<div class="dropdown-header noti-title">
					<h5 class="text-overflow mb-2">Found <span class="text-danger">09</span> results</h5>
				</div>

				<a href="javascript:void(0);" class="dropdown-item notify-item">
					<i class="fe-home mr-1"></i>
					<span>Analytics Report</span>
				</a>

				<a href="javascript:void(0);" class="dropdown-item notify-item">
					<i class="fe-aperture mr-1"></i>
					<span>How can I help you?</span>
				</a>

				<a href="javascript:void(0);" class="dropdown-item notify-item">
					<i class="fe-settings mr-1"></i>
					<span>User profile settings</span>
				</a>

				<div class="dropdown-header noti-title">
					<h6 class="text-overflow mb-2 text-uppercase">Users</h6>
				</div>

				<div class="notification-list">
					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<div class="media">
							<img class="d-flex mr-2 rounded-circle" src="../assets/images/users/avatar-2.jpg" alt="Generic placeholder image" height="32">
							<div class="media-body">
								<h5 class="m-0 font-14">Erwin E. Brown</h5>
								<span class="font-12 mb-0">UI Designer</span>
							</div>
						</div>
					</a>

					<a href="javascript:void(0);" class="dropdown-item notify-item">
						<div class="media">
							<img class="d-flex mr-2 rounded-circle" src="../assets/images/users/avatar-5.jpg" alt="Generic placeholder image" height="32">
							<div class="media-body">
								<h5 class="m-0 font-14">Jacob Deo</h5>
								<span class="font-12 mb-0">Developer</span>
							</div>
						</div>
					</a>
				</div>
				-->

			</div>
		</div>
	</form>
</template>

<style>
.navbar-custom .app-search .dropdown-menu .form-control {
	color: inherit;
	background-color: inherit;
}
</style>