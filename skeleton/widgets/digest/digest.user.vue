<script lang="js" frontend>
/**
* Wrapper around <digest/> for user viewing as a simple pill
* This is really just a shortcut to display the regular digest widgets with a sane setup of properties specifically for users
*
* @param {string|Object} user The user to show, can be the entire object or just the ID
*/
app.component('digestUser', {
	props: {
		user: {type: [String, Object], required: true},
	},
	computed: {
		userId() {
			return _.isString(this.user) ? this.user
				: _.isObject(this.user) && this.user._id ? this.user._id
				: (()=> { throw new Error(`Invalid user type "${this.user}"`) })()
		},
	},
});
</script>

<template>
	<digest
		:url="`/api/users/${userId}`"
		field="*"
		:lazy="false"
		class="digest-user"
		class-valid="badge badge-primary"
		class-invalid="badge badge-warning"
		icon-valid="far fa-user"
		icon-invalid="far fa-exclaimation-triangle"
		text-invalid="Invalid User"
		:ignore-errors="true"
	>
		<template #loading>
			<i class="far fa-spinner fa-spin"/>
			Loading user...
		</template>
		<template #display="{data}">
			<user-avatar
				:user="user"
				size="32"
				class="d-inline-block mr-1"
			/>
			{{data.name}}
		</template>
	</digest>
</template>

<style lang="scss">
.digest-user {
	display: inline-flex;
	align-items: center;
}
</style>
