angular
	.module('app')
	.run($router => $router.when('/debug/directives/shortcut').component('debugDirectivesShortcut'))
	.component('debugDirectivesShortcut', {
		controller: function($timeout) {
			var $ctrl = this;

			$ctrl.buttonClicked = {};
			$ctrl.buttonClick = id => {
				$ctrl.buttonClicked[id] = true;
				$timeout(()=> $ctrl.buttonClicked[id] = false, 500);
			};

			$ctrl.keyCaptureInput;
			$ctrl.keyCapture = event => {
				$ctrl.keyCaptureInput = event.originalEvent.key;
				$ctrl.buttonClicked.capture = true;
				$timeout(()=> $ctrl.buttonClicked.capture = false, 500);
			};
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Debugging</a></li>
				<li><a href="#/debug/directives">Directives</a></li>
				<li><a href="#/debug/directives/shortcut">shortcut</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">shortcut directive</h3>
					</div>
					<div class="panel-body">
						<p>A directive that can be attached to any element to run bind keyboard shortcuts.</p>
						<p>When the user presses the corresponding key or key combination a click event (configurable) is fired.</p>
						<p><code>&lt;element shortcut="ctrl+s"&gt;&lt;/element&gt;</code></p>
					</div>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">Demo</h3>
					</div>
					<div class="panel-body form-horizontal">
						<div class="form-group">
							<label class="col-sm-3 control-label">Generic key capture</label>
							<div class="col-sm-9">
								<a shortcut="ALL" shortcut-function="$ctrl.keyCapture(event)" class="btn" ng-class="$ctrl.buttonClicked.capture ? 'btn-danger' : 'btn-success'">
									{{$ctrl.keyCaptureInput || 'Nothing pressed'}}
								</a>
							</div>
						</div>
						<div class="form-group">
							<label class="col-sm-3 control-label">Press "Q", "W", "E", "R", "T", "Y"</label>
							<div class="col-sm-9">
								<a shortcut="q" ng-click="$ctrl.buttonClick('q')" class="btn" ng-class="$ctrl.buttonClicked.q ? 'btn-danger' : 'btn-success'">Q</a>
								<a shortcut="w" ng-click="$ctrl.buttonClick('w')" class="btn" ng-class="$ctrl.buttonClicked.w ? 'btn-danger' : 'btn-success'">W</a>
								<a shortcut="e" ng-click="$ctrl.buttonClick('e')" class="btn" ng-class="$ctrl.buttonClicked.e ? 'btn-danger' : 'btn-success'">E</a>
								<a shortcut="r" ng-click="$ctrl.buttonClick('r')" class="btn" ng-class="$ctrl.buttonClicked.r ? 'btn-danger' : 'btn-success'">R</a>
								<a shortcut="t" ng-click="$ctrl.buttonClick('t')" class="btn" ng-class="$ctrl.buttonClicked.t ? 'btn-danger' : 'btn-success'">T</a>
								<a shortcut="y" ng-click="$ctrl.buttonClick('y')" class="btn" ng-class="$ctrl.buttonClicked.y ? 'btn-danger' : 'btn-success'">Y</a>
							</div>
						</div>
						<div class="form-group">
							<label class="col-sm-3 control-label">Press the arrow keys</label>
							<div class="col-sm-9">
								<a shortcut="up" ng-click="$ctrl.buttonClick('up')" class="btn" ng-class="$ctrl.buttonClicked.up ? 'btn-danger' : 'btn-success'"><i class="fa fa-arrow-up"></i></a>
								<a shortcut="down" ng-click="$ctrl.buttonClick('down')" class="btn" ng-class="$ctrl.buttonClicked.down ? 'btn-danger' : 'btn-success'"><i class="fa fa-arrow-down"></i></a>
								<a shortcut="left" ng-click="$ctrl.buttonClick('left')" class="btn" ng-class="$ctrl.buttonClicked.left ? 'btn-danger' : 'btn-success'"><i class="fa fa-arrow-left"></i></a>
								<a shortcut="right" ng-click="$ctrl.buttonClick('right')" class="btn" ng-class="$ctrl.buttonClicked.right ? 'btn-danger' : 'btn-success'"><i class="fa fa-arrow-right"></i></a>
							</div>
						</div>
						<div class="form-group">
							<label class="col-sm-3 control-label">Press Bucky keys</label>
							<div class="col-sm-9">
								<a shortcut="ctrl+s" ng-click="$ctrl.buttonClick('ctrlS')" class="btn" ng-class="$ctrl.buttonClicked.ctrlS ? 'btn-danger' : 'btn-success'">Ctrl + S</a>
								<a shortcut="ctrl+w" ng-click="$ctrl.buttonClick('ctrlW')" class="btn" ng-class="$ctrl.buttonClicked.ctrlW ? 'btn-danger' : 'btn-success'">Ctrl + W</a>
								<a shortcut="ctrl+p" ng-click="$ctrl.buttonClick('ctrlP')" class="btn" ng-class="$ctrl.buttonClicked.ctrlP ? 'btn-danger' : 'btn-success'">Ctrl + P</a>
								<a shortcut="shift+l" ng-click="$ctrl.buttonClick('shiftL')" class="btn" ng-class="$ctrl.buttonClicked.shiftL ? 'btn-danger' : 'btn-success'">Shift + L</a>
								<a shortcut="ctrl+l" ng-click="$ctrl.buttonClick('ctrlL')" class="btn" ng-class="$ctrl.buttonClicked.ctrlL ? 'btn-danger' : 'btn-success'">Ctrl + L</a>
								<a shortcut="ctrl+alt+shift+e" ng-click="$ctrl.buttonClick('e')" class="btn" ng-class="$ctrl.buttonClicked.e ? 'btn-danger' : 'btn-success'">Ctrl + Alt + Shift + E</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
