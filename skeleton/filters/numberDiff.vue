<script lang="js" frontend>
/**
* Returns the signed value difference between a number and the original
* @param {number} value Current numeric value
* @param {boolean} oldValue Previous value to compare to
* @returns {string} A formatted differencial between the two values
*
* @example
* {{2 | numberDiff(1)}} //= '+1'
* {{1 | numberDiff(2)}} //= '-1'
* {{1000 | numberDiff(2000)}} //= '-1,000'
*/
app.filter('diffNumber', (value, oldValue) => {
	var diff = value - oldValue;
	return
		(Math.sign(diff) == 1 ? '+' : '')
		+ Number(diff).toLocaleString()
});
</script>
