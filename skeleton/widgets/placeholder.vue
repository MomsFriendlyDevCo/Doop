<script lang="js" frontend>
app.component('placeholder', {
	props: {
		text: {type: String},
		type: {type: String, default: 'box'},
	},
});
</script>

<template>
	<div class="placeholder" :class="`placeholder-${type}`">
		<div v-if="$props.text" class="placeholder-text">
			{{$props.text}}
		</div>
	</div>
</template>

<style>
.placeholder {
	height: 100%;
	width: 100%;
	border-radius: 5px;
	display: flex;
	justify-content: center;
	align-items: center;
}

/* Style: placeholder-box {{{ */
.placeholder.placeholder-box {
	background: #FFF;
	border: 1px solid #000;
}

.placeholder.placeholder-box:before {
	content: '';
	position: absolute;
	left: 15px;
	top: 1px;
	right: 15px;
	bottom: 1px;
	background:
		linear-gradient(to top left,
			rgba(0,0,0,0) 0%,
			rgba(0,0,0,0) calc(50% - 0.8px),
			rgba(0,0,0,1) 50%,
			rgba(0,0,0,0) calc(50% + 0.8px),
			rgba(0,0,0,0) 100%),
		linear-gradient(to top right,
			rgba(0,0,0,0) 0%,
			rgba(0,0,0,0) calc(50% - 0.8px),
			rgba(0,0,0,1) 50%,
			rgba(0,0,0,0) calc(50% + 0.8px),
			rgba(0,0,0,0) 100%);
	opacity: 0.3;
}

.placeholder.placeholder-box > .placeholder-text {
	background: #FFF;
	border-radius: 10px;
	padding: 10px;
	z-index: 1;
}
/* }}} */

/* Style: placeholder-construction {{{ */
.placeholder.placeholder-construction {
	background: repeating-linear-gradient(45deg, #dfc458, #dfc458 10px, #666 10px, #666 20px);
}

.placeholder.placeholder-construction > .placeholder-text {
	font-size: 20pt;
	color: #FFF;
	text-shadow: -2px -2px 1px #000, 2px -2px 1px #000, -2px 2px 1px #000, 2px 2px 1px #000;
}
/* }}} */
</style>
