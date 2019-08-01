<import>
./node_modules/node-waves/dist/waves.min.js
</import>

<script>
/**
* Inject the material design waves effect to all things that look like buttons
* Requires 'node-waves' NPM
*/
app.ready.then(()=> window.app.router.afterEach((to, from) => {
	// NOTE: All the below attachment rules assumes `waves-effect` is applied anyway
	$('.btn').addClass('waves-effect');
	$('.btn-circle, .btn-ellipsis').addClass('waves-circle');
	$('.input-group > .btn').addClass('waves-table-cell');
	$('a.list-group-items, .dropdown-menu > li > a, .main-menu > li > a').addClass('waves-effect waves-block');

	// Re-init
	Waves.init();
}));
</script>
