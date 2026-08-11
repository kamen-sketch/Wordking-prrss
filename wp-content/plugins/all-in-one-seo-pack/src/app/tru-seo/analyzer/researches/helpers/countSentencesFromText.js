import getSentences from '../stringProcessing/getSentences'
import sentencesLength from '../stringProcessing/sentencesLength'

/**
 * Count sentences in the text.
 * @param {Paper} paper The Paper object to get text from.
 * @returns {Array} The sentences from the text.
 */
export default function (paper) {
	const sentences = getSentences(paper)
	return sentencesLength(sentences)
}