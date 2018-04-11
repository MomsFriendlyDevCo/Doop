/**
* Generic routing helper that automatically creates a folder display based on the requeted (and not present) routing path
* For example, if requesting `/foo` and nothing matches that rule, but it does have children in the sitemap those children will be displayed in folder form
*/

angular
	.module('app')
	.run(($q, $router, $sitemap, TreeTools) => $router.rule()
		.priority('low')
		.title('Select area')
		.requires(path => $q((resolve, reject) => { // Check that this path is valid within the sitemap
			$sitemap.get()
				.then(map => {
					var branch = TreeTools.find($sitemap.map, {href: `#${path}`});
					if (branch && branch.children && branch.children.length) {
						resolve();
					} else {
						reject();
					}
				})
		}))
		.component('folderLayoutCtrl')
	)
	.component('folderLayoutCtrl', {
		controller: function($rootScope, $router, $sitemap, TreeTools) {
			var $ctrl = this;

			// Data refresher {{{
			$ctrl.refresh = ()=> {
				$ctrl.branch = TreeTools.find($sitemap.map, {href: `#${$router.path}`});
			};
			// }}}

			$rootScope.$on('$routerSuccess', ()=> $ctrl.refresh());
		},
		template: `
			<div id="page-title">
				<h1 class="page-header text-overflow">{{$ctrl.branch.title}}</h1>
			</div>
			<div id="page-content">
				<div class="row">
					<a ng-repeat="folder in $ctrl.branch.children" href="{{folder.href}}" class="col-sm-6 col-lg-4">
						<div class="panel panel-clip-sm media pad-all">
							<div class="media-left">
								<span class="icon-wrap icon-wrap-sm icon-circle bg-primary">
									<i class="fa fa-folder fa-2x"></i>
								</span>
							</div>

							<div class="media-body">
								<p class="h2 mar-no text-thin">{{folder.title}}</p>
							</div>
						</div>
					</a>
				</div>
			</div>
		`,
	});
