var _ = require('lodash');
var axios = require('axios');
var crypto = require('crypto');
var FormData = require('form-data');
var gulp = require('gulp');

gulp.task('preDeploy', ()=> Promise.resolve());

gulp.task('postDeploy', ['load:app.git', 'load:app.slack'], ()=> Promise.resolve()
	.then(()=> app.git.historySinceBookmark(app.config.deploy.historyBookmark))
	.then(history => Promise.allSeries([
		// {type: 'freedcamp'} {{{
		...app.config.deploy.actions
			.filter(s => s.type == 'freedcamp' && s.event == 'postDeploy')
			.map(msg => ()=> {
				// Calculate FC parameter slush {{{
				var timestamp = new Date().valueOf();
				var params = { // Params to send with each request
					api_key: msg.apiKey,
					timestamp,
					hash: crypto.createHmac('sha1', msg.secret).update(msg.apiKey + timestamp).digest('hex'),
				};
				// }}}

				return Promise.all([
					// Resolve subject + body {{{
					Promise.resolve(msg.subject(app, history)), // Calc the subject Promise
					Promise.resolve(msg.body(app, history)), // Calc the message body
					// }}}

					// Fetch the discussion list ID so we can post to it {{{
					axios({
						method: 'GET',
						url: 'https://freedcamp.com/api/v1/lists/3', // 3 is the discussions list "app"
						params: {
							...params,
							project_id: msg.projectId,
						},
					})
						.then(res => {
							if (!_.has(res, 'data.data.lists') || !res.data.data.lists.length) throw new Error('No lists found for that FreedCamp project');
							return res.data.data.lists[0];
						})
						.catch(e => Promise.reject(`Failed to fetch discussion lists - ${e.toString()}`)),
					// }}}

					// Fetch users we should notify from regExp lists {{{
					axios({
						method: 'GET',
						url: 'https://freedcamp.com/api/v1/users',
						params: {
							...params,
							project_id: msg.projectId,
						},
					})
						.then(res => {
							if (!_.has(res, 'data.data.users') || !res.data.data.users.length) throw new Error('No users found for that FreedCamp project');
							return res.data.data.users.filter(u =>
								msg.notify.some(n =>
									n.test([u.first_name, u.last_name].filter(i => i).join(' ')) // Test against full name not the weird partial `full_name` field FC gives us
								)
							);
						})
						.catch(e => Promise.reject(`Failed to fetch user list - ${e.toString()}`))
					// }}}
				])
				.then(([subject, body, list, users]) => {
					gulp.log('Going to post on FreedCamp discussion board for project', gulp.colors.cyan(msg.projectId), 'title=', gulp.colors.cyan(subject));
					var form = new FormData(); // FC API requires everything using the annoying FormData Mime standard
					form.append('data', JSON.stringify({
						project_id: msg.projectId,
						list_id: list.id,
						f_sticky: false,
						f_private: false,
						title: subject,
						description: body,
						notifications: users.map(u => u.user_id),
					}));

					return axios({
						method: 'POST',
						url: 'https://freedcamp.com/api/v1/discussions',
						params,
						headers: form.getHeaders(),
						data: form,
					}).catch(e => {
						gulp.log(gulp.colors.red('postDeploy failed with FreedCamp Post:'), e.response.data);
						return Promise.resolve(); // Accept the output and continue on with deploy anyway
					})
				})
			}),
		// }}}

		// {type: 'slack'} {{{
		...app.config.deploy.actions
			.filter(s => s.type == 'slack' && s.event == 'postDeploy')
			.map(msg => ()=>
				Promise.resolve(msg.body(app, history))
					.then(body => app.slack.post({...msg, body}))
					.catch(e => {
						gulp.log(gulp.colors.red('postDeploy failed with Slack Post'), e);
						return Promise.resolve(); // Accept the output and continue on with deploy anyway
					})
			),
		// }}}
	]))
);
