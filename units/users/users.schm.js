/**
* Users model
*
* @description Server-side user model
*/

var monoxide = require('monoxide');

var User = module.exports = monoxide.schema('users', {
	username: {type: String, required: true, index: {unique: true}},
	email: {type: String, required: true, index: {unique: true}},
	_passhash: {type: String},
	_passhash2: {type: String},
	_passsalt: {type: String},
	name: {type: String},
	status: {type: String, enum: ['pendingVerify', 'pendingInfo', 'active', 'deleted'], default: 'active', index: true}, // TODO: Change default to 'pendingVerify'
	role: {type: String, enum: ['user', 'admin', 'root'], default: 'user', index: true},
	token: {type: String},
	settings: {type: 'object', default: {}},
	created: {type: Date, default: Date.now},
	lastLogin: {type: Date, default: Date.now},

	// Profile {{{
	location: {
		city: {type: String},
		suburb: {type: String},
		postcode: {type: String},
	},
	dob: {type: Date},
	// }}}

	// User auth-related data {{{
	_auth: {
		subscription: {
			type: {type: String, enum: ['premium', 'trial', 'basic'], default: 'trial', index: true},
			expiry: {type: Date},
			created: {type: Date, default: Date.now},
		},
		facebook: {
			profileId: {type: String},
		},
		google: {
			profileId: {type: String},
		},
		stripe: {
			customerId: {type: String},
			created: {type: Date}
		}
	},
	// }}}
});

// Deal with logins + user passwords {{{
var crypto = require('crypto');

User
	.virtual('password', null, function(password) { // Allow write but not read
		this._passsalt = crypto.randomBytes(16).toString('base64');
		this._passhash = this.encryptPass(this._passsalt, password);
	})
	.method('encryptPass', function(salt, password) {
		var saltBuffer = new Buffer(salt, 'base64');
		return crypto.pbkdf2Sync(password, saltBuffer, 10000, 64).toString('base64');
	})
	.method('validPassword', function(candidate, next) {
		return next(null, this.encryptPass(this._passsalt || '', candidate) == this._passhash);
	});
// }}}

// Setup utility methods {{{
User
	.method('splitName', function() {
		var nameBits = this.name.split(/\s+/);
		return {
			first: nameBits[0],
			last: nameBits.length > 1 ? nameBits[nameBits.length - 1] : null,
			other: nameBits.length > 2 ? nameBits.slice(1, -1).join(' ') : null,
		};
	});
// }}
