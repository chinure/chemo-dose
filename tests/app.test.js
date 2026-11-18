const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')

function page () {
  const elements = new Map()
  function element (id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', dataset: {}, events: {},
      classList: { add () {}, remove () {}, toggle () {} },
      setAttribute () {},
      addEventListener (type, fn) { this.events[type] = fn },
      fire (type) { this.events[type]({ target: this }) }
    })
    return elements.get(id)
  }
  const sex = ['male', 'female'].map((value) => {
    const e = element(value); e.dataset.sex = value; return e
  })
  const document = {
    querySelector (q) { return element(q.slice(1)) },
    querySelectorAll (q) { return q === '.sex' ? sex : [] },
    getElementById: element,
    addEventListener (type, fn) { if (type === 'DOMContentLoaded') fn() }
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8'), {
    document, window: { setTimeout () { return 1 }, clearTimeout () {} }
  })
  return element
}

test('BSA edits invalidate the result before the next calculation', () => {
  const e = page()
  for (const [id, value] of [['bsa-weight', '60'], ['bsa-height', '170'], ['bsa-dose', '75']]) e(id).value = value
  e('bsa-calc').fire('click')
  assert.notEqual(e('bsa-total').textContent, '--')
  e('bsa-dose').value = '80'; e('bsa-dose').fire('input')
  assert.equal(e('bsa-total').textContent, '--')
  assert.equal(e('bsa-dose-preview').textContent, '80')
})

test('Calvert edits and sex changes invalidate prior results', () => {
  const e = page()
  e('calvert-example').fire('click'); e('calvert-calc').fire('click')
  assert.notEqual(e('calvert-total').textContent, '--')
  e('female').fire('click')
  assert.equal(e('calvert-total').textContent, '--')
  e('calvert-calc').fire('click'); e('calvert-scr').value = '90'; e('calvert-scr').fire('input')
  assert.equal(e('calvert-total').textContent, '--')
})

test('invalid/overflowing calculations cannot leave old results', () => {
  const e = page()
  for (const id of ['bsa-weight', 'bsa-height', 'bsa-dose']) e(id).value = '1e308'
  e('bsa-calc').fire('click')
  assert.equal(e('bsa-total').textContent, '--')
  assert.match(e('toast').textContent, /超出/)
  e('bsa-weight').value = '60'; e('bsa-height').value = '170'; e('bsa-dose').value = '5e307'
  e('bsa-calc').fire('click')
  assert.notEqual(e('bsa-total').textContent, '--')
  assert.doesNotMatch(e('bsa-total').textContent, /Infinity/)
  e('calvert-example').fire('click'); e('calvert-calc').fire('click')
  e('calvert-scr').value = ''; e('calvert-calc').fire('click')
  assert.equal(e('calvert-total').textContent, '--')
})

test('zero or negative computed clearance cannot be presented as a result', () => {
  const e = page()
  for (const age of ['140', '141']) {
    e('calvert-example').fire('click')
    e('calvert-age').value = age
    e('calvert-calc').fire('click')
    assert.equal(e('calvert-crcl').textContent, '--')
    assert.equal(e('calvert-total').textContent, '--')
    assert.match(e('toast').textContent, /无效/)
  }
})
