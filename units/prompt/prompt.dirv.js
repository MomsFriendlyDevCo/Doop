angular
	.module('app')
	.factory('$prompt', function($interpolate, $q, $rootScope, $sce, $timeout) {
		var $prompt = {
			/**
			* Display a dialog with various customisations
			* This is the main $prompt worker - all the below helper functions are really just remappings of this function
			* @param {Object} options Dialog options to use
			* @param {string} [options.title='Dialog'] The dialog title
			* @param {string} [options.body='Body text'] The dialog body (usually the message to display)
			* @param {boolean} [options.isHtml=false] Whether the dialog body should be rendered as HTML (must be $sce compilable)
			* @param {string} [options.bodyHeader] Additional HTML to render above the main body area (this is always HTML rendered)
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
					options.$defer = $q.defer();
					$prompt.$dialogQueue.push(options)
					return options.$defer.promise;
				}
				// }}}

				// Setup defaults {{{
				$prompt.$settings = _.defaults(options, {
					title: 'Dialog',
					body: 'Body text',
					isHtml: false,
					keyboard: true,
					backdrop: true,
					bodyHeader: undefined,
					bodyFooter: undefined,
					scope: undefined,
					dialogClose: 'reject',
					buttons: [{
						id: 'close',
						title: 'Close',
						method: 'resolve',
					}],
					$defer: $q.defer(),
				});
				// }}}

				// Attach to promise to add a status property (why $q doesnt have this is beyond me - MC) {{{
				$prompt.$settings.$defer.state = 'pending';
				$prompt.$settings.$defer.promise.then(
					()=> $prompt.$settings.$defer.state = 'resolved',
					()=> $prompt.$settings.$defer.state = 'rejected'
				);
				// }}}

				// Setup dialogClose {{{
				if (!$prompt.$settings.$dialogClose) {
					if (angular.isUndefined($prompt.$settings.dialogClose) || $prompt.$settings.dialogClose == 'resolve') {
						$prompt.$settings.$dialogClose = ()=> {
							$prompt.$settings.$defer.resolve();
							$prompt.close();
						};
					} else if ($prompt.$settings.dialogClose == 'reject') {
						$prompt.$settings.$dialogClose = ()=> {
							$prompt.$settings.$defer.reject();
							$prompt.close();
						};
					}
				}
				// }}}

				// Setup buttons {{{
				$prompt.$settings.buttons = $prompt.$settings.buttons.map(b => {
					if (!b.click) b.click = ()=> { // Compute a click event from the method
						if (angular.isUndefined(b.method) || b.method == 'resolve') {
							$prompt.$settings.$defer.resolve(b.id);
							$prompt.close();
						} else if (b.method == 'reject') {
							$prompt.$settings.$defer.reject(b.id);
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
				if ($prompt.$settings.bodyHeader) $prompt.$settings.$bodyHeader = $sce.trustAsHtml($interpolate($prompt.$settings.bodyHeader)($prompt.$settings.scope));
				if ($prompt.$settings.bodyFooter) $prompt.$settings.$bodyFooter = $sce.trustAsHtml($interpolate($prompt.$settings.bodyFooter)($prompt.$settings.scope));
				// }}}

				// Open the dialog (via Bootstrap) {{{
				$rootScope.$broadcast('$prompt.open');
				// }}}

				return $prompt.$settings.$defer.promise;
			},


			/**
			* Current holder for dialog options
			* This is usually a 1:1 mapping for the dialog options
			* @see dialog()
			* @var {Object}
			* @param {Promise} $defer The promise object for the current dialog
			* @param {string} $defer.state Tracking of the promise status. ENUM: 'pending', 'resolved', 'rejected'
			* @param {Object} $body The $sce compiled version of the dialog body if isHtml is truthy
			* @param {Object} $bodyHeader The $sce compiled version of bodyHeader
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
				if (!options) options = {};
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
							class: 'btn btn-success',
							icon: 'fa fa-check',
							click: ()=> $prompt.close(), // When closing force the confirm button just to hide - resolve is handled in onHide
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
							e.preventDefault();
							e.stopPropagation();
							$prompt.$settings.buttons.filter(b => b.id == 'confirm')[0].click();
						});
					},
					onHide: ()=> {
						var gotVal = angular.element('#modal-_prompt input.form-control').val();
						if (!gotVal && !$prompt.$settings.allowBlank) return $prompt.$settings.$defer.reject();
						$prompt.$settings.$defer.resolve(gotVal);
					},
				}));
			},


			/**
			* Display a list of entries and allow the user to select one of them
			* This function inherits all properties from dialog() but sets various sane defaults for a list prompt
			* @see $prompt.dialog()
			* @param {Object|string} options Either an options object or the body text of prompt
			* @param {string} [options.title='Select an item'] The title of the dialog
			* @param {string} [options.body=''] The body of the dialog
			* @param {array} [options.buttons=[]] The buttons to display, defaults to 'Confirm' + 'Cancel' if in multiple mode, blank otherwise
			*
			* @param {array|Object} [options.list] The list entries to display, this is assumed to either be a collection (with `id` + `title` keys) or something that will be marshelled into one
			* @param {boolean} [options.multiple=false] Whether to accept multiple values, if true the return will be an array of all selected items
			* @param {number|string} [options.default] If numeric this is the offset of the array to select by default, if this is a string it will be used as the ID of the item to match
			*
			* @returns {Promise} A promise representing the dialog, closing OR agreeing will resolve the promise
			*/
			list: function(options) {
				// Argument mangling {{{
				if (angular.isString(options)) {
					options = {list: [options]};
				} else if (angular.isArray(options)) {
					options = {list: options};
				}
				// }}}

				// Mangle list into something we can use {{{
				options.list = _.map(options.list, (v, k) => {
					if (_.isObject(v)) { // Already a collection
						if (!v.id) v.id = k;
						if (!v.title) v.title = _.startCase(k);
					} else if (_.isString(v)) {
						v = {title: v, id: k};
					} else {
						throw new Error('Unable to marshal into a collection: ' + (typeof v));
					}
					return v;
				});
				// }}}

				return $prompt.dialog(_.defaults(options, {
					$selectedIndex: 0, // The offset in the list that is currently selected
					title: 'Select an item',
					list: [],
					default: options.multiple ? [] : undefined,
					body: '',
					bodyHeader: `
						<div class="container-fluid text-center">
							<form action="" class="form-horizontal">
								<div class="form-group text-center">
									<input type="text" class="form-control" autofocus/>
								</div>
							</form>
						</div>
					` + (options.multiple ?
						`
							<div class="container-fluid text-center">
								Select:
								<a data-action="prompt-select-all">All</a>,
								<a data-action="prompt-select-none">None</a>
							</div>
						`
					: ''),
					bodyFooter: options.multiple
						? `
							<ul class="list-group">` +
								options.list.map((i, index) => `
								<label class="list-group-item" data-prompt-index="${index}">
									<input type="checkbox"/>
									${i.title}
								</label>
								`).join('') + `
							</ul>
							<div class="hide text-muted">No items found</div>
						`
						: `
							<ul class="list-group">` +
								options.list.map((i, index) => `
								<a class="list-group-item" data-prompt-index="${index}">
									${i.title}
								</a>
								`).join('') + `
							</ul>
							<div class="hide text-muted">No items found</div>
						`,
					dialogClose: 'reject', // Reject if the user had second thoughts
					buttons: options.multiple
						? [
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
								class: 'btn btn-success',
								icon: 'fa fa-check',
								click: ()=> angular.element('#modal-_prompt form').trigger('submit'),
							},
						] : [],
					onShown: ()=> {
						// Auto-focus autofocus items
						angular.element('#modal-_prompt input[autofocus]')
							.each(function() {
								this.selectionEnd = this.selectionStart = this.value.length;
							})
							.focus()
							.on('keyup', function(e) {
								var items = angular.element('#modal-_prompt ul.list-group > .list-group-item').toArray();

								// Re-render the list, applying hide classes {{{
								var query = new RegExp(angular.element(this).val().toLowerCase().replace(/[^a-z0-9 ]+/g, ''), 'i');

								$prompt.$settings.list.forEach((i, index) => {
									i.visible = query.test(i.title);

									angular.element(items[index])
										.toggleClass('hide', !i.visible)
										.removeClass('list-group-item-primary') // Gets added back later
								});

								angular.element('#modal-_prompt span.text-muted').toggleClass('hide', $prompt.$settings.list.every(i => !i.visible));
								// }}}

								// Move the selected item offset if necessary {{{
								if (e.which == 38) { // Up
									$prompt.$settings.$selectedIndex = _.findLastIndex($prompt.$settings.list, i => i.visible, $prompt.$settings.$selectedIndex - 1);
								} else if (e.which == 40) { // Down
									if ($prompt.$settings.$selectedIndex < $prompt.$settings.list.length -1) {
										$prompt.$settings.$selectedIndex = _.findIndex($prompt.$settings.list, i => i.visible, $prompt.$settings.$selectedIndex + 1);
									} else { // Set to undefined so we skip back to the start
										$prompt.$settings.$selectedIndex = undefined;
									}
								}
								// }}}

								// Render the selected item {{{
								if (
									$prompt.$settings.$selectedIndex === undefined // Nothing selected
									|| !$prompt.$settings.list[$prompt.$settings.$selectedIndex].visible // Active item is not visible
								) {
									// Select first visible instead
									$prompt.$settings.$selectedIndex = $prompt.$settings.list.findIndex(i => i.visible);
								}

								if ($prompt.$settings.$selectedIndex !== undefined) angular.element(items[$prompt.$settings.$selectedIndex]).addClass('list-group-item-primary');
								// }}}

							})
							.trigger('keyup') // Fire initial keyup handler

						if (options.multiple) {
							// Ensure default exists and is an array
							if (!angular.isArray($prompt.$settings.default)) $prompt.$settings.default = [$prompt.$settings.default];

							// For multiple select list - select all the default items
							angular.element('#modal-_prompt ul.list-group > .list-group-item')
								.each(function() {
									var me = angular.element(this);
									angular.element(me)
										.find('input[type=checkbox]')
										.prop('checked', $prompt.$settings.default.some(x => x == $prompt.$settings.list[me.data('prompt-index')].id))
								})

							// Bind form submission to also accept the form
							angular.element('#modal-_prompt form').one('submit', e => {
								e.stopPropagation();
								e.preventDefault();

								$timeout(()=> {
									$prompt.$settings.$defer.resolve(
										$prompt.$settings.list
											.filter((v, k) => {
												var listItem = angular.element('#modal-_prompt ul.list-group > .list-group-item[data-prompt-index=' + k + ']');
												if (!listItem) throw Error('Cannot find multiple choice item by index: ' + k);
												return listItem.find('input[type=checkbox]').is(':checked');
											})
											.map(i => i.id)
									)
									$prompt.close();
								});
							});

							angular.element('#modal-_prompt [data-action="prompt-select-all"]').on('click', e => {
								angular.element('#modal-_prompt ul.list-group > .list-group-item input[type=checkbox]').prop('checked', true);
							});

							angular.element('#modal-_prompt [data-action="prompt-select-none"]').on('click', e => {
								angular.element('#modal-_prompt ul.list-group > .list-group-item input[type=checkbox]').prop('checked', false);
							});
						} else {
							// Select the default item (if there is one)
							if ($prompt.$settings.default) {
								$prompt.$settings.$selectedIndex = $prompt.$settings.list.findIndex(i => i.id == $prompt.$settings.default);
								angular.element('#modal-_prompt ul.list-group > .list-group-item').removeClass('list-group-item-primary');
								angular.element(angular.element('#modal-_prompt ul.list-group > .list-group-item')[$prompt.$settings.$selectedIndex]).addClass('list-group-item-primary');
							}

							// Clicking an item in single mode should select it and close
							angular.element('#modal-_prompt ul.list-group > .list-group-item').on('click', function(e) {
								$timeout(()=> {
									$prompt.$settings.$defer.resolve($prompt.$settings.list[angular.element(this).data('prompt-index')].id);
									$prompt.close();
								});
							});

							// Bind form submission to also accept the form
							angular.element('#modal-_prompt form').one('submit', e => {
								e.stopPropagation();
								e.preventDefault();

								$timeout(()=> {
									$prompt.$settings.$defer.resolve($prompt.$settings.list[$prompt.$settings.$selectedIndex].id);
									$prompt.close();
								});
							});
						}
					},
				}));
			},


			/**
			* Display a MacGyver form in a modal and return the result in a promise
			* This function inherits all properties from dialog() but sets various sane defaults for a MacGyver form
			* @see $prompt.dialog()
			* @param {Object|array} options Either an options object or the body text of prompt. If passed as an array that will be used as options.form
			* @param {string} [options.title='Form input required'] The title of the dialog
			* @param {string} [options.body=''] The body of the dialog
			* @param {array} [options.buttons=OK + Cancel]
			*
			* @param {array|Object} [options.form] The MacGyver form configuration. If an array is given the contents will automaticallty be enclosed in an mgContainer
			* @param {string} [options.data] The MacGyver form data
			*
			* @returns {Promise} A promise representing the MacGyver dialog
			*/
			macgyver: function(options) {
				// Mangle the form into a container if given an array
				if (angular.isArray(options)) options = {form: options};
				if (angular.isArray(options.form)) options.form = {type: 'mgContainer', items: options.form};

				return $prompt.dialog(_.defaults(options, {
					$isMacgyver: true,
					title: 'Form input required',
					body: '',
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
					form: {},
					data: {},
					onHide: ()=> {
						console.log('FIXME: RESOLVE MGFORM AS', $prompt.$settings.data);
						$prompt.$settings.$defer.resolve($prompt.$settings.data);
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

			$scope.$on('$prompt.open', ()=> $timeout(()=> {
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
						if ($prompt.$settings.$defer.state == 'pending') { // Promise not yet resolved - yet we are closing, user probably pressed escape or clicked the background
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
			}, 100));

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
							<div ng-if="$ctrl.$prompt.$settings.bodyHeader" ng-bind-html="$ctrl.$prompt.$settings.$bodyHeader"></div>
							<div ng-if="!$ctrl.$prompt.$settings.isHtml" class="text-center">
								<h4>{{$ctrl.$prompt.$settings.body}}</h4>
							</div>
							<mg-form ng-if="$ctrl.$prompt.$settings.$isMacgyver" config="$ctrl.$prompt.$settings.form" data="$ctrl.$prompt.$settings.data"></mg-form>
							<div ng-if="$ctrl.$prompt.$settings.isHtml" ng-bind-html="$ctrl.$prompt.$settings.$body"></div>
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
