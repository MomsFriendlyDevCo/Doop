<style>
/* Various custom "ideal" column sizes for tables */
th.col-sm, td.col-sm { width: 20px; }
th.col-md, td.col-md { width: 200px; }
th.col-lg, td.col-lg { width: 400px; }
th.col-xl, td.col-xl { width: 500px; }

th.col-status, td.col-status { width: 16px; text-align: center }
th.col-status { visibility: collapse }
th.col-icon { width: 20px }

th.col-thumbnail, td.col-thumbnail { width: 40px; text-align: center }
th.col-thumbnail { visibility: collapse }

th.col-date { width: 200px }
body.screen-xs th.col-date { width: 130px }

th.col-currency, th.col-number { width: 110px }
th.col-currency, td.col-currency, th.col-number, th.col-number { text-align: right }

th.col-filesize { width: 100px }

th.col-checkbox { width: 50px }
th.col-button { width: 50px }

th.col-toggle { width: 50px }

th.col-verbs { visibility: collapse }
th.col-verbs, td.col-verbs { width: 65px }

/* Hide first children of anything marked as col-hover until the mouse is over it (useful for dangerous verbs like Delete) {{{ */
th.col-hover > *,
td.col-hover > * {
	visibility: hidden;
}

tr:hover th.col-hover > *,
tr:hover td.col-hover > * {
	visibility: visible;
}
/* }}} */
</style>
