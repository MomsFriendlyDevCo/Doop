<script lang="js" frontend>
import Waves from 'node-waves'

/**
* Inject the material design waves effect to all things that look like buttons
* Requires 'node-waves' NPM
*/
app.ready.then(()=> {
	Waves.attach('.btn, .sidebar-menu .nav-link', 'waves-effect waves-block');
	Waves.attach('a.list-group-item, .dropdown-menu > li > a, .main-menu > li > a', 'waves-effect waves-block');
	Waves.attach('.btn-ellipsis .btn-circle', 'waves-effect waves-circle waves-block');
	Waves.init();
})
</script>
