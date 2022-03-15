<script lang="js" frontend>
// TODO: Options.
app.filter('currency', (value, options) => {
	// TODO: Use local to match currency? 'en-AU' etc
	return Number(value || 0).toLocaleString(undefined, {
		style: 'currency',
		currency: 'AUD',
		..._.isPlainObject(options) ? options : undefined,
	});
});
</script>
