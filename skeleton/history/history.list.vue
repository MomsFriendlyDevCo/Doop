<component>
module.exports = {
	route: '/history',
};
</component>

<template>
	<div>
		<v-timeline
			:url="{
				url: '/api/history',
				params: $route.query,
			}"
		>
			<template v-slot:row="slotProps">
				<dl>
					<dt>Collection</dt>
					<dd>{{slotProps.row.col}}</dd>
					<dt>Document</dt>
					<dd>{{slotProps.row.doc}}</dd>
				</dl>
			</template>
		</v-timeline>
			
		<v-table
			ref="history"
			:url="{
				url: '/api/history',
				params: $route.query,
			}"
			:columns="[
				{
					id: 'col',
					title: 'Collection',
					type: 'text',
					sortable: true,
				},
				{
					id: 'doc',
					title: 'Document',
					type: 'text',
				},
				/*
				Potentially allow for outputting HTML into v-table cells.
				{
					id: 'body',
					title: 'Fields',
					type: 'text',
					format: function(value) {
						return this.filter('formatDiff')(value)
					}
				},
				*/
				{
					id: 'created',
					type: 'date',
					sortable: true,
					format: function(value) {
						return this.filter('date')(value, {format: 'YYYY-MM-DD h:mma'})
					}
				},
			]"
			sort="created"
			:sortAsc="false"
			:showSearch="false"
			:cell-href="row => `/history/${row._id}`"
			entity="history"
		/>
	</div>
</template>
