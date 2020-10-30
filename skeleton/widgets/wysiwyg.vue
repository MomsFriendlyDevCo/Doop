<script repack>
/**
* Wrapper for the Quill vue2-editor WYSIWYG wrapper as <wysiwyg/>
*
* @url https://github.com/davidroyer/vue2-editor
* @param {string} [value] The existing HTML content to display
* @emits change Emitted as `(html)` when the value changes
*
* @example Simple WYSIWYG component
* <wysiwyg
*   :value="body"
*   @change="body = $event"
* />
*/
import {VueEditor} from 'vue2-editor';
Vue.component('wysiwyg', {
	components: {VueEditor},
	props: {
		value: {type: String},
	},
	methods: {
		/**
		* Focus the WYSIWYG edit area
		*/
		focus() {
			$(this.$el).find('.ql-editor').focus();
		},
	},
	render(h) {
		return h('vue-editor', {
			props: {
				value: this.value,
				editorToolbar: [
					[{header: [false, 1, 2, 3, 4, 5, 6]}],
					[
						'bold',
						'italic',
						'underline',
						'strike',
					],
					[
						{align: ''},
						{align: 'center'},
						{align: 'right'},
						{align: 'justify'}
					],
					[
						'blockquote',
						'code-block',
					],
					[
						{list: 'ordered'},
						{list: 'bullet'},
						{list: 'check'}
					],
					[
						{indent: '-1'},
						{indent: '+1'}
					],
					[
						{color: []},
						{background: []},
					],
					[
						'link',
						'image',
						'video',
					],
					[
						'clean', // remove formatting button
					],
				],
			},
			on: {
				input: v => this.$emit('change', v),
			},
		});
	},
});
</script>
