<style lang="scss">
/**
* Transform a standard Bootstrap button to another on hover
* This effect is usually used when hovering over "dangerous" buttons
*
* @example
* <a class="btn btn-light btn-hover-danger">Delete!</a>
*/
.btn.btn-hover-danger {
	transition: background 0.5s ease-out, border 0.5s ease-out, color 0.5s ease-out;

	&:hover {
		background: var(--danger) !important;
		border: 1px solid var(--danger) !important;
		color: var(--light) !important;
	}
}


.btn.btn-hover-light {
	transition: background 0.5s ease-out, border 0.5s ease-out, color 0.5s ease-out;

	&:hover {
		background: var(--light) !important;
		border: 1px solid var(--light) !important;
	}
}


.btn.btn-hover-success {
	transition: background 0.5s ease-out, border 0.5s ease-out, color 0.5s ease-out;
	&:hover {
		background: var(--success) !important;
		border: 1px solid var(--success) !important;
		color: var(--light) !important;
	}
}
</style>
