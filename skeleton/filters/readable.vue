<script lang="js" frontend>
import Readable from '@momsfriendlydevco/readable';
readable.defaults.fileSize.formatters.fallback = '0b';

app.filter('fileSize', readable.fileSize);
app.filter('relativeTime', readable.relativeTime);
app.filter('sizeOf', readable.sizeOf);
</script>
