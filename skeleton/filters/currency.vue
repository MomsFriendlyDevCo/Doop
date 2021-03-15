<script lang="js" frontend>
app.filter('currency', value => Number(value || 0).toLocaleString('en-AU', {style: 'currency', currency: 'AUD'}));
</script>
