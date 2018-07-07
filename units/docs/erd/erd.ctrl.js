angular
	.module('app')
	.run($router => $router.when('/docs/erd').component('docsERDCtrl'))
	.component('docsERDCtrl', {
		controller: function($loader, $http, $scope, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.refresh = function() {
				$loader.startBackground($scope.$id);
				$http.get('/api/docs/erd/erd.txt')
					.then(res => $ctrl.schema = res.data)
					.catch($toast.catch)
					.finally(()=> $loader.stop($scope.$id));
			};
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
		template: `
			<div class="container">
				<div class="panel panel-default">
					<div class="panel-heading"><h2>ERD Diagram</h2></div>
					<div class="panel-body">
						<ul class="nav nav-tabs">
							<li class="active"><a data-target="#erd" data-toggle="tab">Diagram</a></li>
							<li><a data-target="#markdown" data-toggle="tab">UML Schema</a></li>
							<li class="pull-right"><a ng-click="$ctrl.refresh"><i class="fa fa-sync"></i></a></li>
						</ul>
						<div class="tab-content" style="overflow: auto">
							<div class="tab-pane active" id="erd">
								<img src="/api/docs/erd/erd.svg"/>
							</div>
							<div class="tab-pane" id="markdown">
								<pre>{{$ctrl.schema}}</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
