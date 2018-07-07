var indexer = require('./indexer');
app.register('postFinish', function(finish) {
	indexer.setup(finish);
});
