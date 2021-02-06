<script lang="js" frontend>
//import sift from 'sift';
//global.sift = sift;

//import 'ace-builds';

// TODO: Load in any needed modes/themes
//ace.require("ace/mode/javascript").Mode;
//ace.require("ace/mode/json").Mode;

// "main": "dist/macgyver-node.js"
//import './node_modules/@momsfriendlydevco/macgyver/dist/macgyver.js';
import '@momsfriendlydevco/macgyver';

app.ready.then(()=> {
	macgyver.$http = app.$http;
	macgyver.$prompt = app.$prompt;
});
</script>

<style>
.control-label {
	padding-top: calc(.375rem + 1px);
	padding-bottom: calc(.375rem + 1px);
	margin-bottom: 0;
	font-size: inherit;
	line-height: 1.5;
}
</style>
