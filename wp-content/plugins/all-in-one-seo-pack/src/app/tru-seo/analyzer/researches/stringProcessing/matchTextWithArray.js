/** @module stringProcessing/matchTextWithArray */

import stripSpaces from '../stringProcessing/stripSpaces.js'

import removePunctuation from '../stringProcessing/removePunctuation.js'
import matchTextWithWord from '../stringProcessing/matchTextWithWord'
import { normalize as normalizeQuotes } from '../stringProcessing/quotes.js'
import { uniq } from 'lodash-es'

/**
 * Matches strings from an array against a given text.
 *
 * @param {string} text The text to match
 * @param {Array} array The array with strings to match
 * @param {string} [locale = "en_EN"] The locale of the text to get transliterations
 *
 * @returns {Array} array An array with all matches of the text.
 */
export default function (text, array, locale = 'en_EN') {
	let count = 0,
	 matches = []

	array = array.map(normalizeQuotes)

	uniq(array).forEach(function (wordToMatch) {
		const occurrence = matchTextWithWord(text, wordToMatch, locale)
		count += occurrence.count
		matches = matches.concat(occurrence.matches)
	})

	if (null === matches) {
		matches = []
	}

	matches = matches.map(function (string) {
		return stripSpaces(removePunctuation(string))
	})

	return {
		count   : count,
		matches : matches
	}
}