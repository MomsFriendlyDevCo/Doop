<script lang="js" frontend>
/**
* Simple widget to return an <img/> element contents using base64 input
* @param {string} data The data input (sans 'data:image' etc.)
*/
app.component('imgBase64', {
	props: {
		data: {type: String, required: true},
	},
	render(h) {
		return h('img', {attrs: {src: 'data:image/png;base64,' + this.$props.data} });
	},
});
</script>
