/**
* MacGyver table
* This component displays a nested tree of sub-items across rows and columns
* @param {Object} config The config specification
* @param {array} config.items An collection of definitions for each column
* @param {string} config.items[].id The unique ID of each column - this conforms to the data field
* @param {string} config.items[].title The title of the column to display
* @param {number} [config.items[].width] The width (as a CSS measurement) of the column (e.g. '30px', '10%')
* @param {string} [config.items[].class] Class to apply to each <td> wrapping element
* @param {boolean} [config.allowAdd=true] Whether the form filler is allowed to add rows
* @param {boolean} [config.allowDelete=true] Whether the form filler is allowed to remove existing rows
* @param {boolean} [config.rowNumbers=true] Whether to show row numbers as the first column
* @param {array} [config.data] The default data to display in the table
* @param {*} data The state data
*/
angular
	.module('app')
	.config($macgyverProvider => $macgyverProvider.register('mgTable', {
		title: 'Table layout',
		icon: 'fa fa-table',
		isContainer: true,
		isContainerArray: true,
		config: {
			allowAdd: {type: 'mgToggle', title: 'Allow Row Addition', default: true},
			allowDelete: {type: 'mgToggle', title: 'Allow Row Deletion', default: true},
			textEmpty: {type: 'mgText', title: 'No data message', default: 'No data'},
			items: {
				type: 'array',
				default: [
					{id: 'col1', title: 'Col1'},
					{id: 'col2', title: 'Col2'},
					{id: 'col3', title: 'Col3'},
				],
			},
			default: {type: 'array', title: 'Default data'},
		},
		configChildren: {
			showTitle: {type: 'mgToggle', default: false, title: 'Show Title'},
		},
	}))
	.component('mgTable', {
		bindings: {
			config: '<',
			data: '=',
		},
		controller: function($element, $scope) {
			var $ctrl = this;
			$ctrl.isEditing = !! $element.closest('mg-form-editor').length;

			// Adopt default data (if provided) / fake data (when editing) {{{
			$scope.$watchGroup(['$ctrl.isEditing', '$ctrl.config.items', '$ctrl.config.default'], function() {
				if (!$ctrl.isEmpty()) return; // Already has data

				if (!_.isEmpty($ctrl.config.default)) { // Adopt defaults?
					$ctrl.data = $ctrl.config.default;
					if ($ctrl.isEditing) $ctrl.fakeData = $ctrl.data; // If we're editing also set the fake data to the same static data
				} else if ($ctrl.isEditing) { // When we're editing compose some fake data for the table when we have the column config
					$ctrl.fakeData = [ // Make a single row of all defaults
						_($ctrl.config.items)
							.mapKeys('id')
							.mapValues(col => col.default)
							.value()
					];
				}
			});
			// }}}

			// Ensure .data is always an array {{{
			$scope.$watch('$ctrl.data', function() {
				if (!_.isArray($ctrl.data)) $ctrl.data = [];
			});
			// }}}

			// Row addition {{{
			// .allowAdd {{{
			$ctrl.allowAdd = false;
			$scope.$watch('$ctrl.config.allowAdd', function() {
				$ctrl.allowAdd = $ctrl.config.allowAdd === undefined ? true : $ctrl.config.allowAdd;
			});
			// }}}

			$ctrl.isAdding = false; // Whether the user is actively entering information into $ctrl.newRow (set when $ctrl.newRow is non empty)
			$ctrl.newRow = {};
			$scope.$watch('$ctrl.newRow', function() {
				$ctrl.isAdding = !_.isEmpty($ctrl.newRow);
			}, true);

			$ctrl.createRow = function() {
				$ctrl.data.push($ctrl.newRow);
				$ctrl.newRow = {};
				$element.find('.mgTable-append > td input').first().focus(); // Reselect first input element found in new row
			};

			$element.on('keypress', e => $scope.$apply(() => {
				if (e.which == 13) { // User pressed enter - accept this as a call to $ctrl.createRow and cancel the event
					e.stopPropagation();
					e.preventDefault();
					$ctrl.createRow();
				}
			}));
			// }}}

			// Row deletion {{{
			// .allowDelete {{{
			$ctrl.allowDelete = false;
			$scope.$watch('$ctrl.config.allowDelete', function() {
				$ctrl.allowDelete = $ctrl.config.allowDelete === undefined ? true : $ctrl.config.allowDelete;
			});
			// }}}

			$ctrl.deleteRow = index => $ctrl.data.splice(index, 1);
			// }}}

			// Utility function: isEmpty {{{
			/**
			* Return if the table is empty
			* Since the table will ALWAYS have a data object and that will (via Angular) default to having empty key values we need to do extra checks to see if the table is really empty
			* @returns {boolean} True if the table appears to be empty
			*/
			$ctrl.isEmpty = ()=> (
				_.isEmpty($ctrl.data) ||
				(
					$ctrl.data.length == 1 &&
					_.every($ctrl.data[0], v => !v) // All values are falsy
				)
			);
			// }}}
		},
		template: `
			<table class="table table-bordered table-hover">
				<thead>
					<tr>
						<th ng-if="$ctrl.config.rowNumbers === undefined || $ctrl.config.rowNumbers" width="30px" class="text-center font-md">#</th>
						<th ng-repeat="col in $ctrl.config.items track by col.id" style="{{(col.width ? 'width: ' + col.width + '; ' : '') + col.class}}">
							{{col.title}}
						</th>
					</tr>
				</thead>
				<tbody ng-if="$ctrl.isEditing">
					<tr ng-repeat="row in $ctrl.fakeData">
						<td ng-if="$ctrl.config.rowNumbers === undefined || $ctrl.config.rowNumbers" class="text-center font-md">{{$index + 1 | number}}</td>
						<td ng-repeat="col in $ctrl.config.items track by col.id" class="{{col.class}}">
							<mg-container config="{items: [col]}" data="row"></mg-container>
						</td>
					</tr>
				</tbody>
				<tbody ng-if="!$ctrl.isEditing">
					<tr ng-if="!$ctrl.data">
						<td colspan="{{$ctrl.config.items.length + ($ctrl.config.rowNumbers === undefined || $ctrl.config.rowNumbers ? 1 : 0}}">
							<div class="alert alert-warning m-10">{{$ctrl.config.textEmpty || 'No data'}}</div>
						</td>
					</tr>
					<tr ng-repeat="row in $ctrl.data">
						<td ng-if="$ctrl.config.rowNumbers === undefined || $ctrl.config.rowNumbers" class="text-center">
							<div class="btn-group">
								<a class="btn btn-ellipsis btn-ellipsis-sm dropdown-toggle" data-toggle="dropdown">{{$index + 1 | number}}</a>
								<ul class="dropdown-menu">
									<li ng-if="$ctrl.allowDelete"><a ng-click="$ctrl.deleteRow($index)"><i class="fa fa-trash-o"></i> Delete</a></li>
								</ul>
							</div>
						</td>
						<td ng-repeat="col in $ctrl.config.items track by col.id" class="{{col.class}}">
							<mg-container config="{items: [col]}" data="row"></mg-container>
						</td>
					</tr>
					<tr class="mgTable-append" ng-if="$ctrl.allowAdd">
						<td class="text-center">
							<a ng-click="$ctrl.createRow()" class="btn" ng-class="$ctrl.isAdding ? 'btn-success' : 'btn-disabled'">
								<i class="fa fa-plus"></i>
							</a>
						</td>
						<td ng-repeat="col in $ctrl.config.items track by col.id">
							<mg-container config="{items: [col]}" data="$ctrl.newRow"></mg-container>
						</td>
					</tr>
				</tbody>
			</table>
		`,
	})
