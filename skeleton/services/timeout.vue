<script lang="js" frontend>
/**
* Acts like a combination of app.$nextTick + setTimeout() to wait until Vue has finished its processing
* @param {function} func Function to run when ready
* @param {number} [timeout=100] Delay in MS to wait before running the function
*/
app.mixin({
	methods: {
		$timeout(func, timeout = 100) {
			this.$nextTick(()=> {
				if (this._isDestroyed) return console.log('$timeout - component', this._uid, 'is marked as destroyed - aborting'); // Component has died since last Tick
				setTimeout(func, timeout);
			});
		},
	},
});
</script>
