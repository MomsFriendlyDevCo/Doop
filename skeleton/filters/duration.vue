<script lang="js" frontend>
// TODO: Format to human readable time
app.filter('duration', (value, options) => {
	return (value / 1000 / 60) + ' minutes'; 
});
</script>
