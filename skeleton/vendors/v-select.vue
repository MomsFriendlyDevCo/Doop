<script repack>
import {VueSelect} from 'vue-select';
import './node_modules/vue-select/dist/vue-select.css';
Vue.component('v-select', VueSelect);
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
	background: var(--main);
}
</style>
