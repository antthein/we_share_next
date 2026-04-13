'use client'

import { useEffect, useState } from 'react'

let showToastFn: (msg: string) => void = () => {}

export function showToast(msg: string) {
  showToastFn(msg)
}

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg)
      setVisible(true)
      setTimeout(() => setVisible(false), 3200)
    }
  }, [])

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {message}
    </div>
  )
}
