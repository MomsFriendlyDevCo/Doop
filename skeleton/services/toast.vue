<service defer singleton>
module.exports = function() {
	var $toast = this;

	$toast.settings = {
		progressRemoveDelay: 2000, // How long to wait before removing completed progress toasts
	};

	var Snotify = Vue.prototype.$snotify;
	Snotify.config.global.preventDuplicates = true;

	$toast.primary = Snotify.simple.bind(Snotify);
	$toast.info = Snotify.info.bind(Snotify);
	$toast.success = Snotify.success.bind(Snotify);
	$toast.warn = $toast.warning = Snotify.warning.bind(Snotify);
	$toast.danger = Snotify.error.bind(Snotify);
	$toast.error = Snotify.error.bind(Snotify);
	$toast.confirm = Snotify.confirm.bind(Snotify);
	$toast.prompt = Snotify.prompt.bind(Snotify);
	$toast.clear = Snotify.clear.bind(Snotify);

	$toast.save = ()=>
		Snotify.create({
			title: 'Saved',
			config: {
				position: 'centerTop',
				showProgressBar: false,
				timeout: 2000,
				type: 'save',
			},
		})

	
	$toast._progress = {}; // Storage of all progress toasts

	/**
	* Display a toast with progress
	* @param {string} id A unique ID to identify the toast so it can be changed later
	* @param {string} [text] The text of the progress area
	* @param {number} progress Progress to show between 0 and 100 - at 100 the progress display is removed
	* @param {object} [options] Additional options to pass
	* @param {object} [options.icon="far fa-spinner fa-spin"] Font-Awesome comaptible icon class to use in the side of the toast
	*/
	$toast.progress = (id, text, progress, options) => {
		var settings = {
			icon: 'far fa-spinner fa-spin',
		};

		// Argument mangling {{{
		if (!id) throw new Error('$toast.progress(id, [text], progress) requires an ID');
		if (_.isNumber(text)) {
			[text, progress] = [undefined, text];
		}
		// }}}

		if (!$toast._progress[id]) { // Create new toast
			$toast._progress[id] = {
				text,
				progress: progress || 0,
				snotify: Snotify.create({
					config: {
						timeout: 0,
						position: 'rightBottom',
						showProgressBar: false,
						type: 'progress',
						closeOnClick: false,
						icon: false,
						html: ''
							+ '<div class="media col-12">'
								+ '<div class="mr-2 snotify-fa-icon">'
									+ `<i class="${settings.icon}"></i>`
								+ '</div>'
								+ '<div class="media-body">'
									+ `<h4 id="toast-text-${id}">${text || ''}</h4>`
										+ '<div class="progress mb-1">'
											+`<div id="toast-progress-${id}" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${progress || 0}%"></div>`
										+ '</div>'
									+ '</div>'
								+ '</div>'
							+ '</div>'
					},
				}),
			};
		} else { // Update existing
			$(`#toast-progress-${id}`).css('width', Math.min(progress, 100) + '%');
			if (text != $toast._progress[id].text) $(`#toast-text-${id}`).text(text);
		}

		if (progress === 100) { // Destroy progress
			if (!$toast._progress[id] || !$toast._progress[id].snotify) return; // Toast doesn't exist anyway
			var sid = $toast._progress[id].snotify.id;
			setTimeout(()=> Snotify.remove(sid), $toast.settings.progressRemoveDelay);
			delete $toast._progress[id];
		}
	};


	$toast.catch = (obj, options) => {
		console.warn('Promise chain threw error:', obj);
		if (_.isObject(obj) && obj.status && obj.status == -1 && obj.statusText && obj.statusText == '') return $toast.offline(true);
		if (obj === 'cancel') return; // Silently ignore user cancelled actions

		$toast.error(
			_.isUndefined(obj) ? 'An error has occured'
			: _.isString(obj) ? obj
			: _.isError(obj) ? obj.toString().replace(/^Error: /, '')
			: _.has(obj, 'error') && obj.error ? obj.error
			: _.has(obj, 'data') && _.isString(obj.data) && obj.data ? obj.data
			: _.has(obj, 'data.errmsg') && obj.data.errmsg ? obj.data.errmsg
			: _.has(obj, 'data.error') && obj.data.error ? obj.data.error
			: _.has(obj, 'statusText') && obj.statusText ? obj.statusText
			: _.has(obj, 'status') && obj.status === -1 ? 'Server connection failed'
			: _.has(obj, 'message') && /Received: ".+"/.test(obj.message) ? (function(text) { var matches = /^.+Received: "(.+?)"/.exec(text); return matches[1]; }(obj.message))
			: _.isFunction(obj.toString) && obj.toString() !== '[object Object]' ? obj.toString() :
			'An error has occured'
		, options);
	};

	return $toast;
};
</service>

<style>
.snotifyToast {
	box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.2);
}

/* Icons {{{ */
.snotifyToast .snotify-fa-icon {
	font-size: 2em;
	position: absolute;
	width: 50px;
	left: -6px;
	top: -20px;
	bottom: -20px;
	display: flex;
	align-items: center;
	justify-content: center;
	filter: brightness(1.3);
	background: var(--secondary);
}

.snotifyToast .snotify-fa-icon + .media-body {
	margin-left: 50px;
}
/* }}} */

/* Progress {{{ */
.snotifyToast.snotify-progress {
	background-color: var(--secondary);
	border: 1px solid var(--gray-dark);
}

.snotifyToast.snotify-progress .snotifyToast__inner {
	color: var(--light);
	padding: 5px;
}
/* }}} */
/* Save {{{ */
.snotifyToast.snotify-save {
	background-color: var(--success);
	border-radius: 20px;
	width: 150px;
	margin: auto;
}

.snotifyToast.snotify-save .snotifyToast__inner {
	padding: 5px;
}

.snotifyToast.snotify-save .snotifyToast__inner .snotifyToast__title {
	color: var(--light);
	margin: auto;
	font-size: 1.5em;
}
.snotify {
	z-index: 99999;
}
/* }}} */
</style>

<component>
module.exports = {
	route: '/debug/toast',
	methods: {
		testToast(method, ...args) {
			this.$toast[method](...args);
		},
	},
};
</component>

<template>
	<div class="card">
		<div class="list-group">
			<a class="list-group-item" @click="testToast('primary', 'Hello World')">vm.$toast.primary('Hello World')</a>
			<a class="list-group-item" @click="testToast('info', 'Hello World')">vm.$toast.info('Hello World')</a>
			<a class="list-group-item" @click="testToast('success', 'Hello World')">vm.$toast.success('Hello World')</a>
			<a class="list-group-item" @click="testToast('warning', 'Hello World')">vm.$toast.warning('Hello World')</a>
			<a class="list-group-item" @click="testToast('error', 'Hello World')">vm.$toast.error('Hello World')</a>
			<a class="list-group-item" @click="testToast('save')">vm.$toast.save()</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 'Thinking...', 25)">vm.$toast.progress('debug', 'Thinking...', 25)</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 50)">vm.$toast.progress('debug', 50)</a>
			<a class="list-group-item" @click="testToast('progress', 'debug', 100)">vm.$toast.progress('debug', 100)</a>
			<a class="list-group-item" @click="testToast('catch')">vm.$toast.catch()</a>
			<a class="list-group-item" @click="testToast('catch', {error: 'Hello World'})">vm.$toast.catch({error: 'Hello World'})</a>
		</div>
	</div>
</template>
