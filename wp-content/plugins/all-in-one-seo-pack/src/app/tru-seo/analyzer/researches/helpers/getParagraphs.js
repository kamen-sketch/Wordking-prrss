/**
 * External dependencies
 */

import { filter } from 'lodash-es'

/**
 * Internal dependencies
 */
import wordCount from './wordCount'
import matchParagraphs from './matchParagraphs'

/**
 * Gets all paragraphs and their word counts from the text.
 *
 * @param {string} content The text to get paragraphs from.
 *
 * @returns {Array} The array containing an object with the paragraph word count and paragraph text.
 */
export default (content) => {
	const paragraphsLength = []
	matchParagraphs(content).forEach((paragraph) => paragraphsLength.push(
		{
			wordCount : wordCount(paragraph),
			text      : paragraph
		}
	))

	return filter(paragraphsLength, (paragraphLength) => 0 < paragraphLength.wordCount)
}