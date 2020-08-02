<script>
/**
* Pluralise various words based on the numeric prefix
* This function is a fancy find/replace system which examines numbers before words and tries to pluralise them
*
* NOTE: Auto pluralisation is pretty stupid and really just adds 's' as a suffix for plurals or removes it for singulars unless explicitally specified
* NOTE: Input numbers can also be formatted (e.g. '1,223,123'), only '1' is really checked for
*
* @param {array|string} plurals Expressions to force search for either as an array or CSV, Each entity can be seperated by slashes to force definitions e.g. `['widget/widgets']`
* @returns {string} The correct pluralisation based on the input value
* 
* @example Pluralise automatically
* {{'1 widget' |> plural}} //= '1 widget' / '2 widgets'
*
* @example Pluralise with definitions
* {{'1 person' |> v => plural(v, 'person/people')}} //= '1 person' / '1 people'
*/
app.filter('plural', (value, plurals) => {
	var singularToPlural = {};
	var pluralToSingular = {};

	// Calculate singular lookups {{{
	if (plurals) { // Digest plural definitions
		if (typeof plurals == 'string') plurals = plurals.split(/\s*,\s*/); // Split from CSV
		plurals.forEach(p => {
			var [singular, plural] = p.split(/\s*\/\s*/);
			if (!singular || !plural) throw new Error(`Invalid plural spec definition "${p}", must be of format "singular / plural"`);
			singularToPlural[singular] = plural;
			pluralToSingular[plural] = singular;
		});
	}
	// }}}

	return value.replace(/([\d,]+) ([a-z]+)\b/gi, (match, numberRaw, wordRaw) => {
		// Widgets (P2S, clip 's'), Widget (S2P -> P2S
		var wordSingular =
			pluralToSingular[wordRaw]
			|| singularToPlural[wordRaw] ? pluralToSingular[singularToPlural[wordRaw]] : null
			|| wordRaw.replace(/s$/, '');

		var wordPlural =
			pluralToSingular[wordRaw] ? singularToPlural[pluralToSingular[wordRaw]] : null
			|| singularToPlural[wordRaw]
			|| wordRaw.endsWith('s') ? wordRaw : wordRaw + 's';

		if (numberRaw == '1') { // Use singular
			return numberRaw + ' ' + wordSingular;
		} else { // Use multiple plural
			return numberRaw + ' ' + wordPlural;
		}
	});
});
</script>
