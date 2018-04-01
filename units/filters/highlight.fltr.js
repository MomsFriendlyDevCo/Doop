/**
* Highlights text on page ideal for search results
*
*/
angular
	.module('app')
	.filter('highlight', function($sce) {
		var highlightColour = '#B0C4DE'; //Select Colour to highlight
		return function(text, phrase) {
			if (!text) return; //No text to highlight (ie Blank)
			if (phrase) text = text.replace(new RegExp('('+phrase+')', 'gi'),
			`<span style="background: `+highlightColour+`">$1</span>`)
			return $sce.trustAsHtml(text)
		}
})