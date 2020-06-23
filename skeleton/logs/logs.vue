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
		columns: [
			{
				type: 'date',
				label: 'Date',
				name: 'created',
				sort: true,
			},
			{
				type: 'lookup',
				label: 'Creator',
				name: 'creator',
			},
			{
				type: 'text',
				label: 'Change',
				name: 'body',
			},
		],
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
			:columns="columns"
			:search="false"
			text-empty="No logs found"
			text-loading="Loading logs..."
		>
			<template #created="props">
				<date :date="props.row.created"/>
			</template>
			<template #creator="props">
				<digest
					v-if="props.row.creator"
					field="name"
					:url="`/api/users/${props.row.creator}`"
					class-valid="badge badge-primary"
					icon-valid="fas fa-user"
					class-invalid="badge badge-danger"
					text-invalid="Invalid user"
				/>
			</template>
			<template #body="props">
				<div v-html="props.row.body"/>
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
