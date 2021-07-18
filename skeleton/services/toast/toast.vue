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


	/**
	* Generic toast handling functions
	* All these are really the same method which takes a simple string and additional options
	* @param {string} text Text to display
	* @param {Object} [options] Additional Snotify options
	*/
	$toast.primary = Snotify.simple.bind(Snotify);
	$toast.info = Snotify.info.bind(Snotify);
	$toast.simple = Snotify.simple.bind(Snotify);
	$toast.success = Snotify.success.bind(Snotify);
	$toast.warn = $toast.warning = Snotify.warning.bind(Snotify);
	$toast.danger = Snotify.error.bind(Snotify);
	$toast.error = Snotify.error.bind(Snotify);
	$toast.confirm = Snotify.confirm.bind(Snotify);
	$toast.prompt = Snotify.prompt.bind(Snotify);
	$toast.clear = Snotify.clear.bind(Snotify);


	/**
	* Display a brief generic "Saved" toast at the top of the screen
	*/
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
	*
	* @example Run a promise inside a $toast.progress wrapper
	* this.$toast.promise('Working on something', {action: promiseFunction})
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
	*
	* @example Ask a yes/no question
	* this.$toast.ask('This is a question', {
	*   buttons: [
	*     {text: 'Yes', action: toast => console.log('Clicked Yes')},
	*     {text: 'No', action: toast => console.log('Clicked No')},
	*   ],
	* });
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
	* @param {string|boolean} text The text to display, if boolean `true` / `false` the spinner is removed and the action is considered to have succeded / failed respectively, only the first response is used so its safe to fail in a finally() block
	* @param {Object} [options] Additional options
	* @param {number} [options.spinnerRemoveDelay=5000] How long to keep a closed spinner open for
	*
	* @example Perform a server action and display whether it succeded
	* Promise.resolve()                                                                     // Start promise chain
	*   .then(()=> this.$prompt.spinner('someAction', 'Doing something complicated...'))    // Create spinner
	*   .then(()=> this.$http.get('/api/something/complicated'))                            // Make web request
	*   .then(()=> { ... })                                                                 // Do something with response from server
	*   .then(()=> this.$prompt.spinner('someAction', true))                                // If we got here we can assume it succeded
	*   .finally(()=> this.$prompt.spinner('someAction', false))                            // If we got here either its already succeded (above) or we can mark it as failed
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
	* Storage of all spinner toasts
	* @type {Object}
	*/
	$toast._spinners = {};


	/**
	* Display a toast with progress
	* @param {string} id A unique ID to identify the toast so it can be changed later
	* @param {string} [text] The text of the progress area
	* @param {number} progress Progress to show between 0 and 100 - at 100 the progress display is removed
	* @param {object} [options] Additional options to pass
	* @param {object} [options.icon="far fa-spinner fa-spin"] Font-Awesome comaptible icon class to use in the side of the toast
	*
	* @example Perform a multi-step action showing progress
	* Promise.resolve()                                                                     // Start promise chain
	*   .then(()=> this.$prompt.progress('someAction', 'Working on things'))                // Show initial toast with starting text
	*   .then(()=> Promise.timeout(2000))                                                   // Wait 2s
	*   .then(()=> this.$prompt.progress('someAction', 25))                                 // Set progress to 25%
	*   .then(()=> this.$prompt.progress('someAction', 'Still working', 50))                // Update text and set progress to 50%
	*   .then(()=> Promise.timeout(2000))                                                   // Wait 2s
	*   .finally(()=> this.$prompt.progress('someAction', 100))                             // Show 100% completion - automatically removes the toast after an interval
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


	/**
	* Storage of all progress toasts
	* @type {Object}
	*/
	$toast._progress = {};


	/**
	* Generic fault catching $toast display
	* This function is intended to be within the `catch()` functionality of a promise
	* It will attempt to decode the error to display based on internal tests ignoring the generic 'cancel' string message (used in $prompt dialogs)
	*
	* @example Perform a server action and show errors if any
	* Promise.resolve()                                                                     // Start promise chain
	*   .then(()=> this.$http.get('/api/something/complicated'))                            // Make web request
	*   .catch(this.$toast.catch)                                                           // Handle all error output
	*/
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
			: obj && _.isFunction(obj.toString) && obj.toString() !== '[object Object]' ? obj.toString() :
			'An error has occured'
		, options);
	};

	return $toast;
});
</script>

<style>
.snotifyToast {
	box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.2);
}

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

/* Async {{{ */
.snotifyToast.snotify-async .snotify-icon--async {
	right: 5px !important;
	height: 30px;
	width: 30px;
}
/* }}} */
/* Ask / Confirm {{{ */
.snotifyToast.snotify-confirm {
	background-color: #eee;
	color: #000;
}

.snotifyToast.snotify-confirm .snotifyToast__progressBar {
	background-color: #c7c7c7;
}

.snotifyToast.snotify-confirm .snotifyToast__progressBar .snotifyToast__progressBar__percentage {
	background-color: #4c4c4c;
}

.snotifyToast.snotify-confirm .snotifyToast__body,
.snotifyToast.snotify-confirm .snotifyToast__buttons button,
.snotifyToast.snotify-confirm {
	color: #000;
}
/* }}} */
/* Progress {{{ */
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
/* Save {{{ */
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
