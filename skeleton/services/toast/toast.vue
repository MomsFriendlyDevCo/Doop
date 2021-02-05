<script lang="js" frontend>
import Snotify from 'vue-snotify';
import 'vue-snotify/styles/material.css';

app.use(Snotify, {
	global: {
		preventDuplicates: true,
	},
});

app.service('$toast', function() {
	var $toast = {};
	var Snotify = app.vue.$snotify; // Actual instanciation we use

	$toast.settings = {
		progressRemoveDelay: 2000, // How long to wait before removing completed progress toasts
	};

	$toast.primary = Snotify.simple.bind(Snotify);
	$toast.info = Snotify.info.bind(Snotify);
	$toast.success = Snotify.success.bind(Snotify);
	$toast.warn = $toast.warning = Snotify.warning.bind(Snotify);
	$toast.danger = Snotify.error.bind(Snotify);
	$toast.error = Snotify.error.bind(Snotify);
	$toast.confirm = Snotify.confirm.bind(Snotify);
	$toast.prompt = Snotify.prompt.bind(Snotify);
	$toast.clear = Snotify.clear.bind(Snotify);

	$toast.save = ()=>
		Snotify.create({
			title: 'Saved',
			config: {
				position: 'centerTop',
				showProgressBar: false,
				timeout: 2000,
				type: 'save',
			},
		})

	
	$toast._progress = {}; // Storage of all progress toasts
	$toast._spinners = {}; // Storage of all spinner toasts


	/**
	* Perform an async operation displaying text while its working and success text when done
	* @param {string} text Text to show while working
	* @param {Object|array} options Additional options
	* @param {function} options.action Async worker, function which returns a promise
	* @param {function} func Function which returns a promise
	*/
	$toast.promise = (text, options) => {
		var toast = Snotify.async(
			text,
			()=> Promise.resolve(options.action())
				.finally(()=> setTimeout(()=> Snotify.remove(toast.id), 2000)),
			options,
		);
	};


	/**
	* Display a toast with buttons and other decent defaults
	* This is really just a wrapper for Snotify.confirm() with some additional wrapping functionality to auto-close on button presses
	* @param {string} text Text prompt to show
	* @param {Object|array} [options] Additional options, if this is an array it is assumed as options.buttons, if omitted asks "Yes" / "No" and returns a promise that succeeds on "Yes" and fails on "No"
	* @param {boolean} [options.autoClose=true] Automatically close the toast when the button is pressed
	* @param {array<Object>} [options.buttons] Buttons to display
	* @param {string} options.buttons.text Text of the button
	* @param {function} [options.buttons.action] Action to take when the button is clicked, default behaviour is to close the toast
	* @returns {undefined|Promise} Either undefined if options / buttons is specified or a Promise if using "Yes" / "No" mode - i.e. no options or buttons specified
	*/
	$toast.ask = (text, options) => {
		var output;

		// Argument mangling / Promise mode {{{
		if (_.isArray(options)) {
			[text, options] = [text, {buttons: options}];
		} else if (!options || !options.buttons) {
			// Promise mode - if no options assume yes / no and return a promise
			var deferred = Promise.defer();
			output = deferred.promise;
			options = {
				buttons: [
					{text: 'Yes', action: ()=> deferred.resolve()},
					{text: 'No', action: ()=> deferred.reject('cancel')},
				],
			};
		}
		// }}}

		Snotify.confirm(text, {
			timeout: 5000,
			showProgressBar: true,
			position: 'rightTop', // Force placement differently from regular toasts
			...options,
			buttons: options.buttons.map(button => ({
				...button,
				action: toast => {
					if (options.autoClose ?? true) Snotify.remove(toast.id);
					if (button.action) button.action(toast); // Revert to actual button action
				},
			})),
		});

		return output;
	};


	/**
	* Show a spinner which can be closed when completed
	* This is a ligher version of $toast.progress()
	* @param {string} id A unique ID to identify the toast so it can be changed later
	* @param {string|boolean} text The text to display, if boolean `false` the spinner is removed
	* @param {Object} [options] Additional options
	* @param {number} [options.spinnerRemoveDelay=5000] How long to keep a closed spinner open for
	*/
	$toast.spinner = (id, text, options) => {
		var settings = {
			spinnerRemoveDelay: 2000,
			...options,
		};

		if (text !== true && text !== false && !$toast._spinners[id]) { // Create new toast
			var defer = Promise.defer();

			$toast._spinners[id] = {
				text,
				defer,
				settings,
				snotify: Snotify.async(text, ()=> defer.promise, {
					position: 'rightBottom',
					closeOnClick: false,
				}),
			};
		}

		if (text === true || text === false) { // Resolve spinner promise
			if (!$toast._spinners[id] || !$toast._spinners[id].snotify) return; // Toast doesn't exist anyway
			if (text === true) {
				$toast._spinners[id].defer.resolve(true);
			} else if (text === false) {
				$toast._spinners[id].defer.reject(false);
			}
			var sid = $toast._spinners[id].snotify.id;
			setTimeout(()=> Snotify.remove(sid), $toast._spinners[id].settings.spinnerRemoveDelay);
			delete $toast._spinners[id];
		}
	};




	/**
	* Display a toast with progress
	* @param {string} id A unique ID to identify the toast so it can be changed later
	* @param {string} [text] The text of the progress area
	* @param {number} progress Progress to show between 0 and 100 - at 100 the progress display is removed
	* @param {object} [options] Additional options to pass
	* @param {object} [options.icon="far fa-spinner fa-spin"] Font-Awesome comaptible icon class to use in the side of the toast
	*/
	$toast.progress = (id, text, progress, options) => {
		var settings = {
			icon: 'far fa-spinner fa-spin',
		};

		// Argument mangling {{{
		if (!id) throw new Error('$toast.progress(id, [text], progress) requires an ID');
		if (_.isNumber(text)) {
			[text, progress] = [undefined, text];
		}
		// }}}

		if (!$toast._progress[id]) { // Create new toast
			$toast._progress[id] = {
				text,
				progress: progress || 0,
				snotify: Snotify.create({
					config: {
						timeout: 0,
						position: 'rightBottom',
						showProgressBar: false,
						type: 'progress',
						closeOnClick: false,
						icon: false,
						html: ''
							+ '<div class="media col-12">'
								+ '<div class="mr-2 snotify-fa-icon">'
									+ `<i class="${settings.icon}"></i>`
								+ '</div>'
								+ '<div class="media-body">'
									+ `<h4 id="toast-text-${id}">${text || ''}</h4>`
										+ '<div class="progress mb-1">'
											+`<div id="toast-progress-${id}" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progress || 0}%"></div>`
										+ '</div>'
									+ '</div>'
								+ '</div>'
							+ '</div>'
					},
				}),
			};
		} else { // Update existing
			$(`#toast-progress-${id}`).css('width', Math.min(progress, 100) + '%');
			if (text != $toast._progress[id].text) $(`#toast-text-${id}`).text(text);
		}

		if (progress === 100) { // Destroy progress
			if (!$toast._progress[id] || !$toast._progress[id].snotify) return; // Toast doesn't exist anyway
			var sid = $toast._progress[id].snotify.id;
			setTimeout(()=> Snotify.remove(sid), $toast.settings.progressRemoveDelay);
			delete $toast._progress[id];
		}
	};


	$toast.catch = (obj, options) => {
		console.warn('Promise chain threw error:', obj);
		if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return $toast.offline(true);
		if (obj === 'cancel') return; // Silently ignore user cancelled actions

		$toast.error(
			_.isUndefined(obj) ? 'An error has occured'
			: _.isString(obj) ? obj
			: _.isError(obj) ? obj.toString().replace(/^Error: /, '')
			: _.has(obj, 'error') && obj.error ? obj.error
			: _.has(obj, 'data') && _.isString(obj.data) && obj.data ? obj.data
			: _.has(obj, 'data.errmsg') && obj.data.errmsg ? obj.data.errmsg
			: _.has(obj, 'data.error') && obj.data.error ? obj.data.error
			: _.has(obj, 'statusText') && obj.statusText ? obj.statusText
			: _.has(obj, 'status') && obj.status === -1 ? 'Server connection failed'
			: _.has(obj, 'message') && /Received: ".+"/.test(obj.message) ? (function(text) { var matches = /^.+Received: "(.+?)"/.exec(text); return matches[1]; }(obj.message))
			: _.isFunction(obj.toString) && obj.toString() !== '[object Object]' ? obj.toString() :
			'An error has occured'
		, options);
	};

	return $toast;
});
</script>

