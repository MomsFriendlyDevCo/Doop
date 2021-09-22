<style lang="scss">
/* Hide initial boot app area until we've finished bootstrapping {{{ */
body.bootstrapping #app {
	display: none;
}
/* }}} */

.splash {
	/* .splash - Generic overlay {{{ */
	display: none;
	position: fixed;
	top: 0px;
	left: 0px;
	right: 0px;
	bottom: 0px;
	/* }}} */

	/* .splash-init - Bootstrapping overlay {{{ */
	&.splash-init {
		/* NOTE: These root styles all need to be injected inline in layouts/main.html due to how early this component loads */
		align-items: center;
		justify-content: center;
		background: var(--main);

		body.bootstrapping & {
			display: flex;
		}

		& > img {
			width: 50vw;
			max-width: 400px;
		}
	}

	/* }}} */

	/* .splash-loading-foreground - Foreground loading overlay {{{ */
	&.splash-loading-foreground {
		display: none;

		body.loading.loading-foreground & {
			display: flex;
			align-items: center;
			justify-content: center;
			background: #FFF;
		}

		/* Foreground surround spinner {{{ */
		&::before {
			content: '';
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
	}
	/* }}} */
}
/* }}} */
</style>
