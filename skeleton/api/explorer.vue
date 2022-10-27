<script lang="js" frontend>
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

/**
* Display API explorer
*/
app.component({
	route: '/debug/api',
	mounted() {
		SwaggerUI({
			url: '/api/rest.json',
			dom_id: '#swagger-ui',
			deepLinking: true,
		})

		/*
		// TODO: If Webpack chunks are unable to lazy-load this then inject scripts on mount
		if (typeof SwaggerUIBundle === 'undefined') {
			this.$debug('Injecting Swagger-UI style/script');

			const style = document.createElement('link');
			style.rel = 'stylesheet';
			// https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css
			style.href = '/assets/cdn/swagger-ui/swagger-ui.css';
			document.body.appendChild(style);

			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = '/assets/cdn/swagger-ui/swagger-ui-bundle.js';
			// https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js
			// TODO: Add "crossorigin"?
			document.body.appendChild(script);
			script.onload = () => this.init();
		} else {
			this.init();
		}
		*/
	},
});
</script>

<template>
	<div id="swagger-ui" class="swagger-ui">
	</div>
</template>
