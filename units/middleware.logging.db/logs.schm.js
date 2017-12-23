var monoxide = require('monoxide');

module.exports = monoxide.schema('logs', {
	created: {type: Date, default: Date.now},
	user: {type: 'pointer', ref: 'users', index: true},
	type: {type: 'string', index: true, enum: [
		// NOTE: if this list gets extended remember to add the translation to units/middleware.logging.db/logs.path.js +/switch (log.type)

		'create', // MONOXIDE ONLY: A document was created
		'save', // MONOXIDE ONLY: A document was updated
		'user-validated', // User validated his email by clicking on the validation link
		'user-comment', // Manually created user comment (via angular-ui-history)
		'user-upload', // User uploaded a file (via angular-ui-history), payload is an array of file information with keys `filename`, `url`, `size`, `icon`
		'user-emailed', // User emailed other users something, Content is a brief description of what
	]},
	model: {type: 'string', index: true},
	docId: {type: 'string', index: true}, // NOTE: This is not a pointer as it can be any arbitrary value (e.g. `${worklot}-hw-${itp}-${index}` for worklot hold/witness points)
	content: {type: 'string'}, // Human readable change
	payload: {type: 'object'}, // Change payload (the changed fields with the values as the new values)
	changes: {type: 'object'}, // Change list (keys are the changed keys, each value is an array of [newValue, oldValue])
})