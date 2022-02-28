<style lang="scss">
/**
* Anchored floating alert groups
*
* @example Bottom anchored alert group
* <div class="alert-group float-bottom">
* 	<div class="alert alert-light">Foo</div>
* 	<div class="alert alert-light">Bar</div>
* 	<div class="alert alert-light">Baz</div>
* </div>
*/
.alert-group {
	/* Bottom alignment {{{ */
	&.float-bottom {
		position: fixed;
		bottom: 20px;
		left: calc(50% - 250px);
		right: calc(50% - 250px);
		text-align: center;
		z-index: 10;

		& .alert {
			display: inline-block;
			box-shadow: 2px 2px 10px #000a;

			&:hover {
				box-shadow: 2px 2px 10px #7777;
				&.alert-info {
					box-shadow: 2px 2px 10px #bee5eb;
				}
			}
		}
	}
	/* }}} */
}
</style>
