angular
	.module('app')
	.run($router => $router.when('/debug/server/git').component('debugServerGitCtrl'))
	.component('debugServerGitCtrl', {
		controller: function($config, $filter, $http, $loader, $q, $scope, $timeout, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.history;
			$ctrl.version;
			$ctrl.refresh = ()=>
				$q.resolve()
					.then(()=> $loader.start($scope.$id, $ctrl.version === undefined))
					.then(()=> $http.get('/api/debug/version'))
					.then(res => $ctrl.history = res.data.gitHistory.map(h => _.set(h, 'href', `${$config.git.url}/commit/${h.hash}`)))
					.then(()=> $loader.stop($scope.$id))
					.catch($toast.catch)
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

			$scope.$evalAsync(()=> $ctrl.refresh());
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/server">Server</a></li>
				<li><a href="#/debug/server/git">Git</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<div class="actions">
							<a ng-click="$ctrl.autoRefresh = !$ctrl.autoRefresh" class="btn btn-sm" ng-class="$ctrl.autoRefresh ? 'btn-primary' : 'btn-default'">
								Auto
							</a>
							<a ng-click="$ctrl.refresh()" class="btn btn-sm" ng-class="$ctrl.$loader.loading ? 'btn-warning' : 'btn-success'">
								<i class="fa fa-refresh" ng-class="$ctrl.$loader.loading && 'fa-spin'"></i>
							</a>
						</div>
						<h3 class="panel-title">Git history</h3>
					</div>
					<table class="table table-striped">
						<thead>
							<tr>
								<th class="text-center">Date</th>
								<th class="text-center">Release</th>
								<th class="text-center">Hash</th>
								<th>Author</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							<tr ng-repeat="row in $ctrl.history" ng-class="$index == 0 && 'info'">
								<td class="text-center">
									<a href="{{row.href}}" target="_blank">
										<date date="row.date"></date>
									</a>
								</td>
								<td class="text-center">
									<a href="{{row.href}}" target="_blank">
										<span class="badge badge-success">{{row.release}}</span>
									</a>
								</td>
								<td class="text-center">
									<a href="{{row.href}}" target="_blank">
										<code>{{row.shortHash}}</code>
									</a>
								</td>
								<td>
									<a href="{{row.href}}" target="_blank">
										{{row.committer}}
									</a>
								</td>
								<td>
									<a href="{{row.href}}" target="_blank">
										{{row.subject}}
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		`,
	});
