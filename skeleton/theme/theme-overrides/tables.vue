<style>
/* Table titles are out of alignment {{{ */
table.table th, table.table td {
	padding: 0.75rem 0;
}

/* ... but card > table (direct children) should still have padding */
.card > table.table th:first-child, table.table td:first-child {
	padding-left: 0.75rem;
}
/* }}} */


/* Tables need to be more compressed */
table.table td {
	padding: 0.2rem;
}

/* Table cell entries should vertical-center align */
table.table td {
	vertical-align: middle;
}
</style>
