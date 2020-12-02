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
		postUpdateContent: '',
		columns: [
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

		updateComment(postId, ref) {
			Promise.resolve()
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.post(`/api/logs/${postId}`, {
					body: this.postUpdateContent,
				}))
				.then(()=> this.postUpdateContent = '')
				.then(()=> this.$refs[ref].hide())
				.then(()=> this.$refs.logTable.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

		deleteComment(postId) {
			this.$prompt.confirm({
				title: `Delete comment`,
				body: 'Are you sure you wish to delete this comment?',
			})
				.then(()=> this.$loader.startBackground())
				.then(()=> this.$http.delete(`/api/logs/${postId}`))
				.then(()=> this.$refs.logTable.refresh())
				.catch(this.$toast.catch)
				.finally(()=> this.$loader.stop())
		},

		refresh(){
			this.$refs.logTable.refresh();
		}
	},
};
</component>

<template>
	<div class="logs">
		<v-table
			ref="logTable"
			:url="`/api/logs?col=${$props.collection}&doc=${$props.id}`"
			sort="created"
			:sort-asc="false"
			entity="logs"
			:show-search="false"
			:columns="columns"
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
				<div class="d-flex">
					<div v-html="row.body" class="post-comment"/>
					<v-popover
						v-if="$session.data._id == row.creator || $session.hasPermission('ordersPaymentsCommentsEditAll')"
						container="#modal-order-payments"
						:ref="'updateArea-'+row._id">
						<slot name="text">
							<a class="btn btn-sm btn-link far fa-edit"></a>
						</slot>
						<div slot="popover" class="foobar">
							<form class="form-horizontal px-3 py-2">
								<slot name="popover-header"/>
								<wysiwyg
									:value="row.body"
									@change="postUpdateContent = $event"
								/>
								<button type="button" @click="updateComment(row._id, `updateArea-${row._id}`)" class="w-100 mt-3 btn btn-success btn-sm">Update</button>
							</form>
						</div>
					</v-popover>
					<a v-if="$session.data._id == row.creator || $session.hasPermission('ordersPaymentsCommentsEditAll')" class="btn btn-sm btn-link btn-link-danger far fa-times" @click="deleteComment(row._id)"></a>
				</div>
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

.logs .post-comment p {
	margin-bottom: 0;
}

.logs .post-comment a {
	color: var(--primary);
}

.logs .post-comment a:hover {
	text-decoration: underline;
}
</style>
