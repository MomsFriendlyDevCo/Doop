<component>
module.exports = {
	route: '/users',
	data() { return {
		users: undefined,
		columns: [
			{
				type: 'status',
				name: 'status',
			},
			{
				type: 'text',
				label: 'Email',
				name: 'email',
				sort: true,
			},
			{
				type: 'text',
				label: 'Name',
				name: 'name',
				sort: true,
			},
			{
				type: 'verbs',
				name: 'verbs',
			},
		],
	}},
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
			:columns="columns"
			:cell-href="cell => `/users/${cell._id}`"
			:search="true"
			text-empty="No users found"
			text-loading="Loading users..."
		>
			<template #status="props">
				<i v-if="props.row.status == 'active'" class="fas fa-circle text-success" v-tooltip="'User is active'"/>
				<i v-else-if="props.row.status == 'deleted'" class="fas fa-circle text-warning" v-tooltip="'User has been disabled'"/>
				<i v-else class="fas fa-question-circle text-warning" v-tooltip="'User status is unknown'"/>
			</template>
			<template #email="props">
				{{props.row.email}}
			</template>
			<template #name="props">
				{{props.row.name}}
			</template>
			<template #verbs="props">
				<i v-if="props.row.status == 'active'" @click.prevent.stop="setStatus(props.row, 'deleted')" class="btn btn-light btn-hover-danger far fa-trash" v-tooltip="'Disable this user account'"/>
				<i v-else-if="props.row.status == 'deleted'" @click.prevent.stop="setStatus(props.row, 'active')" class="btn btn-light far fa-undo" v-tooltip="'Re-enable this user account'"/>
			</template>
		</v-table>
	</div>
</template>
