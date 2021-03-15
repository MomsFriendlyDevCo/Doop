var fs = require('fs')

/**
* Attempt to rename a file if its on the same device OR move it if not
*/
fs.promises.move = (src, dst) =>
	fs.promises.rename(src, dst).catch(e => { // Try a simple rename first
		if (e.code != 'EXDEV') throw e; // Not a "not the same device" error - throw it and die

		return new Promise((resolve, reject) => { // Create a copy + unlink the original
			var readStream = fs.createReadStream(src);
			var writeStream = fs.createWriteStream(dst);

			readStream.on('error', reject);
			writeStream.on('error', reject);

			writeStream.on('finish', ()=> resolve());

			readStream.pipe(writeStream);
		})
			.then(()=> fs.promises.unlink(src))
	})
