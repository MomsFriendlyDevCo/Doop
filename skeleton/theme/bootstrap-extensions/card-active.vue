<style>
.card {
	transition: box-shadow 0.2s, border 0.2s;
}

.card.active {
	box-shadow: 0px 0px 10px 0px var(--main);
	border: 1px solid var(--main-highlight);
	background: var(--main);
}

.card.disabled {
	color: var(--gray);
	background: var(--gray-light);
}
</style>
