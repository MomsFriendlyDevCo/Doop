<script lang="js" frontend>
/**
* Import the v-jsoneditor NPM component to edit JSON
* @param {Object} [options={mode: 'code'}] Options to render see https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#configuration-options?blank
* @param {Object} [v-model] Code object binding
* @param {boolean} [plus=true] Whether fullscreen editing is enabled
* @param {string} [height] Default height as a CSS parameter
* @param {function} [error] Error binding
*
* @see https://github.com/yansenlei/VJsoneditor#readme
*
* @example Simple JSON editor
* <v-json
*   v-model="myJson"
*   :options="options"
*   @error="handleError"
* />
*/
import VJsoneditor from 'v-jsoneditor';

app.component('v-json', VJsoneditor);
</script>
