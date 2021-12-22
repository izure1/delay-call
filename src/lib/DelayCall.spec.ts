import test from 'ava'

import { DelayCall } from './DelayCall'

test('request', async (t) => {
  const job = new DelayCall
  const stack: number[] = []

  for (let i = 0; i < 10; i++) {
    job.request('add-stack', () => {
      stack.push(1)
    })
  }

  await job.done('add-stack')

  t.deepEqual(stack, [1])
})

test('cancel', async (t) => {
  const job = new DelayCall
  const stack: number[] = []

  for (let i = 0; i < 10; i++) {
    job.request('add-stack', () => {
      stack.push(1)
    })
  }

  job.cancel('add-stack')
  await job.done('add-stack')

  t.deepEqual(stack, [])
})

test('cancel-all', async (t) => {
  const job = new DelayCall
  const stack: number[] = []

  for (let i = 0; i < 10; i++) {
    job.request('add-stack', () => {
      stack.push(1)
    })
  }

  job.done('add-stack')
  await job.done('add-stack')

  t.deepEqual(stack, [])
})