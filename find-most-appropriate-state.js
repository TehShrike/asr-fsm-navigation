const allShortNames = require('./all-short-names')

module.exports = function findMostAppropriateState(fsmStateOptions, stateName) {
	return allShortNames(stateName).reduce((memo, current) => {
		return fsmStateOptions.indexOf(current) === -1 ? memo : current
	}, null)
}
