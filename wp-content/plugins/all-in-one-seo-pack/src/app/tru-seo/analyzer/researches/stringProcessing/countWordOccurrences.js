import { filter } from 'lodash-es'

import transliterate from './transliterate.js'
import getWords from './getWords.js'

/**
 * Counts the number of occurrences of a word in a text.
 *
 * @param {string} text The text to count the word in.
 * @param {string} wordToMatch The word to check in the text.
 * @param {string} locale The locale used for transliteration.
 * @returns {number} The number of occurrences.
 */
export default function (text, wordToMatch, locale) {
	const words = getWords(text)
	 const count = filter(words, function (word) {
		return (wordToMatch === word || transliterate(wordToMatch, locale) === word)
	})
	return count.length
}