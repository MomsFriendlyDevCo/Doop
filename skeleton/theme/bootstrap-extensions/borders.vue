<style lang="scss">
/**
* Simple border utilities
* .b-1  <- apply a border with 1px
* .bt-1 <- apply a border-top with 1px
* .bb-1 <- apply a border-bottom with 1px
* .by-1 <- apply a border-top + border-bottom with 1px
* .bl-1 <- apply a border-left with 1px
* .br-1 <- apply a border-right with 1px
* .bx-1 <- apply a border-left + border-right with 1px
*/
@for $i from 1 through 5 {
	.b-#{$i} {
		border: #{$i}px solid var(--dark) !important;
	}

	.bt-#{$i} {
		border-top: #{$i}px solid var(--dark) !important;
	}

	.bb-#{$i} {
		border-bottom: #{$i}px solid var(--dark) !important;
	}

	.by-#{$i} {
		border-top: #{$i}px solid var(--dark) !important;
		border-bottom: #{$i}px solid var(--dark) !important;
	}

	.bl-#{$i} {
		border-left: #{$i}px solid var(--dark) !important;
	}

	.br-#{$i} {
		border-right: #{$i}px solid var(--dark) !important;
	}

	.bx-#{$i} {
		border-left: #{$i}px solid var(--dark) !important;
		border-right: #{$i}px solid var(--dark) !important;
	}
}
</style>
