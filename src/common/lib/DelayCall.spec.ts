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

test('cancel-error', async (t) => {
  const job = new DelayCall
  const stack: number[] = []

  for (let i = 0; i < 10; i++) {
    job.request('add-stack', () => {
      stack.push(1)
    })
  }

  job.done('add-stack').then(() => {
    t.fail()
  }).catch((reason) => {
    const { message } = reason as Error
    t.is(message, 'The task canceled.')
  })

  job.cancel('add-stack')
})

test('cancel-all', async (t) => {
  const job = new DelayCall
  const stack: number[] = []

  for (let i = 0; i < 10; i++) {
    job.request('add-stack', () => {
      stack.push(1)
    })
  }

  job.cancelAll()
  await job.done('add-stack')

  t.deepEqual(stack, [])
})