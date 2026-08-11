/**
 * External dependencies
 */
import { flow, filter } from 'lodash-es'
import English from 'parse-english'

/**
 * Internal dependencies
 */
import stripTags from './stripTags'
import stripHTMLComments from './stripHTMLComments'
import stripShortcodes from './stripShortcodes'
import stripSpaces from './stripSpaces'
import stripHTMLEntities from './stripHTMLEntities'
import stripConnectors from './stripConnectors'

/**
 * Count Sentences
 *
 * @param {string} text Text to count sentences.
 *
 * @returns {number} Count of sentences.
 */
export default (text) => {
	text = flow(
		[
			stripTags,
			stripHTMLComments,
			stripShortcodes,
			stripSpaces,
			stripHTMLEntities,
			stripConnectors
		]
	)(text)

	if ('' === text) {
		return 0
	}

	const paragraphs = new English().tokenizeParagraph(text).children
	return filter(paragraphs, { type: 'SentenceNode' }).length
}