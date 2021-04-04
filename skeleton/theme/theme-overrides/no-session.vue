<style lang="scss">
/**
* Overriding style used on the body element before the session is ready
* This also doubles as the promo / landing page style
*/
body:not(.has-session) {
	min-height: 100vh;

	& .topbar,
	& .page-header,
	& .side-menu,
	{
		display: none;
	}

	& .content-page {
		margin-left: 0px;
		overflow: auto;
		min-height: auto;

		& > .content {
			padding: 0;
			margin: 0;
		}
	}
}
</style>
