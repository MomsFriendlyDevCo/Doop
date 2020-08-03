<script>
/**
* Session management service
*
* @emits $session.request Called as `(axiosRequest)` when about to submit a HTTP request to /api/session, can be mutated by downstream promise subscribers
*/
var $session = {};
$session.$debugging = false;

$session.data = {permissions: {}}; // User session data
$session.isRefreshed = false; // Have we pinged the server yet
$session.isLoggedIn = false; // Whether the user is logged in according to the server
$session.isSettled = false; // Have we fully loaded the session + project (and permissions of both)? Use this instead of isLoggedIn when needing both


// $session.stage bootstrapping {{{
/**
* $session bootstrap stage
* Subscribing to any of the $session.* events allows trapping the promise, emit.promise() is supported in each case
*
* -1 - preBootstrap - Not yet called the stage setup
* 0 - bootstrap - Initial boot @emits $session.bootstrap
* 1 - preBootData - Pulling initial session data @emits $session.preBootData
* 2 - postBootData - Initial hit of /api/session (load basic user info for site-wide data) @emits $session.postBootData
* 3 - settled - Final settle @emits $session.settled
*
* @var {number}
*/
$session.stage = -1;


/**
* Promise representing the stage load chain
* This is inialized by $session.stage.run()
* @var {Promise.Defer} Defer object which will resolve when the $session hits the 'settled' stage
*/
$session.stageDefer;


/**
* Object lookup of stages to perform while bootstrapping
* Rules:
* 	- Each stage should call app.vue.$emit.promise('$session.<STAGEID>') during its process
* 	- Each stage should call $session.stages.next() on completion to advance
*/
$session.stages = {
	/**
	* Set the bootstrap stage and execute from there
	* @param {number} stage The stage to operate from
	* @returns {Promise} A promise representing the stage load chain
	*/
	run(stage) {
		if ($session.stage >= 3) {
			$session.$debug('run() REPLACE', $session.stage, 'with', stage, '($session has already settled)');
			$session.stagePromise = Promise.defer();
		} else {
			$session.$debug('run() REVERT', $session.stage, 'to', stage);
		}

		$session.stage = stage - 1;
		$session.stages.next();
		$session.stagePromise.promise.finally(()=> $session.$debug('FINALLY!', $session.data));
		return $session.stagePromise.promise;
	},


	/**
	* Advance to the next load stage
	* @emits $session.stageChange Emitted as a promise event as `(stageNumber)`
	* @returns {Promise} A promise representing the stage load chain
	*/
	next() {
		$session.$debug('At stage', $session.stage + 1);
		return app.vue.$emit.promise('$session.stageChange', ++$session.stage)
			.then(()=> {
				switch ($session.stage) {
					case 0: return $session.stages.bootstrap();
					case 1: return $session.stages.preBootData();
					case 2: return $session.stages.postBootData();
					case 3: return $session.stages.settled();
					case 4: break; // Probably ended up here because some upstream event emitter performed postSettled work
					default:
						debugger;
						throw new Error(`Unknown $session.stage "${$session.stage}"`);
				}
			});
	},


	/**
	* Setup initial session state
	* @emits $session.bootstrap Emitted as a promise event after bootstrap setup
	* @returns {Promise} A promise which resolves when the stage completes
	*/
	bootstrap() {
		return Promise.resolve()
			.then(()=> $session.$debug('stage', 'bootstrap'))
			.then(()=> { // Load auth header token if we're in authHeader session preference mode
				if (!$session.isRefreshed && Vue.services().$config.session.preference == 'authHeader') { // Pull header from localStorage as we're not using cookies
					return $session.settings.get('authToken').then(token => {
						if (token) axios.defaults.headers.Auth = token;
					});
				}
			})
			.then(()=> app.vue.$emit.promise('$session.bootstrap'))
			.then(()=> $session.stages.next())
	},


	/**
	* Make initial tap to /api/session
	* @emits $session.preBootData Emitted as a promise event before requesting the session from the server
	* @emits $session.request Emitted as a promise event as (axiosRequestObject) before making the Axios request to the server
	* @returns {Promise} A promise which resolves when the stage completes
	*/
	preBootData() {
		var requestPrototype = {
			url: '/api/session',
			headers: {
				'Cache-Control': 'no-cache',
			},
		};

		return Promise.resolve()
			.then(()=> $session.$debug('stage', 'preBootData'))
			.then(()=> app.vue.$emit.promise('$session.preBootData'))
			.then(()=> app.vue.$emit.promise('$session.request', requestPrototype))
			.then(req => req || requestPrototype) // Did the promise do a complete rewrite or should we use the original?
			.then(req => Vue.services().$http(req))
			.then(res => {
				$session.$debug('$session.data now', JSON.parse(JSON.stringify(res.data)));
				if (res.data._id) {
					$session.data = Vue.prototype.$assign($session.data, {permissions: {}}, res.data)
					$session.isLoggedIn = true;
				} else {
					$session.isLoggedIn = false;
				}
			})
			.then(()=> $session.stage == 1 ? $session.stages.next() : $session.stages.run(2)) // Decide whether to run from this stage or advance based on if we're already past this step
			.catch(err => {
				if (
					(!err.response || !err.response.status)
					&& err == 'Network error'
					&& !$session.isRefreshed
				) {
					$session.$debug('Network error during preBootData on first fetch');
					app.crash('Can\'t connect to the SiteMobi servers', showReload=true);
				} else {
					$session.$debug('Caught error during preBootData', err);
					throw err;
				}
			})
	},


	/**
	* Signal that the user request has now been made
	* @emits $session.postBootData Emitted as a promise event as `($session.data)` after user data has been loaded
	* @returns {Promise} A promise which resolves when the stage completes
	*/
	postBootData() {
		return Promise.resolve()
			.then(()=> $session.$debug('stage', 'postBootData'))
			.then(()=> app.vue.$emit.promise('$session.postBootData', $session.data))
			.then(()=> $session.stages.next())
	},


	/**
	* Signal that the user load process has completed
	* @emits $session.settled Emitted as a promise event as `($session.data)` after user data has been finalized
	* @returns {Promise} A promise which resolves when the stage completes
	*/
	settled() {
		return Promise.resolve()
			.then(()=> $session.$debug('stage', 'settled'))
			.then(()=> app.vue.$emit.promise('$session.settled', $session.data))
			.then(()=> $session.isSettled = true)
			.then(()=> {
				if ($session.isLoggedIn) {
					$session.stagePromise.resolve($session.data);
				} else {
					$session.stagePromise.reject({errno: 403, error: 'User not logged in'});
				}
			})
	},
};
// }}}


