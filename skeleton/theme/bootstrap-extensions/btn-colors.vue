<style>
/* BUGFIX: Use correct foreground in .btn items even if [href] is not set {{{ */
.btn.btn-danger,
.btn.btn-info,
.btn.btn-primary,
.btn.btn-success,
.btn.btn-warning {
	color: #fff !important;
}
/* }}} */

/* Add .btn-link-{danger} hover effects {{{ */
.btn.btn-link-danger {
	transition: color .5s;
}

.btn.btn-link-danger:hover {
	color: var(--danger) !important;
}
/* }}} */
</style>
