<script>
app.component('error', {
	data: ()=> ({
	}),
});
</script>

<template>
	<div class="page-error">
		<h1 class="page-error-title">404</h1>
		<div class="page-error-body">
			The page you requested can't be found
		</div>
	</div>
</template>

<style>
.page-error {
	margin-top: -30px;
	text-align: center;
}

.page-error .page-error-title {
	font-size: 128px;
	color: #FFF;
}

.page-error .page-error-body {
	margin-top: 40px;
	font-size: 32px;
	color: var(--theme-bg);
}
</style>
