<script repack>
import {VTooltip} from 'v-tooltip';
Vue.component('v-tooltip', VTooltip);
</script>

<style>
/* .tooltip {{{ */
.tooltip {
	display: block !important;
	z-index: 100000;
	border: none;
	box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.2);
}

.tooltip .tooltip-inner {
	background: var(--dark);
	color: white;
	border-radius: 5px;
	padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
	width: 0;
	height: 0;
	border-style: solid;
	position: absolute;
	margin: 5px;
	border-color: black;
	z-index: 100000;
}

.tooltip[x-placement^="top"] {
	margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
	border-width: 5px 5px 0 5px;
	border-left-color: transparent !important;
	border-right-color: transparent !important;
	border-bottom-color: transparent !important;
	bottom: -5px;
	left: calc(50% - 5px);
	margin-top: 0;
	margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
	margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
	border-width: 0 5px 5px 5px;
	border-left-color: transparent !important;
	border-right-color: transparent !important;
	border-top-color: transparent !important;
	top: -5px;
	left: calc(50% - 5px);
	margin-top: 0;
	margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
	margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
	border-width: 5px 5px 5px 0;
	border-left-color: transparent !important;
	border-top-color: transparent !important;
	border-bottom-color: transparent !important;
	left: -5px;
	top: calc(50% - 5px);
	margin-left: 0;
	margin-right: 0;
}

.tooltip[x-placement^="left"] {
	margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
	border-width: 5px 0 5px 5px;
	border-top-color: transparent !important;
	border-right-color: transparent !important;
	border-bottom-color: transparent !important;
	right: -5px;
	top: calc(50% - 5px);
	margin-left: 0;
	margin-right: 0;
}

.tooltip.popover .popover-inner {
	background: #f9f9f9;
	color: black;
	padding: 5px;
	border-radius: 5px;
	box-shadow: 0 5px 30px rgba(black, .1);
}

.tooltip.popover .popover-arrow {
	border-color: #ccc;
}

.tooltip[aria-hidden='true'] {
	visibility: hidden;
	opacity: 0;
	transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
	visibility: visible;
	opacity: 1;
	transition: opacity .15s;
}
/* }}} */

/* .tooltip.text-left - Add left alignment option for tooltips {{{ */
.tooltip.text-left .tooltip-inner {
	text-align: left;
}
/* }}} */

/* .popover-dark {{{ */
/* e.g. <v-popover popover-class="popover-dark"/> */
.popover.popover-dark .popover-inner {
	background: #4c5667;
	color: #FFF;
	border: none;
}

.popover.popover-dark .popover-arrow {
	border-color: #4c5667;
}
/* }}} */

/* .popover-danger {{{ */
/* e.g. <v-popover popover-class="popover-danger"/> */
.popover.popover-danger .popover-inner {
	background: var(--danger);
	color: var(--white);
	border: none;
}

.popover.popover-danger .popover-arrow {
	border-color: var(--danger);
}
/* }}} */

/* .popover-success {{{ */
/* e.g. <v-popover popover-class="popover-success"/> */
.popover.popover-success .popover-inner {
	background: var(--success);
	color: var(--white);
	border: none;
}

.popover.popover-success .popover-arrow {
	border-color: var(--success);
}
/* }}} */

/* .popover-p-1 - minimal padding {{{ */
/* e.g. <v-popover popover-class="popover-p-1"/> */
.popover.popover-p-1 .popover-inner {
	padding: 5px;
}
/* }}} */
</style>
