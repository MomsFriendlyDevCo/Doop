/**
* Display a list of files available from a back-end URL
* [EMU](https://github.com/hash-bang/express-middleware-upload) is recommended as a backend
*
* @param {string} url The backend URL to use to retrieve files
*
* @param {boolean} [canRename=false] Allow renaming of files [NOT YET SUPPORTED]
* @param {boolean} [canUpload=false] Allow upload of files [NOT YET SUPPORTED]
* @param {boolean} [canDelete=false] Allow delete of files [NOT YET SUPPORTED]
*
* @example Display a simple list of files
* <filekit-list url="/some/url"></filekit-list>
*/
angular
	.module('app')
	.component('filekitList', {
		bindings: {
			url: '@',
			canRename: '<?',
			canUpload: '<?',
			canDelete: '<?',
		},
		controller: function($filekit, $http, $loader, $q, $rootScope, $scope, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.refresh = ()=> {
				if (!$ctrl.url) return; // Not yet ready
				$ctrl.loaded = false;

				$q.resolve()
					.then(()=> $filekit.settings.eventEmitter('filekitTaskBegin', `${$scope.$id}-refresh`))
					.then(()=> $http.get($ctrl.url))
					.then(data => {
						if (!angular.isArray(data.data)) return $ctrl.error(`Response from URL ${$ctrl.url} was not an array`);
						$ctrl.files = data.data.map(file => {
							file.url = $ctrl.url + '/' + file.name;
							return file;
						});
					})
					.catch(err => $filekit.settings.errorHandler(err))
					.finally(()=> $filekit.settings.eventEmitter('filekitTaskEnd', `${$scope.$id}-refresh`))
					.finally(()=> $ctrl.loaded = true)
			};

			// An upload has finished elsewhere - update
			$rootScope.$on('filekitUploaded', ()=> $ctrl.refresh());
			$rootScope.$on('filekitUpdated', ()=> $ctrl.refresh());
			// }}}

			// File selection {{{
			$ctrl.filesSelected = [];
			$ctrl.updateSelected = ()=> {
				$ctrl.filesSelected = $ctrl.files.filter(f => f.selected);
			};
			// }}}

			// File operations {{{
			$ctrl.delete = file =>
				$q.resolve()
					.then(()=> $filekit.settings.eventEmitter('filekitTaskBegin', `${$scope.$id}-delete-${file.name}`))
					.then(()=> $http.delete(`${$ctrl.url}/${file.name}`))
					.then(()=> $filekit.settings.eventEmitter('filekitUpdated'))
					.catch(err => $filekit.settings.errorHandler(err))
					.finally(()=> $filekit.settings.eventEmitter('filekitTaskEnd', `${$scope.$id}-delete-${file.name}`))

			$ctrl.deleteSelected = ()=>
				$q.resolve()
					.then(()=> $filekit.settings.eventEmitter('filekitTaskBegin', `${$scope.$id}-delete-selected`))
					.then(()=> $q.all(
						$ctrl.filesSelected.map(f =>
							$http.delete(`${$ctrl.url}/${f.name}`)
						)
					))
					.then(()=> $filekit.settings.eventEmitter('filekitUpdated'))
					.catch(err => $filekit.settings.errorHandler(err))
					.finally(()=> $filekit.settings.eventEmitter('filekitTaskEnd', `${$scope.$id}-delete-selected`))

			$ctrl.rename = file =>
				$q.resolve()
					.then(()=> $filekit.settings.prompter({
						title: 'Rename file',
						body: `Rename the file '${file.name}'`,
						default: file.name,
					}))
					.then(newName => $http({
						method: 'MOVE',
						url: `${$ctrl.url}/${file.name}`,
						headers: {destination: `${$ctrl.url}/${newName}`},
					}))
					.then(()=> $filekit.settings.eventEmitter('filekitTaskBegin', `${$scope.$id}-rename-${file.name}`))
					.then(()=> $filekit.settings.eventEmitter('filekitUpdated'))
					.catch(err => $filekit.settings.errorHandler(err))
					.finally(()=> $filekit.settings.eventEmitter('filekitTaskEnd', `${$scope.$id}-rename-${file.name}`))
			// }}}

			$scope.$watch('$ctrl.url', $ctrl.refresh);
		},
		template: `
			<div ng-if="!$ctrl.loaded" class="text-center">
				<i class="fa fa-spinner fa-spin fa-lg"></i>
				Loading files...
			</div>
			<div ng-if="$ctrl.loaded && !$ctrl.files.length" class="alert alert-info m-20">
				No files have been uploaded
			</div>
			<table ng-if="$ctrl.loaded && $ctrl.files.length" class="table table-bordered table-striped table-hover">
				<thead>
					<tr>
						<th ng-if="$ctrl.canDelete" width="50px">&nbsp;</th>
						<th>Filename</th>
						<th class="text-center">Size</th>
						<th ng-if="$ctrl.canDelete" width="100px">&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					<tr ng-repeat="file in $ctrl.files track by file.name">
						<td ng-if="$ctrl.canDelete" class="text-center">
							<label class="btn-block">
								<input type="checkbox" ng-model="file.selected" ng-change="$ctrl.updateSelected()"/>
							</label>
						</td>
						<td>
							<a href="{{file.url}}">
								{{file.name}}
							</a>
						</td>
						<td class="text-center">
							<a href="{{file.url}}">
								<span class="badge badge-info">
									{{file.size | filesize}}
								</span>
							</a>
						</td>
						<td ng-if="$ctrl.canDelete" class="text-center">
							<div class="btn-group">
								<a ng-click="$ctrl.rename(file)" class="btn btn-xs btn-default" tooltip="Rename the file">
									<i class="fa fa-pencil"></i>
								</a>
								<a ng-click="$ctrl.delete(file)" class="btn btn-xs btn-danger" tooltip="Delete the file">
									<i class="fa fa-trash-o"></i>
								</a>
							</div>
						</td>
					</tr>
				</tbody>
				<tfoot ng-if="$ctrl.filesSelected.length">
					<tr>
						<td colspan="3" class="text-center">
							<div class="btn-group">
								<a class="btn btn-default">
									{{$ctrl.filesSelected.length | number}} files selected
								</a>
								<a ng-if="$ctrl.canDelete" ng-click="$ctrl.deleteSelected()" class="btn btn-danger">
									<i class="fa fa-trash"></i>
									Delete
								</a>
							</div>
						</td>
					</tr>
				</tfoot>
			</table>
		`,
	})