<script lang="js" frontend>
/**
* Display a table-of-contents navigation element
*
* @param {boolean} [useCards=true] Use BS5 card element headers to populate the ToC
*/
app.component('tableOfContents', {
	data() { return {
		tree: undefined,
		active: undefined, // Active child element (if any)
		scrollTarget: undefined, // Calculated parent scroll target from 'scroller'
	}},
	props: {
		float: {type: Boolean, default: true},
		useCards: {type: Boolean, default: true},
		scroller: {type: [String, Array], default: ()=> ['.overflow-y-auto', '.content', 'body']},
		axisY: {type: Boolean, default: true},
		axisX: {type: Boolean, default: false},
		scrollSpeed: {type: Number, default: 400},
		scrollEasing: {type: String, default: 'swing'},
	},
	methods: {
		/**
		* Populate the ToC
		* Called automatically on mount
		*/
		refresh() {
			this.tree = [];

			if (this.useCards) {
				$('.card')
					.filter((i, el) => $(el).find('.card-header').text()) // Filter non-headers or blank headers
					.each((i, el) => this.tree.push({
						title: $(el).find('.card-header').text(),
						el,
						click: ()=> this.navigateTo(el),
					}))
				console.log('Tree now', this.tree);
			}
		},


		/**
		* Detect scrolling and highlight probable target from ToC list
		*/
		scroll() {
			var lastActive = this.active;
			this.active = this.tree.reduce((target, candidate) => {
				if (target) return target; // Already allocated target
				if (this.isElementInViewport(candidate.el)) return candidate;
			}, null) || lastActive; // Can't find anything? Use last value
		},


		/**
		* Navigate to a DOM node on the page
		* NOTE: This scrolls the scroller elements position, not just the bodies
		* @param {DOMElement} node DOM node to navigate to
		*/
		navigateTo(node) {
			$(this.$el).closest(this.scrollTarget).stop().animate({
				...(this.axisY ? {scrollTop: node.offsetTop} : {}),
				...(this.axisX ? {scrollLeft: node.offsetLeft} : {}),
			}, {
				duration: this.scrollSpeed,
				easing: this.scrollEasing,
			});
		},


		/**
		* Return if an element is within a viewpoint
		* @see https://stackoverflow.com/questions/123999/how-can-i-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
		*/
		isElementInViewport(el) {
			var rect = el.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
				rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
			);
		},
	},
	mounted() {
		var $el = $(this.$el);
		this.$nextTick() // Wait for page to settle
			.then(()=> this.refresh())
			.then(()=> this.scroll())

		this.scrollTarget = _.castArray(this.scroller)
			.find(selector => $el.closest(selector).length > 0);
		if (!this.scrollTarget) throw new Error('Cannot detect a viable scroller target, specify `scroller` property to override defaults');

		$(this.scrollTarget).on('scroll', this.scroll);
	},
	beforeDestroy() {
		$(this.scrollTarget).off('scroll', this.scroll);
	},
});
</script>

<template>
	<div class="table-of-contents" :class="float && 'float'">
		<ul>
			<li v-for="root in tree">
				<a
					:class="root == active && 'active'"
					@click="root.click"
				>{{root.title}}</a>
				<ul v-if="root.children && root.children.length > 0">
					<li v-for="child in root.children">
						<a
							:class="child == active && 'active'"
							@click="child.click"
						>{{child.title}}</a>
					</li>
				</ul>
			</li>
		</ul>
	</div>
</template>

<style lang="scss">
.table-of-contents {
	padding: 10px;

	ul {
		list-style: none;
		padding: 5px;

		&:not(:first-child) {
			margin-left: 20px;
		}

		& a {
			display: block;
			color: #999;
			padding: 5px 0;

			&.active {
				color: #006bef !important;
			}

			&:hover {
				color: #007bff !important;
			}
		}
	}

	/* Floating functionality {{{ */
	&.float {
		position: fixed;
	}
	/* }}} */
}
</style>
