/**
* Simple file upload prompt which uses the $fileUpload service
* This directive is best used alongside the fileDropArea directive
* NOTE: This directive transcludes any contents. So use the inner tag area to define how the HTML looks
*
* @param {string} url The URL endpoint to upload to
* @param {boolean} [multiple=false] Whether to accept multiple files
*
* @example Prompt for a file
* <filekit-upload url="/some/url"></filekit-upload>
*
* @example Prompt for a file with custom styling
* <filekit-upload url="/some/url">
*     Click here to upload a file
* </filekit-upload>
*/
angular
	.module('app')
	.component('filekitUpload', {
		bindings: {
			url: '@',
			multiple: '<?',
		},
		controller: function($element, $filekit) {
			var $ctrl = this;

			$ctrl.selectFile = ()=> $element.find('input[type=file]').trigger('click');

			$element
				.find('input[type=file]')
				.on('change', function(e) { // Attach to file widget and listen for change events so we can auto-upload files
					$filekit.upload($ctrl.url, this.files);
				})
		},
		transclude: true,
		template: `
			<a ng-click="$ctrl.selectFile()" class="hidden-print">
				<ng-transclude>
					Select files to upload...
				</ng-transclude>
			</a>
			<div style="display: none"><input type="file" name="file" multiple="{{!!$ctrl.multiple}}"/></div>
		`,
	})