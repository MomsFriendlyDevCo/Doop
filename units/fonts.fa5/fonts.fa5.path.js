var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');

/**
* Provide a JSON list of FA fonts
*/
// FIXME: app.middleware.cache('12h'),
app.get('/webfonts/fa.json', (req, res) => {
	async()
		// Read metadata file {{{
		.then('metadata', function(next) {
			fs.readFile(`${app.config.paths.root}/units/fonts.fa5/fa-pro/metadata/icons.json`, 'utf8', next);
		})
		.then('metadata', function(next) {
			next(null, JSON.parse(this.metadata));
		})
		// }}}
		// Map icons {{{
		.then('icons', function(next) {
			next(null,
				_.chain(this.metadata)
					.map((v, k) => {
						v.class = k;
						return _.pick(v, [
							'class', 'styles', 'unicode',
						]);
					})
					.map(icon => ({
						id: icon.class,
						class:
							icon.styles[0] == 'brands' ? `fab fa-${icon.class}`
							: `fa fa-${icon.class}`,
						varients: icon.styles
							.map(s =>
								s == 'brands' ? `fab fa-${icon.class}`
								: s == 'solid' ? `fa fa-${icon.class}`
								: s == 'regular' ? `far fa-${icon.class}`
								: s == 'light' ? `fal fa-${icon.class}`
								: null
							)
							.filter(s => s),
					}))
					.value()
			);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return res.sendError(err);
			res.send(this.icons);
		})
		// }}}
});
