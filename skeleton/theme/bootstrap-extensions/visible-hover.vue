<style>
/**
* Hide a child element unless its parent is hovered
*
* @example Show a list of verbs within a table row only if the row has hover
* <tr class="visible-hover-parent">
*   <td>Name</td>
*   <td class="visible-hover-target">Verbs!</td>
* </r>
*
* @example Show a button only if the parent div has a hover state (remove from DOM)
* <div class="visible-hover-parent">
*   <a class="visible-hover-target btn btn-danger">Delete</a>
* </div>
*
* @example Reserve the browser location for an item but not show it (hide only)
* <div class="visible-hover-parent-hide">
*   <a class="visible-hover-target btn btn-danger">Delete</a>
* </div>
*/
.visible-hover-parent .visible-hover-target {
	display: none;
}

body:not(.dragging) .visible-hover-parent:hover .visible-hover-target {
	display: inline-block;
}



.visible-hover-parent-hide .visible-hover-target {
	visibility: hidden;
}

body:not(.dragging) .visible-hover-parent-hide:hover .visible-hover-target {
	visibility: visible;
}
</style>
