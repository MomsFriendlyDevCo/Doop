/**
* Bootstrap styled file uploader
*
* e.g.
*
*	<file-upload></file-upload>
*
*/
angular
	.module('app')
	.component('fileUpload', {
		scope: {},
		restrict: 'E',
		controller: function($scope, $element) {
			$scope.text = 'Select file...';

			$scope.click = function() {
				$element.find('input[type=file]').trigger('click');
			};

			$scope.setFile = function(name) {
				$scope.text = name;
				$scope.$emit('fileUploadChange', name);
			};

			$element
				.find('input[type=file]')
				.on('change', function() {
					var my = $(this);
					$scope.$apply(function() {
						$scope.setFile(my.val().replace(/\\/g,'/').replace( /.*\//,''));
					});
				});
		},
		template: `
			<div style="display: none"><input type="file" name="file"/></div>
			<a ng-click="click(this)" class="btn btn-primary">
				<i class="fa fa-file"></i>
				{{text}}
			</a>
		`,
	})
