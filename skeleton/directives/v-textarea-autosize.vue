<script lang="js" frontend>
/**
* Directive to enable auto-fit / auto-resize to text areas
*
* @example make a textarea auto-resize
* <textarea v-textarea-autoresize/>
*/
import fitTextarea from 'fit-textarea';

app.directive('v-textarea-autosize', {
	inserted(el, binding) {
		fitTextarea.watch(el);
	},
});
</script>
