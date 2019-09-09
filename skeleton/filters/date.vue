<filter>
/**
* Display human-readable dates
* This filter is similar to the <date/> component which adds the extra behaviour of having tooltip
* Generally this filter should be used only if the above component cannot be used for some reason
*
* @param {string|number|Object} options Either a date string, unix Epoch or options object to format
* @param {string} [options.format] Overriding format, use to force set both formatMobile + formatDesktop
* @param {string} [options.formatMobile="Do MMM YYYY"] Date format to use on mobile displays
* @param {string} [options.formatDesktop="ddd MMM Do YYYY h:mma"] Date format to use on larger displays
* @returns {string} A formatted date
*/
module.exports = value => {
	var settings = {
		format: '',
		formatMobile: 'Do MMM YYYY',
		formatDesktop: 'ddd MMM Do YYYY h:mma',
		date: !_.isPlainObject(value) ? value : value.date,
		...(_.isPlainObject(value) ? value : undefined),
	};


	var dateMoment =
		isFinite(settings.date) && settings.date > 1000000000 && settings.date < 2000000000 ? moment.unix(settings.date)
		: moment(settings.date);

	return dateMoment.format(
		settings.format ? settings.format
		: Vue.services().$screen.isMobile ? settings.formatMobile
		: settings.formatDesktop
	);
};
</filter>
