angular
	.module('app')
	.run($router => $router.when('/debug/services/tts').component('debugServicesTtsCtrl'))
	.component('debugServicesTtsCtrl', {
		controller: function($tts) {
			var $ctrl = this;
			$ctrl.$tts = $tts;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/tts">$tts</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$tts</h3>
					</div>
					<div class="panel-body">
						<div class="form-horizontal">
							<div class="form-group">
								<label class="col-sm-3 control-label">Recommended Voice</label>
								<div class="col-sm-9 form-control-static">{{$ctrl.$tts.recommendedVoice.name}}</div>
							</div>
							<div class="form-group">
								<label class="col-sm-3 control-label">Current Voice</label>
								<div class="col-sm-9">
									<ui-select ng-model="$ctrl.$tts.voice" title="Choose a voice...">
										<ui-select-match placeholder="Select a voice...">{{$select.selected.name}}</ui-select-match>
										<ui-select-choices repeat="voice in $ctrl.$tts.voices | filter:$select.search">
											<div ng-bind-html="voice.name | highlight:$select.search"></div>
										</ui-select-choices>
									</ui-select>
								</div>
							</div>
						</div>
					</div>
					<div class="list-group">
						<a class="list-group-item" ng-click="$ctrl.$tts.say('Hello World')">$tts.say('Hello World')</a>
						<a class="list-group-item" ng-click="$ctrl.$tts.say('The quick brown fox jumps over the lazy dog')">$tts.say('The quick brown fox jumps over the lazy dog')</a>
						<a class="list-group-item" ng-click="$ctrl.$tts.say('The wizard quickly jinxed the gnomes before they vaporized')">$tts.say('The wizard quickly jinxed the gnomes before they vaporized')</a>
						<a class="list-group-item" ng-click="$ctrl.$tts.say('Five or six big jet planes zoomed quickly by the new tower')">$tts.say('Five or six big jet planes zoomed quickly by the new tower')</a>
					</div>
				</div>
			</div>
		`,
	});
