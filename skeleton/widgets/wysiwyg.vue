<script lang="js" frontend>
/**
* Wrapper for the Quill vue2-editor WYSIWYG wrapper as <wysiwyg/>
*
* @url https://github.com/davidroyer/vue2-editor
* @param {string} [value] The existing HTML content to display
* @param {object} [modules] Extended configuration for VueEditor, useful for configuring quill modules. See: https://quilljs.com/docs/modules/
* @param {string} [toolbar='full'] Type of toolbar UI to use. ENUM: 'none', 'simple', 'full'
*
* @emits change Emitted as `(html)` when the value changes
*
* @example Simple WYSIWYG component
* <wysiwyg
*   :value="body"
*   @change="body = $event"
* />
*/
import {VueEditor} from 'vue2-editor';

app.component('wysiwyg', {
	components: {VueEditor},
	props: {
		modules: {type: Object},
		toolbar: {type: String, default: 'full', validator: v => ['none', 'simple', 'full'].includes(v)},
		value: {type: String},
	},
	methods: {
		/**
		* Focus the WYSIWYG edit area
		*/
		focus() {
			$(this.$el).find('.ql-editor').focus();
			//this.$refs.editor.quill.focus();

			// Set cursor caret position to end of field
			const el = $(this.$el).find('.ql-editor').get(0);
			const range = document.createRange();
			const sel = window.getSelection();

			// Support for HTML nodes within editable content
			range.setStart(el.childNodes[el.childNodes.length - 1], el.childNodes[el.childNodes.length - 1].length);
			range.collapse(true);

			sel.removeAllRanges();
			sel.addRange(range);
		},
	},
	render(h) {
		return h('vue-editor', {
			props: {
				value: this.value,
				//useMarkdownShortcuts: true,
				editorOptions: {
					modules: {
						//syntax: true,
						//uploader: true,
						...this.modules,
					}
				},
				editorToolbar: this.toolbar == 'none' ? [[]] : [
					this.toolbar == 'full' && [{header: [false, 1, 2, 3, 4, 5, 6]}],
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
					this.toolbar == 'full' && [
						{list: 'ordered'},
						{list: 'bullet'},
						{list: 'check'}
					],
					this.toolbar == 'full' && [
						{indent: '-1'},
						{indent: '+1'}
					],
					[
						{color: []},
						{background: []},
					],
					this.toolbar == 'full' && [
						'link',
						'image',
						'video',
					],
					[
						'clean', // remove formatting button
					],
				].filter(Boolean),
			},
			on: {
				input: v => this.$emit('change', v),
			},
		});
	},
});
</script>

<style lang="scss">
.quillWrapper {
	width: 100%;

	/* Special .quill-no-toolbar rules {{{ */
	&.quill-no-toolbar {
		& .ql-toolbar.ql-snow {
			display: none;
		}
	}
	/* }}} */

	/* Special .quill-no-border rules {{{ */
	&.quill-no-border {
		& .ql-toolbar.ql-snow,
		& .ql-container.ql-snow {
			border: none !important;
		}
	}
	/* }}} */
}
</style>
