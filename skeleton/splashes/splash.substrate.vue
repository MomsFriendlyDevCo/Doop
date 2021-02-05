<script lang="js" frontend>
/**
* Substate style background image
* Vue compatible, slightly altered version of the below CodePen
* @url https://codepen.io/piksl/pen/EaxJxX
*/
app.component('splashSubstrate', {
	props: {
		speed: {type: Number, default: 25},
		strokeColor: {type: String, default: '#505050'},
		spawnChance: {type: Number, default: 0.1},
		maxBoids: {type: Number, default: 500},
	},
	data() { return {
		boidIntervalTimer: undefined,
	}},
	mounted() {
		var vm = this;
		var Boid = function(x, y, angle) {
			this.x = x;
			this.y = y;

			this.angle = Math.pow(Math.random(), 20) + angle;
			this.dx = Math.cos(this.angle);
			this.dy = Math.sin(this.angle);

			this.life = Math.random() * 100 + 100;
			this.dead = false;

			this.update = function () {
				context.strokeStyle = vm.$props.strokeColor;
				context.beginPath();
				context.moveTo(this.x, this.y);

				this.x += this.dx * 2;
				this.y += this.dy * 2;
				this.life -= 1;

				context.lineTo(this.x, this.y);
				context.stroke();

				var index = (Math.floor(this.x) + width * Math.floor(this.y)) * 4;

				if (this.life <= 0) this.kill();
				if (data[index + 3] > 0) this.kill();

				if (this.x < 0 || this.x > width) this.kill();
				if (this.y < 0 || this.y > height) this.kill();
			}

			this.kill = function () {
				boids.splice(boids.indexOf(this), 1);
				this.dead = true;
			}
		}

		var width = window.innerWidth;
		var height = window.innerHeight;

		var canvas = this.$el;
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext('2d');
		var image, data;

		var boids = [];
		boids.push(new Boid(width / 2, height / 2, Math.random() * 180 * Math.PI / 180));

		this.boidIntervalTimer = setInterval(()=> {
			image = context.getImageData(0, 0, width, height);
			data = image.data;

			var allDead = true;
			for (var i = 0; i < boids.length; i ++) {
				var boid = boids[i];
				boid.update();
				if (!boid.dead) allDead = false;
				if (!boid.dead && Math.random() < vm.$props.spawnChance && boids.length < vm.$props.maxBoids) {
					boids.push(new Boid(boid.x, boid.y, (Math.random() > 0.5 ? 90 : - 90) * Math.PI / 180 + boid.angle));
				}
			}

			if (allDead) {
				clearInterval(this.boidIntervalTimer);
				console.log('DONE TIMER');
			}
		}, vm.$props.speed);
	},

	beforeDestroy() {
		clearInterval(this.boidIntervalTimer);
	},
});
</script>

<template>
	<canvas class="splash splash-substrate"/>
</template>

<style>
.splash.splash-substrate {
	display: block;
	z-index: 100;
}
</style>
