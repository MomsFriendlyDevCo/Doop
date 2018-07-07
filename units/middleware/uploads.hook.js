/**
* Returns a wrapped version of multer with suitable defaults
*
* @example Accept a single file upload using the 'file' field. req.file gets populated with the decoded file
* app.post('/api/upload', app.middleware.uploads.single('file'), (req, res) => {
*   fs.rename(req.file.path, '/a/path/somewhere.txt', ()=> res.sendStatus(200));
* });
*
* @example Accept multiple files req.files gets populated with the decoded file collections
* app.post('/api/upload', app.middleware.uploads.any(), (req, res) => {
*   // ... iterate over req.files and presumably use fs.rename() to move them somewhere ... //
* });
*/
var multer = require('multer');
var os = require('os');

app.register('preControllers', function(finish) {
	app.middleware.uploads = multer({
		storage: multer.diskStorage({
			destination: os.tmpdir(),
			filename: function (req, file, cb) {
				cb(null, `upload-${file.fieldname}-${Date.now()}`);
			},
		}),
	});

	finish();
})
