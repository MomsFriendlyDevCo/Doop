<script>
if (window.LogRocket) app.ready.then(()=> { // LogRocket is running and the app is ready
	app.vue.$on('$session.settled', data => { // And the session changes...
		LogRocket.identify(data._id, { // Tell LogRocket about who is logged in
			name: data.name,
			email: data.email,
		});
	});
});
</script>
