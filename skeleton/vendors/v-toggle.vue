<script lang="js" frontend>
/**
* Import the vue-js-toggle-button control
* @param {boolean} [value=false] Initial state of the toggle button
* @param {boolean} [sync=false] If set to true, will be watching changes in value property and overwrite the current state of the button whenever value prop changes
* @param {number} [speed=300] Transition time for the animation
* @param {boolean} [disabled=false] Button does not react on mouse events
* @param {string} [color='#75C791'] Color of the button when checked
* @param {boolean|Object} [labels=true] If Boolean - shows/hides default labels ("on" and "off"), if object use `{checked: 'on', unchecked: 'off'}`
* @param {string|Object} [switch-color='#BFCBD9'] Color or background property of the switch when checked, if object use `{checked: '#25EF02', unchecked: 'linear-gradient(red, yellow)'}`
* @param {Number} [width=50] Width of the button
* @param {Number} [height=22] Height of the button
* @param {Number} [margin=3] Space between the switch and background border
* @param {String} [name=undefined] Name to attach to the generated input field
* @param {Number} [font-size=undefined] Font size
*
* @emits change Emitted as ({value: Boolean}) when the value changes
*
* @example Use event emitters to update a value
* <v-toggle
*   :value="false"
*   color="#82C7EB"
*   :labels="true"
*   :labels="{checked: 'On', unchecked: 'Off'}"
*   @change="someValue = $event.value"
* />
*
* @example Sync a value
* <v-toggle v-model="someValue"/>
*
* @example Toggle button within a BS4 form
* <div class="form-group row">
*   <label class="col-4 col-form-label">Allow upload</label>
*   <div class="col-8 col-form-label">
*     <v-toggle v-model="someValue"/>
*   </div>
* </div>
*/
import {ToggleButton} from 'vue-js-toggle-button';
app.component('v-toggle', ToggleButton);
</script>

<style>
.vue-js-switch {
	vertical-align: top;
	margin-right: 5px;
}
</style>
