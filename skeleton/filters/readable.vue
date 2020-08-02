<script>
/**
* Various @momsfriendlydevco/readable filters
*/

import readable from '@momsfriendlydevco/readable';

readable.defaults.fileSize.formatters.fallback = '0b';

/**
* Format a raw number into a valid readable file size
* @param {string|number} value Input raw number to format
* @param {Object} [options] Additional options to pass to @momsfriendlydevco/readable#fileSize()
* @returns {string} Human readable file size
*/
app.filter('fileSize', (value, options) => readable.fileSize(value, options));


/**
* Format a raw millisecond range into a readable time offset
* @param {string|number} value Input millisecond value to format
* @param {Object} [options] Additional options to pass to @momsfriendlydevco/readable#relativeTime()
* @returns {string} Human readable relative time
*/
app.filter('relativeTime', (value, options) => readable.relativeTime(value, options));
</script>
