<style>
/**
* Add a checkmark next to checked item or spacing when no item is un-checked
* @example Display a checked + unchecked item
* <ul class="dropdown-menu">
*   <a class="dropdown-item checked">This item is checked</a>
*   <a class="dropdown-item unchecked">This item is unchecked</a>
* </ul>
*/

.dropdown-item.unchecked:before,
.dropdown-item.checked:before {
	font-family: 'Font Awesome 5 Pro';
	font-weight: 400;
	text-align: center;
	width: 20px;
	display: inline-block;
	margin-right: 2px;
	content: "";
}

.dropdown-item.checked:before {
	content: "\f00c";
}
</style>
