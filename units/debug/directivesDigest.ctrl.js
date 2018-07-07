angular
	.module('app')
	.run($router => $router.when('/debug/directives/digest').component('debugDirectivesDigest'))
	.component('debugDirectivesDigest', {
		controller: function($timeout) {
			var $ctrl = this;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Debugging</a></li>
				<li><a href="#/debug/directives">Directives</a></li>
				<li><a href="#/debug/directives/digest">digest</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">digest directive</h3>
					</div>
					<div class="panel-body">
						<p>A element level directive that can pull in a simple single-key data feed from a URL or collection / model combo.</p>
						<p>Digest uses lazy loading and only actually triggers its data fetching when the element is visible on the screen.</p>
						<p><code>&lt;digest url="/api/users/count" key="count"&gt;&lt;/digest&gt;</code></p>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">Demo</h3>
					</div>
					<div class="panel-body form-horizontal">
						<div class="form-group">
							<label class="col-sm-3 control-label">Fetch a single value</label>
							<div class="col-sm-9 form-control-static">
								<digest url="/api/worklots/count" key="count" class="badge badge-primary"></digest>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
