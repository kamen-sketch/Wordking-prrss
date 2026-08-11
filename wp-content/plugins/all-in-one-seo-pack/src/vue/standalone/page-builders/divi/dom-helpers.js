/* globals ET_Builder */
import { getText } from '@/vue/utils/html'
import { getVideos, getImages } from '@/app/tru-seo/analyzer/analysis/contentHasAssets'

/**
 * Get the content area.
 *
 * @returns {HTMLElement} The content area.
 */
export const getContentArea = () => {
	const frame = ET_Builder?.Frames?.app?.frameElement ||
		document.querySelector('iframe#et-fb-app-frame') ||
		document.querySelector('iframe#et-vb-app-frame')

	if (!frame) {
		return document.createElement('div')
	}

	const content = frame.contentWindow.document.querySelectorAll('#et-fb-app')

	return Array.from(content).find(n => n.classList.contains('et-fb-root-ancestor')) ||
		content[0] ||
		document.createElement('div')
}

/**
 * Get the content from the builder by scraping the DOM.
 *
 * @returns {string} The content.
 */
export const getScrapedContent = () => {
	const regex = /<style.*?<\/style>|\[object Object\]/gi
	return Array.from(getContentArea().querySelectorAll('.et_pb_section'))
		.map(s => s.innerHTML.replace(regex, '').replaceAll(/<p.*>(<img.*>)<\/p>/g, '$1'))
		.filter(html => getText(html) || getImages(html) || getVideos(html))
		.join(' ')
}