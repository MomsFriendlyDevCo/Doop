var bouncy = require('bouncy');

var server = bouncy(function (req, res, bounce) {
	if (req.headers.host == '{{FIXME.domain}}' || req.headers.host == 'www.{{FIXME.domain}}') {
		bounce(8001);
	} else if (req.headers.host == 'console.{{FIXME.domain}}') {
		bounce(8002);
	} else {
		res.status(404).send('no such host');
	}
});

server.listen(80);
