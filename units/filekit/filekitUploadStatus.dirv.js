/**
* Display a list of all file uploads handled by the $filekit.upload() function
*
* @example Display a list of uploading files
* <filekit-upload-status></filekit-upload-status>
*/
angular
	.module('app')
	.component('filekitUploadStatus', {
		controller: function($filekit) {
			var $ctrl = this;
			$ctrl.$filekit = $filekit;
		},
		template: `
			<div ng-if="$ctrl.$filekit.settings.uploadStatus.enabled" ng-repeat="(id, upload) in $ctrl.$filekit.uploading track by id" class="row">
				<div class="col-xs-12">
					<div class="card">
						<div class="card-body p-10">
							<div>
								<div class="pull-right">
									<span class="badge badge-muted">{{upload.file.size | filesize}}</span>
								</div>
								{{upload.file.name}}
							</div>
							<div class="progress">
								<div
									class="progress-bar"
									style="width: {{upload.progress}}%"
									ng-class="{
										'progress-bar-success' : upload.status == 'done',
										'progress-bar-danger': upload.status == 'error',
									}"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	})
