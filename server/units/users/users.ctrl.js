/**
* Users controller
* Server-side logic for managing users
* User actions / flows related to user authentication are in `auth.ctrl.js`
*/

var _ = require('lodash');
var async = require('async-chainable');
var colors = require('chalk');
var email = require('mfdc-email');
var fs = require('fs');
var fspath = require('path');
var mkdirp = require('mkdirp');
var moment = require('moment');
var monoxide = require('monoxide');
var uuid = require('node-uuid');

// Demo data
var dashData = require('./dashboard.json');

app.route('/signup')
	.all(app.middleware.ensure.nologin)
	/**
	 * Serves signup page
	 */
	.get(function(req, res) {
		res.render('units/users/signup', {
			layout: 'units/layouts/main',
			namespace: 'plain',
			message: req.flash('signupMessage'),
			values: {key: '', name: '', email: '', password: ''},
		});
	})
	/**
	 * API to handle user signup submissions
	 */
	.post(function(req, res, finish) {
		// Rather crappy checking - yes this needs improvement MC 2014-12-31

		async()
			.then(function(next) { // Form validation
				if (!req.body.name) {
					next('No name specified');
				} else if (!req.body.email) {
					next('No email specified');
				} else if (!/^(.*)@(.*)$/.test(req.body.email)) { // FIXME: Ugh!
					next('That doesnt look like a valid email address');
				} else if (!req.body.password) {
					next('No password specified');
				} else {
					next();
				}
			})
			.then(function(next) { // Check email isn't already in use
				return db.users.findOne({
					$or: [
						{ username: req.body.email },
						{ email: req.body.email },
				]},
				function(err, user) {
					// Don't want to show 'Not found' errors as that's intended for signup to proceed
					if (err && err !== 'Not found') return next(err);
					if (user) return next('Email already registered');
					next();
				});
			})
			.then('user', function(next) { // Create the user
				return db.users.create({
					name: req.body.name,
					email: req.body.email,
					username: req.body.username || req.body.email,
					password: req.body.password,
					status: 'pendingVerify',
					token: uuid.v4(), // FIXME: Should improve token generation to a better hash
				}, next);
			})
			.then(function(next) {
				// Dispatch signup email with account verfication link
				email
					.to(req.body.email)
					.subject('4ME Training Registration - Account Verification')
					.template(app.config.paths.server + '/units/users/signup.email.html')
					.templateParams({
						// Construct the link the user will need to activate to verify their account and thus complete signup
						tokenURI: app.config.url + '/validate/' + this.user.token,
					})
					.send(next);
			})
			.end(function(err) {
				// There was an issue creating the account
				if (err) return res.status(400).json({ error: err });

				res.json({
					message: 'Signup success!',
					userid: this.user._id,
				});
			});
	});

app.route('/api/users/stats')
	.all(app.middleware.ensure.admin)
	/**
	 * API to query users from DB
	 */
	.get(function(req, res) {
		async()
			.parallel({
				users: function(next){
					db.users.find({status:'active', role:'user'}).populate('achievements.achievement').exec(next)
				},
				equipments: function(next){
					db.equipment.count({status:'active'},next)
				},
				exercises: function(next){
					db.exercises.count({status:'active'},next)
				},
				classes: function(next){
					db.classes.count({status:'active'},next)
				},
				routines: function(next){
					db.routines.count({status:'active'},next)
				},
				challenges: function(next){
					db.challenges.count({status:'active'},next)
				},
				presets: function(next){
					db.users.find({status:'active'}, function(err, users){
						var presets = [];
						if(err) return next(err);
						if(users){
							presets = _(users).map('presets').flatten().filter().value();
						}
						next(null, presets)
					})
				}
			})
			.then('equipmentIds',function(next){
				//Most common equipment
				var topN = 3;//FIXME: move to config
				var equipments = _(this.presets).map('equipment').flatten().filter().value();
				var commonEquipment = _(equipments)
					.countBy(_.identity)
					.map(function(value, key){
						return {
							equipment: key,
							count: value
						};
					})
					.orderBy('count','desc')
					.map('equipment')
					.take(topN)
					.value()

				next(null, commonEquipment)
			})
			.then('commonEquipments', function(next){
				db.equipment.find({_id:{$in:this.equipmentIds}},next)
			})
			.then('commonDuration', function(next){
				var topN = 1;//FIXME: move to config

				var durations = _(this.presets)
					.map('duration')
					.flatten()
					.filter()
					.countBy(_.identity)
					.map(function(value, key){
						return {
							duration: key,
							count: value
						};
					})
					.orderBy('count','desc')
					.map('duration')
					.take(topN)
					.value()

				next(null, durations)
			})
			.then('achievementsWeek', function(next){
				var weekAgo = moment().subtract(7,'days');
				var achievements = _(this.users)
					.map('achievements')
					.flatten()
					.filter(function(achievement){
						return moment(achievement.created).isAfter(weekAgo);
					})
					.value().length;

				next(null, achievements)
			})
			.then('clientCount', function(next){
				next(null, this.users.length)
			})
			.then('paidClientsCount', function(next){
				next(null, this.users.filter(user => user._auth.subscription.type == "premium").length)
			})
			.then('freeClientsCount', function(next){
				next(null, this.users.filter(user => user._auth.subscription.type != "premium").length)

			})
			.then('stats', function(next) {
				// FIXME: STUB
				var stats = {
					clientCount: this.clientCount,
					paidClientsCount: this.paidClientsCount,
					freeClientsCount: this.freeClientsCount,
					// missedTrainingCount: 4, // Over the past 78 days
					achievementCount: this.achievementsWeek, // Over the past 7 days
					equipmentCount: this.equipments,
					exerciseCount: this.exercises,
					classCount: this.classes,
					routineCount: this.routines,
					challengeCount: this.challenges,
					commonEquipment: this.commonEquipments,
					commonDuration: this.commonDuration
				};

				next(null, stats);
			})
			.end(function(err) {
				if (err) return res.status(400).send(err);
				res.status(200).send(this.stats);
			});
	});

