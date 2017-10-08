angular
	.module('app')
	.factory('$prompt', function($interpolate, $q, $rootScope, $sce) {
		var $prompt = {
			/**
			* Display a dialog with various customisations
			* This is the main $prompt worker - all the below helper functions are really just remappings of this function
			* @param {Object} options Dialog options to use
			* @param {string} [options.title='Dialog'] The dialog title
			* @param {string} [options.body='Body text'] The dialog body (usually the message to display)
			* @param {boolean} [options.isHtml=false] Whether the dialog body should be rendered as HTML (must be $sce compilable)
			* @param {string} [options.bodyFooter] Additional HTML to render under the main body area (this is always HTML rendered)
			* @param {Object} [options.scope] Scope to use when interpolating HTML (if isHtml is truthy)
			* @param {string} [options.dialogClose='reject'] How to handle the promise state if the dialog is closed. ENUM: 'resolve', 'reject', 'nothing'
			* @param {boolean} [options.backdrop=true] Whether to display a dimmed backdrop when drawing the dialog
			* @param {boolean} [options.keyboard=true] Close the dialog when the escape key is pressed. Uses dialogClose to work out what to do
			*
			* @param {array} [options.buttons=OK] Buttons to display (the promise will be resolved with the clicked button.id)
			* @param {string} [options.buttons.*.id] The ID of the button to resolve the promise with
			* @param {string} [options.buttons.*.title] The text to display on the button
			* @param {string} [options.buttons.*.class='btn btn-success'] The button class to apply (default is 'btn btn-success' for buttons that resolve, 'btn btn-danger' for ones that reject and 'btn btn-default' otherwise)
			* @param {string} [options.buttons.*.method='resolve'] How to close the promise. ENUM: 'resolve', 'reject'. False or null will casuse click to only close the dialog
			* @param {function} [options.buttons.*.click] Function to run when the button is clicked, this will be automatically formed from 'method' if present. Call $prompt.close() to terminate the dialog
			*
			* @param {function} [options.onShow] Function to execute when the dialog is being shown
			* @param {function} [options.onShown] Function to execute when the dialog is ready
			* @param {function} [options.onHide] Function to execute when the dialog is hiding
			* @param {function} [options.onHidden] Function to execute when the dialog is completely hidden
			*
			* @return {Promise} Promise that is triggered when the dialog closes. The responses are determined by the button methods as well as dialogClose
			* @emits $prompt.open Message to PromptHelper component to display the dialog
			*/
			dialog: function(options) {
				// If we're already showing a dialog - defer showing the next dialog until this one has finished {{{
				if ($prompt.$settings) {
					options.$promise = $q.defer();
					$prompt.$dialogQueue.push(options)
					return options.$promise;
				}
				// }}}

				// Setup defaults {{{
				$prompt.$settings = _.defaults(options, {
					title: 'Dialog',
					body: 'Body text',
					isHtml: false,
					keyboard: true,
					backdrop: true,
					bodyFooter: undefined,
					scope: undefined,
					dialogClose: 'reject',
					buttons: [{
						id: 'close',
						title: 'Close',
						method: 'resolve',
					}],
					$promise: $q.defer(),
				});
				// }}}

				// Attach to promise to add a status property (why $q doesnt have this is beyond me - MC) {{{
				$prompt.$settings.$promise.state = 'pending';
				$prompt.$settings.$promise.promise.then(
					()=> $prompt.$settings.$promise.state = 'resolved',
					()=> $prompt.$settings.$promise.state = 'rejected'
				);
				// }}}

				// Setup dialogClose {{{
				if (!$prompt.$settings.$dialogClose) {
					if (angular.isUndefined($prompt.$settings.dialogClose) || $prompt.$settings.dialogClose == 'resolve') {
						$prompt.$settings.$dialogClose = ()=> {
							$prompt.$settings.$promise.resolve();
							$prompt.close();
						};
					} else if ($prompt.$settings.dialogClose == 'reject') {
						$prompt.$settings.$dialogClose = ()=> {
							$prompt.$settings.$promise.reject();
							$prompt.close();
						};
					}
				}
				// }}}

				// Setup buttons {{{
				$prompt.$settings.buttons = $prompt.$settings.buttons.map(b => {
					if (!b.click) b.click = ()=> { // Compute a click event from the method
						if (angular.isUndefined(b.method) || b.method == 'resolve') {
							$prompt.$settings.$promise.resolve(b.id);
							$prompt.close();
						} else if (b.method == 'reject') {
							$prompt.$settings.$promise.reject(b.id);
							$prompt.close();
						}

						$prompt.close();
					};

					if (!b.class) {
						if (b.method == 'resolve') {
							b.class = 'btn btn-success';
						} else if (b.method = 'reject') {
							b.class = 'btn btn-danger';
						} else {
							b.class = 'btn btn-default';
						}
					}

					return b;
				});
				// }}}

				// Setup body (if HTML) {{{
				if ($prompt.$settings.isHtml) $prompt.$settings.$body = $sce.trustAsHtml($interpolate($prompt.$settings.body)($prompt.$settings.scope));
				if ($prompt.$settings.bodyFooter) $prompt.$settings.$bodyFooter = $sce.trustAsHtml($interpolate($prompt.$settings.bodyFooter)($prompt.$settings.scope));
				// }}}

				// Open the dialog (via Bootstrap) {{{
				$rootScope.$broadcast('$prompt.open');
				// }}}

				return $prompt.$settings.$promise;
			},


			/**
			* Current holder for dialog options
			* This is usually a 1:1 mapping for the dialog options
			* @see dialog()
			* @var {Object}
			* @param {Promise} $promise The promise object for the current dialog
			* @param {string} $promise.state Tracking of the promise status. ENUM: 'pending', 'resolved', 'rejected'
			* @param {Object} $body The $sce compiled version of the dialog body if isHtml is truthy
			* @param {Object} $bodyFooter The $sce compiled version of bodyFooter
			* @param {function} $dialogClose Binding for dialogClose
			* @param {string} $status The status of the dialog. ENUM: 'showing', 'shown', 'hiding', 'hidden'
			*/
			$settings: undefined,


			/**
			* Close the dialog if open
			* This may trigger another dialog to open if one is queued
			* NOTE: This does not resolve the dialog promise
			* @emits $prompt.close Message to the promptHelper that it should close the dialog
			*/
			close: function() {
				$rootScope.$broadcast('$prompt.close');
			},


			/**
			* Display a general alert dialog
			* This function inherits all properties from dialog() but sets various sane defaults suitable for a simple message
			* @see $prompt.dialog()
			* @param {Object|string} options Either an options object or the body text of the alert
			* @param {string} [options.title='Alert'] The title of the alert
			* @param {string} [options.body='Be alerted'] The body of the alert message
			* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
			*/
			alert: function(options) {
				if (angular.isString(options)) options = {title: options};
				return $prompt.dialog(_.defaults(options, {
					title: 'Alert',
					body: 'Be alerted',
					dialogClose: 'resolve', // Alerts dont ever reject
					buttons: [{
						id: 'close',
						title: 'Close',
						method: 'resolve',
					}],
				}));
			},


			/**
			* Prompt with confirm / cancel buttons
			* This function inherits all properties from dialog() but sets various sane defaults suitable for a confirmation prompt
			* @see $prompt.dialog()
			* @param {Object|string} options Either an options object or the body text of the confirmation
			* @param {string} [options.title='Confirm action'] The title of the dialog
			* @param {string} [options.body='Are you sure you want to do this?'] The body of the dialog
			* @param {array} [options.buttons=Confirm + Cancel]
			* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
			*/
			confirm: function(options) {
				if (angular.isString(options)) options = {body: options};
				return $prompt.dialog(_.defaults(options, {
					title: 'Confirm action',
					body: 'Are you sure you want to do this?',
					dialogClose: 'reject', // Reject if the user had second thoughts
					buttons: [
						{
							id: 'cancel',
							title: 'Cancel',
							method: 'reject',
							class: 'btn btn-danger',
							icon: 'fa fa-times',
						},
						{
							id: 'confirm',
							title: 'Confirm',
							method: 'resolve',
							class: 'btn btn-success',
							icon: 'fa fa-check',
						},
					],
				}));
			},


			/**
			* Prompt for text input
			* This function inherits all properties from dialog() but sets various sane defaults for a text prompt
			* @see $prompt.dialog()
			* @param {Object|string} options Either an options object or the body text of prompt
			* @param {string} [options.title='Input required'] The title of the dialog
			* @param {string} [options.body=''] The body of the dialog
			* @param {array} [options.buttons=Ok]
			*
			* @param {string} [options.default] Text prompt specific option to specify the default answer
			* @param {string} [options.placeholder] Text prompt specific option to specify the textbox placeholder
			* @param {boolean} [options.allowBlank=false] Allow blank input (if this is true and the answer is blank the promise is rejected)
			*
			* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
			*/
			text: function(options) {
				if (angular.isString(options)) options = {body: options};
				return $prompt.dialog(_.defaults(options, {
					title: 'Input required',
					body: '',
					bodyFooter: `
						<div class="container-fluid text-center">
							<form action="" class="form-horizontal">
								<div class="form-group text-center">
									<input type="text" class="form-control" value="${options.default || ''}" placeholder="${options.placeholder || ''}" autofocus/>
								</div>
							</form>
						</div>
					`,
					dialogClose: 'reject', // Reject if the user had second thoughts
					buttons: [
						{
							id: 'cancel',
							title: 'Cancel',
							method: 'reject',
							class: 'btn btn-danger',
							icon: 'fa fa-times',
						},
						{
							id: 'confirm',
							title: 'Confirm',
							method: 'resolve',
							class: 'btn btn-success',
							icon: 'fa fa-check',
						},
					],
					onShown: ()=> {
						// Auto-focus autofocus items
						angular.element('#modal-_prompt input[autofocus]')
							.each(function() {
								this.selectionEnd = this.selectionStart = this.value.length;
							})
							.focus();

						// Bind form submission to also accept the form
						angular.element('#modal-_prompt form').one('submit', e => {
							e.stopPropagation();
							$prompt.$settings.buttons.filter(b => b.id == 'confirm')[0].click();
						});
					},
					onHide: () => {
						var gotVal = angular.element('#modal-_prompt input.form-control').val();
						if (!gotVal && !$prompt.$settings.allowBlank) return $prompt.$settings.$promise.reject();
						$prompt.$settings.$promise.resolve(gotVal);
					},
				}));
			},


			/**
			* Dialogs queued to show
			* This will only be populated if dialog gets called multiple times
			* @var {array}
			*/
			$dialogQueue: [],

			/**
			* Terminate the previous dialog and shift the next element of the queue if there is one
			* This is called by the downstream promptHelper component when its ready for the next (optional) queued dialog to show
			*/
			$terminate: ()=> {
				$prompt.$settings = undefined; // Release previous dialog
				if (!$prompt.$dialogQueue.length) return; // Nothing to do
				$prompt.dialog($prompt.$dialogQueue.shift());
			},
		};

		return $prompt;
	})
	.component('promptHelper', {
		controller: function($element, $prompt, $scope, $timeout) {
			var $ctrl = this;
			$ctrl.$prompt = $prompt;

			$scope.$on('$prompt.open', ()=> {
				$element.find('.modal')
					.one('show.bs.modal', ()=> $timeout(()=> {
						$prompt.$settings.$status = 'showing';
						if ($prompt.$settings.onShow) $prompt.$settings.onShow();

						// Weird work around as shown.bs.modal doesnt fire for some reason
						$timeout(()=> {
							$prompt.$settings.$status = 'shown';
							if ($prompt.$settings.onShown) $prompt.$settings.onShown();
						}, 300);
					}))
					.one('hide.bs.modal', ()=> $timeout(()=> {
						$prompt.$settings.$status = 'hiding';
						if ($prompt.$settings.onHide) $prompt.$settings.onHide();
						if ($prompt.$settings.$promise.state == 'pending') { // Promise not yet resolved - yet we are closing, user probably pressed escape or clicked the background
							$prompt.$settings.$dialogClose();
						}
					}))
					.one('hidden.bs.modal', ()=> $timeout(()=> {
						$prompt.$settings.$status = 'hidden';
						if ($prompt.$settings.onHidden) $prompt.$settings.onHidden();
						$prompt.$terminate();
					}))
					.modal({
						keyboard: $prompt.$settings.keyboard,
						show: true,
						backdrop: $prompt.$settings.backdrop,
					})
			});

			$scope.$on('$prompt.close', ()=> {
				$element.find('.modal').modal('hide');
			});
		},
		template: `
			<div id="modal-_prompt" class="modal fade">
				<div ng-if="$ctrl.$prompt.$settings" class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<a class="close" ng-click="$ctrl.$prompt.$settings.$dialogClose()"><i class="fa fa-times fa-lg"></i></a>
							<h4 class="modal-title">{{$ctrl.$prompt.$settings.title}}</h4>
						</div>
						<div class="modal-body">
							<div ng-if="!$ctrl.$prompt.$settings.isHTML" class="text-center">
								<h4>{{$ctrl.$prompt.$settings.body}}</h4>
							</div>
							<div ng-if="$ctrl.$prompt.$settings.isHTML" ng-bind-html="$ctrl.$prompt.$settings.$body"></div>
							<div ng-if="$ctrl.$prompt.$settings.bodyFooter" ng-bind-html="$ctrl.$prompt.$settings.$bodyFooter"></div>
						</div>
						<div class="modal-footer">
							<div class="text-center">
								<a ng-repeat="button in $ctrl.$prompt.$settings.buttons track by button.id" ng-click="button.click()" ng-class="button.class">
									<i ng-if="button.icon" ng-class="button.icon"></i>
									{{button.title}}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		`,
	});
