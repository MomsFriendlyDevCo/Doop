/**
* Stub model so Monoxide can talk to the session storage model
* This model is actually maintained by express-session + connect-mongodb-session on each page refresh
* It also assumes that the connect-mongodb-session object has be init'd with at least `{idField: 'sessionID'}`
*/
var monoxide = require('monoxide');

module.exports = monoxide.schema('sessions', {
	sessionID: {type: 'string'},
	expires: {type: 'date'},
	session: {type: 'object'},
});
