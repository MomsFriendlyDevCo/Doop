<script lang="js" frontend>
import DebugFactory from '.';

/**
* Glue debugger onto console.debug
*/
console.debug = DebugFactory('console.debug');


/**
* Generic debug factory object
*/
app.service('$debug', function() {
	return DebugFactory('UNKNOWN SERVICE');
});


/**
* Inject personalized debugginer per component
*/
app.mixin({
	beforeCreate() {
		this.$debug = DebugFactory(this); // Generate a personalized $debug instance based on this component
	},
});
</script>
