<script lang="js" frontend>
app.filter('percent', value => _.round(Number(value || 0), 1) + '%');
</script>
