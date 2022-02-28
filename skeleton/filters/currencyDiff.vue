<script lang="js" frontend>
/**
* Returns the signed value difference between a number and the original formatted to currency
* @param {number} value Current numeric value
* @param {boolean} oldValue Previous value to compare to
* @param {Object} options Additional options to pass to Number.toLocaleString()
* @returns {string} A formatted differencial between the two values
*
* @example
* {{2 | numberDiff(1)}} //= '+1'
* {{1 | numberDiff(2)}} //= '-1'
* {{1000 | numberDiff(2000)}} //= '-1,000'
*/
app.filter('currencyDiff', (value, oldValue, options) => {
	var diff = value - oldValue;
	var res =
		(Math.sign(diff) == 1 ? '+' : '')
		+ Number(diff).toLocaleString('en-AU', {
			style: 'currency',
			currency: 'AUD',
			...options,
		})

	return res;
});
</script>
