import { WheelEvent } from 'react'
import CoordinatesRecognizer from './CoordinatesRecognizer'
import { addV, getWheelEventData } from '../utils'
import GestureController from '../controllers/GestureController'
import { TransformedEvent, ReactEventHandlerKey, Fn } from '../types'

export default class WheelRecognizer extends CoordinatesRecognizer {
  sharedStartState = { wheeling: true }
  sharedEndState = { wheeling: false, velocity: 0, vxvy: [0, 0] }

  constructor(controller: GestureController, args: any[]) {
    super('wheel', controller, args)
  }

  getPayloadFromEvent(event: TransformedEvent<WheelEvent>) {
    const { xy: prevXY } = this.state
    const { xy, ...sharedPayload } = getWheelEventData(event)
    const values = addV(xy, prevXY)

    return { values, sharedPayload }
  }

  onWheel = (event: TransformedEvent<WheelEvent>): void => {
    if (!this.enabled) return
    if (event.ctrlKey && this.controller.actions.has('onPinch')) return

    this.clearTimeout()
    this.setTimeout(this.onEnd)

    if (!this.state.active) this.onStart(event)
    else this.onChange(event)
  }

  getEventBindings(): [ReactEventHandlerKey | ReactEventHandlerKey[], Fn][] {
    return [['onWheel', this.onWheel]]
  }
}
