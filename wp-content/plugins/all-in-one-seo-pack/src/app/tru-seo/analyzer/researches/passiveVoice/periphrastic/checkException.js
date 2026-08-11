import { isEmpty } from 'lodash-es'

/**
 * Sets sentence part passiveness to passive if no exception rules for the participle apply.
 *
 * @param {Object} that The object.
 * @returns {void}
 */
export default function (that) {
	if (isEmpty(that.getParticiple())) {
		that.setSentencePartPassiveness(false)
		return
	}

	that.setSentencePartPassiveness(that.isPassive())
}