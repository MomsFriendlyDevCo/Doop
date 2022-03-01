<script lang="js" frontend>
import moment from 'moment';

/**
* Display human-readable dates
* This filter is similar to the <date/> component which adds the extra behaviour of having tooltip
* Generally this filter should be used only if the above component cannot be used for some reason
*
* @param {string|number|Object} options Either a date string, unix Epoch or options object to format
* @param {string} [options.format] Overriding format, use to force set both formatMobile + formatDesktop
* @param {string} [options.formatMobile="Do MMM YYYY"] Date format to use on mobile displays
* @param {string} [options.formatDesktop="ddd MMM Do YYYY h:mma"] Date format to use on larger displays
* @param {boolean} [options.fromNow] Display using Moment fromNow() feature
* @param {string} [options.diff] Difference from now at the given resolution
* @param {number} [options.diffLimit] Highest diff before switching back to formatMobile
* @param {boolean} [options.utc=false] Display using Moment utc() feature
* @returns {string} A formatted date
*/
app.filter('date', (value, options) => {
	if (!value) return '';

	// TODO: Could use _.defaults
	var settings = {
		format: '',
		formatMobile: 'Do MMM YYYY',
		formatDesktop: 'ddd MMM Do YYYY h:mma',
		fromNow: false,
		diff: '',
		diffLimit: 0,
		date: !_.isPlainObject(value) ? value : value.date,
		utc: false,
		...(_.isPlainObject(value) ? value : undefined),
		...(_.isPlainObject(options) ? options : undefined), // Ability to pass in options as second parameter `string | date({format: 'YYYY'})`
	};

	var dateMoment =
		isFinite(settings.date) && settings.date > 1000000000 && settings.date < 2000000000 ? moment.unix(settings.date)
		: moment(settings.date);

	if (settings.utc) dateMoment = dateMoment.utc();

	if (!dateMoment.isValid()) return '';

	if (settings.fromNow) {
		return dateMoment.fromNow();
	} else if (settings.diff) {
		var now = moment();
		var diff = now.diff(dateMoment, settings.diff);
		if (diff === 0) return 'Now';
		if (settings.diffLimit && diff > settings.diffLimit) return dateMoment.format(settings.formatMobile);
		return diff + ' ' + ((diff>1)?settings.diff:settings.diff.slice(0, -1)) + ' ago';
	} else {
		return dateMoment.format(
			settings.format ? settings.format
			: app.service.$screen.isMobile ? settings.formatMobile
			: settings.formatDesktop
		);
	}
	
});
</script>
