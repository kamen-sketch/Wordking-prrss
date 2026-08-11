import transitionWordsEnglishFactory from '../english/transitionWords.js'
import twoPartTransitionWordsEnglish from '../english/twoPartTransitionWords.js'

import transitionWordsGermanFactory from '../german/transitionWords.js'
import twoPartTransitionWordsGerman from '../german/twoPartTransitionWords.js'

import transitionWordsFrenchFactory from '../french/transitionWords.js'
import twoPartTransitionWordsFrench from '../french/twoPartTransitionWords.js'

import transitionWordsSpanishFactory from '../spanish/transitionWords.js'
import twoPartTransitionWordsSpanish from '../spanish/twoPartTransitionWords.js'

import transitionWordsDutchFactory from '../dutch/transitionWords.js'
import twoPartTransitionWordsDutch from '../dutch/twoPartTransitionWords.js'

import transitionWordsItalianFactory from '../italian/transitionWords.js'
import twoPartTransitionWordsItalian from '../italian/twoPartTransitionWords.js'

import transitionWordsPortugueseFactory from '../portuguese/transitionWords.js'
import twoPartTransitionWordsPortuguese from '../portuguese/twoPartTransitionWords.js'

import transitionWordsRussianFactory from '../russian/transitionWords.js'
import twoPartTransitionWordsRussian from '../russian/twoPartTransitionWords.js'

import transitionWordsCatalanFactory from '../catalan/transitionWords.js'
import twoPartTransitionWordsCatalan from '../catalan/twoPartTransitionWords.js'

import transitionWordsPolishFactory from '../polish/transitionWords.js'
import twoPartTransitionWordsPolish from '../polish/twoPartTransitionWords.js'
import transitionWordsSwedishFactory from '../swedish/transitionWords.js'
import twoPartTransitionWordsSwedish from '../swedish/twoPartTransitionWords.js'

import transitionWordsHungarianFactory from '../hungarian/transitionWords.js'
import twoPartTransitionWordsHungarian from '../hungarian/twoPartTransitionWords.js'

import transitionWordsIndonesianFactory from '../indonesian/transitionWords.js'
import twoPartTransitionWordsIndonesian from '../indonesian/twoPartTransitionWords.js'

import getLanguage from './getLanguage.js'

import transitionWordsArabicFactory from '../arabic/transitionWords.js'
import twoPartTransitionWordsArabic from '../arabic/twoPartTransitionWords.js'
const transitionWordsEnglish = transitionWordsEnglishFactory().allWords
const transitionWordsGerman = transitionWordsGermanFactory().allWords
const transitionWordsFrench = transitionWordsFrenchFactory().allWords
const transitionWordsSpanish = transitionWordsSpanishFactory().allWords
const transitionWordsDutch = transitionWordsDutchFactory().allWords
const transitionWordsItalian = transitionWordsItalianFactory().allWords
const transitionWordsPortuguese = transitionWordsPortugueseFactory().allWords
const transitionWordsRussian = transitionWordsRussianFactory().allWords
const transitionWordsCatalan = transitionWordsCatalanFactory().allWords
const transitionWordsPolish = transitionWordsPolishFactory().allWords
const transitionWordsSwedish = transitionWordsSwedishFactory().allWords
const transitionWordsHungarian = transitionWordsHungarianFactory().allWords
const transitionWordsIndonesian = transitionWordsIndonesianFactory().allWords
const transitionWordsArabic = transitionWordsArabicFactory().allWords

/**
 * Returns transition words for a specific locale.
 *
 * @param {string} locale The locale to return function words for.
 *
 * @returns {Object} The function words for a locale.
 */
export default function (locale) {
	switch (getLanguage(locale)) {
		case 'de':
			return {
				transitionWords        : transitionWordsGerman,
				twoPartTransitionWords : twoPartTransitionWordsGerman
			}
		case 'es':
			return {
				transitionWords        : transitionWordsSpanish,
				twoPartTransitionWords : twoPartTransitionWordsSpanish
			}
		case 'fr':
			return {
				transitionWords        : transitionWordsFrench,
				twoPartTransitionWords : twoPartTransitionWordsFrench
			}
		case 'nl':
			return {
				transitionWords        : transitionWordsDutch,
				twoPartTransitionWords : twoPartTransitionWordsDutch
			}
		case 'it':
			return {
				transitionWords        : transitionWordsItalian,
				twoPartTransitionWords : twoPartTransitionWordsItalian
			}
		case 'pt':
			return {
				transitionWords        : transitionWordsPortuguese,
				twoPartTransitionWords : twoPartTransitionWordsPortuguese
			}
		case 'ru':
			return {
				transitionWords        : transitionWordsRussian,
				twoPartTransitionWords : twoPartTransitionWordsRussian
			}
		case 'ca':
			return {
				transitionWords        : transitionWordsCatalan,
				twoPartTransitionWords : twoPartTransitionWordsCatalan
			}
		case 'pl':
			return {
				transitionWords        : transitionWordsPolish,
				twoPartTransitionWords : twoPartTransitionWordsPolish
			}
		case 'sv':
			return {
				transitionWords        : transitionWordsSwedish,
				twoPartTransitionWords : twoPartTransitionWordsSwedish
			}
		case 'hu':
			return {
				transitionWords        : transitionWordsHungarian,
				twoPartTransitionWords : twoPartTransitionWordsHungarian
			}
		case 'id':
			return {
				transitionWords        : transitionWordsIndonesian,
				twoPartTransitionWords : twoPartTransitionWordsIndonesian
			}
		case 'ar':
			return {
				transitionWords        : transitionWordsArabic,
				twoPartTransitionWords : twoPartTransitionWordsArabic
			}
		case 'en':
		default:
			return {
				transitionWords        : transitionWordsEnglish,
				twoPartTransitionWords : twoPartTransitionWordsEnglish
			}
	}
}