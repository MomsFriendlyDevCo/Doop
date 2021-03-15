<script lang="js" frontend>
app.service('$prompt', function() {
	var $prompt = {};

	this.$debug = this.$debug.new('$prompt').enable(false);
	$prompt.dialogQueue = [];


	// $prompt.modal() {{{
	/**
	* General helper for Bootstrap modals
	* This adds a promise structure around modals which makes them easier to handle
	*
	* Advantages over handling modal popups with $element.modal('show'):
	*
	* 	* Uses promises instead of weird callbacks
	*	* Fires notification promises with each status update
	*	* Handles nesting automatically
	*
	* @param {Object} settings Settings structure to pass OR the jQuery selected modal to display
	* @param {Object|string} settings.element The modal object (usualy selected as `$('.modal')` or something), this is populated from 'settings' if its passed in as the only argument
	* @param {function} [settings.onShow] Optional callback to fire when the modal animation begins. Called as (settings)
	* @param {function} [settings.onShown] Optional callback to fire when the modal animation finishes and the modal is fully shown. Called as (settings)
	* @param {function} [settings.onHide] Optional callback to fire when the modal hide animation starts. Called as (settings)
	* @param {function} [settings.onHidden] Optional callback to fire when the modal hide animation finishes and the modal is fully hidden. Called as (settings)
	* @param {boolean} [settings.keyboard=false] React to the escape key to close the modal
	* @param {boolean} [settings.backdrop=true] Show a backdrop when displaying the modal
	* @param {Object} [settings.defer] The defer object to track against, if omitted one is created automatically
	* @param {string} [settings.status='showing'] A read-only property showing the current status of the modal when the settings object is passed to a callback
	* @param {boolean} [settings.nesting=true] Automatically determine if this modal is nested and apply a background in front of existing modals
	* @param {number} [settings.nestingZStart=10000] What Z-index to start numbering from if settings.nesting is enabled
	* @param {number} [settings.nestingZStep=10] What Z-index incrementor to use for each successive modal
	* @returns {Promise} Promise that is fired when the modal closes
	*
	* @example Show a simple modal and react when it closes
	* $prompt.modal($('#myModal')).then(()=> console.log('Closed'))
	* @example Pass in options
	* $prompt.modal({element: $('#myModal'), onShow: ()=> {...}})
	* @example Use the promise notfier to update the modal status
	* $prompt.modal($('#myModal')).then(()=> {...}, ()=> {...}, settings => console.log(`Modal Status: ${settings.status}`))
	*/
	$prompt.modal = options => {
		if (!_.isPlainObject(options)) options = {element: options};

		var settings = {
			status: 'showing',
			onShow: ()=> {},
			onShown: ()=> {},
			onHide: ()=> {},
			onHidden: ()=> {},
			defer: Promise.defer(),
			keyboard: false,
			backdrop: true,
			nesting: true,
			nestingZStart: 10000,
			nestingZStep: 10,
			...options,
		};

		this.$debug('$prompt.modal', settings);
		app.set($prompt, 'settings', settings);

		// Expand expression into object if passed a string
		if (_.isString(settings.element)) settings.element = $(settings.element);

		setTimeout(()=> {
			if (settings.nesting) { // Detect existing modals and attempt to nest?
				var existingModals = $('.modal.in').length;

				// Rank existing modals in z-index order (if they don't already have a z-index applied)
				$('.modal.in').each((i, elem) => {
					var $elem = $(elem);
					if (!$elem.css('z-index')) $elem.css('z-index', settings.nestingZStart + (settings.nestingZStep * i));
				});

				// Apply a z-index bias to this modal
				settings.element.css('z-index', settings.nestingZStart + (settings.nestingZStep * (existingModals + 1)));
			}

			settings.element
				.one('show.bs.modal', ()=> {
					if (settings.nesting) { // Set appearing backdrop overlay's correct z-index
						// Rank existing backdrops in z-index order (ignoring if they z-index applied, as they are just dumb covering elements)
						$('body > .modal-backdrop.in').each((i, elem) => {
							var $elem = $(elem);
							$elem.css('z-index', settings.nestingZStart + (settings.nestingZStep * i));
						});
					}
					if (settings.backdrop) $('body > .modal-backdrop').addClass('shown'); // Add the shown class late to the backdrop - allows the CSS transition to apply if fading / bluring etc.

					settings.status = 'showing';
					settings.onShow(settings);
					settings.defer.notify(settings);
				})
				.one('shown.bs.modal', ()=> {
					settings.status = 'shown';
					settings.onShown(settings);
					settings.defer.notify(settings);
				})
				.one('hide.bs.modal', ()=> {
					settings.status = 'hiding';
					settings.onHide(settings);
					settings.defer.notify(settings);
				})
				.one('hidden.bs.modal', ()=> {
					// Stop BS from removing the body.modal-open class if we still have modals on the screen
					if (settings.nesting && $('.modal.in').length) $('body').addClass('modal-open');

					settings.status = 'hidden';
					settings.onHidden(settings);
					settings.defer.notify(settings);
					settings.defer.resolve();
				})
				.modal({
					keyboard: settings.keyboard,
					show: true,
					backdrop: settings.backdrop,
				})
		});

		return settings.defer.promise;
	};
	// }}}

	// $prompt.dialog() {{{
	/**
	* Current holder for dialog options
	* This is usually a 1:1 mapping for the dialog options
	* @see dialog()
	* @var {Object}
	* @param {Promise} defer The promise object for the current dialog
	* @param {string} defer.state Tracking of the promise status. ENUM: 'pending', 'resolved', 'rejected'
	* @param {Object} $body The $sce compiled version of the dialog body if isHtml is truthy
	* @param {Object} $bodyHeader The $sce compiled version of bodyHeader
	* @param {Object} $bodyFooter The $sce compiled version of bodyFooter
	* @param {function} $dialogClose Binding for dialogClose
	* @param {string} $status The status of the dialog. ENUM: 'showing', 'shown', 'hiding', 'hidden'
	*/
	$prompt.settings = undefined;


	/**
	* Storage for previous settings queues
	* This gets appended if a model-within-model situation occurs
	* Upon model close this should get popped so that $prompt.settings is always the latest version
	* @type {array<Object>}
	*/
	$prompt.settingsNested = [];


	/**
	* Display a dialog with various customisations
	* This is the main $prompt worker - all the other $prompt.* functions are really just wrappers for this function
	* NOTE: Use $prompt.dialog.method() to communicate with the nested component - e.g. via button click actions
	*
	* @param {Object} options Dialog options to use
	* @param {string} [options.title='Dialog'] The dialog title, HTML is supported
	* @param {string} [options.body=''] The dialog body (usually the message to display)
	* @param {boolean} [options.isHtml=false] Whether the dialog body should be rendered as HTML (must be $sce compilable)
	* @param {string} [options.bodyHeader] Additional HTML to render above the main body area (this is always HTML rendered)
	* @param {string} [options.bodyFooter] Additional HTML to render under the main body area (this is always HTML rendered)
	* @param {string} [options.component] Vue component object to render as the modal body (under options.body if present), either as a string or wrapped with `app.component('fooComponent')`. Uses the `<dynamic-component/>` service to render so can also accept props, events etc.
	* @param {Object} [options.componentProps] Property values to pass when initializing the component
	* @param {Object} [options.componentEvents] Event mappings to pass when initializing the component
	* @param {string|array} [options.modalClass] Optional modal class items to add (e.g. 'modal-lg')
	* @param {Object} [options.scope] Scope to use when interpolating HTML (if isHtml is truthy)
	* @param {string} [options.dialogClose='reject'] How to handle the promise state if the dialog is closed. ENUM: 'resolve', 'reject', 'nothing'
	* @param {boolean} [options.backdrop=true] Whether to display a dimmed backdrop when drawing the dialog
	* @param {boolean} [options.keyboard=true] Close the dialog when the escape key is pressed. Uses dialogClose to work out what to do
	*
	* @param {array} [options.buttons.{}] Buttons to display (the promise will be resolved with the clicked button.id) has the subkeys {left, right, center}
	* @param {string} [options.buttons.{}.[].id] The ID of the button to resolve the promise with
	* @param {string} [options.buttons.{}.[].title] The text to display on the button
	* @param {string} [options.buttons.{}.[].class='btn btn-success'] The button class to apply (default is 'btn btn-success' for buttons that resolve, 'btn btn-danger' for ones that reject and 'btn btn-default' otherwise)
	* @param {string} [options.buttons.{}.[].method='resolve'] How to close the promise. ENUM: 'resolve', 'reject'. False or null will only close the dialog
	* @param {function} [options.buttons.{}.[].click] Function to run when the button is clicked, this will be automatically formed from 'method' if present. Call $prompt.close() to terminate the dialog. Callback is called as `(settings)`
	*
	* @param {function} [options.onShow] Function to execute when the dialog is being shown
	* @param {function} [options.onShown] Function to execute when the dialog is ready
	* @param {function} [options.onHide] Function to execute when the dialog is hiding
	* @param {function} [options.onHidden] Function to execute when the dialog is completely hidden
	*
	* @return {Promise} Promise that is triggered when the dialog closes. The responses are determined by the button methods as well as dialogClose
	* @emits $prompt.open Message to PromptHelper component to display the dialog
	*/
	$prompt.dialog = options => {
		// If we're already showing a dialog - defer showing the next dialog until this one has finished {{{
		if ($prompt.settings) {
			this.$debug('Dialog already present, stashing previous settings', {current: $prompt.settings, new: options});
			$prompt.settingsNested.push($prompt.settings);
		}
		// }}}

		// Setup defaults {{{
		var settings = app.set($prompt, 'settings', {
			title: 'Dialog',
			body: '',
			isHtml: false,
			component: undefined,
			keyboard: true,
			backdrop: true,
			bodyHeader: undefined,
			bodyFooter: undefined,
			scope: undefined,
			dialogClose: 'reject',
			buttons: {
				left: [],
				center: [{
					id: 'close',
					title: 'Close',
					method: 'resolve',
				}],
				right: [],
			},
			defer: Promise.defer(),
			...options,
		});
		this.$debug('$prompt.dialog', settings);

		if (settings.component && !_.isString(settings.component)) throw new Error('$prompt.dialog({component}) must be a string or object - use the raw component name or the wrapped app.component(name) value');
		// }}}

		// Attach to promise to add a status property {{{
		settings.defer.state = 'pending';
		settings.defer.promise.then(
			()=> settings.defer.state = 'resolved',
			()=> settings.defer.state = 'rejected',
		);
		// }}}

		// Setup dialogClose {{{
		if (!settings.$dialogClose) {
			if (_.isUndefined(settings.dialogClose) || settings.dialogClose == 'resolve') {
				settings.$dialogClose = ()=> settings.defer.resolve();
			} else if (settings.dialogClose == 'reject') {
				settings.$dialogClose = ()=> settings.defer.reject();
			}
		}
		// }}}

		// Setup buttons {{{
		if (!settings.buttons) settings.buttons = {};
		['left', 'right', 'center'].forEach(align => {
			if (!settings.buttons[align]) settings.buttons[align] = [];
			settings.buttons[align] = settings.buttons[align].map(b => {
				if (!b.click) b.click = ()=> { // Compute a click event from the method
					if (_.isUndefined(b.method) || b.method == 'resolve') {
						$prompt.close(true, b.id);
					} else if (b.method == 'reject') {
						$prompt.close(false, b.id);
					}
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
		});
		// }}}

		// Open the dialog (via Bootstrap) {{{
		app.broadcast('$prompt.open', settings);

		// Trap out-of-context destruction (clicking on background, pressing escape etc.) and reroute to cancel action
		$(document).one('hide.bs.modal', ()=> $prompt.close(false))
		// }}}

		return settings.defer.promise;
	};


	/**
	* Call a method on an open $prompt.dialog instance component
	* @param {string} method The method name to call
	* @param {*} [args...] Additional arguments to pass
	* @returns {*} The return of the method
	*/
	$prompt.dialog.method = (method, ...args) => app.broadcast('$prompt.method', method, ...args);


	/**
	* Close the dialog if open
	* This may trigger another dialog to open if one is queued
	* NOTE: This does not resolve the dialog promise
	* @param {boolean} [ok=false] Whether the dialog contents we're accepted - this is used to determine whether resolve/reject should be called on close
	* @param {*} [payload] Payload to pass to resolve / reject handlers
	* @emits $prompt.close Message to the promptHelper that it should close the dialog
	* @returns {Promise} A promise object which resolves when the dialog has closed
	*/
	$prompt.close = (ok = false, payload) => {
		if (!$prompt.settings) {
			this.$debug('Closing already closed modal - assuming internal recursion and ignoring');
			return;
		}

		this.$debug('Close modal', {status: ok ? 'resolve' : 'reject', payload});

		// FIXME: Single field responses are being returned as Object.
		$prompt.settings.defer[ok ? 'resolve' : 'reject'](payload);

		// Force a specific modal handle to close
		if ($prompt.settings.element) {
			$prompt.settings.element.modal('hide');
			app.set($prompt, 'settings', undefined);
		}

		// Close standard (handled) modals
		app.broadcast('$prompt.close', !!ok);


		// Pop back to previous settings object if we have one
		if ($prompt.settingsNested.length) {
			$prompt.settings = $prompt.settingsNested.pop();
			this.$debug('Pop $prompt session', $prompt.settings);
		}

		return Promise.resolve();
	};


	/**
	* Shorthand function to resolve the current prompt and close the dialog
	* @param {*} [value] Optional payload to pass as a resolved value
	*/
	$prompt.resolve = value => $prompt.close(true, value);

	/**
	* Shorthand function to reject the current prompt and close the dialog
	* @param {*} [value] Optional payload to pass as a rejected value
	*/
	$prompt.reject = value => $prompt.close(false, value);
	// }}}

	// All other $prompt.* functions are in seperate files within `services/prompt/prompt.*.vue`

	return $prompt;
});
</script>
