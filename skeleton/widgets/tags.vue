<component>
/**
* Tag selection widget obeying an opinionated internal spec
*
* FIXME: This widget does not yet support adding new tags, only selecting from existing ones within the spec
* FIXME: This widget does not yet apply color classing to items
*
* @param {array <Object>} value The current array of selected tags
* @param {string} value.tag The tag string (corresponds with spec.tag)
* @param {date} [value.created] When the tag was created, inherits from the current date for new tags
* @param {string} [value.creator] Who created the tag was created, inherits from $session.data._id for new tags
*
* @param {array <Object>} spec The specification of tags the user can select
* @param {string} spec.tag The value of the tag, must be a-z or hyphen in lower case
* @param {string} [spec.color="var(--secondary)"] The color of the tag to display
* @param {string} [spec.group] The item group, forms a mutual-exclusion with other tags, tagging cannot have two elements of the same group and placing a new group item removes the other
* @param {date} [spec.created] When the spec item was created
* @param {string} [spec.creator] The user ID of the user who created the tag spec
*
* @param {boolean} [disabled=false] Whether to disallow editing
* @param {string} [placeholder] Placeholder to display when no tags are selected
* 
* @emits change Emitted as `(tags)` when the tag selection changes
*/
module.exports = {
	props: {
		value: Array,
		spec: Array,
		disabled: {type: Boolean, default: false},
		placeholder: String,
	},
	computed: {
		options() {
			return (this.spec || []).map(s => ({
				color: 'var(--secondary)',
				tag: s.tag,
				value: s.tag,
			}));
		},
	},
	methods: {
		changed(val) {
			// Deduplicate groups {{{
			val = _(val)
				.groupBy(v => {
					var tagMeta = this.$props.spec.find(s => s.tag == v.tag);
					if (!tagMeta) throw new Error(`Tag "${v.tag}" is a member of no item in spec!`);
					return tagMeta.group;
				})
				.tap(v => console.log('Computed groups', v))
				.mapValues((members, group) => {
					if (!group) return members; // Ignore non-grouped items
					if (members.length == 1) return members; // Ignore single item groups

					return _.last(members); // Take last entry as its likely to be the one the user is replacing existing values with
				})
				.values()
				.flatten()
				.value()
			// }}}

			this.$emit('change', val.map(v => ({
				tag: v.tag,
				created: v.created || new Date(),
				creator: v.creator || this.$session.data._id,
			})));
		},
		getTagStyle(tagStr) {
			var foundSpec = this.spec.find(s => s.tag == tagStr);
			if (!foundSpec) return undefined;
			return foundSpec.color ? {background: foundSpec.color} : {};
		},
	},
};
</component>

<template>
	<v-select
		class="tags"
		multiple
		:value="$props.value"
		:options="options"
		:select-on-tab="true"
		:disabled="$props.disabled"
		:placeholder="$props.placeholder"
		label="tag"
		@input="changed"
	>
		<template #selected-option-container="{option, deselect, disabled, multiple}">
			<span class="selected-tag vs__selected" :key="option.index" :style="getTagStyle(option.tag)">
				{{option.tag}}
				<button v-if="multiple" :disabled="disabled" @click="deselect(option)" type="button" class="close" aria-label="Remove option">
					<span aria-hidden="true">&times;</span>
				</button>
			</span>
		</template>
	</v-select>
</template>

<style>
.tags .vs__selected {
	color: #fff;
}

.tags .vs__selected .close {
	color: #FFF;
	font-weight: 900;
	text-shadow: none;
	margin-left: 5px;
}
</style>
