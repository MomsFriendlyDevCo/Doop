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
			dom_id: '#swagger-ui'
		})
	},
});
</script>

<template>
	<div id="swagger-ui" class="swagger-ui">
	</div>
</template>