<style lang="scss">
.btn.btn-hover-danger {
	transition: background 0.5s ease-out, border 0.5s ease-out, color 0.5s ease-out;

	&:hover {
		background: var(--danger) !important;
		border: 1px solid var(--danger) !important;
		color: var(--light) !important;
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
