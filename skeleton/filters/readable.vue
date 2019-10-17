<import>
./node_modules/@momsfriendlydevco/readable/dist/readable.js
</import>

<script>
readable.defaults.fileSize.formatters.fallback = '0b';
</script>

<filter name="fileSize">
module.exports = (value, options) => readable.fileSize(value, options);
</filter>

<filter name="relativeTime">
module.exports = (value, options) => readable.relativeTime(value, options);
</filter>

<filter name="sizeOf">
module.exports = (value, options) => readable.sizeOf(value, options);
</filter>
