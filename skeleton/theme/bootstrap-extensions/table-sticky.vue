<style lang="scss">
table {
	/* table.table-sticky-thead {{{ */
	&.table-sticky-thead thead > tr {
		& > td, & > th {
			top: 0px;
			position: sticky;
			background: #FFF;
			z-index: 9;

			&:first-child {
				z-index: 11;
			}

			/* Add borders to floating items {{{ */
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
			/* }}} */

			/* Fix .col-verbs collapsing {{{ */
			&.col-verbs {
				visibility: visible;
			}
		}
	}
	/* }}} */

	/* table.table- sticky-tfoot {{{ */
	&.table-sticky-thead tfoot > tr {
		& > td, & > th {
			bottom: -1px;
			position: sticky;
			background: #FFF;

			&:before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				border-top: 2px solid #ddd;
			}
		}
	}
	/* }}} */
}
</style>
