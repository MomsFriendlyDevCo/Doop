<script lang="js" frontend>
app.component({
	route: '/debug/transitions/:offset?',
	data() { return {
		offset: 0,
		cardClasses: ['', 'bg-primary text-white', 'bg-success text-white', 'bg-info text-white', 'bg-warning text-white', 'bg-danger text-white'],
	}},
	created() {
		if (!this.$route.params.offset) {
			this.offset = 1;
		} else {
			this.offset = parseInt(this.$route.params.offset);
		}
	},
	computed: {
		cardClass() {
			return this.cardClasses[(this.offset - 1) % this.cardClasses.length];
		},
	},
});
</script>

<template>
	<div class="card py-3" :class="cardClass">
		<div class="card-body text-center">
			<h2>Current page: {{offset}}</h2>
		</div>
		<div class="list-group">
			<a class="list-group-item" v-href="{href: `/debug/transitions/${offset+1}`, transition: 'cover-up', force: true}">Cover up</a>
			<a class="list-group-item" v-href="{href: `/debug/transitions/${offset+1}`, transition: 'fade', force: true}">Fade</a>
			<a class="list-group-item" v-href="{href: `/debug/transitions/${offset+1}`, transition: 'slide-left', force: true}">Slide left</a>
			<a class="list-group-item" v-href="{href: `/debug/transitions/${offset+1}`, transition: 'slide-right', force: true}">Slide right</a>
			<a class="list-group-item" v-href="{href: `/debug/transitions/${offset+1}`, transition: 'slide-up', force: true}">Slide up</a>
		</div>
	</div>
</template>
