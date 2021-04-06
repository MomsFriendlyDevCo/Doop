<script lang="js" frontend>
/**
* This is the Vue endpoint for vm.$loader, if you want a standalone version see https://www.npmjs.com/package/@momsfriendlydevco/loader
*/
var Loader = {
	/**
	* Fast access boolean to determine if we are doing any loading (foreground or background)
	* @var {boolean}
	*/
	loading: false,

	/**
	* Fast access boolean to determine if we are doing specifically foreground loading
	* @var {boolean}
	* @see updateStates()
	*/
	loadingForeground: false,

	/**
	* Fast access boolean to determine if we are doing specifically background loading
	* @var {boolean}
	* @see updateStates()
	*/
	loadingBackground: false,

	/**
	* Storage of all ID's that we are waiting on in the foreground
	* This object should be empty when there is no more foreground loading to do
	* @var {Object}
	* @see updateStates()
	*/
	waitingForeground: {},

	/**
	* Storage of all ID's that we are waiting on in the background
	* This object should be empty when there is no more background loading to do
	* @var {Object}
	*/
	waitingBackground: {},

	/**
	* Custom bindings to execute when certain events occur
	* This is a really low-rent implementation of an event omtiter
	* Replace these noop functions with your own if you wish to bind to custom events
	* @var {Object}
	*/
	on: {
		start: id => {},
		stateUpdate: state => {},
		stop: id => {},
		stopAll: ()=> {},
	},

	/**
	* Returns if the loader is active
	* @return {boolean} Whether the loader is active
	*/
	isActive: function() {
		return Boolean(
			Object.keys(Loader.waitingForeground).length ||
			Object.keys(Loader.waitingBackground).length
		);
	},

	/**
	* Determines if we are loading in the foreground rather than background loading
	* @return {boolean} True if we are loading in the foreground, false if the background
	*/
	isForeground: function() {
		return Object.keys(Loader.waitingForeground).length > 0;
	},

	/**
	* Determines if we are loading in the background rather than foreground loading
	* @return {boolean} True if we are loading in the background, false if the foreground
	*/
	isBackground: function() {
		return Object.keys(Loader.waitingBackground).length > 0;
	},

	/**
	* Start the loading of an item by an optional ID
	* Loading is only closed off when all ID's call the .stop() function
	* @param {string} [id='default'] Optional ID to use
	* @param {boolean} [foreground=true] Whether to load the object in the foreground (if false $scope.startBackground is used instead)
	* @return {Object} This chainable loader object
	*/
	start: function(id, foreground) {
		if (!id) id = 'default';
		if (foreground === undefined) foreground = true;

		var wasBackground = false;

		if (foreground) {
			wasBackground = Loader.isBackground();
			Loader.waitingForeground[id] = true;
		} else {
			Loader.waitingBackground[id] = true;
		}

		Loader.on.start(id);

		var isForeground = Loader.isForeground();
		document.body.classList.add('loading', isForeground ? 'loading-foreground' : 'loading-background');
		if (wasBackground) Loader.timers.backgroundCloseout.setup(); // Manage transition from background -> foreground
		document.body.classList.remove(isForeground ? 'loading-background' : 'loading-foreground');
		Loader.updateStates();


		return Loader;
	},

	/**
	* Alias function for start(id, false)
	* @see start()
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	startBackground: function(id) {
		return Loader.start(id, false);
	},

	/**
	* Update the fast-access state variables
	*/
	updateStates: function() {
		var isLoading = Loader.isActive();
		var isForeground = Loader.isForeground();
		var isBackground = Loader.isBackground();
		Loader.loading = isLoading;
		Loader.loadingForeground = isForeground;
		Loader.loadingBackground = isBackground;
		Loader.on.stateUpdate({loading: isLoading, foreground: isForeground, background: isBackground});
	},

	/**
	* Handle for various timers
	* @var {Object}
	*/
	timers: {
		foregroundCloseout: {
			handle: null,
			interval: 1000,
			callback: function() {
				document.body.classList.remove('loading-foreground-closing');
			},
			setup: function() {
				document.body.classList.add('loading-foreground-closing');
				Loader.timers.foregroundCloseout.handle = setTimeout(Loader.timers.foregroundCloseout.callback, Loader.timers.foregroundCloseout.interval);
			},
			teardown: function() {
				cancelTimeout(Loader.timers.foregroundCloseout.handle);
			},
		},
		backgroundCloseout: {
			handle: null,
			interval: 1000,
			callback: function() {
				document.body.classList.remove('loading-background-closing');
			},
			setup: function() {
				document.body.classList.add('loading-background-closing');
				Loader.timers.backgroundCloseout.handle = setTimeout(Loader.timers.backgroundCloseout.callback, Loader.timers.backgroundCloseout.interval);
			},
			teardown: function() {
				cancelTimeout(Loader.timers.backgroundCloseout.handle);
			},
		},
	},

	/**
	* Release an item from loading
	* When all items are released the loader animation is stopped
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	stop: function(id) {
		if (!id) id = 'default';

		var wasForeground = Loader.waitingForeground[id];
		if (wasForeground) {
			delete Loader.waitingForeground[id];
		} else if (Loader.waitingBackground[id]) {
			delete Loader.waitingBackground[id];
		} else { // Unknown ID
			return;
		}

		Loader.on.stop(id);

		if (!Loader.isActive()) { // Nothing waiting
			document.body.classList.remove('loading', 'loading-foreground', 'loading-background');
			if (wasForeground) {
				Loader.timers.foregroundCloseout.setup();
			} else {
				Loader.timers.backgroundCloseout.setup();
			}
			Loader.on.stopAll();
		} else if (!Loader.isForeground()) { // Transition from foreground -> background
			document.body.classList.add('loading-background');
			document.body.classList.remove('loading-foreground');
			Loader.timers.foregroundCloseout.setup();
		}
		Loader.updateStates();

		return Loader;
	},

	/**
	* Remove all pending items from the loader queue
	* @return {Object} This chainable loader object
	*/
	clear: function() {
		Loader.waitingForeground = {};
		Loader.waitingBackground = {};
		Loader.stop();
		return Loader;
	},


	/**
	* The template to add to the page during init()
	* @see init()
	* @var {string}
	*/
	templateHTML: '<div class="loader-bar"></div><div class="loader-spinner"></div>',

	/**
	* Fired at the earliest possible point when we have the document.body addressable
	* This function creates all the elements required for the loader to operate from templateHTML
	* @see templateHTML
	*/
	init: function() {
		var elem = document.createElement('div');
		elem.innerHTML = Loader.templateHTML;
		document.body.appendChild(elem);
	},
};