<style>
/* Base toast {{{ */
.snotifyToast {
	box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.2);
}
/* }}} */

/* Snotify simple dialogs background is too light {{{ */
.snotify-simple {
	background: #eee;
}
/* }}} */

/* Smaller snotify display area {{{ */
.snotifyToast__inner {
	min-height: 40px;
	padding: 5px 40px 5px 15px;
}

.snotify-icon {
	background-repeat: no-repeat;
	right: -8px !important;
	height: 80%;
}
/* }}} */

/* Icons {{{ */
.snotifyToast .snotify-fa-icon {
	font-size: 2em;
	position: absolute;
	width: 50px;
	left: -6px;
	top: -20px;
	bottom: -20px;
	display: flex;
	align-items: center;
	justify-content: center;
	filter: brightness(1.3);
	background: var(--secondary);
}

.snotifyToast .snotify-fa-icon + .media-body {
	margin-left: 50px;
}
/* }}} */

/* TYPE: Async / Promise {{{ */
.snotifyToast .snotify-icon--async {
	right: -3px !important;
	height: 70%;
	background-position: center;
}
/* }}} */

/* TYPE: Progress {{{ */
.snotifyToast.snotify-progress {
	background-color: #eee;
}

.snotifyToast.snotify-progress .progress-bar {
	background-color: var(--main-darker);
}

.snotifyToast.snotify-progress .snotify-fa-icon {
	background: #acacac;
}

.snotifyToast.snotify-progress .snotifyToast__inner {
	padding: 5px;
}
/* }}} */

/* TYPE: Save {{{ */
.snotifyToast.snotify-save {
	background-color: var(--success);
	border-radius: 20px;
	width: 150px;
	margin: auto;
}

.snotifyToast.snotify-save .snotifyToast__inner {
	padding: 5px;
}

.snotifyToast.snotify-save .snotifyToast__inner .snotifyToast__title {
	color: var(--light);
	margin: auto;
	font-size: 1.5em;
}
.snotify {
	z-index: 99999;
}
/* }}} */
</style>
