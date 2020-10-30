<script repack>
// FIXME: Better way to scope?
window.jsondiffpatch = require('jsondiffpatch');
import './node_modules/jsondiffpatch/dist/formatters-styles/html.css';
// annotated, console, jsonpatch, html
</script>

<filter name="formatDiff">
module.exports = (value, options) => window.jsondiffpatch.formatters[options || 'html'].format(value);
</filter>
