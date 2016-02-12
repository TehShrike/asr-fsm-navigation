const test = require('tape-catch')
const updateSpecificStateHistory = require('../specific-state-history')

test('Updating state history', t => {
	var history = {}

	updateSpecificStateHistory(history, 'parent.child.grandchild')

	t.equal(history.parent, 'parent.child.grandchild')
	t.equal(history['parent.child'], 'parent.child.grandchild')
	t.equal(history['parent.child.grandchild'], 'parent.child.grandchild')

	updateSpecificStateHistory(history, 'parent.otherchild.othergrandchild')

	t.equal(history.parent, 'parent.otherchild.othergrandchild')
	t.equal(history['parent.otherchild'], 'parent.otherchild.othergrandchild')
	t.equal(history['parent.otherchild.othergrandchild'], 'parent.otherchild.othergrandchild')

	t.equal(history['parent.child'], 'parent.child.grandchild')
	t.equal(history['parent.child.grandchild'], 'parent.child.grandchild')

	t.end()
})
