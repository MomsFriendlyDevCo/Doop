<script lang="js" frontend>
/**
* Wrapped implementation of vue-select
* @see https://vue-select.org/api/props.html
*
* @param {array<Object>} options Collection of options to choose from
* @param {boolean} [clearable=true] Whether to allow user clearing of the selected item
* @param {boolean} [searchable=true] Whether the element should present a search UI
* @param {string} [label='label'] How to find the title of the active element
* @param {string} [value] The currently selcted item (if any), should correspond to the full object selected (`label` is used by default as text) or override with a slot
* @param {*} [...] See https://vue-select.org/api/props.html for more options
*
* @emits input Emitted as `(newSelection: Object)` when the selection changes
*
* @example Show a simple list of widgets using `title` as the visible text
*
* <v-select
*   :options="widgets"
*   :value="selectedWidget"
*   label="title"
*   :clearable="false"
*   :searchable="false"
*   @input="selectedWidget = $event"
* />
*/

import vSelect from "vue-select";
import '/node_modules/vue-select/dist/vue-select.css';

app.component('v-select', vSelect);
</script>

<style>
.v-select .vs__actions {
	cursor: pointer;
}

/* Disabled functionality {{{ */
.disabled .v-select {
	pointer-events: none;
}

.disabled .v-select .vs__dropdown-toggle {
	border: none;
}

.disabled .v-select .vs__actions,
.disabled .v-select button {
	display: none;
}
/* }}} */

/* Copy background color from theme */
.vs__dropdown-option--highlight {
	background: var(--primary);
}
</style>
