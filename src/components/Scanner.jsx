import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef } from 'react'

export default function Scanner({ onScan }){
  const ref = useRef(null)
  useEffect(()=>{
    const reader = new BrowserMultiFormatReader()
    reader.decodeFromVideoDevice(null, ref.current, (result) => {
      if(result){ onScan(result.getText()) }
    })
    return () => reader.reset()
  },[onScan])
  return <video ref={ref} style={{width:'100%', borderRadius:8}} />
}