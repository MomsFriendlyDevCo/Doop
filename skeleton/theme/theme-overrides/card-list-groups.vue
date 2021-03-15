<style>
/* Card body's with an immediate list group of verbs get screwed up */
.card > .list-group {
	border: none !important;
}

.card > .list-group .list-group-item {
	border-left: none;
	border-right: none;
}

.card > .list-group .list-group-item:first-child {
	border-top: none;
}

/* Cards with a body followed by a link group should have a divider line */
.card > .card-body + .list-group .list-group-item:first-child {
	border-top: 1px solid #dfdfdf !important;
}
</style>
