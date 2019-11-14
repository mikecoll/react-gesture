import { StateKey, StateObject, Fn, ReactEventHandlerKey, ReactEventHandlers, InternalFullConfig, InternalHandlers } from './types'
import { initialState } from './utils/state'
import { addListeners, removeListeners } from './utils/event'
import { chainFns } from './utils/utils'

type GestureTimeouts = Partial<{ [stateKey in StateKey]: number }>
type WindowListeners = Partial<{ [stateKey in StateKey]: [string, Fn][] }>
type Bindings = Partial<{ [eventName in ReactEventHandlerKey]: Fn[] }>

const clone = <T>(arr: T): T =>
  Object.entries(arr).reduce((acc, [name, value]) => {
    // @ts-ignore
    return { ...acc, [name]: { ...arr[name], ...value } }
  }, arr)

/**
 * Gesture controller will create gesture recognizers (which handle the gesture logic)
 * and keep track of the state for all gestures
 *
 * @template BinderType the type the bind function should return
 */
export default class Controller {
  public config!: InternalFullConfig
  public handlers!: Partial<InternalHandlers>
  public state: StateObject = clone(initialState) // state for all gestures
  public timeouts: GestureTimeouts = {} // keeping track of timeouts for debounced gestures (such as move, scroll, wheel)
  private bindings: Bindings = {} // an object holding the handlers associated to the gestures
  private domListeners: [string, Fn][] = [] // when config.domTarget is set, we attach events directly to the dom
  private windowListeners: WindowListeners = {} // keeps track of window listeners added by gestures (drag only at the moment)

  /**
   * Function run on component unmount
   * Cleans timeouts and removes dom listeners set by the bind function
   */
  public clean = (): void => {
    this.resetBindings()
    Object.values(this.timeouts).forEach(clearTimeout)
    Object.keys(this.windowListeners).forEach(stateKey => this.removeWindowListeners(<StateKey>stateKey))
  }

  /**
   * Function run every time the bind function is run (ie on every render)
   * Reset the binding object and remove dom listeners attached to config.domTarget
   */
  public resetBindings = (): void => {
    this.bindings = {}
    const domTarget = this.getDomTarget()
    if (domTarget) {
      removeListeners(domTarget, this.domListeners, this.config.eventOptions)
      this.domListeners = []
    }
  }

  private getDomTarget = () => {
    const { domTarget } = this.config
    return domTarget && 'current' in domTarget ? domTarget.current : domTarget
  }

  /**
   * Commodity function to let recognizers simply add listeners to config.window
   * @param stateKey
   * @param listeners
   */
  public addWindowListeners = (stateKey: StateKey, listeners: [string, Fn][]): void => {
    if (!this.config.window) return
    // we use this.windowListeners to keep track of the listeners we add
    this.windowListeners[stateKey] = listeners
    addListeners(this.config.window, listeners, this.config.eventOptions)
  }

  // commodity function to let recognizers simply remove listeners from config.window
  public removeWindowListeners = (stateKey: StateKey): void => {
    if (!this.config.window) return
    const listeners = this.windowListeners[stateKey]
    if (listeners) {
      removeListeners(this.config.window, listeners, this.config.eventOptions)
      delete this.windowListeners[stateKey]
    }
  }

  /**
   * When config.domTarget is set, this function will add dom listeners to it
   */
  public addDomTargetListeners = (target: EventTarget): void => {
    // we iterate on the entries of this.binding
    // for each event, we chain the array of functions mapped to it
    // and push it to this.domListeners
    Object.entries(this.bindings).forEach(([event, fns]) => {
      this.domListeners.push([event.substr(2).toLowerCase(), chainFns(...(<Fn[]>fns))])
    })

    addListeners(target, this.domListeners, this.config.eventOptions)
  }

  /**
   * this.bindings is an object which keys match ReactEventHandlerKeys (onMouseMove, onTouchStart...).
   * Since a recognizer might want to bind a handler function to an event key already used by a previously
   * added recognizer, we need to make sure that each event key is an array of all the functions mapped for
   * that key.
   */
  public addBindings = (eventNames: ReactEventHandlerKey | ReactEventHandlerKey[], fn: Fn): void => {
    const eventNamesArray = !Array.isArray(eventNames) ? [eventNames] : eventNames
    eventNamesArray.forEach(eventName => {
      if (this.bindings[eventName]) this.bindings[eventName]!.push(fn)
      else this.bindings[eventName] = [fn]
    })
  }

  /**
   * getBindings will return an object that will be bound by users
   * to the react component they want to interact with
   */
  public getBindings = (): ReactEventHandlers => {
    const bindings: ReactEventHandlers = {}
    const { captureString } = this.config

    Object.entries(this.bindings).forEach(([event, fns]) => {
      const fnsArray = Array.isArray(fns) ? fns : [fns]
      const key = (event + captureString) as ReactEventHandlerKey
      bindings[key] = chainFns(...(<Fn[]>fnsArray))
    })

    return bindings
  }

  public getBind = () => {
    const domTarget = this.getDomTarget()
    // if config.domTarget is set we add event listeners to it and return the clean function
    if (domTarget) {
      this.addDomTargetListeners(domTarget)
      return this.clean
    }

    // if not, we return an object that contains gesture handlers mapped to react handler event keys
    return this.getBindings()
  }
}
