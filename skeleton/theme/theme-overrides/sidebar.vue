<style>
/* Sidebar should scroll when screen is too small */
#sidebar-menu {
	height: 100%;
	padding-top: 0px;
	overflow-x: hidden;
	overflow-y: auto;
}

/* Various fixes for icon offsets */
#sidebar-menu > ul.nav {
	height: 100%;
	display: block;
	padding: 0 !important;
}


/* Slightly smaller sidebar when in minimized mode */
#wrapper.enlarged .left.side-menu {
	width: 66px;
	position: fixed;
}


/* Hide menus from diplaying/taking up height on minified sidebar */
.forced.enlarged #sidebar-menu .listunstyled {
	display: none !important;
}


/* Keep consistant icon sizes */
#sidebar-menu ul li a i {
	font-size: 20px;
}


/* Add dropshadows */
.topbar, .left.side-menu {
	box-shadow: 0 0 6px 1px rgb(0 0 0 / 50%);
}
.left.side-menu {
	top: 66px;
}


/* Sidebar animation */
@media (max-width: 767px) {
	/* Expanded */
	.left.side-menu {
		transition: width 200ms ease-in-out;
	}

	#sidebar-menu {
		opacity: 1;
		transition: opacity 200ms ease-in-out;
		transition-delay: 250ms;
	}

	#sidebar-menu > ul > li > a {
		margin: 0 !important;
		min-height: 0 !important;
		padding: 12px 20px !important;
	}
	#wrapper.enlarged .left.side-menu #sidebar-menu > ul > li > a i {
		font-size: 16px !important;
		line-height: 17px;
		margin-right: 15px !important;
	}
	#sidebar-menu > ul > li > a > span {
		display: inline !important;
		padding-left: 0 !important;
	}

	.topbar > .topbar-left {
		transition: width 200ms ease-in-out;
	}

	/* Collapsed */
	.enlarged .left.side-menu {
		margin-left: 0 !important;
		pointer-events: none;
		transition-delay: 250ms;
		width: 0 !important;
	}

	.enlarged #sidebar-menu {
		opacity: 0;
		transition-delay: 0s;
	}


	.enlarged .topbar > .topbar-left {
		transition-delay: 250ms;
	}
}

@media (min-width: 768px) {
	/* Expanded */
	.left.side-menu {
		transition: width 200ms ease-in-out;
	}

	#sidebar-menu > ul > li > a {
		transition: padding 200ms ease-in-out;
		white-space: nowrap;
	}
	#sidebar-menu > ul > li > a > i {
		transition: font-size 200ms ease-in-out;
	}
	#sidebar-menu > ul > li > ul {
		max-height: 0px !important;
		position: relative !important;
		transition: max-height 500ms ease-in-out !important;
	}
	#sidebar-menu > ul > li.opened > ul {
		max-height: none !important;
	}
	#sidebar-menu > ul > li > ul > li,
	#sidebar-menu > ul > li > a > span {
		opacity: 1;
		transition: opacity 250ms ease-in-out;
		transition-delay: 500ms;
	}

	.topbar-left {
		height: 70px;
		transition: width 200ms ease-in-out;
	}
	.navbar-custom {
		transition: margin-left 200ms ease-in-out;
	}
	.logo {
		height: 100%;
		width: 100%;
	}
	.logo-inner-sm,
	.logo-inner-lg {
		display: block !important;
		position: absolute;
		top: 0;
	}
	.logo-inner-sm {
		opacity: 0;
		transition: opacity 200ms ease-in-out;
	}
	.logo-inner-lg {
		opacity: 1;
		transition: opacity 200ms ease-in-out;
		transition-delay: 250ms;
	}

	/* Collapsed */
	.enlarged .left.side-menu {
		transition-delay: 250ms;
	}

	.enlarged #sidebar-menu > ul > li > a > i {
		transition-delay: 250ms;
	}
	.enlarged #sidebar-menu > ul > li > ul {
		display: block !important;
		max-height: 0px !important;
		overflow: hidden;
		pointer-events: none;
	}
	.enlarged #sidebar-menu > ul > li > a > span {
		display: inline-block !important;
	}
	.enlarged #sidebar-menu > ul > li > ul > li,
	.enlarged #sidebar-menu > ul > li > a > span {
		opacity: 0;
		transition: opacity 250ms ease-in-out;
		transition-delay: 0ms;
	}
	.enlarged #sidebar-menu > ul > li > ul {
		border: 0 !important;
		padding: 0 !important;
	}

	.enlarged .topbar-left {
		transition-delay: 250ms;
	}
	.enlarged .navbar-custom {
		transition-delay: 250ms;
	}
	.enlarged .logo-inner-sm {
		opacity: 1;
		transition-delay: 250ms;
	}
	.enlarged .logo-inner-lg {
		opacity: 0;
	}
}
</style>
