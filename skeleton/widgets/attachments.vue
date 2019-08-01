<service singleton>
module.exports = function() {
	var $attachments = this;

	/**
	* Storage of files currently being uploaded
	* The key is a randomly generated ID usually of the form `upload-${$attachments.nextId++}`
	* @var {Object}
	* @param {Promise} promise The promise for the original upload
	* @param {File} file The original browser File object
	* @param {number} uploaded The bytes uploaded so far (NOTE: total size is available as .file.size)
	* @param {number} progress The percentage uploaded to 0DP
	* @param {string} status ENUM: `uploading`, `done`, `error`
	* @param {Object} [error] Error code that occured if status=='error'
	*/
	$attachments.uploading = {};

	/**
	* Tracker for the next upload ID
	* @var {number}
	*/
	$attachments.nextId = 0;


	/**
	* File upload settings
	* @var {Object}
	* @param {number} removeDelay How long to timeout before removing an item from the $attachments.uploading queue after it has finished
	* @param {function} errorHandler Error handler when uploading files. Called as (err, files)
	* @param {function} eventEmitter How to handle event broadcasts. Called as (event, ...args)
	* @param {function} prompter How to ask the user simple text response questions. Called as (options). Where options contains `title`, `body` and `default`
	*
	* @param {Object} uploadStatus Options to configure how the attachmentsUploadStatus directive acts
	* @param {boolean} [uploadStatus.enabled=true] Whether to actually show anything in the attachmentsUploadStatus directive, if disabled this assumes you are showing the upload status elsewhere
	*/
	$attachments.settings = {
		removeDelay: 5000,
		errorHandler: (err, files) => console.error('Error when uploading files', err),
		eventEmitter: (event, ...args) => app.vue.$emit(event, ...args),
		prompter: options => new Promise((resolve, reject) => {
			var res = window.prompt(options.body, options.default);
			if (res) {
				resolve(res);
			} else {
				reject();
			}
		}),
		uploadStatus: {
			enabled: true,
		},
	};


	/**
	* Upload a list of files (the fileList must be a compatible FileList object provided by the browser)
	* All uploading files are available in $attachments.uploading
	* @param {string} url URL endpoint to upload to
	* @param {FileList} files The files to upload
	* @return {Promise} A promise which will resolve when the file(s) have been uploaded, return value is equivalent to Promise.all
	*
	* @emits attachmentsUploaded Emitted as (file) when a single file item finishes uploading
	* @emits attachmentsFinished Emitted as () when all files have finished uploading
	* @emits attachmentsProgress Emitted as (attachmentsObject) when a files upload progress updates
	*/
	$attachments.upload = (url, files) => Promise.all(
		_.toArray(files).map(file => {
			let formData = new FormData();
			let uploadId = `upload-${$attachments.nextId++}`;
			formData.append('file', file);

			$attachments.uploading[uploadId] = {
				promise: undefined,
				file: file,
				uploaded: 0,
				progress: 0,
				status: 'uploading',
				error: undefined,
			};

			this.$toast.progress(uploadId, `Uploading ${file.name}`, 0);

			$attachments.uploading[uploadId].promise = this.$http.post(url, formData, {
				headers: {'Content-Type': undefined}, // Need to override the headers so that angular changes them over into multipart/mime
				onUploadProgress: e => {
					$attachments.uploading[uploadId].uploaded = e.loaded;
					$attachments.uploading[uploadId].progress = Math.round(e.loaded / e.total * 100);
					$attachments.settings.eventEmitter('attachmentsProgress', $attachments.uploading[uploadId]);
					this.$toast.progress(uploadId, $attachments.uploading[uploadId].progress);
				},
			})
				.then(()=> { setTimeout(()=> delete $attachments.uploading[uploadId], $attachments.settings.removeDelay) }) // NOTE: Not an arrow function so we dont have to wait for the timeout to resolve
				.then(()=> {
					$attachments.settings.eventEmitter('attachmentsUploaded', $attachments.uploading[uploadId].file);

					if (!_.map($attachments.uploading).filter(u => u.status == 'uploading').length) { // Nothing else uploading?
						$attachments.settings.eventEmitter('attachmentsFinished');
					}
				})
				.catch(err => {
					$attachments.uploading[uploadId].status = 'error';
					$attachments.uploading[uploadId].error = err;
					$attachments.settings.errorHandler(err, $attachments.uploading[uploadId]);
				})

			return $attachments.uploading[uploadId].promise;
		})
	);

	return $attachments;
};
</service>

