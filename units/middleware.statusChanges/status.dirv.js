/**
* Status change directive
* This directive displays a complex status changing path depending on the supplied data model
* @param {Object} collection The collection name, used to query the backend to retrieve the status
* @param {Object} ng-model The link to the data model
* @param {function} [onChange] Function to call INSTEAD OF updating the model directly. This function must perform the update itself to be effective. Called as ({status})
* @param {boolean} [locked] Convenience binding to determine if the current status is locked - i.e. the user should not be able to edit this interface
*
* @param {string} [config.display='buttons'] How to display the status change dialog. ENUM: `buttons` (display a button for each valid status option), `select` (display a dropdown list of each valid value)
*
* @param {array|string|Object|null|undefined} [config.*.changeTo] Either an array of strings for each valid option the current option can change to or a collection containing ({id, title}). If this value is falsy no options are allowed
* @param {string} [config.*.changeTo.*.id] The ID of the status to change to for this change option
* @param {string} [config.*.changeTo.*.title] The human friendly text for this change option
* @param {string} [config.*.changeTo.*.class='btn btn-default'] The CSS class of the button for this change option if `display='buttons'`
* @param {boolean} [config.changeTo.*.comments] Prompt the user for comments when changing the status
* @param {string|boolean} [config.changeTo.*.confirm] Check with the user when changing to this status. If the value is a string that will be used as a prompt, otherwise if truthy text will be generated
* @param {function} [config.changeTo.*.enabled] Whether the button should be enabled. This differs from validate in that it is run on load. Called as (dataModel, $session)
* @param {Object} [config.changeTo.*.permissions] Compare a Mongo style expression (using `sift`) against the `$session.data` object. (e.g. `['permissions.perm1', 'permissions.perm2']`, `{$and: [{'permissions.perm3': true}], [{'permissions.perm4': true}]}}`, `{$or: [{'permissions.perm5': false}, {'permissions.perm6': true}]}`)
* @param {string} [config.changeTo.*.tooltip] Display the given string as a tooltip on the choice button
* @param {Promise|function} [config.changeTo.*.validate] Only allow this option if the promise resolves. This differs from validate in that it is run when the status is being changed. Function is called as (dataModel, $session)
*/
angular
	.module('app')
	.component('status', {
		bindings: {
			collection: '@',
			locked: '=?',
			onChange: '&?',
			ngModel: '=',
		},
		controller: function($element, $loader, $prompt, $q, $scope, $session, $toast, Logs, StatusChange) {
			var $ctrl = this;
			$ctrl.$session = $session;

			$ctrl.schema; // The retrieved schema from the backend

			/**
			* Attempt to change the status
			* This is usually triggered by the user manually selecting a single status to change from: either via button, dropdown etc.
			* @param {string} status The new status ID to set
			* @returns {Promise}
			*/
			$ctrl.setStatus = status => {
				var changeToItem = $ctrl.current.changeTo.find(c => c.id == status); // What we are changing to
				if (!changeToItem) throw new Error(`Refusing to change to unknown status "${status}" for the ${$ctrl.collection} collection`);

				return $q.resolve()
					// Sanity checks {{{
					.then(()=> $q((resolve, reject) => {
						if (!$ctrl.schema[status]) {
							reject('Cannot set item to non-existant status: ' + status);
						} else if (!changeToItem) { // Is there a path from this status to the requested one?
							reject(`Cannot change from current status '${$ctrl.ngModel.status}' to '${status}'`);
						} else {
							resolve();
						}
					}))
					// }}}
					// (Optional) Run validator {{{
					.then(()=> {
						if (!changeToItem.validate) return;
						return changeToItem.validate($ctrl.ngModel, $session);
					})
					// }}}
					// (Optional) Display confirmation {{{
					.then(()=> $q((resolve, reject) => {
						if (!changeToItem.confirm) return resolve();

						$prompt.confirm({
							title: 'Confirm status change',
							content:
								angular.isString(changeToItem.confirm)
								? changeToItem.confirm
								: 'Are you sure you wish to change the status of this file?',
						})
							.then(()=> resolve())
							.catch(()=> reject('CANCELLED'))
					}))
					// }}}
					// (Optional) Display comments prompt {{{
					.then(()=> $q((resolve, reject) => {
						if (!changeToItem.comments) return resolve();
						if (!$ctrl.collection) return console.warn('Comments are supported only if the status widget has a supplied `collection` property');
						if (!$ctrl.ngModel._id) return console.warn('Comments are supprted only if the status widget has a supplied `ngModel` property which contains an `_id` key');

						$prompt.macgyver({
							title: 'Add comments',
							form: [
								{id: 'content', type: 'mgWysiwyg', showTitle: false},
							],
						})
							.then(form => {
								Logs.create({
									model: $ctrl.collection,
									docId: $ctrl.ngModel._id,
								}, {
									user: $session.data._id,
									type: 'user-comment',
									body: form.content,
								}).$promise
									.then(()=> resolve())
									.catch(reject)
							})
							.catch(()=> reject('CANCELLED'))
					}))
					// }}}
					// Change the status (or run onChange if that is specified) {{{
					.then(()=> {
						if (angular.isFunction($ctrl.onChange)) { // Don't update the model directly - run via onChange instead
							$ctrl.onChange({status});
						} else {
							$ctrl.ngModel.status = status;
						}
					})
					// }}}
					.catch(err => {
						if (err && err == 'CANCELLED') return; // Don't report on cancelled actions
						$toast.catch(err);
					})
			};


			/**
			* Compares the current user (`$session.data`) against a given Sift expression as a shortname
			* @param {Object} expression Sift compatible matcher to compare against $session.data.permissions
			*/
			$ctrl.evalPermissions = (expression) => {
				if (_.isArray(expression)) throw new Error('Cannot use an array as a Sift expression:', expression, 'See https://github.com/crcn/sift.js for examples');
				var res = sift(expression, [$session.data]).length > 0;
				console.log('SIFT', expression, $session.data.permissions, '?', res);
				return res;
			};


			/**
			* Init
			* When the controller is ready - go fetch the schema spec from the server
			*/
			$ctrl.$onInit = ()=> {
				if (!$ctrl.schema) {
					StatusChange.schema({collection: $ctrl.collection}).$promise
						.then(data => $ctrl.schema = data)
						.catch($toast.catch)
				}
			};

			$ctrl.current; // Inherited as $ctrl.schema[$ctrl.entity.status]

			// Watch the main status key + schema changes and react to them
			$scope.$watchGroup(['$ctrl.ngModel.status', '$ctrl.schema'], ()=> {
				if (!$ctrl.ngModel || !$ctrl.ngModel.status || !$ctrl.schema) return; // Not yet ready

				$ctrl.current = _.clone($ctrl.schema[$ctrl.ngModel.status]);

				// Deal with invalid status levels {{{
				if (!$ctrl.current) {
					var schemaDefault = _($ctrl.schema)
						.pickBy(i => !! i.default)
						.keys()
						.first();

					if (schemaDefault && !$ctrl.schema[schemaDefault]) {
						console.warn(`Unknown status "${$ctrl.ngModel.status}" for "${$ctrl.collection}" collection. Default is defined as "${schemaDefault}" but this is not a valid status rule!`);
						$prompt.alert({
							isHtml: true,
							title: 'Invalid record status',
							body: `
								<p>This record has the invalid status "<strong>${$ctrl.ngModel.status}</strong>". This can occur if this is an old record and the status list has been recently updated.</p>
								<p>While a default status of this record has been defined as "<strong>${schemaDefault}</strong> this is actually not a valid status level.</p>
								<p>Please <a href="http://help.rockjaw.com.au/otrs" target="_blank">contact support</a> about this message.</p>
							`,
						});
						$ctrl.current = undefined;
					} else if (schemaDefault) {
						console.warn(`Unknown status "${$ctrl.ngModel.status}" for "${$ctrl.collection}" collection. Defaulting to ${schemaDefault}`);
						$prompt.alert({
							isHtml: true,
							title: 'Invalid record status',
							body: `
								<p>This record has the invalid status "<strong>${$ctrl.ngModel.status}</strong>". This can occur if this is an old record and the status list has been recently updated.</p>
								<p>The status of this record will be changed to "<strong>${schemaDefault}</strong>" which is the default.</p>
								<p>If you believe this is an error please <a href="http://help.rockjaw.com.au/otrs" target="_blank">contact support</a>.</p>
							`,
						});
						$ctrl.current = _.clone($ctrl.schema[schemaDefault]);
					} else {
						console.warn(`Unknown status "${$ctrl.ngModel.status}" for "${$ctrl.collection}" collection. No valid default is available!`);
						$ctrl.current = undefined;
					}
				}
				// }}}

				// Apply defaults to current item
				_.defaults($ctrl.current, {
					display: 'buttons',
					comments: false,
					$enabled: true,
					tooltip: '',
				});

				// Calculate the computed values of functions
				if (!$ctrl.current.changeTo) $ctrl.current.changeTo = [];

				$ctrl.current.changeTo.forEach(c => {
					c.$enabled =
						(c.enabled ? c.enabled($ctrl.ngModel, $session) : true)
						&& (c.permissions ? $ctrl.evalPermissions(c.permissions) : true)
				});

				// Set various convenience functions
				$ctrl.locked = !! $ctrl.current.locked;
			});

			// Force status setting (admins only) {{{
			$ctrl.forceSet = ()=> {
				$prompt.list({
					list: _($ctrl.schema)
						.pickBy((v, k) => !k.startsWith('$') && $ctrl.schema.hasOwnProperty(k)) // Exclude Angular crap
						.map((v, k) => {
							v.id = k;
							return v;
						})
						.value(),
					default: $ctrl.ngModel.status,
					title: 'Change status',
				})
					.then(status => $ctrl.ngModel.status = status)
			};
			// }}}

			// Process flow display {{{
			$ctrl.schemaMermaid;
			$ctrl.showFlow = ()=> {
				if (!$ctrl.schemaMermaid) {
					$loader.startBackground($scope.$id);
					StatusChange.schemaMermaid({
						collection: $ctrl.collection,
						highlight: $ctrl.ngModel.status,
					}).$promise
						.then(data => $ctrl.schemaMermaid = data)
						.then(()=> $element.find('.modal').modal('show'))
						.catch($toast.catch)
						.finally(()=> $loader.stop($scope.$id))
				} else {
					$element.find('.modal').modal('show');
				}
			};
			// }}}
		},
		template: `
			<div class="modal fade">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<a class="close" data-dismiss="modal">&times;</a>
							<h4 class="modal-title">Process Flow</h4>
						</div>
						<div class="modal-body text-center">
							<mermaid schema="$ctrl.schemaMermaid" width="500" height="500"></mermaid>
						</div>
					</div>
				</div>
			</div>
			<div ng-switch="$ctrl.current.display">
				<div class="pull-right">
					<a ng-if="$ctrl.$session.data.isAdmin" ng-click="$ctrl.forceSet()" tooltip="Forcably set the status (Admins only)" class="btn btn-default">
						<i class="fa fa-undo"></i>
					</a>
					<a ng-click="$ctrl.showFlow()" class="btn btn-info" tooltip="Show information on the process flow">
						<i class="fa fa-info-circle"></i>
					</a>
				</div>
				<div ng-switch-when="buttons">
					<div class="form-control-static">{{$ctrl.current.title}}</div>
					<a
						ng-repeat="option in $ctrl.current.changeTo track by option.id"
						ng-click="$ctrl.setStatus(option.id)"
						ng-class="[option.class, !option.$enabled && 'disabled']"
						tooltip="{{option.tooltip}}"
						tooltip-position="bottom"
						tooltip-tether="true"
						class="m-r-5"
					>{{option.title}}</a>
				</div>
				<div ng-switch-when="select">
					<ui-select title="Set status to...">
						<ui-select-match placeholder="Select status...">{{$select.selected.title}}</ui-select-match>
						<ui-select-choices repeat="role.id as role in $ctrl.current.changeTo | filter:{$enabled:true} | filter:$select.search track by role.id">
							<div ng-bind-html="role.title | highlight:$select.search"></div>
						</ui-select-choices>
					</ui-select>
				</div>
				<div ng-switch-default class="form-control-static">
					{{$ctrl.current.title}}
					<i ng-if="$ctrl.current.locked" class="fa fa-lock" tooltip="This document is locked" tooltip-tether="true"></i>
				</div>
			</div>
		`,
	});
