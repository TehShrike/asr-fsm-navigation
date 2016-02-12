Given an [fsm](https://github.com/dominictarr/fsm) description of how users should be able to navigate between states:

Watches for `dispatch` and `dispatchInput` events, interprets the first argument to be the action type, and when it sees one it has a command for, it tells the [abstract-state-router](https://github.com/TehShrike/abstract-state-router) to navigate to that state (inheriting all parameters from the current state).

```js
const asrFsmNavigation('asr-fsm-navigation')
const makeAsrStateWatcher = require('asr-active-state-watcher')

const stateWatcher = makeAsrStateWatcher(stateRouter)
const startFsmNavigation = asrFsmNavigation(stateRouter, stateWatcher)

var stopNavigating = startFsmNavigation({
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
```

If the user is at the parent1.child1 state and dispatches a GO_TO_PARENT2_CHILD1 event, the module will navigate to the parent2.child1 state.
