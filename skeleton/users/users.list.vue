<component>
module.exports = {
	route: '/users',
	methods: {
		setStatus(user, status) {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/users/${user._id}`, {status}))
				.then(()=> this.$refs.users.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
};
</component>

<template>
	<div>
		<div class="btn-group-float">
			<a v-href="'/users/invite'" class="btn btn-icon btn-circle btn-success far fa-paper-plane" v-tooltip="'Invite a new user'"></a>
		</div>
		<v-table
			ref="users"
			:url="`/api/users`"
			:columns="[
				{
					id: 'status',
					type: 'status',
				},
				{
					id: 'email',
					type: 'text',
				},
				{
					id: 'name',
					type: 'text',
				},
				{
					id: 'company',
					type: 'text',
				},
				{
					id: 'verbs',
					type: 'verbs',
				},
			]"
			sort="email"
			entity="users"
			:cell-href="row => `/users/${row._id}`"
		>
			<template #status="{row}">
				<i v-if="row.status == 'active'" class="fas fa-circle text-success" v-tooltip="'User is active'"/>
				<i v-else-if="row.status == 'deleted'" class="fas fa-circle text-warning" v-tooltip="'User has been disabled'"/>
				<i v-else class="fas fa-question-circle text-warning" v-tooltip="'User status is unknown'"/>
			</template>
			<template #verbs="{row}">
				<div class="btn-group">
					<i @click.prevent.stop="userOrders(row)" class="btn btn-light btn-hover-primary far fa-clipboard-list" v-tooltip="'Show user orders'"/>
					<i v-if="row.status == 'active'" @click.prevent.stop="setStatus(row, 'deleted')" class="btn btn-light btn-hover-danger far fa-trash" v-tooltip="'Disable this user account'"/>
					<i v-else-if="row.status == 'deleted'" @click.prevent.stop="setStatus(row, 'active')" class="btn btn-light far fa-undo" v-tooltip="'Re-enable this user account'"/>
				</div>
			</template>
		</v-table>
	</div>
</template>
