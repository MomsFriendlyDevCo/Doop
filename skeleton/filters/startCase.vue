<script>
/**
* Format a string into lodash StartCase
* @param {string} value Input value
* @returns {string} The input value formatted into StartCase
*/
app.filter('startCase', value => _.startCase(value));
</script>
