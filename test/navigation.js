const test = require('tape-catch')
const beginWatchingRouter = require('../')
const stateFactory = require('abstract-state-router/test/helpers/test-state-factory')
const EventEmitter = require('events').EventEmitter
const makeAsrStateWatcher = require('asr-active-state-watcher')

function createMockRendererFactory() {
	return function makeRenderer(stateRouter) {
		return {
			render: function render(context, cb) {
				cb(null, context.template)
			},
			reset: function reset(context, cb) {
				setTimeout(cb, 100)
			},
			destroy: function destroy(renderedTemplateApi, cb) {
				setTimeout(cb, 100)
			},
			getChildElement: function getChildElement(renderedTemplateApi, cb) {
				cb(null, 'whatever')
			}
		}
	}
}

function makeTestStates(t, datas) {
	datas = datas || {}
	const testState = stateFactory(t, createMockRendererFactory(), { throwOnError: true })
	testState.emitters = {}

	function addState(name) {
		const nameWithNoPeriod = name.replace(/\./g, '')
		const emitter = new EventEmitter() // Ractive mock
		emitter.fire = emitter.emit
		emitter.off = emitter.removeListener
		emitter.set = function set(newState) {
			emitter.state = newState
		}
		if (testState.emitters[nameWithNoPeriod]) {
			throw new Error('emitter ' + nameWithNoPeriod + ' existed already')
		}
		testState.emitters[nameWithNoPeriod] = emitter

		testState.stateRouter.addState({
			name: name,
			template: emitter,
			route: name.replace(/\./g, '/'),
			data: datas[nameWithNoPeriod] || {}
		})
	}

	addState('parent1')
	addState('parent1.child1')
	addState('parent1.child2')
	addState('parent2')
	addState('parent2.child1')
	addState('parent2.child2')
	addState('parent3')

	return testState
}

test('initial use case', t => {
	t.timeoutAfter(1000)

	const testState = makeTestStates(t)
	const stateWatcher = makeAsrStateWatcher(testState.stateRouter)
	const startFsmNavigation = beginWatchingRouter(testState.stateRouter, stateWatcher)

	t.plan(2)

	var stop = startFsmNavigation({
		'parent1': {
			GO_TO_PARENT2_CHILD1: 'parent2.child1',
			GO_TO_PARENT2_CHILD2: 'parent2.child2'
		},
		'parent2': {
			GO_TO_PARENT1: 'parent1'
		},
		'parent2.child2': {
			GO_TO_PARENT1: 'parent1',
			GO_TO_PARENT1_CHILD2: 'parent1.child2'
		}
	})

	testState.stateRouter.once('stateChangeEnd', () => {
		testState.stateRouter.once('stateChangeEnd', secondStep)

		testState.emitters.parent1child1.fire('dispatch', 'GO_TO_PARENT2_CHILD1')
	})

	testState.stateRouter.go('parent1.child1')

	function secondStep(state) {
		t.equal(state.name, 'parent2.child1', 'navigated to the correct state after dispatching an event on parent1.child1')

		testState.stateRouter.once('stateChangeEnd', thirdStep)

		// should have no effect
		testState.emitters.parent1child1.fire('dispatch', 'GO_TO_PARENT2_CHILD2')

		testState.emitters.parent2.fire('dispatch', 'GO_TO_PARENT1')
	}

	function thirdStep(state) {
		t.equal(state.name, 'parent1.child1', 'remembered the last child state and navigated to it')

		stop()

		t.end()
	}
})

test('query parameters specified when navigating to states', t => {
	t.timeoutAfter(1000)

	const testState = makeTestStates(t)
	const stateWatcher = makeAsrStateWatcher(testState.stateRouter)
	const startFsmNavigation = beginWatchingRouter(testState.stateRouter, stateWatcher)

	t.plan(2)

	var stop = startFsmNavigation({
		'parent1': {
			GO_TO_PARENT2_CHILD1: {
				name: 'parent2.child1',
				parameters: {
					from: 'parent1'
				}
			}
		},
		'parent2.child1': {
			GO_TO_PARENT1: 'parent1',
			GO_TO_PARENT1_CHILD1: 'parent1.child1'
		}
	}, { inherit: false })

	testState.stateRouter.once('stateChangeEnd', () => {
		testState.stateRouter.once('stateChangeEnd', secondStep)

		testState.emitters.parent1child1.fire('dispatch', 'GO_TO_PARENT2_CHILD1')
	})

	testState.stateRouter.go('parent1.child1')

	function secondStep(state, parameters) {
		t.equal(parameters.from, 'parent1')

		testState.stateRouter.once('stateChangeEnd', thirdStep)

		testState.emitters.parent2.fire('dispatch', 'GO_TO_PARENT1')
	}

	function thirdStep(state, parameters) {
		t.notOk(parameters.from)

		stop()

		t.end()
	}
})
