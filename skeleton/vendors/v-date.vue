<script repack>
/**
* Import the vuejs-datepicker as v-date
* @url https://www.npmjs.com/package/vuejs-datepicker
*
* @example Simple date binding
* <v-date v-model="myDate"/>
*
* @example Expanded binding
* <v-date :value="myDate" @selected="myDate = $event"/>
*/
import Datepicker from 'vuejs-datepicker';
Vue.component('v-date', Datepicker);
</script>
