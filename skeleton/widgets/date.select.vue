<script lang="js" frontend>
import {Datetime} from 'vue-datetime';
import '../node_modules/vue-datetime/dist/vue-datetime.css';
import moment from 'moment';


/**
* Show a user editable data/time selectable widget
* @param {Date|number|string} [date] The intial date value, can be any processable Moment expression or a Unix timestamp (number or string)
* @param {string} [outputFormat="date"] How to return the output, ENUM: 'date', 'unixEpoch'
* @param {string} [type="dateTime"] What to select, ENUM: 'date', 'time', 'datetime'
* @param {number} [minuteStep=10] Minute increments when selecting
* @param {string} [placeholder="Select date..."] The placeholder to display when no date is present
* @param {string|number} [constrainDate] Date to constrain to when selecting time (i.e. disreguard time portion of choice to force to this date), can be an ISO date or Unix Epoch
*
* @emits change Emitted as (output) where the output format is determined by `outputFormat`
*/
app.component('dateSelect', {
	props: {
		date: [Date, Number, String], // Date may be also be blank
		outputFormat: {type: String, default: 'date'},
		type: {type: String, default: 'date'},
		minuteStep: {type: Number, default: 10},
		placeholder: {type: String, default: 'Select date...'}, // FIXME: Currently unhandled
		constrainDate: {type: [Number, String]},
	},
	data() { return {
		value: '',
	}},
	components: {
		datetime: Datetime,
	},
	methods: {
		change(newVal) {
			var outMoment = moment(newVal);

			if (this.$props.type == 'date' && this.$props.contrainDate) {
				var cDate = getMoment(this.$props.constrainDate);
				outMoment = outMoment.date(cDate.date()).month(cDate.month()).year(mDate.year());
			}

			this.$emit('change', 
				this.$props.outputFormat == 'date' ? outMoment.toDate()
					: this.$props.outputFormat == 'unixEpoch' ? outMoment.unix()
					: newVal
			);
		},


		/**
		* Return the moment object of an input
		* @param {number|string} input Either a Unix timestamp or an ISO / Moment processable date
		* @returns {Moment} A moment instance
		*/
		getMoment(input) {
			return (
				isFinite(this.$props.date) && this.$props.date > 1000000000 && this.$props.date < 2000000000 ? moment.unix(this.$props.date)
				: moment(this.$props.date)
			);
		},
	},
	watch: {
		'$props.date': {
			immediate: true,
			handler(newVal) {
				if (!this.$props.date) return this.value = undefined;

				this.value = this.getMoment(this.$props.date).toISOString();
			},
		},
	},
});
</script>

<template>
	<div class="date-select btn btn-light">
		<datetime
			v-model="value"
			value-zone="local"
			:type="$props.type"
			:minute-step="$props.minuteStep"
			use12-hour
			auto
			@input="change"
		/>
	</div>
</template>

<style>
.date-select input.vdatetime-input {
	border: 0;
	text-align: center;
	background: transparent;
}

.date-select {
	padding: 0;
}

.date-select > .vdatetime > input.vdatetime-input {
	cursor: pointer;
	color: inherit;
	width: 100%;
}

.vdatetime-popup__header,
.vdatetime-calendar__month__day--selected > span > span,
.vdatetime-calendar__month__day--selected:hover > span > span {
	background: var(--main);
}

.vdatetime-year-picker__item--selected,
.vdatetime-time-picker__item--selected,
.vdatetime-popup__actions__button {
	color: var(--main);
}

/* Disabled state {{{ */
.disabled .vdatetime {
	pointer-events: none;
}

.disabled .vdatetime.btn {
	border: 0;
	background: transparent;
}

.disabled .vdatetime-input {
	text-align: left;
	padding-left: 10px;
}
/* }}} */
</style>
