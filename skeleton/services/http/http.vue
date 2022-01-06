<script lang="js" frontend>
import axios from 'axios';

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
// Make Axios request JSON by default
axios.defaults.headers.common.Accept = 'application/json';

// Make Axios encode using jQueries parameter serializer to keep Monoxide happy
axios.defaults.paramsSerializer = params =>
	$.param(params)
		.replace(/\bq=(.+)\b/g, p => p.replace(/%3A/g, ':')) // Allow `q=` to contain ':' tags

// Monkey patch Axios so that any error response gets correctly decoded rather than weird stuff like 'Server returned a 403 code'
axios.interceptors.response.use(response => response, error => {
	if (!error.response || !error.response.status) { // Recommended method to catch network errors as per https://github.com/axios/axios/issues/383#issuecomment-234079506
		return Promise.reject('Network error');
	} else if (error.response && error.response.data
		&& _.startsWith(error.response.request.responseURL, window.location.origin) // Only redirect hits to domain
		&& (error.response.status === 401 || error.response.status === 403)) {
		// FIXME: Some API routes may wish to throw 401 or 403 while actually being authenticated.
		app.router.go('/login');
		return Promise.reject(error.response.data);
	} else if (error.response && error.response.data) {
		return Promise.reject(error.response.data);
	} else {
		return Promise.reject(error.response);
	}
});

// Set BaseURL if we are running under cordova
app.ready.then(()=> {
	if (app.isCordova) {
		console.log('[$service.http]', 'Override baseUrl:', this.$config.apiUrl);
		axios.defaults.baseURL = this.$config.apiUrl;
	}
});


// Track active requests being made right now as axios.activeRequests {{{
axios.activeRequests = 0;

axios.interceptors.request.use(config => {
	axios.activeRequests++;
	return config;
});

axios.interceptors.response.use(
	res => {
		axios.activeRequests--;
		return res;
	},
	err => {
		axios.activeRequests--;
		return Promise.reject(err);
	},
);
// }}}

app.service('$http', ()=> axios); // NOTE: Because Axios is a function (with static methods) we have to wrap the return in an arrow function return to not confuse the app.service() scope fetcher
</script>