/**
* Return a promise for when this user is logged in
* NOTE - if the user is ALREADY logged in or DEFINIATELY NOT logged in this function will return an already resolved/rejected promise.
*        If neither are true we return a defer / future and resolve that when we know for certain
* @param {function} [cb] Optional callback to run when the user resolves, supplied so this function can also be used as Vue middleware
* @return {Promise} A promise which will resolve with the contents of $session.data on login or reject on fail (or not logged in)
*
* @example Use as a Vue middleware hook
* beforeRouteEnter(to, from, next) {
*  Vue.services().$session.promise(next);
* },
*/
$session.promise = cb => new Promise((resolve, reject) => {
	var checkPromise = ()=> {
		if ($session.stagePromise) {
			resolve($session.stagePromise.promise.then(()=> {
				if (cb) cb();
			}));
		} else {
			$session.$debug('$session.promise not ready yet');
			setTimeout(checkPromise, 10);
		}
	};
	checkPromise();
});


/**
* Refresh user information from the server
* This function is automatically executed on bootstrap
* @depreciated
* @return {Promise} A promise object for the fetch request
*/
$session.refresh = ()=> { throw new Error('$session.refresh is depreciated! Use $session.stage.preBootData if you really have to refresh directly') };


/**
* Attempt to log in the user
* @param {Object} user The user object to login
* @param {string} user.username The username to login
* @param {string} user.password The password to login
* @return {Promise} The promise object for the server request
*/
$session.login = user => Promise.resolve()
	.then(()=> Vue.services().$loader.start('$session.login'))
	.then(()=> Vue.services().$http.post('/api/session/login', user))
	.then(res => { // Use authHeader method?
		if (Vue.services().$config.session.preference == 'authHeader' && res.data && res.data.auth) {
			axios.defaults.headers.Auth = res.data.auth;
			return $session.settings.set('authToken', res.data.auth, 'local');
		}
	})
	.then(()=> $session.stages.run(1)) // Reperform the session fetcher
	.then(()=> $session.$debug('login done'))
	.finally(()=> Vue.services().$loader.stop('$session.login'))


/**
* Attempt to logout the user
* @return {Promise} The promise object for the server request
* @emits $session.reset Emitted when the session is nullified
*/
$session.logout = ()=> Promise.resolve()
	.then(()=> Vue.services().$loader.start('$session.logout'))
	.then(()=> app.vue.$emit.promise('$session.reset'))
	.then(()=> this.$config.session.preference == 'authHeader' && $session.settings.unset('authToken'))
	.then(()=> this.$http.post('/api/session/logout'))
	.then(()=> window.location.reload())
	.finally(()=> Vue.services().$loader.stop('$session.logout'))


// $session.permissions - mirror or app.utils.permissions {{{
/**
* User permissions handling
* NOTE: This is a front-end mirror of the app.utils.permissions library and should be kept up to date
* @var {Object}
*/
$session.permissions = {};


