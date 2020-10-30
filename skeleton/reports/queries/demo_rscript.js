/**
* Demo report (R-Script)
*
* @title Demo report (R-Script)
* @tabTitle demo
* @permissions debug
* @environments slab, production
* @type object
*/
db.union({
	results: rscript()
});
