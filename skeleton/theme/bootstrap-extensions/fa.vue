<style>
/* Fixed width icons within buttons */
.btn.fa-fw {
	display: inline-block;
	text-align: center;
	vertical-align: middle;
	width: 2.4em;
	height: 2.4em;
	padding: 7px 5px 5px;
}

/* Better spacing for icons */
.list-group .list-group-item > i {
	margin-right: 5px;
}

/* Add a background "throb" animation to fa? icons {{{ */
.fal.fa-throb,
.fal.fa-throb,
.far.fa-throb,
.fas.fa-throb,
.fab.fa-throb {
	position: relative; /* Parent has to be relative so absolute positioning of throbber works */

	&::after {
		content: "";
		position: absolute;
		left: -11px;
		top: -10px;
		width: 40px;
		height: 40px;
		z-index: 0;
		background: #f00;
		display: inline-block;
		border-radius: 50%;
		animation: fa-throb 1s ease-in infinite;
	}

	@keyframes fa-throb {
		0% { transform: scale(0); opacity: 1;}
		100% { transform: scale(1); opacity: 0;}
	}
}
/* }}} */
</style>
