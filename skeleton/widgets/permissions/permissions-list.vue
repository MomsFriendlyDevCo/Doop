<component>
/**
* Display a permission setting UI
* The current permissions are specified with `selected` and their spec available with `spec`
* @param {Object} selected The currently selected permissions
* @param {Object} spec The specification (retrieved via /api/widgets/meta)
* @param {string} [specPerfix=""] How to filter the flat `spec` object to the permissions list
* @emits change Event emitted as `(selected)` when the user changes the permissions
*/
module.exports = {
	props: {
		selected: {type: Object, required: true},
		spec: {type: Object, required: true},
		specPrefix: {type: String, default: ''},
	},
	computed: {
		permissions() {
			return Object.keys(this.spec)
				.filter(k => k.startsWith(this.$props.specPrefix))
				.map(k => ({
					...this.spec[k],
					key: k.substr(this.$props.specPrefix.length),
					title: _.startCase(k.substr(this.$props.specPrefix.length))
						.split(' ')
						.map(word => `${word} >`)
						.join(' ')
						.replace(/ >$/, ''),
				}))
		},
	},
	methods: {
		change(key) {
			this.$props.selected[key] = ! this.$props.selected[key];
			this.$emit('change', this.selected);
		},
	},
};
</component>

<template>
	<div>
		<div v-for="permission in permissions" :key="permission.key" class="form-group row m-b-0">
			<div class="col-11 col-form-label">
				<toggle-button
					:value="$props.selected[permission.key]"
					@change="change(permission.key)"
				/>
				{{permission.title}}
			</div>
		</div>
	</div>
</template>