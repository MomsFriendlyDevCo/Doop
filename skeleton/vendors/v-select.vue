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

<style lang="scss">
.vs__selected-options {
	padding: 0;
}

.vs__selected {
	padding: 0.375rem 0.75rem;
}

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

.vs--disabled .vs__clear,
.vs--disabled .vs__dropdown-toggle,
.vs--disabled .vs__open-indicator,
.vs--disabled .vs__search,
.vs--disabled .vs__selected {
	cursor: inherit;
	background-color: #e9ecef;
}
/* }}} */

/* Copy background color from theme */
.vs__dropdown-option--highlight {
	background: var(--primary);
}

/* Unset certain styles if .form-control class is set on the v-select */
.v-select.form-control {
	padding: 0;

	.vs__dropdown-toggle {
		border: 0;
		height: 100%;
		margin: 0;
		padding: 0;
	}

	.vs__selected-options > input {
		margin: 0;
		padding: 0.375rem 0.75rem;
	}

	.vs__selected {
		height: 100%;
		margin: 0;
	}
}

/* If v-select is used in bootstrap input-group */
.input-group {
	> .input-group-prepend + .vs--single > .vs__dropdown-toggle,
	> .input-group-prepend + .vs__dropdown-toggle {
		border-bottom-left-radius: 0;
		border-left: 0;
		border-top-left-radius: 0;
		height: 100%;
	}
}
</style>
