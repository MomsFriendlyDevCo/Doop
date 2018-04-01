/**
* File upload drop area which uses the $filekit upload service
*
* @param {string} [element] The jQuery element to bind to, if omitted the document body is used (be careful to only use one of these elements on a page if the body is the drop area)
* @param {string} url URL endpoint to upload to
*
* @example Create a drop area which automatically uploads when the user drops a file on the page
* <filekit-drop-area url="/some/url"></filekit-drop-area>
*/
angular
	.module('app')
	.component('filekitDropArea', {
		bindings: {
			element: '@',
			url: '@',
		},
		controller: function($element, $filekit, $scope, $timeout) {
			var $ctrl = this;

			$ctrl.dropAreaTimer;
			$ctrl.showDropArea = show => {
				// Since the dragover event is a bit slow we have to wait for a timeout before we are allowed to remove the droparea indicator
				var dropArea = $element.children('.droparea');
				if (show) {
					$timeout.cancel($ctrl.dropAreaTimer);
					dropArea.show();
				} else {
					$ctrl.dropAreaTimer = $timeout(()=> dropArea.hide(), 250);
				}
			};

			$ctrl.$onInit = ()=> {
				var boundElem = angular.element($ctrl.element || 'body');

				// Show and hide the drop prompt when the user drags files over the bound element
				boundElem[0].addEventListener('dragover', e => $ctrl.showDropArea(true), false);
				boundElem[0].addEventListener('dragleave', e => $ctrl.showDropArea(false), false);

				$element.children('.droparea')
					.on('dragover', e => e.preventDefault()) // We have to trap the dragover event of the handler or the 'drop' event wont fire (see https://stackoverflow.com/a/27482540)
					.on('drop', e => {
						e.stopPropagation();
						e.preventDefault();
						$filekit.upload($ctrl.url, e.originalEvent.dataTransfer.files);
						$ctrl.showDropArea(false);
					});
			};
		},
		template: `
			<div class="droparea" style="display: none">
				<div class="vcenter-outer">
					<div class="vcenter-inner text-center">
						Drop files to upload
					</div>
				</div>
			</div>
		`,
	})