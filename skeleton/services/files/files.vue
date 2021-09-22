<script lang="js" frontend>
app.service('$files', function() {
	var $files = {};

	this.$debug = this.$debug.new('$files').enable(false);
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
	* @return {Promise} A promise which will resolve when all uploads complete
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

				return fileObj.promise = app.service.$http({
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
						app.service.$toast.progress(fileObj._id, fileObj.name, fileObj.progress, {
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

	return $files;
});
</script>
