/**
* MacGyver form
* This should be the topmost item within a MacGyver form. It loads the actual form display and the data associated with it
*/
angular
	.module('app')
	.component('mgForm', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($macgyver, $q, $scope) {
			var $ctrl = this;
			$ctrl.errors;

			// MacGyver integration {{{
			$scope.$on('mg.getForm', (e, f) => f.form = $ctrl)
			// }}}

			/**
			* Broadcasts 'mgValidate' to all child controls and collections responses
			* Each child control can respond by decorating the 'response' object with its
			* The resolution of this promise will be a collection where each element will be of the form {id: <component ID>, err: <string>}
			* @return {Promise} A promise which will resolve if everything validates, a collection of errors if not
			*/
			$ctrl.validate = ()=> $q(function(resolve, reject) {
				$q.all( // Compose into promises then wait for them to resolve
					_($macgyver.getAll($scope)) // Get all MacGyver components
						.pickBy((c, k) => _.isFunction(c.validate)) // Filter by components with a validate method
						.mapValues((c, k) => c.validate())
						.value()
				)
					.then(res => {
						var errs = _.reduce(res, (errs, err, id) => { // Convert compound errors into a simple collection
							if (!err) { // Undefined - assume all ok
								// Do nothing
							} else if (_.isArray(err)) { // Multiple errors
								err
									.filter(e => !!e) // Remove all falsy elements
									.forEach(e => errs.push({id, err: e}));
							} else if (_.isString(err)) { // Single error
								errs.push({id, err});
							} else if (v === false) { // Generic error
								errs.push({id, err: 'is not valid'});
							}

							return errs;
						}, []);

						// Populate the 'mgValidation' variable
						_.forEach($macgyver.getAll($scope), (component, id) => component.config.mgValidation = errs.some(e => e.id == id) ? 'error' : 'success');

						if (_.isEmpty(errs)) {
							$ctrl.errors = undefined;
							resolve();
						} else {
							$ctrl.errors = errs;
							reject(errs)
						}
					})
					.catch(e => reject(e));
			});

			$scope.$watch('$ctrl.config', ()=> {
				if (!$ctrl.config) return; // Form not loaded yet
				// Force showTitle to be false on the root element if its not already set
				if (_.isUndefined($ctrl.config.showTitle)) $ctrl.config.showTitle = false;
			});
		},
		template: `
			<form submit="$ctrl.submit" class="form-horizontal">
				<div ng-show="$ctrl.errors" class="alert alert-warning animate fadeInDown">
					<ul>
						<li ng-repeat="err in $ctrl.errors">{{err.err}}</li>
					</ul>
				</div>

				<mg-container config="$ctrl.config" data="$ctrl.data"></mg-container>
			</form>
		`,
	})
