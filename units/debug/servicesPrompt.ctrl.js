angular
	.module('app')
	.run($router => $router.when('/debug/services/prompt').component('debugServicesPromptCtrl'))
	.component('debugServicesPromptCtrl', {
		controller: function($prompt) {
			var $ctrl = this;
			$ctrl.$prompt = $prompt;
		},
		template: `
			<ol class="breadcrumb">
				<li><a href="#/debug">Admin</a></li>
				<li><a href="#/debug/services">Services</a></li>
				<li><a href="#/debug/services/prompt">$prompt</a></li>
			</ol>
			<div id="page-content">
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">$prompt</h3>
					</div>
					<div class="list-group">
						<a class="list-group-item" ng-click="$ctrl.$prompt.alert('Hello World')">$prompt.alert("Hello World")</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.confirm({content: 'This is a question'})">$prompt.confirm({content: "This is a question"})</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.text({title: 'What is your name', default: 'Joe Random'})">$prompt.text({title: 'What is your name', default: 'Joe Random'})</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.list({list: ['Foo', 'Bar', 'Baz'], default: 1})">$prompt.list({list: ['Foo', 'Bar', 'Baz'], default: 1})</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.list({list: [{id: 'foo', title: 'Foo'}, {id: 'bar', title: 'Bar'}, {id: 'baz', title: 'Baz'}], default: 1})">$prompt.list({list: Collection,  default: 1})</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.list({list: ['Foo', 'Bar', 'Baz'], multiple: true, default: 1})">$prompt.list({list: ['Foo', 'Bar', 'Baz'], multiple: true, default: 1})</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.macgyver([
							{id: 'demoText', type: 'mgText', title: 'Text'},
							{id: 'demoTextArea', type: 'mgTextArea', title: 'Textarea'},
							{id: 'demoNumber', type: 'mgNumber', title: 'Number'},
						])">$prompt.macgyver(example-form)</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.macgyver({form: [{id: 'content', type: 'mgWysiwyg', showTitle: false}]})">$prompt.macgyver(WYSIWYG)</a>
						<a class="list-group-item" ng-click="$ctrl.$prompt.alert('One'); $ctrl.$prompt.alert('Two'); $ctrl.$prompt.alert('Three')">$prompt.alert() x 3</a>
					</div>
				</div>
			</div>
		`,
	});
