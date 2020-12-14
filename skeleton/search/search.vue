<service singleton>
/**
* Various utility functions for handling string queries
*/
module.exports = function() {
	var $search = this;

	/**
	* Attempt to loosely parse search tags from an input string
	* NOTE: This does not perform any validation on tags - only parses them into a key=value object
	* @param {string} query The input string to process
	* @returns {Object} An object of key=value parses with the meta `$fuzzy` key for left over string values
	*
	* @example Parse a string query
	* vm.$search.parseTags('is:draft between:jan john smith') //= {is: 'draft', between: 'jan-dec', $fuzzy: 'john smith'}
	*/
	$search.parseTags = function(query = '') {
		var fuzzyQuery = []; // Extracted fuzzy query parts, extracted from all queryHash parts that don't look like tags

		return _.chain(query) // Break query into a lookup hash of tag:values
			.thru(terms => stringSplitBy(terms, /\s+/, {
				ignore: ['"', "'", '()'], // Preserve compound terms with speachmarks + brackets
				escape: true, // Allow escaping of terms
			}))
			.filter(v => {
				if (/:/.test(v)) return true;
				fuzzyQuery.push(v); // Not a tag - add to fuzzy query part
				return false;
			})
			.map(v => v.split(/:/, 2))
			.fromPairs()
			.set('$fuzzy', fuzzyQuery.join(' '))
			.value();
	};


	/**
	* Take an object and return it as a sequence of tags
	* This is the opposite of $search.parseTags()
	* @param {Object} obj The query object to stringify, this can also contain the `$fuzzy` meta key
	* @returns {string} The stringified object
	*/
	$search.stringify = function(obj) {
		return _.chain(obj)
			.map((v, k) =>
				k == '$fuzzy' ? v
				: /\s/.test(v) ? `"${v}"`
				: `${k}:${v}`
			)
			.join(' ')
			.value();
	};


	/**
	* Take an existing search query, merge options and return the result
	* This is really just a combination of various other functions together as a convenience function
	* @param {string} query The existing query string to merge with
	* @param {Object} obj The new object to merge with the input query using _.merge()
	* @returns {string} The modified query with the object merged
	*/
	$search.merge = function(query = '', obj) {
		var existingQuery = $search.parseTags(query);
		return $search.stringify(_.merge(existingQuery, obj));
	};


	return $search;
};
</service>

<script repack>
// Expose string-split-by globally
import stringSplitBy from 'string-split-by';
window.stringSplitBy = stringSplitBy;
</script>
