import React from 'react'
import { useGesture, useDrag } from '../../src/index'
import { Common } from './Common'

interface Props {
  args1: any
  args2: any
}

// TODO fix @ts-ignore

export const BindProps: React.FunctionComponent<Props> = ({ args1 = [], args2 = [] }) => {
  const [state, set] = React.useState({})
  const bind = useDrag(({ event, cancel, ...rest }) => void set(rest))

  return (
    <>
      <Common
        listeners={{
          // @ts-ignore
          ...bind(...args1),
        }}
        state={state}
        testKey="drag"
      />
      <Common
        listeners={{
          // @ts-ignore
          ...bind(...args2),
        }}
        state={state}
        testKey="2-drag"
      />
    </>
  )
}

export const GenuineHandlers: React.FunctionComponent<{ args: string }> = ({ args = '' }) => {
  const [state, set] = React.useState({})
  const [state2, set2] = React.useState('mouse not down')
  const [state3, set3] = React.useState('not clicked')

  const bind = useGesture({
    onDrag: ({ event, cancel, ...rest }) => void set(rest),
    onMouseDown: ({ args }) => set2('mouse down ' + args[0]),
    onClick: ({ args }) => set3('clicked ' + args[0]),
  })

  return (
    // @ts-ignore
    <Common listeners={{ ...bind(args) }} state={state} testKey="drag">
      <div data-testid={`mouseDown`}>{state2}</div>
      <div data-testid={`click`}>{state3}</div>
    </Common>
  )
}
