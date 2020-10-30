<script repack>
import sift from 'sift';
global.sift = sift;

import 'ace-builds';

// TODO: Load in any needed modes/themes
//ace.require("ace/mode/javascript").Mode;
//ace.require("ace/mode/json").Mode;

// "main": "dist/macgyver-node.js"
import './node_modules/@momsfriendlydevco/macgyver/dist/macgyver.js';
</script>

<script>
app.ready.then(()=> {
	macgyver.$http = Vue.services().$http;
	macgyver.$prompt = Vue.services().$prompt;
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
