<style>
/**
* Display a fixed aside on a page
* @example
* <aside class="aside aside-right open">
*   <div class="aside-header">
*     <h4>Title</h4>
*     <a class="close"/>
*   </div>
* </aside>
*/
.aside {
	transition: transform 0.2s ease-out;
}

.aside.aside-right.open.open { /* Silly hack to force the transform when open */
	transform: translateX(0px);
}

.aside.aside-right {
	position: fixed;
	top: 70px;
	right: 0px;
	bottom: 0px;
	background: #FFF;
	z-index: 100;
	box-shadow: 0 1px 40px rgba(0,0,0,.3);
	width: 350px;
	transform: translateX(380px);
}

/* .aside-sm {{{ */
.aside.aside-right.aside-sm {
	width: 40px;
	transform: translateX(50px);
	top: calc(50% - 30px); /* Approx middle of the screen */
	bottom: inherit;
	border-radius: 50px;
}

.aside.aside-right.aside-sm .form-group {
	margin: 0;
}

/* Remove BS padding from sub-elements */
.aside.aside-right.aside-sm .form-group [class*="col-"] {
	padding: 0;
}
/* }}} */

/* Headers {{{ */
.aside .aside-header {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 10px 0px;
	border-bottom: 1px solid #e9ecef;
	margin: 0;
}

.aside .aside-header h4 {
	flex-grow: 1;
}

.aside .aside-header legend.form-control-static {
	border-bottom: none;
	font-size: 17pt;
}

.aside .aside-header .close {
	color: #5e5e5e;
}

.aside .aside-header .close:hover {
	color: #000;
}

.aside .aside-header .close::after {
	display: inline-block;
	font-family: 'Font Awesome 5 Pro';
	font-weight: 900;
	content: "\f00d";
}
/* }}} */

/* Actions {{{ */
.aside-actions {
	justify-self: flex-end;
	margin-right: 10px;
}

.aside-actions .btn-group {
	border: none;
	box-shadow: none;
}

.aside-actions a {
	padding: 8px;
	font-size: 125%;
}
/* }}} */

/* Body {{{ */
.aside .aside-body {
	margin-left: 0;
	padding: 10px 10px 0 0;

	/* Body scrolling */
	overflow: auto;
	height: calc(100vh - 130px); /* FIXME: Probably wrong when .aside-header isn't present */
}
/* }}} */
</style>
