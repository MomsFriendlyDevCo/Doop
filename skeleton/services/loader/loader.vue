<script lang="js" frontend>
/**
* The loader is really just a wrapper for @momsfriendlydevco/loader
* @url https://www.npmjs.com/package/@momsfriendlydevco/loader
*/
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
