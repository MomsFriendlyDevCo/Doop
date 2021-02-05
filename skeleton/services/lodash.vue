<script lang="js" frontend>
/**
* Register Lodash against the generic VueComponent prototype so it can be used within templates without Vue complaining
*/
import lodash from 'lodash';

app.service('_', ()=> lodash);
</script>
