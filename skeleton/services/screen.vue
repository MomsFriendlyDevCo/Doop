<script>
/**
* Service which guesses the screen display area based on window.resize events
* This service returns a number of simple variables such as:
*
* 	$screen.is{XS,SM,MD,LG} - Booleans indicating if this screen size corresponds to the minimum Bootstrap definition of width (e.g. isXS =~ mobile, isMD = is at least a small screen)
*       $screen.isMobile - Shorthand accessor if the screen is XS
*       $screen.isTablet - Shorthand accessor if the screen is SM - LG
*       $screen.isDesktop - Shorthand accessor if the screen is LG
*	$screen.size - String indicating the minimum Bootstrap definition of size (e.g. 'md', 'lg')
*
 * In addition the body class `screen-{xs,sm,mg,lg}` is also added
*/
var $screen = {};

$screen.isXS;
$screen.isSM;
$screen.isMD;
$screen.isLG;
$screen.size;

$screen.recalculate = ()=> {
	var width = $(document).width();
	Vue.set($screen, 'isXS', width <= 576);
	Vue.set($screen, 'isSM', width > 576 && width < 768);
	Vue.set($screen, 'isMD', width > 768 && width < 1200);
	Vue.set($screen, 'isLG', width >= 1200);
	Vue.set($screen, 'isMobile', $screen.isXS);
	Vue.set($screen, 'isTablet', $screen.isSM || $screen.isMD || $screen.isLG);
	Vue.set($screen, 'isDesktop', $screen.isLG);

	var newSize =
		$screen.isXS ? 'xs'
		: $screen.isSM ? 'sm'
		: $screen.isMD ? 'md'
		: 'lg';

	if (newSize != $screen.size) {
		Vue.set($screen, 'size', newSize);
		app.ready.then(()=> app.broadcast('$screen.resize', $screen.size));
	}

	$('body')
		.toggleClass('screen-xs', $screen.isXS)
		.toggleClass('screen-sm', $screen.isSM)
		.toggleClass('screen-md', $screen.isMD)
		.toggleClass('screen-lg', $screen.isLG)
};

$(window).on('resize', $screen.recalculate);
app.ready.then(()=> $screen.recalculate()); // Trigger initial calculation

app.service('$screen', $screen);
</script>
