<style lang="scss">
table {
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
		&:first-child:before {
			border-left: 2px solid #ddd;
		}

		&:last-child:before {
			border-right: 2px solid #ddd;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			border: {
				top: 2px solid #ddd;
				bottom: 2px solid #ddd;
			}
		}
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
