<style>
/** .btn-group-float
* Display a set of floating buttons (also called 'FAB' - Floating Action buttons)
*
* @example Display an add button for a list
* <div class="btn-group-float">
*   <a v-href="'/widgets/create'" class="btn btn-icon btn-circle btn-success fa fa-plus" v-tooltip="'Create a new widget'"></a>
* </div>
*
* @example Display a save button
* <div class="btn-group-float">
*   <a @click="$ctrl.save()" class="btn btn-icon btn-circle btn-success fa fa-check" v-tooltip="'Save changes'"></a>
* </div>
*/

.btn-group-float {
	position: fixed;
	right: 20px;
	z-index: 10;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	transition: opacity .2s ease-out, bottom .2s ease-out;
}

.btn-group-float.pull-left {
	right: auto;
	left: 300px;
}

.btn-group-float .btn {
	font-size: 12pt;
	padding: 15px;
	width: 55px;
	height: 55px;

	display: flex;
	justify-content: center;
	align-items: center;
}

.btn-group-float .btn.btn-sm {
	font-size: 12pt;
	padding: 10px;
	height: 40px;
	width: 40px;
}

.btn-group-float .btn.btn-lg {
	font-size: 16pt;
	padding: 16px;
	width: 70px;
	height: 70px;
}

/* Nudge large 'Save' buttons into the shoulder of smaller delete buttons */
.btn-group-float .btn.btn-sm.btn-danger + .btn.btn-lg.btn-success,
.btn-group-float .btn.btn-sm.btn-secondary + .btn.btn-lg.btn-success {
	margin-left: -10px;
}


/* Extra small 'cancel' like button which hides behind a larger button if its the last in the list */
.btn-group-float .btn-xs {
	position: absolute;
	bottom: -7px;
	right: -7px;
	padding: 2px;
	height: 30px;
	width: 30px;
	z-index: -1;
	margin-right: 0;
}

.btn-group-float .btn-xs:hover {
	z-index: 1;
}

/* Hide when routing or animating {{{ */
.btn-group-float {
	opacity: 1;
	bottom: 20px;
}

body.loading .btn-group-float {
	opacity: 0;
	bottom: -80px;
}
/* }}} */

/* Shadowing (mainly fixes with .waves-circle) {{{ */
.btn-group-float .btn {
	box-shadow: 4px 4px 5px 0px rgba(50, 50, 50, 0.5) !important;
}

.btn-group-float .btn.waves-circle {
	-webkit-mask-image: none !important;
}
/* }}} */

/* Hide when printing {{{ */
@media print {
	.btn-group-float {
		display: none;
	}
}
/* }}} */

/* Nudge smaller buttons slightly behind larger ones {{{ */
.btn-group-float .btn.btn-sm {
	margin-right: -10px;
	transition: margin-right 0.4s ease-out, padding 0.4s ease-out;
}

.btn-group-float .btn.btn-sm:hover {
	margin-right: 2px;
	padding: 25px;
}
/* }}} */
</style>