//Initial implementation of notification poller (not Notification model)
//Returns
//messages: all unread messages for logged in user
//notifications: all unread notifications for logged in user
//TODO: parameterize the resources to be retrieved
app.route('/api/users/pollNotifications')
	.get(function(req, res){
		async()
			.parallel({
				messages: function(next){
					if (req.user.role == "user" && req.user._auth.subscription.type == 'basic')
						return next(null, []);
					db.messages.find({
						owner: req.user._id,
						status: 'unread',
						sender: {$ne:req.user._id}
					})
					.populate('sender')
					.populate('recipient')
					.sort('-created')
					.exec(next);
				},
				notifications: function(next){
					db.notifications.find({
						user: req.user._id,
						read: false
					})
					.sort('-created')
					.exec(next);
				}
			})
			.end(function(err){
				if(err) return res.status(400).send(err);

				res.send({
					messages: this.messages,
					notifications: this.notifications
				})
			})
	});

app.route('/api/users/members')
	.get(function(req, res){
		db.users.find({
			"_auth.subscription.type":{$ne:'basic'},
			status:{$ne:"deleted"}
		})
		.sort('-created')//TODO: add .select() to limit the fields sent to client
		.exec(function(err, users){
			if (err) return res.status(400).send(err);
			res.status(200).send(users);//TODO: remove private fields
		})
	});

// expose demo dashboard data
app.route('/api/users/dashboard')
	.get(function(req, res) {
		res.send(dashData);
	});

app.route('/api/users/friendRequest/')
	.post(function(req, res){
		async()
			//Validation
			.then(function(next){
				if(!req.body.friend)
					next("No friend specified");
				next()
			})
			//Add friend request
			.then(function(next){
				console.log("add friend");
				db.users.update(
					{ _id: req.body.friend},
					{	$push:{"friendRequests":req.user._id}},
					next
				)
			})
			//Create Notification
			.then(function(next){
				console.log("create notification");
				utils.notifications.add({
					type:'info',
					user: req.body.friend,
					content: "You have one new friend request"
				});
				next()
			})
			.end(function(err){
					if(err) res.status(400).send(err);
					res.status(200).send()
			})
	})

app.route('/api/users/acceptFriendRequest/')
	.post(function(req, res){
		async()
			//Validation
			.then(function(next){
				if(!req.body.friend)
					next("No friend specified");
				next()
			})
			//TODO: this should be done in parallel
			.then(function(next){
				var user = req.user._id;
				var friend = req.body.friend;

				db.users.update(
					{_id:friend},
					{$push:{"friends":user}},
					next
				)
			})
			//TODO: this should be done in parallel
			.then(function(next){
				var user = req.user._id;
				var friend = req.body.friend;

				db.users.update(
					{_id: user},
					{
						$pull:{"friendRequests":friend},
						$push:{"friends": friend}
					},
					next
				)
			})
			.end(function(err){
				if(err) res.status(400).send(err);
				res.status(200).send()
			})
});

app.route('/api/users/deleteFriendship/')
	.post(function(req, res){
		async()
			//Validation
			.then(function(next){
				if(!req.body.friend)
					return next('No Friend specified');
				next();
			})
			//TODO: this should be done in parallel
			.then(function(next){
				var user = req.user._id;
				var friend = req.body.friend;

				db.users.update(
					{_id: user},
					{
						$pull:{"friends":friend}
					},
					next
				)
			})
			.then(function(next){
				var user = req.user._id;
				var friend = req.body.friend;

				db.users.update(
					{_id: friend},
					{
						$pull:{"friends": user}
					},
					next
				)
			})
			.end(function(err){
				if(err) res.status(400).send(err);
				res.status(200).send()
			})
	});

// Campaign background image upload {{{
app.route('/api/users/:id/image/')
	.post(function(req, res) {
		var userId = req.params.id;
		var src = req.files.file.path;
		var fileName = uuid.v4() + fspath.extname(src); //file name to be created
		var front = app.config.upload.user.profileImage + userId + "/" + fileName;
		var dest = app.config.paths.root + front;

		async()
			.then(function(next) {
				mkdirp(fspath.dirname(dest), next);
			})
			.then(function(next) {
				fs.createReadStream(src)
					.on('end', next)
					.on('error', next)
					.pipe(fs.createWriteStream(dest));
			})
			.then(function(next){
				db.users.update(
					{ _id: userId},
					{ profileImage: front},
				next);
			})
			.end(function(err) {
				res.send({
					error: err,
					file: front,//send back the front-end uri for the new file
				});
			});
	});

app.use('/api/users/:id?', monoxide.express.middleware('users', {
	query: [ app.middleware.ensure.admin ],
	create: [],
	save: [ app.middleware.ensure.login ],
	get: [ app.middleware.ensure.login ],
	delete: [ app.middleware.ensure.admin ]
}));
