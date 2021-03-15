<style>
/* Modal headers look weird */
.modal .modal-dialog .modal-content .modal-header {
	border-bottom-width: 1px;
}

/* Support for modal sizes */
.modal .modal-dialog.modal-lg {max-width: 80%}
.modal .modal-dialog.modal-xl {max-width: 95%}

/* Modals should have a drop shadow */
.modal .modal-dialog {
	box-shadow: 7px 7px 5px 0px rgba(50, 50, 50, 0.16);
}

/* Close buttons look weird */
.modal .modal-dialog .close {
	text-align: center;
	padding-top: 6px;
	font-size: 20px;
}

.modal .modal-dialog .close:hover {
	background: var(--red);
	color: var(--white);
	opacity: 1;
}

/* Footers should be better spaced */
.modal .modal-dialog .modal-footer {
	justify-content: space-between;
}
</style>
