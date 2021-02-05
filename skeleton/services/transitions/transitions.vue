<script lang="js" frontend>
app.service('$transitions', function() {
	var $transitions = {};

	/**
	* Specify whether to use any transitions
	* If this is false, 'none' is used for all transitions and can never change
	* @var {bool}
	*/
	$transitions.enabled = false;

	$transitions.transitions = {
		'none': {
			class: 'page-transition-none', // CSS class to apply to the <transition/> element
			maxKeepAlive: 0, // How long to preserve the last page before cleaning up (generally x2 of the CSS animation duration)
		},
		'cover-up': {
			class: 'page-transition-cover-up',
			maxKeepAlive: 2000,
		},
		'slide-left': {
			class: 'page-transition-slide-left',
			maxKeepAlive: 2000,
		},
		'slide-right': {
			class: 'page-transition-slide-right',
			maxKeepAlive: 2000,
		},
		'slide-up': {
			class: 'page-transition-slide-up',
			maxKeepAlive: 2000,
		},
		'fade': {
			class: 'page-transition-fade',
			maxKeepAlive: 2000,
		},
	};

	$transitions.current = $transitions.transitions.none;

	/**
	* Set the current page transition
	* This is pretty useless unless its immediately followed by a router action
	* @param {string} [id="none"] The ID of the transition to apply
	* @see $router.go()
	*/
	$transitions.set = (id = 'none') => {
		if (!$transitions.enabled) return $transitions.transitions.none;
		if (!$transitions.transitions[id]) throw new Error(`Unknown transition "${id}"`);
		$transitions.current = $transitions.transitions[id];
	};

	return $transitions;
});
</script>

<style>
/* page-transition-cover-up {{{ */
.page-transition-cover-up-enter-active, .page-transition-cover-up-leave-active {
	position: absolute;
	width: calc(100% - 300px);
	transition: transform 0.2s ease-out, opacity 0.2s ease-out;
	display: inline-block;
}

.page-transition-cover-up-enter {
	transform: translateY(100vh);
}

.page-transition-cover-up-enter-to {
	transform: translateY(0vh);
}

.page-transition-cover-up-leave {
	opacity: 1;
}

.page-transition-cover-up-leave-to {
	opacity: 0;
}
/* }}} */

/* page-transition-fade {{{ */
.page-transition-fade-enter-active, .page-transition-fade-leave-active {
	position: absolute;
	width: calc(100% - 300px);
	transition: opacity 0.2s ease-out;
	display: inline-block;
}

.page-transition-fade-enter {
	opacity: 0;
}

.page-transition-fade-enter-to {
	opacity: 1;
}

.page-transition-fade-leave {
	opacity: 1;
}

.page-transition-fade-leave-to {
	opacity: 0;
}
/* }}} */

/* page-transition-slide-right {{{ */
.page-transition-slide-right-enter-active, .page-transition-slide-right-leave-active {
	position: absolute;
	width: calc(100% - 300px);
	transition: transform 0.2s ease-out;
	display: inline-block;
}

.page-transition-slide-right-enter {
	transform: translateX(100vw);
}

.page-transition-slide-right-enter-to {
	transform: translateX(0vw);
}

.page-transition-slide-right-leave {
	transform: translateX(0vw);
}

.page-transition-slide-right-leave-to {
	transform: translateX(-100vw);
}
/* }}} */

/* page-transition-slide-left {{{ */
.page-transition-slide-left-enter-active, .page-transition-slide-left-leave-active {
	position: absolute;
	width: calc(100% - 300px);
	transition: transform 0.2s ease-out;
	display: inline-block;
}

.page-transition-slide-left-enter {
	transform: translateX(-100vw);
}

.page-transition-slide-left-enter-to {
	transform: translateX(0vw);
}

.page-transition-slide-left-leave {
	transform: translateX(0vw);
}

.page-transition-slide-left-leave-to {
	transform: translateX(100vw);
}
/* }}} */

/* page-transition-slide-up {{{ */
.page-transition-slide-up-enter-active, .page-transition-slide-up-leave-active {
	position: absolute;
	width: calc(100% - 300px);
	transition: transform 0.2s ease-out;
	display: inline-block;
}

.page-transition-slide-up-enter {
	transform: translateY(100vh);
}

.page-transition-slide-up-enter-to {
	transform: translateY(0vh);
}

.page-transition-slide-up-leave {
	transform: translateY(0vh);
}

.page-transition-slide-up-leave-to {
	transform: translateY(-100vh);
}
/* }}} */
</style>
