<style>
.sidebar.sidebar-left {
	position: fixed;
	top: 132px;
	left: 240px;
	height: calc(100% - 130px);
	width: 200px;
	z-index: 10;
	box-shadow: 4px 4px 4px 0px rgba(0,0,0,0.1);
	transition: left 0.1s ease-out;
	overflow-y: auto;
}

/* Stick to minimized side-panel {{{ */
#wrapper.enlarged .sidebar.sidebar-left {
	left: 70px;
}
/* }}} */
</style>
