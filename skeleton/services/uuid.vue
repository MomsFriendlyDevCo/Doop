<script lang="js" frontend>
import {v4} from 'uuid';

app.service('$uuid', {
	generate: v4,
});
</script>
