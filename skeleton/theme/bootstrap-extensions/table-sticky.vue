<style lang="scss">
table {
	/* Set outline for any sticky table so it doesn't look orphaned within a card {{{ */
	&.table-sticky-thead, &.table-sticky-tfoot {
		border: 1px solid #dee2e6
	}
	/* }}} */

	/* table.table-sticky-thead {{{ */
	&.table-sticky-thead thead > tr {
		& > td, & > th {
			top: 0px;
			position: sticky;
			background: #FFF;
			z-index: 9;

			/* Fix .col-verbs collapsing {{{ */
			&.col-verbs {
				visibility: visible;
			}
			/* }}} */
		}
	}
	/* }}} */

	/* table.table-sticky-tfoot {{{ */
	&.table-sticky-tfoot tfoot > tr {
		& > td, & > th {
			bottom: 0px;
			position: sticky;
			background: #FFF;
			z-index: 9;
		}
	}
	/* }}} */

	/* Add borders to floating items {{{ */
	&.table-sticky-thead thead > tr > th,
	&.table-sticky-thead thead > tr > td,
	&.table-sticky-tfoot tfoot > tr > th,
	&.table-sticky-tfoot tfoot > tr > td {
		/* Hack to force a solid background behind all table cells {{{ */
		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			pointer-events: none;
			border: {
				top: 1px solid #ddd;
				bottom: 1px solid #ddd;
			}
		}
		/* }}} */
	}

	/* Thinner border widths on tfoot {{{ */
	&.table-sticky-tfoot tfoot > tr > th,
	&.table-sticky-tfoot tfoot > tr > td {
		&::before {
			border-top-width: 1px;
			border-bottom-width: 1px;
		}
	}
	/* }}} */
	/* }}} */
}
</style>
