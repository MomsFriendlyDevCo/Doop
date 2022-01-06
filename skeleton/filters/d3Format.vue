<script lang="js" frontend>
// FIXME: Possible to import only "format"?
import * as d3 from 'd3';

app.filter('d3Format', (value, options) => {
	const config = _.defaults(options, {
		formatSpecifier: {
			fill: " ",
			align: ">",
			sign: "-",
			symbol: "",
			zero: false,
			width: undefined,
			comma: false,
			precision: undefined,
			trim: false,
			type: "f"
		},
		formatLocale: {
			decimal: '.',
			thousands: ',',
			grouping: [3],
			currency: ['$', ' '],
		},
	});
	
	return d3
		.formatLocale(config.formatLocale)
		.format(new d3.FormatSpecifier(config.formatSpecifier))(value);
});
</script>
