const test = require('tape-catch')
const findAppropriateState = require('../find-most-appropriate-state')

test('Find most appropriate state to visit based on fsm object', t => {
	var states = [
		'a',
		'a.c',
		'a.a',
		'a.a.x',
		'a.b',
		'a.b.y',
		'b',
		'b.z'
	]

	t.equal(findAppropriateState(states, 'a.c.d'), 'a.c')
	t.equal(findAppropriateState(states, 'a.b.d'), 'a.b')
	t.equal(findAppropriateState(states, 'a.a.a.a.a'), 'a.a')
	t.equal(findAppropriateState(states, 'a.z.z'), 'a')
	t.equal(findAppropriateState(states, 'b.x'), 'b')
	t.equal(findAppropriateState(states, 'b.z.b.a.a.a'), 'b.z')

	t.end()
})
