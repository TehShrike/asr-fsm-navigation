var getShortNames = require('./all-short-names')

module.exports = function updateSpecificStateHistory(history, stateName) {
	getShortNames(stateName).forEach(shortName => history[shortName] = stateName)
}
