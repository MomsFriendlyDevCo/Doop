angular
	.module('app')
	.run($router => $router.when('/debug/directives/selectFrom').component('debugDirectivesSelectFrom'))
	.component('debugDirectivesSelectFrom', {
		controller: function($screen) {
			var $ctrl = this;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Debugging</a></li>
				<li><a href="#/debug/directives">Directives</a></li>
				<li><a href="#/debug/directives/selectFrom">selectFrom</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">selectFrom</h3>
					</div>
					<div class="panel-body form-horizontal">
						<div class="form-group">
							<label class="col-sm-3 control-label">Single selector</label>
							<div class="col-sm-9">
								<select-from
									url="/api/dropdowns/byName/designPackage"
								></select-from>
							</div>
						</div>
						<div class="form-group">
							<label class="col-sm-3 control-label">Mutliple selector</label>
							<div class="col-sm-9">
								<select-from
									url="/api/dropdowns/byName/designPackage"
									multiple="true"
								></select-from>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
