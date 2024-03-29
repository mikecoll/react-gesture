import React from 'react'
import { useSpring, animated } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styles from './styles.css'

// document.addEventListener('gesturestart', e => e.preventDefault())
// document.addEventListener('gesturechange', e => e.preventDefault())

export default function Pinch() {
  const [style, set] = useSpring(() => ({ x: 0, y: 0, rotateZ: 0, scale: 1 }))
  const domTarget = React.useRef(null)

  useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        set({ x, y })
      },
      onPinch: ({ offset: [d, a] }) => {
        set({ scale: 1 + d / 200, rotateZ: a })
      },
    },
    { domTarget: domTarget }
  )

  return (
    <div className={`${styles.simple} flex`}>
      <animated.div id="one" ref={domTarget} style={style} />
    </div>
  )
}
