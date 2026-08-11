import { count } from '@/vue/plugins/wordcount'

function pageTitleWidth (text) {
	if (!text) {
		return {}
	}

	return count(text, 'words')
}

export default pageTitleWidth