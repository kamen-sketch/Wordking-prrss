import { filter } from 'lodash-es'
import getWords from '../../stringProcessing/getWords.js'

// Verb-form lists per language
import getPassiveVerbsRussianFactory from '../../russian/passiveVoice/participlesShortenedList.js'

import getPassiveVerbsSwedishFactory from '../../swedish/passiveVoice/participles.js'
import nonPassivesIndonesianFactory from '../../indonesian/passiveVoice/nonPassiveVerbsStartingDi'

import getPassiveVerbsArabicFactory from '../../arabic/passiveVoice/passiveVerbsWithLongVowel'
const getPassiveVerbsRussian = getPassiveVerbsRussianFactory().all
const getPassiveVerbsSwedish = getPassiveVerbsSwedishFactory().all

const passivePrefixIndonesian = 'di'
const nonPassivesIndonesian = nonPassivesIndonesianFactory()
const getPassiveVerbsArabic = getPassiveVerbsArabicFactory()

/**
 * Matches the sentence against passive verbs.
 *
 * @param {string} sentence The sentence to match against.
 * @param {Array} passiveVerbs The array containing passive verb-forms.
 * @returns {Array} The found passive verbs.
 */
const matchPassiveVerbs = function (sentence, passiveVerbs) {
	return filter(getWords(sentence), function (word) {
		return passiveVerbs.includes(word.toLocaleLowerCase())
	})
}

/**
 * Checks the passed sentence to see if it contains passive verb-forms.
 *
 * @param {string} sentence The sentence to match against.
 * @param {string} language The language of the text.
 * @returns {boolean} Whether the sentence contains passive voice.
 */
const determineSentenceIsPassiveListBased = function (sentence, language) {
	let passiveVerbs = []

	switch (language) {
		case 'ru':
			passiveVerbs = getPassiveVerbsRussian
			break
		case 'sv':
			passiveVerbs = getPassiveVerbsSwedish
			break
	}
	return 0 !== matchPassiveVerbs(sentence, passiveVerbs).length
}

/**
 * Checks the passed sentence to see if it contains Indonesian passive verb-forms.
 *
 * @param {string} sentence The sentence to match against.
 * @returns {boolean} Whether the sentence contains Indonesian passive voice.
 */
const determineSentenceIsPassiveIndonesian = function (sentence) {
	const words = getWords(sentence)
	let matchedPassives = words.filter(word => (word.startsWith(passivePrefixIndonesian)))

	if (0 === matchedPassives.length) {
		return false
	}

	// Check exception list.
	matchedPassives = matchedPassives.filter(matchedPassive => (!nonPassivesIndonesian.includes(matchedPassive)))

	if (0 === matchedPassives.length) {
		return false
	}

	// Check direct precedence exceptions.
	matchedPassives = matchedPassives.filter(function (matchedPassive) {
		let matchedPassivesShouldStay = true
		const passiveIndex = words.indexOf(matchedPassive)
		const wordPrecedingPassive = words[passiveIndex - 1]
		if ('untuk' === wordPrecedingPassive) {
			matchedPassivesShouldStay = false
		}
		return matchedPassivesShouldStay
	})

	return 0 !== matchedPassives.length
}

/**
 * Checks the passed sentence to see if it contains Arabic passive verb-forms.
 *
 * @param {string} sentence The sentence to match against.
 * @returns {boolean} Whether the sentence contains Arabic passive voice.
 */
const determineSentenceIsPassiveArabic = function (sentence) {
	const arabicPrepositionalPrefix =  'و'
	const words = getWords(sentence)
	const passiveVerbs = []

	for (let word of words) {
		// Check if the word starts with prefix و
		if (word.startsWith(arabicPrepositionalPrefix)) {
			word = word.slice(1)
		}

		// Check if the first character has a damma or if the word is in the list of Arabic passive verbs
		const wordWithDamma = word[1].search('\u064F')
		if (-1 !== wordWithDamma || getPassiveVerbsArabic.includes(word)) {
			passiveVerbs.push(word)
		}
	}

	return 0 !== passiveVerbs.length
}

/**
 * Determines whether a sentence is passive.
 *
 * @param {string} sentenceText The sentence to determine voice for.
 * @param {string} language The language of the sentence part.

 * @returns {boolean} Returns true if passive, otherwise returns false.
 */
export default function (sentenceText, language) {
	if ([ 'ru', 'sv' ].includes(language)) {
		return determineSentenceIsPassiveListBased(sentenceText, language)
	}

	if ('id' === language) {
		return determineSentenceIsPassiveIndonesian(sentenceText)
	}

	if ('ar' === language) {
		return determineSentenceIsPassiveArabic(sentenceText)
	}
}