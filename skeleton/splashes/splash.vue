<style>
.splash.splash-loading-foreground {
	background: #f3f3f3;
	position: fixed;
	top: 70px;
	left: 0px;
	right: 0;
	bottom: 0;
	z-index: 5; /* Must be >.navbar-main */
	font-size: 100px;
	color: #ccc;
	align-content: center;
	justify-content: center;
}

.splash.splash-loading-foreground::before {
	border-top: 5px solid var(--main-lighter);
	z-index: -1;
}

/* Remove margins when in mobile mode */
body.screen-xs .splash.splash-loading-foreground {
	top: 0px;
	left: 0px;
	z-index: 1000;
}

body.loading.loading-foreground .splash.splash-loading-foreground {
	display: flex;
	align-items: center;
}

.splash.splash-loading-foreground > img {
	width: 40vw;
	max-width: 500px;
	padding: 3rem;
}
</style>
