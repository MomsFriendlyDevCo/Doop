<component>
/**
* Customizable timeline component with auto data retrieval and searching
*
* TODO: JSDocs.
*/

module.exports = {
	data() { return {
		//state: 'init', // ENUM: 'loading', 'ready', 'empty', 'error'
		//error: undefined, // Error from server, if any
		rows: undefined,
		//rowCount: undefined,
		//pages: undefined, // Number of pages based on rowCount

		//endpointFilters: {},
		//endpointSearch: '',
		//endpointPage: 1,

		//searchInput: '', // Ubsubmitted query the user is typing
	}},
	props: {
		url: {type: [String, Object], required: true},

		//showSearch: {type: Boolean, default: true},

		//rowKey: {type: String, default: '_id'},
		//loadForeground: {type: Boolean, default: false},

		//entity: {type: String, default: 'items'},
		//textEmpty: {type: String, default() { return `No ${this.entity} found` }},
		//textLoading: {type: String, default() { return `Loading ${this.entity}...` }},

	},
	methods: {
		refresh() {
			this.$debug('Refresh', this.url);
			if (!this.url) return this.$debug('Skipping refresh due to falsy URL'); // No URL available yet, URL is probably dynamic - do nothing
			if (_.isPlainObject(this.url) && !this.url.url) throw new Error('No "url" key provided in v-timeline object');

			// Omit empty keys from url object
			if (_.isObject(this.url))
				this.$setPath(this.url, 'params', _.pickBy(this.url.params, _.identity));

			return Promise.resolve()
				.then(()=> _.merge( // Calculate Axios request object
					{}, // Empty object so we don't stomp on anything
					_.isString(this.url) ? {url: this.url} : this.url, // Merge either single URL string OR entire url object
					{ // Calculate fields from v-table session - filters, search, sorting, pagination
						method: 'GET',
						params: { // Compute AxiosRequest
							//...(this.endpointFilters),
							//...(this.endpointSearch ? {q: this.endpointSearch} : {}), // Add search functionality
							sort: '-created',
							//limit: this.limit,
							//skip: this.limit * (this.endpointPage - 1), // Since page numbers start at 1 we have to decrement to get the skip value
						},
					},
				))
				.then(req => { this.$debug('AxiosRequest', req); return req })
				.then(req => {
					var endpointQuery = new URL(req.url, window.location.href);
					return Promise.all([
						this.$http({...req, url: endpointQuery.toString()})
							.then(res => this.rows = res.data)
					]);
				});
		},
		isNewDay(data, i) {
			if (i === 0) return true;
			return (moment(data[i].created).dayOfYear() !== moment(data[i-1].created).dayOfYear());
		}
	},
	created() {
		this.$debugging = true;

		return this.refresh();
	},
};
</component>

<template>
	<div class="v-timeline">

		<div class="timeline" dir="ltr">

			<!-- TODO: Configurable which date field, `created` as default -->
			<div v-for="(row, index) in rows" :key="row._id">
				<div v-if="isNewDay(rows, index)" class="timeline-item">
					<h2 class="m-0 d-none">&nbsp;</h2>
					<div class="time-show mt-0 mb-0">
						<a href="#" class="btn btn-primary width-lg">{{row.created | date({diff: 'days', diffLimit: 100})}}</a>
					</div>
				</div>

				<div class="timeline-item">
					<!--span class="timeline-date">{{row.created | date({format: 'YYYY-MM-DD'})}}</span-->
					<div class="timeline-desk">
						<a v-href="`/history/${row._id}`">
							<div class="timeline-box">
								<span class="arrow"></span>
								<span class="timeline-icon"><i class="mdi mdi-adjust"></i></span>
								<h4 class="mt-0 font-16">{{row.created | date({fromNow: true})}}</h4>
								<p class="text-muted"><small>{{row.created | date({format: 'h:mma'})}}</small></p>
								<slot name="row" :row="row"></slot>
								<p class="mb-0">{{row.created | date}}</p>
							</div>
						</a>
					</div>
				</div>
			</div>
		</div>


		<div v-if="this.$debugging" v-permissions="'debug'" class="card">
			<div class="card-header">
				Raw data
				<i class="float-right fas fa-debug fa-lg" v-tooltip="'Only visible to users with the Debug permission'"/>
			</div>
			<div class="card-body">
				<pre>{{$data}}</pre>
			</div>
		</div>
	</div>
</template>

<style>
.timeline:before {
	left: 45px;
}

@media (min-width: 768px) {
	.timeline-item:before {
		width: 45px;
	}

	.timeline .timeline-desk {
		width: 90%;
	}
}
</style>