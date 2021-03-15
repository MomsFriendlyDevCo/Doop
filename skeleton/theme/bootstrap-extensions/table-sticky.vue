<style>
/* table.table-sticky-thead {{{ */
table.table.table-sticky-thead thead > tr > td,
table.table.table-sticky-thead thead > tr > th {
	top: -20px;
	position: sticky;
	background: #FFF;
	z-index: 1;
}

table.table.table-sticky-thead thead > tr > td:first-child,
table.table.table-sticky-thead thead > tr > th:first-child {
	z-index: 2;
}

table.table.table-sticky-thead thead > tr > td:after,
table.table.table-sticky-thead thead > tr > th:after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	border-bottom: 2px solid #ddd;
}
/* }}} */

/* table.table-sticky-tfoot {{{ */
table.table.table-sticky-tfoot tfoot > tr > td,
table.table.table-sticky-tfoot tfoot > tr > th {
	bottom: -1px;
	position: sticky;
	background: #FFF;
}

table.table.table-sticky-tfoot tfoot > tr > td:before,
table.table.table-sticky-tfoot tfoot > tr > th:before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	border-top: 2px solid #ddd;
}
/* }}} */
</style>
