<script>
/**
* Simple currency filter
* Returns a number / string as a formatted Australian dollar amount
* @param {string|number} value Value to format
* @returns {string} Formatted currency value
*/
app.filter('currency', (value, locale) => Number(value || 0).toLocaleString('en-AU', {style: 'currency', currency: 'AUD'}));
</server>
