const updateSpecificStateHistory = require('./specific-state-history')
const findMostAppropriateState = require('./find-most-appropriate-state')

module.exports = function beginWatchingRouter(stateRouter, stateWatcher) {
	var currentStateName = ''
	const specificStateHistory = {}

	stateRouter.on('stateChangeStart', state => {
		updateSpecificStateHistory(specificStateHistory, state.name)
		currentStateName = state.name
	})

	return function startFsmNavigation(fsm, options = { inherit: true }) {
		var definedStates = Object.keys(fsm)
		function dispatchListener(actionType) {
			const currentMostAppropriateState = findMostAppropriateState(definedStates, currentStateName)

			if (currentMostAppropriateState) {
				const destinationState = fsm[currentMostAppropriateState][actionType]

				if (destinationState) {
					var destinationStateName = destinationState
					var parameters = {}

					if (typeof destinationState !== 'string') {
						destinationStateName = destinationState.name
						parameters = destinationState.parameters
					}

					const mostSpecificChildState = specificStateHistory[destinationStateName] || destinationStateName
					stateRouter.go(mostSpecificChildState, parameters, options)
				}
			} else {
				console.warn('The state router is at state ' + currentStateName + ' and there is no matching fsm')
			}
		}

		const removeAttachListener = stateWatcher.addDomApiAttachListener(ractive => {
			ractive.on('dispatch', dispatchListener)
			ractive.on('dispatchInput', dispatchListener)
		})

		const removeDetachListener = stateWatcher.addDomApiDetachListener(ractive => {
			if (ractive) {
				ractive.off('dispatch', dispatchListener)
				ractive.off('dispatchInput', dispatchListener)
			}
		})

		return function stop() {
			removeAttachListener()
			removeDetachListener()
		}
	}
}
