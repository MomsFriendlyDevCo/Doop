<script>
/**
* Returns a locale formatted number
* @param {*} value The input value
* @returns {string} The formatted input value or '0'
*/
app.filter('number', value => Number(value || 0).toLocaleString());
</script>
