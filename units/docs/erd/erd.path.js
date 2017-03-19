var express = require('express');

app.use('/api/docs/erd', app.middleware.extensions('txt', 'png', 'svg'), express.static(app.config.paths.root + '/build/docs/erd'));
