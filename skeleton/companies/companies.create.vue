<script>
app.component({
	route: '/companies/create',
	render: ()=> {},
	created() {
		return Promise.resolve()
			.then(()=> this.$loader.start())
			.then(()=> this.$http.post('/api/companies'))
			.then(res => this.$router.go(`/companies/${res.data._id}`))
			.catch(this.$toast.catch)
			.finally(()=> this.$loader.stop())
	},
});
</script>
