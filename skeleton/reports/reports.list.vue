<component>
module.exports = {
	route: '/reports',
};
</component>

<template>
	<div>
		<!--div class="btn-group-float">
			<a v-href="'/reports/create'" class="btn btn-icon btn-circle btn-success far fa-plus" v-tooltip="'Create a report'"></a>
		</div-->
		<v-table
			ref="reports"
			url="/api/reports"
			:columns="[
				/*
				{
					id: 'name',
					title: 'Name',
					type: 'text',
					sortable: true,
				},
				*/
				{
					id: 'title',
					title: 'Title',
					type: 'text',
					sortable: true,
				},
				/*
				{
					id: 'description',
					title: 'Description',
					type: 'text',
					sortable: false,
				}
				*/
			]"
			sort="name"
			:sortAsc="true"
			:cell-href="row => `/reports/${row.name}`"
			entity="reports"
			:showSearch="false"
		/>
	</div>
</template>
