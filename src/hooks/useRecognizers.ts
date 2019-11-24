import React from 'react'
import Controller from '../Controller'
import { InternalConfig, HookReturnType, InternalHandlers, RecognizerClasses } from '../types'

export default function useRecognizers<Config extends Partial<InternalConfig>>(
  handlers: Partial<InternalHandlers>,
  classes: RecognizerClasses,
  config: InternalConfig
): (...args: any[]) => HookReturnType<Config> {
  // the gesture controller will keep track of all gesture states
  const controller = React.useRef<Controller>()

  if (!controller.current) {
    // we initialize the gesture controller once
    controller.current = new Controller()
  }

  controller.current!.config = config
  controller.current!.handlers = handlers

  // when the user component unmounts, we run our gesture controller clean function
  React.useEffect(() => controller.current!.clean, [])

  const [bind] = React.useState(() => (...args: any[]) => {
    controller.current!.resetBindings()
    classes.forEach(RecognizerClass => {
      const recognizer = new RecognizerClass(controller.current!, args)
      recognizer.addBindings()
    })

    return controller.current!.getBind() as HookReturnType<Config>
  })

  // we return the bind function of our controller, which returns an binding object or
  // a cleaning function depending on whether config.domTarget is set
  return bind
}
