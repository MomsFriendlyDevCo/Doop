<script lang="js" frontend>
/**
* This is the Vue endpoint for vm.$loader, if you want a standalone version see https://www.npmjs.com/package/@momsfriendlydevco/loader
* This singleton manages global load states with each VueComponent calling vm.start(isForeground?), vm.startBackground(), vm.stop() respectively
*
* Site init          - display the .splash.splash-init <div/> fullscreen
* Foreground loading - display the .splash.splash-loading-foreground <div/> fullscreen
* Background loading - display a small spinner in the bottom right of the page
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
	* @var {Set}
	* @see updateStates()
	*/
	waitingForeground: new Set(),


	/**
	* Storage of all ID's that we are waiting on in the background
	* This object should be empty when there is no more background loading to do
	* @var {Set}
	* @see updateStates()
	*/
	waitingBackground: new Set(),


	/**
	* Returns if the loader is active
	* @return {boolean} Whether the loader is active
	*/
	isActive: function() {
		return Boolean(
			Loader.waitingForeground.size > 0 ||
			Loader.waitingBackground.size > 0
		);
	},


	/**
	* Determines if we are loading in the foreground rather than background loading
	* @return {boolean} True if we are loading in the foreground, false if the background
	*/
	isForeground: function() {
		return Loader.waitingForeground.size > 0;
	},


	/**
	* Determines if we are loading in the background rather than foreground loading
	* @return {boolean} True if we are loading in the background, false if the foreground
	*/
	isBackground: function() {
		return Loader.waitingBackground.size > 0;
	},


	/**
	* Start the loading of an item by an optional ID
	* Loading is only closed off when all ID's call the .stop() function
	* @param {string} [id='default'] Optional ID to use
	* @param {boolean} [foreground=true] Whether to load the object in the foreground (if false $scope.startBackground is used instead)
	* @return {Object} This chainable loader object
	*/
	start: function(id = 'loader', foreground = true) {
		if (foreground) {
			Loader.waitingForeground.add(id);
		} else {
			Loader.waitingBackground.add(id);
		}

		Loader.updateStates();


		return Loader;
	},


	/**
	* Alias function for start(id, false)
	* @see start()
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	startBackground: function(id = 'loader') {
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

		document.body.classList.toggle('loading', isLoading);
		document.body.classList.toggle('loading-foreground', isForeground);
		document.body.classList.toggle('loading-background', !isForeground && isBackground);
	},


	/**
	* Release an item from loading
	* When all items are released the loader animation is stopped
	* @param {string} [id='default'] Optional ID to use
	* @return {Object} This chainable loader object
	*/
	stop: function(id = 'loader') {
		delete Loader.waitingForeground.delete(id);
		delete Loader.waitingBackground.delete(id);
		Loader.updateStates();

		return Loader;
	},


	/**
	* Remove all pending items from the loader queue
	* @return {Object} This chainable loader object
	*/
	clear: function() {
		Loader.waitingForeground.clear();
		Loader.waitingBackground.clear();
		Loader.stop();
		return Loader;
	},


	/**
	* Fired at the earliest possible point when we have the document.body addressable
	* This function creates all the elements required for the loader to operate from templateHTML
	* @see templateHTML
	*/
	init: function() {
		var elem = document.createElement('div');
		elem.id = 'core-loader';
		elem.innerHTML = '<div class="loader-spinner"></div>';
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
			start: (id, foreground) => Loader.start(id || `uid-${this._uid}`, foreground),


			/**
			* Shortcut to start a process in the background
			* @param {string} [id=vm._uid] A unique ID to assign to this loader, if omitted vm._uid is used
			*/
			startBackground: id => Loader.start(id || `uid-${this._uid}`, false),


			/**
			* Signal that a process has finished
			* @param {string} [id=vm._uid] A unique ID to stop, if omitted vm._uid is used
			*/
			stop: id => Loader.stop(id || `uid-${this._uid}`),
		};
	},
});
</script>

<style lang="scss">
/* Loader visibility {{{ */
body.loading-background #core-loader .loader-spinner {
	opacity: 1;
}
/* }}} */

#core-loader {
	/* .loader-spiner - Spinner / background processing indicator {{{ */
	& .loader-spinner {
		--loader-size: 50px;

		pointer-events: none;
		display: block;
		opacity: 0;
		position: absolute;
		top: auto;
		left: auto;
		right: 25px;
		bottom: 25px;
		height: var(--loader-size);
		width: var(--loader-size);
		transition: opacity 0.8s ease-out;

		&::before {
			animation-duration: 0.75s;
			animation-timing-function: linear;
			border-color: var(--main);
			border-style: solid;
			border-width: 5px;

			animation-name: loader-rotate;
			animation-iteration-count: infinite;
			border-bottom-color: transparent;
			border-left-color: transparent;
			border-radius: 50%;
			box-sizing: border-box;
			content: '';
			display: block;
			position: absolute;
			height: var(--loader-size);
			width: var(--loader-size);

			@keyframes loader-rotate {
				from { transform: rotate( 0deg ); }
				to { transform: rotate( 360deg ); }
			}
		}
	}
	/* }}} */
}
</style>
