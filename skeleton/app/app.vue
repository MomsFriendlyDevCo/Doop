<script>
/**
* Entry point file for Vue frontend
*/

import './app.index.vue'; // Import all .vue files automatically from the index
// import '../**/*.vue'; // Import all .vue files automatically from the index

globalThis.app = {
	controller: (cid, spec) => {
		console.log('DECLARE CONTROLLER', cid, spec);
	},
};
</script>
