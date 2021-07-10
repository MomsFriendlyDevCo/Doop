<script lang="js" frontend>
app.filter('percent', (value, options) => _.round(Number(value || 0), options.precision || 1) + '%');
</script>
