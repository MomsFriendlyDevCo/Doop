<script lang="js" frontend>
/**
* Convert a camelCasePermission into `Camel > Case > Permission`
* @param {string} value The input string to process
* @returns {string} The formatted sting output
*/
app.filter('permissionCase', value => _.startCase(value).split(' ').map(word => `${word} >`).join(' ').replace(/ >$/, ''));
</script>
