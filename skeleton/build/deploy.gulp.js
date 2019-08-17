var gulp = require('gulp');

gulp.task('preDeploy', ()=> Promise.resolve());

gulp.task('postDeploy', 'postDeploy:slack');

gulp.task('postDeploy:slack', ['load:app.git', 'load:app.slack'], ()=>
	Promise.all(app.config.gulp.slack.filter(s => s.event == 'postDeploy').map(msg =>
		app.slack.post({
			...msg,
			body: msg.body(app),
		})
	))
);
