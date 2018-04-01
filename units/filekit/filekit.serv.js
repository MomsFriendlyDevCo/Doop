/**
* Main $filekit service
*/
angular
	.module('app')
	.factory('$filekit', function($http, $rootScope, $timeout) {
		var $filekit = this;

		/**
		* Storage of files currently being uploaded
		* The key is a randomly generated ID usually of the form `upload-${$filekit.nextId++}`
		* @var {Object}
		* @param {Promise} promise The promise for the original upload
		* @param {File} file The original browser File object
		* @param {number} uploaded The bytes uploaded so far (NOTE: total size is available as .file.size)
		* @param {number} progress The percentage uploaded to 0DP
		* @param {string} status ENUM: `uploading`, `done`, `error`
		* @param {Object} [error] Error code that occured if status=='error'
		*/
		$filekit.uploading = {};

		/**
		* Tracker for the next upload ID
		* @var {number}
		*/
		$filekit.nextId = 0;


		/**
		* File upload settings
		* @var {Object}
		* @param {number} removeDelay How long to timeout before removing an item from the $filekit.uploading queue after it has finished
		* @param {function} errorHandler Error handler when uploading files. Called as (err, files)
		* @param {function} eventEmitter How to handle event broadcasts. Called as (event, ...args)
		* @param {function} prompter How to ask the user simple text response questions. Called as (options). Where options contains `title`, `body` and `default`
		*
		* @param {Object} uploadStatus Options to configure how the filekitUploadStatus directive acts
		* @param {boolean} [uploadStatus.enabled=true] Whether to actually show anything in the filekitUploadStatus directive, if disabled this assumes you are showing the upload status elsewhere
		*/
		$filekit.settings = {
			removeDelay: 5000,
			errorHandler: (err, files) => console.error('Error when uploading files', err),
			eventEmitter: (event, ...args) => $rootScope.$broadcast(event, ...args),
			prompter: options => $q((resolve, reject) => {
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
		* All uploading files are available in $filekit.uploading
		* @param {string} url URL endpoint to upload to
		* @param {FileList} files The files to upload
		* @return {array} An array of promises, one for each file that is being uploaded
		*
		* @emits filekitUploaded Emitted as (file) when a single file item finishes uploading
		* @emits filekitFinished Emitted as () when all files have finished uploading
		* @emits filekitProgress Emitted as (filekitObject) when a files upload progress updates
		*/
		$filekit.upload = (url, files) => {
			return _.toArray(files).map(file => {
				let formData = new FormData();
				let uploadId = `upload-${$filekit.nextId++}`;
				formData.append('file', file);

				$filekit.uploading[uploadId] = {
					promise: undefined,
					file: file,
					uploaded: 0,
					progress: 0,
					status: 'uploading',
					error: undefined,
				};

				$filekit.uploading[uploadId].promise = $http.post(url, formData, {
					headers: {'Content-Type': undefined}, // Need to override the headers so that angular changes them over into multipart/mime
					transformRequest: angular.identity,
					uploadEventHandlers: {
						progress: e => {
							$filekit.uploading[uploadId].uploaded = e.loaded;
							$filekit.uploading[uploadId].progress = Math.round(e.loaded / e.total * 100);
							$filekit.settings.eventEmitter('filekitProgress', $filekit.uploading[uploadId]);
						},
					},
				})
					.then(()=> { $timeout(()=> delete $filekit.uploading[uploadId], $filekit.settings.removeDelay) }) // NOTE: Not an arrow function so we dont have to wait for the timeout to resolve
					.then(()=> {
						$filekit.settings.eventEmitter('filekitUploaded', $filekit.uploading[uploadId].file);

						if (!_.map($filekit.uploading).filter(u => u.status == 'uploading').length) { // Nothing else uploading?
							$filekit.settings.eventEmitter('filekitFinished');
						}
					})
					.catch(err => {
						$filekit.uploading[uploadId].status = 'error';
						$filekit.uploading[uploadId].error = err;
						$filekit.settings.errorHandler(err, $filekit.uploading[uploadId]);
					})

				return $filekit.uploading[uploadId].promise;
			});
		};


		return $filekit;
	})
