/**
* Generate ERD diagrams from a Monoxide schema
* Requires [Graphviz](http://www.graphviz.org) which is available via Apt / Brew
*
* Diagrams are placed in /build/docs/erd/*
* @see http://plantuml.com/class-diagram
*/

var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');
var gulp = require('gulp');
var mkdirp = require('mkdirp');
var monoxide = require('monoxide');
var plantUML = require('node-plantuml');
var stream = require('stream');

gulp.task('docs:erd', ['load:app.db'], function(finish) {
	async()
		// Create storage directories {{{
		.then(function(next) {
			mkdirp(app.config.paths.root + '/build/docs/erd', next);
		})
		// }}}
		// Output each field line-item {{{
		.set('metaRelations', [])
		.map('dbText', db, function(next, collection, collectionID) {
			metaRelations = this.metaRelations;

			collection.meta(function(err, layout) {
				if (err) return next(err);

				next(null, _([])
					.concat(
						'class ' + collectionID + ' {',
						_.map(layout, (col, colID) => {
							var buffer = [];

							switch (col.type) {
								case 'objectid':
									if (colID == '_id') { // Primary ID
										buffer.push('\t<b>' + colID + ' : OID</b>');
									} else if (col.ref) { // 1:M relation with another collection
										metaRelations.push(col.ref + ' <|-- ' + collectionID);
										buffer.push('\t' + colID + ' : OID');
									} else { // Floating OID
										buffer.push('\t' + colID + ' : OID');
									}
									break;
								default:
									buffer.push('\t' + colID + ' : ' + col.type);
							}

							return buffer;
						}),
						'}'
					)
					.flatten()
					.value()
				);
			});
		})
		// }}}
		// Calculate PlantUML schema {{{
		.then('schema', function(next) {
			next(null,
				// Meta relations {{{
				'\'// Relationships {{{\n' +
				this.metaRelations.join('\n') + '\n' +
				'\'// }}}\n\n' +
				// }}}

				// Schema {{{
				'\'// Datbase Schema {{{\n' +
				_(this.dbText)
					.map()
					.flattenDeep()
					.join('\n') + '\n' +
				'\'// }}}\n'
				// }}}
			);
		})
		// }}}
		// Make a data stream {{{
		.then('stream', function(next) {
			var dataStream = new stream.Readable();
			dataStream._read = ()=> {}; // Has to be set so Node doesn't crash >0.10 because of reasons - MC 2017-03-18
			dataStream.push(this.schema);
			dataStream.push(null);
			next(null, dataStream);
		})
		// }}}
		.parallel([
			// Output raw text specification {{{
			function(next) {
				fs.writeFile(app.config.paths.root + '/build/docs/erd/erd.txt', this.schema, next);
			},
			// }}}
			// Encode into PNG {{{
			function(next) {
				var diagram = plantUML.generate({format: 'png'});
				diagram.out.pipe(fs.createWriteStream(app.config.paths.root + '/build/docs/erd/erd.png'));
				this.stream.pipe(diagram.in);
				diagram.out.on('close', next);
			},
			// }}}
			// Encode into SVG {{{
			function(next) {
				var diagram = plantUML.generate({format: 'svg'});
				diagram.out.pipe(fs.createWriteStream(app.config.paths.root + '/build/docs/erd/erd.svg'));
				this.stream.pipe(diagram.in);
				diagram.out.on('close', next);
			},
			// }}}
		])
		.end(finish);
});
