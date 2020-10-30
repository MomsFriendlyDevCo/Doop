<script repack>
/**
* Front-end polyfills to apply
*/
import './polyfills/array.flat';
import './polyfills/array.flatMap';
import './polyfills/promise.allLimit';
import './polyfills/promise.allSeries';
import './polyfills/promise.defer';
import './polyfills/promise.isPromiseLike';
import './polyfills/promise.tap';
import './polyfills/promise.timeout';
import './polyfills/regexp.escape';

// Misc polyfills needed by MS Edge >=41
import 'core-js/features/object/from-entries';
</script>