Loader.init();

app.mixin({
	beforeCreate() {
		// Instanciate each loader with this components unique ID prefix
		this.$loader = {
			...Loader,

			/**
			* Signal that a process is starting
			* @param {string} [id=vm._uid] A unique ID to assign to this loader, if omitted vm._uid is used
			* @param {boolean} [foreground] Specify that the foreground loader type should be used
			*/
			start: (id, foreground) => {
				if (typeof id == 'string') {
					return Loader.start(id, foreground);
				} else {
					return Loader.start(this._uid, foreground);
				}
			},

			/**
			* Shortcut to start a process in the background
			* @param {string} [id=vm._uid] A unique ID to assign to this loader, if omitted vm._uid is used
			*/
			startBackground: id => Loader.start(id || this._uid, false),

			/**
			* Signal that a process has finished
			* @param {string} [id=vm._uid] A unique ID to stop, if omitted vm._uid is used
			*/
			stop: id => Loader.stop(id || this._uid),
		};
	},
});
</script>

<style>
/* Bootstrapping overlay {{{ */
body.bootstrapping #app {
	display: none;
}

.splash {
	display: none;
	position: fixed;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
}

.splash-init {
	background: #CCC;
}

body.bootstrapping .splash.splash-init {
	display: flex;
	align-content: center;
	justify-content: center;
}

body.bootstrapping .splash.splash-init > img {
	width: 50vw;
	max-width: 200px;
}
/* }}} */
/* Error overlay {{{ */
.splash.splash-crash {
	display: none;
	background: #CCC;
	align-content: center;
	justify-content: center;
	flex-direction: column;
}

.splash.splash-crash > img {
	width: 50vw;
	max-width: 700px;
	margin-bottom: 20px;
}

.splash.splash-crash > * {
	align-self: center;
}
/* }}} */
/* Loader bar styles {{{ */
.loader-bar {
	height: 5px !important;
	z-index: 1 !important;
}

.loader-bar::before, .loader-bar::after {
	background: #3264d5 !important;
}

body.loading-foreground .loader-spinner {
	display: none; /* Don't display smaller spinner when we are already foreground loading */
}

.loading-background .loader-spinner {
	opacity: 0.7;
}

.loader-spinner {
	top: auto;
	left: auto;
	right: 10px !important;
	bottom: 5px !important;
	height: 50px;
	width: 50px;
}

.loader-spinner::before {
	animation-duration: 0.80s;
	width: 50px;
	height: 50px;
	border-color: var(--main);
	border-width: 4px;
	border-bottom-color: transparent;
	border-left-color: transparent;
}
/* }}} */
/* Foreground loader spinner {{{ */
.splash.splash-loading-foreground .splah-loading-foreground-spinner {
	position: absolute;
	display: block;
	width: 16rem;
	height: 16rem;
	border-top: 3px solid var(--main);
	border-right: 3px solid transparent;
	border-radius: 50%;
	animation: splah-loading-foreground-spinner-spin 2s linear infinite;
}

@keyframes splah-loading-foreground-spinner-spin {
	from{transform: rotate(0deg)}
	to{transform: rotate(360deg)}
}
/* }}} */
</style>
