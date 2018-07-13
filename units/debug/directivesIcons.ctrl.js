angular
	.module('app')
	.run($router => $router.when('/debug/directives/icons').component('debugDirectivesIcons'))
	.component('debugDirectivesIcons', {
		controller: function($http, $loader, $q, $scope, $timeout, $toast) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.icons;
			$ctrl.refresh = ()=>
				$q.resolve()
					.then(()=> $loader.start($scope.$id))
					.then(()=> $http.get('/webfonts/fa.json'))
					.then(res => $ctrl.icons = res.data)
					.catch($toast.catch)
					.finally(()=> $loader.stop($scope.$id))
			// }}}

			$scope.$evalAsync($ctrl.refresh);
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Debugging</a></li>
				<li><a href="#/debug/directives">Directives</a></li>
				<li><a href="#/debug/directives/icons">icons</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">Icons</h3>
					</div>
					<div class="panel-body">
						<p>Simple font-awesome icon importer.</p>
						<p>Use icons by specifying the class <code>fa</code> (bold), <code>far</code> (regular weight) or <code>fal</code> (light weight) with a single icon class.</p>
						<p><code>&lt;i class="fa fa-lemon"&gt;&lt;/i&gt;</code></p>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">Icons</h3>
					</div>
					<div class="panel-body form-horizontal btn-group-folders">
						<div ng-repeat="icon in $ctrl.icons track by icon.id" class="col-sm-4 col-lg-3">
							<a class="btn btn-block media">
								<div class="media-left">
									<span class="icon-wrap icon-wrap-sm icon-circle bg-primary">
										<i class="fa-fw fa-2x" ng-class="icon.class"></i>
									</span>
								</div>
								<div class="media-body">
									<h2>{{icon.id}}</h2>
								</div>
							</a>
						</div>
					</div>
				</div>
			</div>
		`,
	});
