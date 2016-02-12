module.exports = function getShortNames(stateName) {
	var stateNameChunks = stateName.split('.')
	var shortNames = []

	for (var i = 0; i < stateNameChunks.length; ++i) {
		shortNames.push(stateNameChunks.slice(0, i + 1).join('.'))
	}

	return shortNames
}
