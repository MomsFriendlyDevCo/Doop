<import>
./node_modules/@momsfriendlydevco/readable/dist/readable.js
</import>

<filter name="fileSize">
module.exports = value => readable.fileSize(value);
</filter>

<filter name="relativeTime">
module.exports = value => readable.relativeTime(value);
</filter>

<filter name="sizeOf">
module.exports = value => readable.sizeOf(value);
</filter>
