angular
	.module('app')
	.run($router => $router.when('/debug/directives/reveal').component('debugDirectivesReveal'))
	.component('debugDirectivesReveal', {
		controller: function($timeout) {
			var $ctrl = this;

			$ctrl.isRevealed = {};
			$ctrl.triggerReveal = id => {
				console.log('REVEAL', id);
				$ctrl.isRevealed[id] = true;
				$timeout(()=> $ctrl.isRevealed[id] = 'idle', 500);
			};
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Debugging</a></li>
				<li><a href="#/debug/directives">Directives</a></li>
				<li><a href="#/debug/directives/reveal">reveal</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">reveal directive</h3>
					</div>
					<div class="panel-body">
						<p>A directive that can be attached to any element to run a function when the element becomes visible or hidden on the screen.</p>
						<p>This can be used to defer loading of data unless its needed - for example in infinite scrolling displays.</p>
						<p><code>&lt;element reveal="functionToRun()"&gt;&lt;/element&gt;</code></p>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">Demo</h3>
					</div>
					<div class="panel-body form-horizontal">
						<div ng-repeat="n in [].constructor(50) track by $index" class="form-group">
							<label class="col-sm-3 control-label">Item {{$index}}</label>
							<div class="col-sm-9">
								<a
									reveal="$ctrl.triggerReveal($index)"
									class="btn"
									ng-class="
										$ctrl.isRevealed[$index] == 'idle' ? 'btn-default'
										: $ctrl.isRevealed[$index] == true ? 'btn-success'
										: 'btn-danger'
									"
								>
									Reveal element {{$index}}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
