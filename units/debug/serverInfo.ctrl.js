angular
	.module('app')
	.run($router => $router.when('/debug/server/info').component('debugServerInfoCtrl'))
	.component('debugServerInfoCtrl', {
		controller: function($http, $loader, $q, $scope, $timeout, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.live;
			$ctrl.refresh = ()=>
				$q.resolve()
					.then(()=> $loader.start($scope.$id, $ctrl.live === undefined))
					.then(()=> $http.get('/api/debug/live'))
					.then(res => $ctrl.live = res.data)
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
				<li><a href="#/debug/server/info">Info</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<div class="panel-control">
							<a ng-click="$ctrl.autoRefresh = !$ctrl.autoRefresh" class="btn btn-sm" ng-class="$ctrl.autoRefresh ? 'btn-primary' : 'btn-default'">
								Auto
							</a>
							<a ng-click="$ctrl.refresh()" class="btn btn-sm" ng-class="$ctrl.$loader.loading ? 'btn-warning' : 'btn-success'">
								<i class="fa fa-refresh" ng-class="$ctrl.$loader.loading && 'fa-spin'"></i>
							</a>
						</div>
						<h3 class="panel-title">Server data</h3>
					</div>
					<div class="panel-body">
						<pre>{{$ctrl.live | json}}</pre>
					</div>
				</div>
			</div>
		`,
	});
