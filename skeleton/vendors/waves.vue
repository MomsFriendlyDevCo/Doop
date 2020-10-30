<script repack>
import Waves from 'node-waves';
global.Waves = Waves;
</script>

<script>
/**
* Inject the material design waves effect to all things that look like buttons
* Requires 'node-waves' NPM
*/
app.ready.then(()=>
	app.router.afterEach((to, from) =>
		Vue.nextTick(()=> {
			// NOTE: All the below attachment rules assumes `waves-effect` is applied anyway
			$('.btn').addClass('waves-effect');
			$('.btn-circle, .btn-ellipsis').addClass('waves-circle');
			$('.input-group > .btn').addClass('waves-table-cell');
			$('a.list-group-item, .dropdown-menu > li > a, .main-menu > li > a').addClass('waves-effect waves-block');

			// Re-init
			Waves.init();
		})
	)
);
</script>