/**
* Query whether a user has a given or array of permissions
* @param {string|array<string>} permission Single or multiple permissions to check, if an array all must be present
* @returns {boolean} A boolean if the permission statement matches
* @see $session.hasPermission.any()
*/
$session.hasPermission = permission =>
	_.isArray(permission) ? permission.every(p => _.get($session, ['data', 'permissions', p]))
	: _.isString(permission) ? _.get($session, ['data', 'permissions', permission], false)
	: false;


/**
* Similar to $session.hasPermission but applies an "OR" condition to arrays
* @param {string|array<string>} permission Single or multiple permissions to check, if an array any item must be present
* @returns {boolean} A boolean if the permission statement matches
* @see $session.hasPermission()
*/
$session.hasPermission.any = permission =>
	_.isArray(permission) ? permission.some(p => _.get($session, ['data', 'permissions', p]))
	: _.isString(permission) ? _.get($session, ['data', 'permissions', permission], false)
	: false;
// }}}


/**
* User settings handling
* @var {Object}
*/
$session.settings = {};


/**
* Attempt to retrieve a user setting from any of the supported storage methods
* @param {string} key The key the setting is stored against, can be in dotted notation
* @param {*} [fallback] Fallback value if no value can be found
* @returns {Promise} A promise which will resolve with the found value
*/
$session.settings.get = (key, fallback) => {
	var found;
	if ((found = _.get($session, `data.settings.${key}`)) !== undefined) {
		return Promise.resolve(found);
	} else if ((found = localStorage.getItem(key)) !== null) {
		return Promise.resolve(JSON.parse(found));
	} else if ((found = sessionStorage.getItem(key)) !== null) {
		return Promise.resolve(JSON.parse(found));
	} else {
		return Promise.resolve(fallback);
	}
};


/**
* Set a user setting against an optional endpoint
* @param {string} key The key to set, can be in dotted notation
* @param {*} value The value to store
* @param {string} [method='server'] Where to store the setting. ENUM: 'server' (store on the server against user document), 'local' (use localStorage), 'session', (use sessionStorage)
* @returns {Promise} A promise which will resolve when the setting has been saved
*/
$session.settings.set = (key, value, method = 'server') => {
	switch (method) {
		case 'server':
			_.set($session.data.settings, key, value);
			return this.$http.post('/api/session/profile', {
				settings: this.$session.data.settings,
			});
		case 'local': return Promise.resolve(localStorage.setItem(key, JSON.stringify(value)));
		case 'session': return Promise.resolve(sessionStorage.setItem(key, JSON.stringify(value)));
		default: throw new Error(`Unknown setting storage method "${method}"`);
	}
};


/**
* Remove a user setting
* @param {string} key The key to remove, can be in dotted notation
* @param {string} [method='server'] Where to store the setting. ENUM: 'server' (store on the server against user document), 'local' (use localStorage), 'session', (use sessionStorage)
* @returns {Promise} A promise which will resolve when the setting has been removed
*/
$session.settings.unset = (key, method = 'local') => {
	switch (method) {
		case 'server':
			_.unset($session.data.settings, key, value);
			return this.$http.post('/api/session/profile', {
				settings: this.$session.data.settings,
			});
		case 'local': return Promise.resolve(localStorage.removeItem(key));
		case 'session': return Promise.resolve(sessionStorage.removeItem(key));
		default: throw new Error(`Unknown setting unset method "${method}"`);
	}
};

app.ready.then(()=> {
	$session.stagePromise = Promise.defer();
	$session.stages.run(0); // Kickoff initial session pull
});

app.service('$session', $session);
</script>

<script>
app.component({
	route: '/debug/session',
});
</script>

<template>
	<div class="card">
		<div class="card-body">
			<pre>{{$session.data}}</pre>
		</div>
	</div>
</template>

<script name="session-menu">
app.component('sessionMenu', {
	mounted() {
		this.$on('$session.update', ()=> this.$forceUpdate());
	},
});
</script>

<template name="session-menu">
	<li v-if="$session.isLoggedIn" class="pull-right dropdown session-menu">
		<a data-toggle="dropdown">
			<div class="username">{{$session.data.name}}</div>
			<img :src="`/api/session/avatar/${$session.data._id}`" class="img-circle img-user">
		</a>
		<ul class="dropdown-menu pull-right">
			<li><a v-href="{href: '/profile', transition: 'cover-up'}"><i class="far fa-user"></i> Your Profile</a></li>
			<li class="dropdown-divider"></li>
			<li class="dropdown-item-danger"><a @click="$session.logout()"><i class="far fa-sign-out-alt"></i> Logout</a></li>
		</ul>
	</li>
</template>

<style>
.session-menu .username {
	float: left;
	color: #FFF;
	margin: 15px 5px;
}

.session-menu .img-user {
	width: 50px;
	height: 50px;
	border: 1px solid #1e3a56;
}
</style>
