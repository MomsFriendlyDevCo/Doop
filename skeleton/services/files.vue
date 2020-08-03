<script>
var $files = {};
$files.debugging = true;

/**
* Storage of files currently being uploaded
* The key is a randomly generated ID usually of the form `upload-${this.$files.nextId++}`
* @var {Object}
* @param {string} _id The unique ID of this item
* @param {Promise} promise The promise for upload
* @param {File} file The original browser File object
* @param {number} uploaded The bytes uploaded so far
* @param {number} size The total size of the file
* @param {number} progress The percentage uploaded to 0DP
* @param {string} status ENUM: `uploading`, `done`, `error`
* @param {Object} [error] Error code that occured if status=='error'
*/
$files.uploading = {};


/**
* Tracker for the next upload ID
* @var {number}
*/
$files.nextId = 0;


/**
* Upload a list of files (`files` must be a compatible FileList object provided by the browser)
* All uploading files are available in $files.uploading
* @param {Object} options The options to use during upload, inherits $files.defaults
* @param {string} options.url URL endpoint to upload to
* @param {Object} [options.body] Additional AxiosRequest parameters to pass, overrides auto-generated properties
* @param {boolean} [options.multiple=true] If prompting for files, allow multiple
* @param {string} [options.accept] The file types to accept, can be a mime list or extension list. e.g. 'image/*,.pdf,.zip'
* @param {FormData|FileList|File} [options.files] The file(s) to upload in FormData, File or FileList format, specifying this does not prompt the user
* @return {Profimise} A promise which will resolve when all uploads complete
*/
$files.upload = (options) => {
	var settings = {
		url: undefined,
		multiple: true,
		files: undefined,
		body: {},
		...$files.defaults,
		...options,
	};
	if (!settings.url) throw new Error('url omitted when calling $files.upload()');

	// Closure for the actual uploader {{{
	var upload = fileList => Promise.all(
		_.toArray(fileList).map(file => {
			var fileObj = {
				_id: `upload-${$files.nextId++}`,
				promise: undefined,
				name: file.name,
				file: file,
				uploaded: 0,
				size: file.size,
				progress: 0,
				status: 'uploading',
				error: undefined,
			};
			this.$debug('Upload', fileObj);

			$files.uploading[fileObj._id] = fileObj;

			var formData = new FormData();
			formData.append('file', file);

			return fileObj.promise = Vue.services().$http({
				url: settings.url,
				method: 'post',
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data',
					...settings?.body?.headers,
				},
				onUploadProgress: e => {
					Object.assign(fileObj, {
						uploaded: e.loaded,
						size: e.total,
						progress: Math.round(e.loaded / e.total * 100),
					});
					Vue.services().$toast.progress(fileObj._id, fileObj.name, fileObj.progress, {
						icon: 'far fa-file-upload',
					});
				},
				...settings?.body,
			})
				.catch(e => {
					fileObj.status = 'error';
					throw e;
				})
				.finally(()=> delete $files.uploading[fileObj])
		})
	);
	// }}}

	if (!settings.files) { // User wants this function to prompt the user
		this.$debug('Prompt for upload file', settings);
		return new Promise((resolve, reject) => {
			var wrapper = $('<div style="display: none"/>').appendTo('body');
			var fileControl = $(
				'<input type="file" '
					+ (settings.multiple ? 'multiple="multiple" ' : ' ')
					+ (settings.accept ? 'accept="' + settings.accept + '" ' : ' ')
				+ '/>'
			)
				.one('change', function(e) {
					wrapper.remove();
					return upload(this.files)
						.then(resolve)
						.catch(reject);
				})
				.appendTo(wrapper)
				.click();
		});
	} else if (settings.files instanceof FormData) {
		return upload(settings.files.values());
	} else if (settings.files instanceof File) {
		return upload([settings.files]);
	} else if (settings.files instanceof FileList) { // Being given an existing FileList object
		return upload(settings.files);
	} else {
		throw new Error('Unknown file upload wrapper');
	}
};

app.service('$files', $files);
</script>

<script>
app.component({
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
								<toggle-button v-model="attachments.showControls"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow upload</label>
							<div class="col-8 col-form-label">
								<toggle-button v-model="attachments.allowUpload"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow multiple files</label>
							<div class="col-8 col-form-label">
								<toggle-button v-model="attachments.allowUploadMultiple"/>
							</div>
						</div>
						<div class="form-group row">
							<label class="col-4 col-form-label">Allow delete</label>
							<div class="col-8 col-form-label">
								<toggle-button v-model="attachments.allowDelete"/>
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
