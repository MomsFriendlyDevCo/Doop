<script lang="js" frontend>
app.component('debugFiles', {
	data() { return {
		attachments: {
			url: '/api/debug/files',
			view: 'icons', //FIXME: table
			showControls: true,
			allowDelete: true,
			allowUpload: true,
			allowUploadMultiple: true,
		},
	}},
	route: '/debug/files',
	methods: {},
});
</script>

<template>
	<div>
		<div class="card">
			<div class="list-group">
				<a class="list-group-item" @click="$files.upload({url: '/api/debug/files'})">vm.$files.upload()</a>
				<a class="list-group-item" @click="$files.upload({url: '/api/debug/files', accept: '.jpg'})">vm.$files.upload({accept: '.jpg'})</a>
			</div>
		</div>
		<div class="row mt-1">
			<div class="col-xs-12 col-md-6">
				<div class="card">
					<div class="card-header">Attachments Widget Config</div>
					<div class="card-body form-horizontal">
						<div class="form-group row">
							<label class="col-4 col-form-label">URL</label>
							<div class="col-8">
								<input type="text" class="col-8 form-control" v-model="attachments.url"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">View</label>
							<div class="col-8">
								<select class="form-control" v-model="attachments.view">
									<option value="table">table (default)</option>
									<option value="directory">directory</option>
									<option value="icons">icons</option>
								</select>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Show controls</label>
							<div class="col-8 col-form-label">
								<v-toggle v-model="attachments.showControls"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow upload</label>
							<div class="col-8 col-form-label">
								<v-toggle v-model="attachments.allowUpload"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow multiple files</label>
							<div class="col-8 col-form-label">
								<v-toggle v-model="attachments.allowUploadMultiple"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow delete</label>
							<div class="col-8 col-form-label">
								<v-toggle v-model="attachments.allowDelete"/>
							</div>
						</div>
						<pre>{{attachments}}</pre>
					</div>
				</div>
			</div>
			<div class="col-xs-12 col-md-6">
				<div class="card">
					<div class="card-header">Attachments Widget Preview</div>
					<div class="card-body">
						<attachments
							:url="attachments.url"
							:view="attachments.view"
							:allow-delete="attachments.allowDelete"
							:allow-upload="attachments.allowUpload"
							:allow-upload-multiple="attachments.allowUploadMultiple"
							:show-controls="attachments.showControls"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
