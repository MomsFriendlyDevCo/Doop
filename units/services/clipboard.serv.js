/**
* Basic clipboard access
* This unit is designed as an all-purpose work around the madness and vice that is Clipboard management in modern browsers
* Copy + Paste functionality will be appended to this module only when I'm crazy / drunk enough to even attempt that
*
* @author Matt Carter <m@ttcarter.com>
* @date 2017-03-24
* @example
* $clipboard.copy('Hello World')
*/

angular
	.module('app')
	.service('$clipboard', function($q, $toast, $window) {
		var $clipboard = this;

		/**
		* Copy text to the clipboard in the supidest yet consistant way imagineable
		* @param {string} text Text to copy
		* @param {boolean} [notify=false] Whether to also create a 'Copied to clipboard' notification
		* @return {Promise}
		*/
		$clipboard.copy = function(text, notify = false) {
			var output;

			if (_.has(navigator, 'clipboard.writeText')) { // Chrome 65 onwards
				output = navigator.clipboard.writeText(text);
			} else { // Fallback method
				var copyDiv = document.createElement('div');
				copyDiv.contentEditable = true;
				document.body.appendChild(copyDiv);
				copyDiv.innerHTML = text;
				copyDiv.unselectable = "off";
				copyDiv.focus();
				document.execCommand('SelectAll');
				document.execCommand("Copy", false, null);
				document.body.removeChild(copyDiv);
				output = $q.resolve();
			}

			if (notify) output.then(()=> $toast.success('Copyied to clipboard'));
		};

	});
