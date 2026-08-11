<template>
	<div
		class="aioseo-ai-content-main"
		:class="{
			'aioseo-ai-content-main--sidebar': 'sidebar' === parentComponentContext
		}"
	>
		<div class="aioseo-ai-content-main-header">
			<div
				v-if="'sidebar' !== parentComponentContext"
				class="aioseo-ai-content-main-header-title"
			>
				{{ strings.aiContentGeneration }}
			</div>

			<credit-counter
				:parent-component-context="parentComponentContext"
				:tooltip-placement="'bottom'"
				:tooltip-offset="'-60px, 0'"
			/>
		</div>

		<div class="aioseo-ai-content-main-body">
			<core-alert
				class="aioseo-ai-content-no-content-warning"
				v-if="postContentLength < minContentLength"
				type="red"
			>
				{{ noContentWarning }}
			</core-alert>

			<core-alert
				v-if="sensitiveOptionsStore.hasAiAccessToken && optionsStore.internalOptions.internal.ai.isTrialAccessToken"
				class="aioseo-ai-content-trial-warning"
				type="blue"
				v-html="strings.trialWarning"
			/>

			<div class="aioseo-ai-content-features">
				<feature-card
					v-for="(feature, index) in features"
					:key="index"
					:feature="feature"
					:buttonDisabled="isButtonDisabled(feature)"
					:parent-component-context="parentComponentContext"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { useAiContent } from '@/vue/composables/AiContent'

import {
	useOptionsStore,
	useSensitiveOptionsStore
} from '@/vue/stores'

import CoreAlert from '@/vue/components/common/core/alert/Index'
import CreditCounter from '@/vue/components/common/ai/CreditCounter'
import FeatureCard from './FeatureCard'

import { getAiFeatures } from './utils'
import { isBlockEditor, isClassicEditor, isPageBuilderEditor } from '@/vue/utils/context'

import { debounce } from 'lodash-es'
import links from '@/vue/utils/links'

import { __, sprintf } from '@/vue/plugins/translations'
const td = import.meta.env.VITE_TEXTDOMAIN

export default {
	setup () {
		const aiContent             = useAiContent()
		const optionsStore          = useOptionsStore()
		const sensitiveOptionsStore = useSensitiveOptionsStore()

		return {
			aiContent,
			optionsStore,
			sensitiveOptionsStore
		}
	},
	components : {
		CoreAlert,
		CreditCounter,
		FeatureCard
	},
	props : {
		parentComponentContext : String
	},
	data () {
		return {
			features          : getAiFeatures(),
			postContentLength : 0,
			strings           : {
				aiContentGeneration : __('AI Content Generation', td),
				trialWarning        : sprintf(
					// Translators: 1 - "upgrade to Pro" link, 2 - "purchase PAYG credits" link.
					__('You can try out our AI features for free, enjoy! To unlock additional AI credits, %1$s or %2$s.', td),
					sprintf(
						'<a href="%1$s" target="_blank">%2$s</a>',
						links.getUpsellUrl('ai-content', 'trial-warning', 'pricing'),
						__('upgrade to Pro', td)
					),
					sprintf(
						'<a href="%1$s" target="_blank">%2$s</a>',
						links.getUpsellUrl('ai-content', 'trial-warning', 'aiCredits'),
						__('purchase PAYG credits', td)
					)
				)
			}
		}
	},
	computed : {
		minContentLength () {
			return this.aiContent.minContentLength
		},
		noContentWarning () {
			return this.aiContent.strings.noContentWarning
		}
	},
	methods : {
		isButtonDisabled (feature) {
			if (
				'image-generator' === feature.slug ||
				'ai-assistant' === feature.slug
			) {
				return false
			}

			return this.minContentLength > this.postContentLength
		},
		updateContentLength (length) {
			this.postContentLength = length
		},
		watchBlockEditor () {
			window.wp.data.subscribe(() => {
				debounce(() => {
					this.updateContentLength(this.aiContent.getPostContentLength())
				}, 500)()
			})
		},
		watchClassicEditor () {
			if (!window.tinyMCE) {
				return
			}

			const updateLength = () => this.updateContentLength(this.aiContent.getPostContentLength())

			if (document.querySelector('#wp-content-wrap.tmce-active')) {
				window.tinyMCE.get('content').on('keyup', updateLength)
				window.tinyMCE.get('content').on('paste', updateLength)
			} else {
				const textEditor = document.querySelector('textarea#content')
				if (textEditor) {
					textEditor.addEventListener('keyup', updateLength)
					textEditor.addEventListener('paste', updateLength)
				}
			}
		},
		watchPageBuilderEditor () {
			window.aioseoBus.$on('aioseo-content-changed', () => {
				this.updateContentLength(this.aiContent.getPostContentLength())
			})
		},
		initWatchers () {
			if (isPageBuilderEditor()) {
				this.watchPageBuilderEditor()
			} else if (isBlockEditor()) {
				this.watchBlockEditor()
			} else if (isClassicEditor()) {
				this.watchClassicEditor()
			}
		}
	},
	beforeMount () {
		this.updateContentLength(this.aiContent.getPostContentLength())
		this.initWatchers()
	},
	beforeUnmount () {
		window.aioseoBus.$off('aioseo-content-changed')
	}
}
</script>

<style lang="scss">
.aioseo-ai-content-no-content-warning,
.aioseo-ai-content-trial-warning {
	margin-bottom: 12px;
}

.aioseo-ai-content-main {
	&--sidebar {
		--main-header-padding: 12px 16px;
	}

	.aioseo-ai-content-main-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #F3F4F5;
		padding: var(--main-header-padding, 16px 20px);
		border-radius: 4px;
		margin-bottom: 12px;
		flex-wrap: wrap;
        gap: 12px;
	}

	.aioseo-ai-content-main-header-title {
		font-weight: 700;
		font-size: 18px;
	}
}
</style>