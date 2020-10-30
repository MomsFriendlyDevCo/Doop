<component>
module.exports = {
	route: '/debug/session',
	data() { return {
	}},
};
</component>

<template>
	<div class="card">
		<div class="card-body">
			<pre>{{$session.data}}</pre>
		</div>
	</div>
</template>
