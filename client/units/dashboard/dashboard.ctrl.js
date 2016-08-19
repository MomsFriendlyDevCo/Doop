(function() {
	angular
		.module('app')
		.controller('DashCtrl', function() {
			var self = this;

			/**
			 * Controller initialiser hook
			 */
			this.$onInit = function() {
				// Init scope variables
				this.message = 'Welcome to the dashboard!';
			};
		});
})();
