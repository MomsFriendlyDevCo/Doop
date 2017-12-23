/**
* Error reporting hook
* This module will add logging to express via the `express-log-url` NPM
* It will also add the `res.sendError()` function which raises a 400, outputs text and also sets the res.errorBody header for debugging
*/

app.register('preControllers', function(finish) {
	app.use(require('express-log-url'));

	// Extend the Res object so it contains the new res.sendError() reporting function
	app.use(function(req, res, next) {

		/**
		* Report an error
		* This is really just a convenience function to set all the weird headers in the event of an error
		* @param {number} [code=400] Optional error code to use
		* @param {string} err The error to report
		* @return {undefined} This function is fatal to express as it closes the outbound connection when it completes
		*/
		res.sendError = function(code, err) {
			res.errorBody = err;
			if (isFinite(code)) {
				res.status(code).send(err).end();
			} else {
				res.status(400).send(code).end();
			}
		};

		next();
	});


	finish();
});