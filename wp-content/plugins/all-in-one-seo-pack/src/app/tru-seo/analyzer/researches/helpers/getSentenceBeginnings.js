import getWords from '../stringProcessing/getWords.js'
import stripSpaces from '../stringProcessing/stripSpaces.js'
import getFirstWordExceptions from './getFirstWordExceptions.js'
import sentences from './sentences.js'
import { stripFullTags as stripTags } from '../stringProcessing/stripHTMLTags.js'

import { isEmpty, forEach, filter } from 'lodash-es'

/**
 * Compares the first word of each sentence with the first word of the following sentence.
 *
 * @param {string} currentSentenceBeginning The first word of the current sentence.
 * @param {string} nextSentenceBeginning The first word of the next sentence.
 * @returns {boolean} Returns true if sentence beginnings match.
 */
const startsWithSameWord = function (currentSentenceBeginning, nextSentenceBeginning) {
	if (!isEmpty(currentSentenceBeginning) && currentSentenceBeginning === nextSentenceBeginning) {
		return true
	}

	return false
}

/**
 * Counts the number of similar sentence beginnings.
 *
 * @param {Array} sentenceBeginnings The array containing the first word of each sentence.
 * @param {Array} sentencesArray The array containing all sentences.
 * @returns {Array} The array containing the objects containing the first words and the corresponding counts.
 */
const compareFirstWords = function (sentenceBeginnings, sentencesArray) {
	const consecutiveFirstWords = []
	let foundSentences = [],
		sameBeginnings = 1

	forEach(sentenceBeginnings, function (beginning, i) {
		const currentSentenceBeginning = beginning
		const nextSentenceBeginning = sentenceBeginnings[i + 1]
		foundSentences.push(sentencesArray[i])

		if (startsWithSameWord(currentSentenceBeginning, nextSentenceBeginning)) {
			sameBeginnings++
		} else {
			consecutiveFirstWords.push({ word: currentSentenceBeginning, count: sameBeginnings, sentences: foundSentences })
			sameBeginnings = 1
			foundSentences = []
		}
	})

	return consecutiveFirstWords
}

/**
 * Retrieves the first word from the sentence.
 *
 * @param {string} sentence The sentence to retrieve the first word from.
 * @param {Array} firstWordExceptions Exceptions to match against.
 * @returns {string} The first word of the sentence.
 */
function getSentenceBeginning (sentence, firstWordExceptions) {
	const words = getWords(stripTags(stripSpaces(sentence)))

	if (0 === words.length) {
		return ''
	}

	let firstWord = words[0].toLocaleLowerCase()

	if (-1 < firstWordExceptions.indexOf(firstWord) && 1 < words.length) {
		firstWord += ' ' + words[1]
	}

	return firstWord
}

/**
 * Gets the first word of each sentence from the text, and returns an object containing the first word of each sentence and the corresponding counts.
 *
 * @param {string} text The text to parse.
 * @param {string} locale The locale.
 * @returns {Object} The object containing the first word of each sentence and the corresponding counts.
 */
export default function (text, locale) {
	const firstWordExceptions = getFirstWordExceptions(locale)()

	let sentencesResearch = sentences(text),
		sentenceBeginnings = sentencesResearch.map(function (sentence) {
			return getSentenceBeginning(sentence, firstWordExceptions)
		})

	sentencesResearch = sentencesResearch.filter(function (sentence) {
		return 0 < getWords(stripSpaces(sentence)).length
	})
	sentenceBeginnings = filter(sentenceBeginnings)

	return compareFirstWords(sentenceBeginnings, sentencesResearch)
}