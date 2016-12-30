/**
* Display a ms readout as a duration
*
* e.g. 60000 => '1m'
* e.g. {{something | duration}}
*/
angular
	.module('app')
	.filter('duration', function() {
		return function(value) {
			if (!value) return null;

			var out = [];
			var hours = Math.floor(value / (60 * 60 * 1000));
			if (hours > 0) out.push(hours + 'h');

			var mins = Math.floor(value % (60 * 60 * 1000) / (60 * 1000));
			if (mins > 0) out.push(mins + 'm');

			var secs = Math.floor(value % (60 * 1000) / 1000);
			if (secs > 0) out.push(secs + 's');

			return out.join(' ');
		};
	})
