angular
	.module('app')
	.run($router => $router.when('/debug/server/indexer').component('debugServerIndexerCtrl'))
	.component('debugServerIndexerCtrl', {
		controller: function($loader, $http, $q, $scope, $timeout, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.indexers;
			$ctrl.refresh = ()=>
				$q.resolve()
					.then(()=> $loader.start($scope.$id, $ctrl.indexers === undefined))
					.then(()=> $http.get('/api/indexers'))
					.then(res => $ctrl.indexers = res.data)
					.catch($toast.catch)
					.finally(()=> $loader.stop($scope.$id))
			// }}}

			// Auto-refresh functionality {{{
			$ctrl.refreshTimer;
			$ctrl.autoRefresh = false;
			$ctrl.autoRefreshWorker = ()=> {
				$timeout.cancel($ctrl.refreshTimer);
				$ctrl.refreshTimer = $timeout(()=> $ctrl.refresh().then(()=> $ctrl.autoRefreshWorker()), 1000);
			};

			$scope.$watch('$ctrl.autoRefresh', ()=> {
				$timeout.cancel($ctrl.refreshTimer);
				if ($ctrl.autoRefresh) $ctrl.autoRefreshWorker();
			});
			// }}}

			// Regenerate {{{
			$ctrl.regenerate = id =>
				$q.resolve()
					.then(()=> $toast.progress(id, `Regenerating "${id}"`))
					.then(()=> $http.get(`/api/indexers/${id}/regenerate`))
					.then(()=> { $ctrl.refresh() }) // Start refresh in background
					.catch($toast.catch)
					.finally(()=> $toast.progress(id, `Regenerated "${id}"`, 100))
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/indexer">Indexer</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<div class="panel-control">
							<a ng-click="$ctrl.autoRefresh = !$ctrl.autoRefresh" class="btn btn-sm" ng-class="$ctrl.autoRefresh ? 'btn-primary' : 'btn-default'">
								Auto
							</a>
							<a ng-click="$ctrl.refresh()" class="btn btn-sm" ng-class="$ctrl.$loader.loading ? 'btn-warning' : 'btn-success'">
								<i class="fa fa-sync" ng-class="$ctrl.$loader.loading && 'fa-spin'"></i>
							</a>
						</div>
						<h3 class="panel-title">Indexer</h3>
					</div>
					<table ng-if="$ctrl.indexers.length" count="$ctrl.indexers.length" sticky-thead sticky-tfoot class="table table-striped table-hover">
						<thead>
							<tr>
								<th>Indexer</th>
								<th class="text-center">Size</th>
								<th>Timing</th>
								<th>Last updated</th>
								<th>Expiry</th>
								<th width="100px">&nbsp;</th>
							</tr>
						</thead>
						<tbody>
							<tr ng-repeat="indexer in $ctrl.indexers track by indexer.id">
								<td>{{indexer.id}}</td>
								<td class="text-center"><digest
									ng-if="indexer.timing"
									url="/api/indexers/{{indexer.id}}/size"
									key="size"
									format="filesize"
									class-valid="badge badge-info"
									class-invalid="hide"
								></digest></td>
								<td>{{indexer.timingString}}</td>
								<td><date date="indexer.created"></date></td>
								<td><date date="indexer.expiry"></date></td>
								<td class="text-center">
									<div class="btn-group">
										<a class="dropdown-toggle btn btn-sm btn-icon btn-default fa fa-ellipsis-v" data-toggle="dropdown"></a>
										<ul class="dropdown-menu pull-right">
											<li><a ng-click="$ctrl.regenerate(indexer.id)"><i class="fa fa-sync"></i> Regenerate</a></li>
											<li><a target="_blank" href="/api/indexers/{{indexer.id}}"><i class="fa fa-file"></i> Show raw output</a></li>
										</ul>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		`,
	});