<component>
/**
* Component which displays a simple attachment list linked against an API endpoint
* NOTE: Url is expected to return [{url, deleteUrl?, name, icon?, created? (parseable date string), size (bytes)}]
* The created, icon and size columns will optionally show based on whether any item in the server response has these fields
* If deleteUrl is omitted the source URL is used instead along with the HTTP DELETE method
* @param {string} url The backend endpoint to query for file lists and to POST to
* @param {boolean} [allowUpload=false] Whether to allow file uploads (backend must support POST method) - NOTE you must setup an upload button somewhere which calls `$refs.attachments.upload()`
* @param {boolean} [allowDelete=false] Whether to allow file deletion (backend must support DELETE method)
*
* @example Attachments widget with page level upload button
* <div class="btn-group-float">
*   <a @click="$refs.attachments.upload()" class="btn btn-icon btn-circle btn-primary fa fa-upload" v-tooltip="'Upload files'"></a>
* </div>
* <attachments ref="attachments" url="/api/uploads"/>
*/
module.exports = {
	props: {
		url: {type: String, required: true},
		allowUpload: {type: Boolean, default: false},
		allowDelete: {type: Boolean, default: false},
	},
	data() { return {
		attachments: undefined,
		loading: true, // Display a 'Loading' notifier, if false $loader.startBackground() is used instead to indicate action
		loadCount: 0, // Number of times we have refreshed, used to determine whether `loading` should be set >0
		hasStats: { // Attribuutes to show, determined when we refresh
			created: false,
			icon: false,
			size: false,
		},
	}},
	methods: {
		refresh() {
			return Promise.resolve()
				.then(()=> this.loadCount == 0
					? this.loading = true
					: this.$loader.startBackground(`attachment-refresh{attachment.url}`)
				)
				.then(()=> this.$http.get(this.$props.url))
				.then(res => this.attachments = res.data)
				.then(()=> { // Determine which stat columsn to show
					var fields = _.keys(this.hasStats);	
					fields.forEach(f => this.hasStats[f] = false);
					this.attachments.some(attachment => {
						fields.forEach(f => { if (attachment[f]) this.hasStats[f] = true });
						return (fields.map(f => this.hasStats[f]).every(i => i)); // Stop searching if all fields are accounted for
					});
				})
				.catch(this.$toast.catch)
				.finally(()=> this.loadCount++ == 0
					? this.loading = false
					: this.$loader.stop(`attachment-refresh{attachment.url}`)
				)
		},
		upload() {
			if (!this.$props.allowUpload) return;
			var $fileElem = $('<input type="file" name="file" multiple="multiple"/>');
			var $wrapperElem = $('<div style="display: none"></div>').append('body');
			var component = this;
			console.log('Allow upload');
			$fileElem
				.append($wrapperElem)
				.on('change', function() {
					component.$attachments.upload(component.$props.url, this.files)
						.then(()=> component.refresh())
						.finally(()=> $fileElem.remove())
				})

			Vue.nextTick(()=> $fileElem.trigger('click'));
		},
		remove(attachment) {
			return Promise.resolve()
				.then(()=> this.$loader.startBackground(`attachment-delete-${attachment.url}`))
				.then(()=> this.$http.delete(attachment.deleteUrl || attachment.url))
				.then(()=> this.refresh())
				.finally(()=> this.$loader.stop(`attachment-delete-${attachment.url}`))
				.catch(this.$toast.catch)
		},
	},
	created() {
		return this.refresh();
	},
};
</component>

<template>
	<div class="attachments">
		<div v-if="loading">
			<i class="fa fa-spinner fa-spin"/>
			Loading attachments...
		</div>
		<table v-else-if="attachments.length" class="table table-hover">
			<thead>
				<tr>
					<th v-if="hasStats.icon" class="col-icon">&nbsp;</th>
					<th>File name</th>
					<th v-if="!$screen.isMobile && hasStats.created" class="col-date">Created</th>
					<th v-if="hasStats.size" class="col-filesize">Size</th>
					<th v-if="$props.allowDelete" class="col-button">&nbsp;</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="attachment in attachments" :key="attachment.url" v-href="{url: attachment.url, target: '_blank'}">
					<td v-if="hasStats.icon">
						<i v-if="attachment.icon" :class="[attachment.icon, $screen.isMobile && 'fa-2x']"/>
					</td>
					<td>
						{{attachment.name}}
						<date v-if="$screen.isMobile && hasStats.created" class="text-muted" :date="attachment.created"/>
					</td>
					<td v-if="!$screen.isMobile && hasStats.created">
						<date :date="attachment.created"/>
					</td>
					<td v-if="hasStats.size">
						{{attachment.size | fileSize}}
					</td>
					<td v-if="$props.allowDelete">
						<a @click="remove(attachment)" class="btn btn-danger far fa-trash"/>
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="text-muted">
			No attachments
		</div>
	</div>
</template>
