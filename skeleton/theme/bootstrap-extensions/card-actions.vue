<style>
/**
* Actions for card headers
*
* @example
* <div class="card">
*   <div class="card-header">
*     <h2>Card title</h2>
*     <div class="card-actions">
*       <a class="btn btn-light far fa-check" v-tooltip="'Save'"></a>
*     </div>
*   </div>
* </div>
*/

.card .card-header > .card-actions {
	position: absolute;
	right: 15px;
	top: 10px;
	font-size: 20px;
}

/* Append .pr-0 for zero right padding */
.card .card-header > .card-actions.pr-0 {
	right: 0px;
}

.card.card .card-header > .card-actions > a:not(.btn),
.card.card .card-header > .card-actions > a.btn-light,
.card.card .card-header > .card-actions > li.open > a:not(.btn) {
	color: #999;
}

.card .card-header > .card-actions > a:not(.btn):hover,
.card .card-header > .card-actions > a.btn-light:hover,
.card .card-header > .card-actions > li > a:not(.btn):hover {
	color: #000;
}

.card .card-header > .card-actions > a.btn {
	margin-right: 1px;
}

.card .card-header > .card-actions > a:not(.btn) {
	color: #CCC;
	width: 30px;
	height: 30px;
	display: inline-block;
	padding-top: 5px;
}

.card .card-header > .card-actions > a:not(.btn):hover > i.fa,
.card .card-header > .card-actions > a:not(.btn):hover.fa {
	color: #333;
}

.card .card-header > .card-actions label.toggle {
	position: relative;
	top: -5px;
	margin-right: 10px;
}

.card .card-header > .card-actions > .btn {
	margin-right: 1px;
}

.card .card-header > .card-actions > .btn:last-child {
	margin-right: 10px;
}

/* BUGFIX: Theme override: action container z-index {{{ */
/*
	A set value may not be needed. Must not be set to fix qb-model issues
	as the model is nested inside an action container.
*/
.card .card-header .card-actions {
	z-index: auto !important;
}
/* }}} */
</style>
