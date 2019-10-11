<script repack>
import VueBootstrap4Table from 'vue-bootstrap4-table';

Vue.component(VueBootstrap4Table);
</script>

<style>
.vbt-table-wrapper {
	overflow-x: hidden;
}

.vbt-header-row {
	margin: 0px;
}

.vbt-header-row .form-group {
	margin-bottom: 0px;
}

.vbt-global-search {
	margin-left: 10px;
}

.vbt-global-search + .col-md-6 {
	margin-left: -10px;
}
</style>
