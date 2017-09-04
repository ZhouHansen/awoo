const test = require('ava')
const read = require('../lib/read')

test('reads files correctly', async t => {
  const res = await read('test/sample')

  const file = res.find(f => f.path === 'test.md')
  t.true(file.contents.trim() === 'Hello!')
})

test('reads binary files as buffers', async t => {
  const res = await read('test/sample')
  const file = res.find(f => f.path === 'picture.png')
  t.true(Buffer.isBuffer(file.contents))
  t.true(Buffer.byteLength(file.contents) === 1119)
})

test('throws on nonexistent path', async t => {
  try {
    await read('test/fakepath')
  } catch (err) {
    t.truthy(err[0])
    t.is(err[0].code, 'ENOENT')
  }
})

test('excludes files', async t => {
  const res = await read('test/sample', ['subdir/'])

  const basenames = res.map(f => f.basename)
  t.false(basenames.includes('another.md'))
})
