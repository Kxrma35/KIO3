import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { XMarkIcon } from '@heroicons/react/24/outline'
import './barcodescanner.css'

function BarcodeScanner({ onResult, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    readerRef.current = codeReader

    codeReader.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
      if (result && scanning) {
        setScanning(false)
        const barcode = result.getText()

        try {
          const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
          const data = await res.json()

          if (data.status === 1) {
            const product = data.product
            const nutriments = product.nutriments || {}
            onResult({
              name: product.product_name || 'Unknown Product',
              calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
              protein: Math.round(nutriments['proteins_100g'] || nutriments.proteins || 0)
            })
          } else {
            setError('Product not found. Try entering manually.')
            setScanning(true)
          }
        } catch (e) {
          setError('Could not fetch product info. Try again.')
          setScanning(true)
        }
      }
    })

    return () => {
      codeReader.reset()
    }
  }, [])

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-card" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-header">
          <h3>Scan Barcode</h3>
          <button className="scanner-close" onClick={onClose}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="scanner-viewport">
          <video ref={videoRef} className="scanner-video" />
          <div className="scanner-frame">
            <div className="scanner-line"></div>
          </div>
        </div>

        <p className="scanner-hint">
          {error ? error : scanning ? 'Point your camera at a barcode' : 'Fetching product info...'}
        </p>
      </div>
    </div>
  )
}

export default BarcodeScanner