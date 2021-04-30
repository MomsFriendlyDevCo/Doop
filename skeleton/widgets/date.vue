<script lang="js" frontend>
import moment from 'moment';

/**
* Component to display a shorthand date display with a tooltip on hover
* @param {string|number|Date} [date] The date to display, can be any processable Moment expression or a Unix timestamp (number or string)
* @param {string} [format] Overriding format, use to force set both formatMobile + formatDesktop
* @param {string} [formatMobile="Do MMM YYYY"] Date format to use on mobile displays
* @param {string} [formatDesktop="ddd MMM Do YYYY h:mma"] Date format to use on larger displays
* @param {string} [formatTooltip="dddd MMMM Do YYYY h:mma"] Date format to display in the tooltip
*
* @listens $screen.resize Triggers the component to reapply which profile it should display as (e.g. moving from Desktop to Mobile screen sizes)
*
* @example Display a date
* <date :date="someDate"/>
*/
app.component('date', {
	props: {
		date: {type: [Date, Number, String]}, // Date may be blank
		format: {type: String},
		formatMobile: {type: String, default: 'Do MMM YYYY'},
		formatDesktop: {type: String, default: 'ddd MMM Do YYYY h:mma'},
		formatTooltip: {type: String, default: 'dddd MMMM Do YYYY h:mma'},
	},
	data() { return {
		dateDisplay: undefined,
		dateTooltip: undefined,
	}},
	methods: {
		refresh() {
			if (!this.$props.date) return this.dateDisplay = this.dateTooltip = undefined;
			var dateMoment =
				isFinite(this.$props.date) && this.$props.date > 1000000000 && this.$props.date < 2000000000 ? moment.unix(this.$props.date)
				: moment(this.$props.date);

			this.dateDisplay = dateMoment.format(
				this.$props.format ? this.$props.format
				: this.$screen.isMobile ? this.$props.formatMobile
				: this.$props.formatDesktop
			);
			this.dateTooltip = dateMoment.format(this.$props.formatTooltip);
		},
	},
	watch: {
		'$props.date': {
			immediate: true,
			handler() {
				this.refresh();
			},
		},
	},
	created() {
		this.$on('$screen.resize', this.refresh); // React to screen size changes
	},
});
</script>

<template>
	<div v-tooltip="dateTooltip">
		{{dateDisplay}}
	</div>
</template>
