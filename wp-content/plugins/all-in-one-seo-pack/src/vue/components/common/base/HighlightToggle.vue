<template>
	<div
		class="aioseo-highlight-toggle"
		:class="[
			{ active: active },
			{ [size]: size }
		]"
		@click="toggleCheckbox"
	>
		<component
			:is="`base-${type}`"
			ref="toggle"
			:name="name"
			:modelValue="modelValue"
			:size="size"
			:round="round"
			@update:modelValue="$emit('update:modelValue', $event)"
		>
			<slot />
		</component>
	</div>
</template>

<script>
import BaseCheckbox from '@/vue/components/common/base/Checkbox'
import BaseRadio from '@/vue/components/common/base/Radio'
export default {
	components : {
		BaseCheckbox,
		BaseRadio
	},
	props : {
		type : {
			type     : String,
			required : true
		},
		name : {
			type     : String,
			required : true
		},
		modelValue : {
			type     : [ Boolean, String, Event ],
			required : true
		},
		active : Boolean,
		size   : String,
		round  : Boolean
	},
	methods : {
		toggleCheckbox () {
			this.$refs.toggle.labelToggle()
		}
	}
}
</script>

<style lang="scss">
.aioseo-highlight-toggle {
	border: 1px solid $border;
	border-radius: 3px;
	min-height: 40px;
	display: flex;
	align-items: center;
	padding: 5px 10px;
	cursor: pointer;

	> * {
		cursor: pointer;
		user-select: none;
	}

	&.active {
		border-color: $blue;
		box-shadow: 0px 5px 10px rgba(0, 90, 224, 0.1);
	}

	&.medium {
		min-height: 40px;
	}

	.icon {
		display: flex;
		align-items: center;
		margin-right: 5px;
	}
}
</style>