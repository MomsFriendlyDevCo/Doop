<script lang="js" frontend>
app.component({
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
});
</script>

<template>
	<div>
		<div class="btn-group-float">
			<a v-href="'/invite'" class="btn btn-icon btn-circle btn-success fa fa-share-square" v-tooltip="'Invite a new user'"></a>
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
					id: 'verbs',
					type: 'verbs',
				},
			]"
			sort="email"
			entity="users"
			:cell-href="row => `/users/${row._id}`"
		>
			<template #status="{row}">
				<i v-if="row.status == 'active'" class="fa fa-circle text-success" v-tooltip="'User is active'"/>
				<i v-else-if="row.status == 'deleted'" class="fa fa-circle text-warning" v-tooltip="'User has been disabled'"/>
				<i v-else class="fa fa-question-circle text-warning" v-tooltip="'User status is unknown'"/>
			</template>
			<template #verbs="{row}">
				<div class="btn-group">
					<i v-if="row.status == 'active'" @click.prevent.stop="setStatus(row, 'deleted')" class="btn btn-light btn-hover-danger fa fa-trash" v-tooltip="'Disable this user account'"/>
					<i v-else-if="row.status == 'deleted'" @click.prevent.stop="setStatus(row, 'active')" class="btn btn-light fa fa-undo" v-tooltip="'Re-enable this user account'"/>
				</div>
			</template>
		</v-table>
	</div>
</template>
