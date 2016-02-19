const allShortNames = require('./all-short-names')

module.exports = function findMostAppropriateState(fsmStateOptions, stateName) {
	return allShortNames(stateName)
		.reverse()
		.find(state => fsmStateOptions.indexOf(state) !== -1) || null
}
