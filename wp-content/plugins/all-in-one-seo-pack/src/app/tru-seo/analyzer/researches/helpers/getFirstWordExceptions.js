import firstWordExceptionsEnglish from '../english/firstWordExceptions.js'
import firstWordExceptionsGerman from '../german/firstWordExceptions.js'
import firstWordExceptionsSpanish from '../spanish/firstWordExceptions.js'
import firstWordExceptionsFrench from '../french/firstWordExceptions.js'
import firstWordExceptionsDutch from '../dutch/firstWordExceptions.js'
import firstWordExceptionsItalian from '../italian/firstWordExceptions.js'
import firstWordExceptionsRussian from '../russian/firstWordExceptions.js'
import firstWordExceptionsPolish from '../polish/firstWordExceptions.js'
import firstWordExceptionsSwedish from '../swedish/firstWordExceptions.js'
import firstWordExceptionsPortuguese from '../portuguese/firstWordExceptions.js'
import firstWordExceptionsIndonesian from '../indonesian/firstWordExceptions.js'
import firstWordExceptionsArabic from '../arabic/firstWordExceptions.js'
import getLanguage from './getLanguage.js'

/**
 * Returns the first word exceptions function for a locale.
 *
 * @param {string} locale The locale to return word exceptions for.
 *
 * @returns {Function} A function that will return the first word exceptions.
 */
export default function (locale) {
	const firstWordExceptions = {
		en : firstWordExceptionsEnglish,
		de : firstWordExceptionsGerman,
		fr : firstWordExceptionsFrench,
		es : firstWordExceptionsSpanish,
		nl : firstWordExceptionsDutch,
		it : firstWordExceptionsItalian,
		ru : firstWordExceptionsRussian,
		pl : firstWordExceptionsPolish,
		sv : firstWordExceptionsSwedish,
		pt : firstWordExceptionsPortuguese,
		id : firstWordExceptionsIndonesian,
		ar : firstWordExceptionsArabic
	}

	// If available, return the language-specific first word exceptions.
	if (Object.keys(firstWordExceptions).includes(getLanguage(locale))) {
		return firstWordExceptions[getLanguage(locale)]
	}

	// Return the English first word exceptions as a default.
	return firstWordExceptionsEnglish
}