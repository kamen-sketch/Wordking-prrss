import { filter } from 'lodash-es'
import isSentenceTooLong from '../helpers/isValueTooLong'

/**
 * Checks for too long sentences.
 * @param {Array} sentences The array with objects containing sentences and their lengths.
 * @param {number} recommendedValue The recommended maximum length of sentence.
 * @returns {Array} The array with objects containing too long sentences and their lengths.
 */
export default function (sentences, recommendedValue) {
	return filter(sentences, function (sentence) {
		return isSentenceTooLong(recommendedValue, sentence.sentenceLength)
	})
}