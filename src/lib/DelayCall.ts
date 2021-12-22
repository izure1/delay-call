import EventEmitter from 'eventemitter3'

type DelayCallback = () => void
type DelayCallID = string|number|symbol
type DelayCallTimeoutID = number|NodeJS.Timeout
type DelayCallQueue = Map<DelayCallID, DelayCallQueueItem>

interface DelayCallQueueItem {
  done: symbol
  cancel: symbol
  timeoutID: DelayCallTimeoutID
}

class DelayCallQueueManager extends EventEmitter {
  protected __getQueue(queue: DelayCallQueue, id: DelayCallID): DelayCallQueueItem {
    const item = queue.get(id)
    if (item) {
      return item as DelayCallQueueItem
    }
    else {
      throw new Error(`The queue of '${id.toString()}' not exists.`)
    }
  }

  protected __setTimeout(callback: DelayCallback, delay: number): DelayCallTimeoutID {
    return setTimeout(callback, delay)
  }

  protected __clearTimeout(item: DelayCallQueueItem): void {
    const { timeoutID } = item
    clearTimeout(timeoutID as any)
  }

  protected __waitCall(queue: DelayCallQueue, id: DelayCallID): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!queue.has(id)) {
        resolve()
      }
      else {
        const { done, cancel } = this.__getQueue(queue, id)
        this.once(done, resolve)
        this.once(cancel, reject)
      }
    })
  }

  protected __request(queue: DelayCallQueue, id: DelayCallID, callback: DelayCallback, delay: number): void {
    if (queue.has(id)) {
      this.__clearTimeout(this.__getQueue(queue, id))
    }
    const done = Symbol('done')
    const cancel = Symbol('cancel')
    const wrapper = () => {
      callback()
      this.emit(done)
      queue.delete(id)
    }
    const timeoutID = this.__setTimeout(wrapper, delay)
    queue.set(id, { done, cancel, timeoutID })
  }

  protected __cancel(queue: DelayCallQueue, id: DelayCallID): boolean {
    const exists = queue.has(id)
    if (exists) {
      this.__clearTimeout(this.__getQueue(queue, id))
      queue.delete(id)
    }
    return exists
  }

  protected __cancelAll(queue: DelayCallQueue): void {
    queue.forEach((t, id) => {
      this.__clearTimeout(t)
      queue.delete(id)
    })
  }

  protected __done(queue: DelayCallQueue, id: DelayCallID): Promise<void> {
    return this.__waitCall(queue, id)
  }
}

export class DelayCall extends DelayCallQueueManager {
  protected readonly __delay: number = 25
  protected readonly __queue: DelayCallQueue = new Map

  /**
   * @param globalDelay Ignore requests with the same unique name if repeated during this time. You can also set each as a `delay` parameter for the `request` method. The default value of the `delay` is `25`
   */
  constructor(globalDelay = 25) {
    super()
    this.__delay = globalDelay
  }

  /**
   * Request to execute the callback function. The function is not called immediately and waits as much as the `delay` parameter. The default value of the `delay` is `this.__delay`.
   * @param id It's a unique name for the task. If this value is called in duplicate, the existing task is ignored.
   * @param callback The callback function to be called.
   * @param delay Ignore requests with the same unique name if repeated during this time.
   * @returns This instance.
   */
  request(id: DelayCallID, callback: DelayCallback, delay = this.__delay): this {
    this.__request(this.__queue, id, callback, delay)
    return this
  }

  /**
   * Cancel the requested task with the `id` parameter.
   * @param id It's a unique name for the task.
   * @returns If there was a scheduled task, return `true`, otherwise `false`.
   */
  cancel(id: DelayCallID): boolean {
    return this.__cancel(this.__queue, id)
  }

  /**
   * Cancel all requested tasks.
   */
  cancelAll(): void {
    return this.__cancelAll(this.__queue)
  }

  /**
   * Wait until the requested task of the `id` parameter is actually called.
   * @param id It's a unique name for the task.
   * @returns The Promise instance.
   */
  done(id: DelayCallID): Promise<void> {
    return this.__done(this.__queue, id)
  }

  /**
   * Call before destroying an instance.
   */
  destroy(): void {
    this.__cancelAll(this.__queue)
  }
}

export class DelayCallGlobally extends DelayCall {
  protected static __Delay = 25
  protected static __Queue: DelayCallQueue = new Map
  
  /**
   * @param globalDelay Ignore requests with the same unique name if repeated during this time. You can also set each as a `delay` parameter for the `request` method. The default value of the `delay` is `25`
   */
  constructor(globalDelay = 25) {
    super()
    DelayCallGlobally.__Delay = globalDelay
  }

  /**
   * Request to execute the callback function. The function is not called immediately and waits as much as the `delay` parameter. The default value of the `delay` is `this.__delay`.
   * @param id It's a unique name for the task. If this value is called in duplicate, the existing task is ignored.
   * @param callback The callback function to be called.
   * @param delay Ignore requests with the same unique name if repeated during this time.
   * @returns This instance.
   */
  request(id: DelayCallID, callback: DelayCallback, delay = DelayCallGlobally.__Delay): this {
    this.__request(DelayCallGlobally.__Queue, id, callback, delay)
    return this
  }

  /**
   * Cancel the requested task with the `id` parameter.
   * @param id It's a unique name for the task.
   * @returns If there was a scheduled task, return `true`, otherwise `false`.
   */
  cancel(id: DelayCallID): boolean {
    return this.__cancel(DelayCallGlobally.__Queue, id)
  }

  /**
   * Cancel all requested tasks.
   */
  cancelAll(): void {
    return this.__cancelAll(DelayCallGlobally.__Queue)
  }

  /**
   * Wait until the requested task of the `id` parameter is actually called.
   * @param id It's a unique name for the task.
   * @returns The Promise instance.
   */
  done(id: DelayCallID): Promise<void> {
    return this.__done(DelayCallGlobally.__Queue, id)
  }

  /**
   * Call before destroying an app.
   */
  destroy(): void {
    this.__cancelAll(DelayCallGlobally.__Queue)
  }
}