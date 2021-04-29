<script lang="js" frontend>
/**
* Importer for the v-mask directive
* @url https://github.com/probil/v-mask
*
* @example Mask a time + date input
* <div v-mask="'##/##/#### ##:##'"/>
*
* @example Mask credit card input
* <div v-mask="'#### #### #### ####'"/>
*
* @example Mask a number with a thousands seperator
* <div v-mask="'#,###'"/>
*/
import {VueMaskDirective} from 'v-mask';

app.directive('v-mask', VueMaskDirective);
</script>
