<service singleton>
/**
* Axios wrapper
* @url https://github.com/axios/axios#example
*
* @example Make a GET request and process the (array'd) document body)
* this.$http.get('/api/widgets').then(res => res.data)
*
* @example Make a complex request
* this.$http({
*   method: 'PUT',
*   headers: {'My Custom Header': 123},
*   params: {id: 123},
*   data: {someData: 'someValue'},
*/
module.exports = function() {
	// Make Axios request JSON by default
	axios.defaults.headers.common.Accept = 'application/json';

	// Make Axios encode using jQueries parameter serializer to keep Monoxide happy
	axios.defaults.paramsSerializer = $.param;

	// Monkey patch Axios so that any error response gets correctly decoded rather than weird stuff like 'Server returned a 403 code'
	axios.interceptors.response.use(response => response, error => {
		if (!error.response || !error.response.status) { // Recommended method to catch network errors as per https://github.com/axios/axios/issues/383#issuecomment-234079506
			return Promise.reject('Network error');
		} else if (error.response && error.response.data) {
			return Promise.reject(error.response.data);
		} else {
			return Promise.reject(error.response);
		}
	});

	// Set BaseURL if we are running under cordova
	app.ready.then(()=> {
		if (this.$config.isCordova) {
			console.log('[$service.http]', 'Override baseUrl:', this.$config.apiUrl);
			app.ready.then(()=> axios.defaults.baseURL = this.$config.apiUrl);
		}
	});

	return axios;
};
</service>

<component>
module.exports = {
	route: '/debug/http',
	methods: {
		testFetch(url) {
			this.$http.get(url)
				.then(res => this.$toast.success(res.data))
				.catch(this.$toast.catch)
		},
	},
};
</component>

<template>
	<div class="card">
		<div class="card-body card-padding">
			<p>Simple controller showing the result of vairious back-end HTTP response codes and how they are automatically handled by $toast</p>
		</div>
		<div class="list-group">
			<a class="list-group-item" @click="testFetch('/api/debug/http/200')">Trigger Code 200</a>
			<a class="list-group-item" @click="testFetch('/api/debug/http/403')">Trigger Code 403</a>
			<a class="list-group-item" @click="testFetch('/api/debug/http/500')">Trigger Code 500</a>
		</div>
	</div>
</template>
