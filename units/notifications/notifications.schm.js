var monoxide = require('monoxide');

module.exports = monoxide.schema('notifications', {
	created: {type: Date, default: Date.now},
	status: {type: 'string', enum: ['active', 'read', 'deleted'], default: 'active', index: true},
	from: {type: 'pointer', ref: 'users', index: true}, // Set as null for 'system message'
	to: {type: 'pointer', ref: 'users', index: true},
	subject: {type: 'string'},
	body: {type: 'string'},
});
