<component>
/**
* Simple component to display a table of log elements for a collection / docId tuple
*/
module.exports = {
	props: {
		collection: {type: String, required: true},
		id: {type: String, required: true},
		comments: {type: Boolean, default: true},
	},
	data() { return {
		postContent: '',
		postMode: false,
	}},
	methods: {
		beginComment() {
			this.postMode = true;
			this.$nextTick(()=> this.$refs.postArea.focus());
		},

		postComment(val) {
			Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/logs/${this.$props.collection}/${this.$props.id}`, {
					creator: this.$session.data._id,
					body: this.postContent,
				}))
				.then(()=> this.postContent = '')
				.then(()=> this.postMode = false)
				.then(()=> this.$refs.logTable.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},
	},
};
</component>

<template>
	<div class="logs">
		<v-table
			ref="logTable"
			:url="`/api/logs?col=${$props.collection}&doc=${$props.id}`"
			sort="created"
			sort-asc="false"
			entity="logs"
			:show-search="false"
			:columns="[
				{
					id: 'created',
					type: 'date',
					title: 'Date',
					sortable: true,
				},
				{
					id: 'creator',
					type: 'lookup',
					title: 'Creator',
				},
				{
					id: 'body',
					type: 'text',
					title: 'Change',
				},
			]"
		>
			<template #created="{row}">
				<date :date="row.created"/>
			</template>
			<template #creator="{row}">
				<digest
					v-if="row.creator"
					field="name"
					:url="`/api/users/${row.creator}`"
					class-valid="badge badge-primary"
					icon-valid="fas fa-user"
					class-invalid="badge badge-danger"
					text-invalid="Invalid user"
				/>
			</template>
			<template #body="{row}">
				<div v-html="row.body"/>
			</template>
		</v-table>
		<div v-if="$props.comments" class="mt-2">
			<wysiwyg
				ref="postArea"
				v-if="postMode"
				:value="postContent"
				@change="postContent = $event"
			/>
			<div class="float-right mt-1">
				<a v-if="!postMode" @click="beginComment" class="btn btn-light">
					<i class="far fa-plus"/>
					Add comment
				</a>
				<a v-if="postMode" @click="postComment" class="btn btn-success">
					<i class="far fa-plus"/>
					Post comment
				</a>
			</div>
		</div>
	</div>
</template>

<style>
.logs .ql-editor {
	min-height: 100px;
}
</style>
