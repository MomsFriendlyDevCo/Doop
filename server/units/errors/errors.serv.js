app.register('postServer', function(finish) {
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.send(500, 'Something broke!').end();
	});

	finish();
});
