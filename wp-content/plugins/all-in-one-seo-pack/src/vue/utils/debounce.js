let timeout,
	timer
export const debounceContext = (fn, time) => {
	return ((...args) => {
		const functionCall = () => fn(...args)

		clearTimeout(timeout)
		timeout = setTimeout(functionCall, time)
	}).call()
}

export const debounce = function (fn, d) {
	if (timer) {
		clearTimeout(timer)
	}

	timer = setTimeout(fn, d)
}