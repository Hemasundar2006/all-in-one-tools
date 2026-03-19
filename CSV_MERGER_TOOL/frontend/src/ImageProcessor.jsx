import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { 
  ArrowLeft, 
  Download, 
  Loader2, 
  AlertCircle,
  FileImage,
  Image as ImageIcon,
  Maximize,
  RefreshCw,
  FileDigit,
  Ruler,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'https://all-in-one-tools-iz5e.onrender.com'

const UNITS = ['PX', 'INCH', 'CM', 'MM']
const DPI = 96
const CM_TO_PX = 37.7952755906
const MM_TO_PX = 3.77952755906

function ImageProcessor({ onBack }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [unit, setUnit] = useState('PX')
  const [widthPx, setWidthPx] = useState('')
  const [heightPx, setHeightPx] = useState('')
  const [displayW, setDisplayW] = useState('')
  const [displayH, setDisplayH] = useState('')
  const [format, setFormat] = useState('JPG')
  const [targetKb, setTargetKb] = useState('500')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!widthPx) return
    setDisplayW(convertFromPx(widthPx, unit))
    setDisplayH(convertFromPx(heightPx, unit))
  }, [unit])

  const convertToPx = (val, fromUnit) => {
    const num = parseFloat(val) || 0
    if (fromUnit === 'PX') return Math.round(num)
    if (fromUnit === 'INCH') return Math.round(num * DPI)
    if (fromUnit === 'CM') return Math.round(num * CM_TO_PX)
    if (fromUnit === 'MM') return Math.round(num * MM_TO_PX)
    return num
  }

  const convertFromPx = (val, toUnit) => {
    const num = parseFloat(val) || 0
    if (toUnit === 'PX') return num.toString()
    if (toUnit === 'INCH') return (num / DPI).toFixed(3)
    if (toUnit === 'CM') return (num / CM_TO_PX).toFixed(2)
    if (toUnit === 'MM') return (num / MM_TO_PX).toFixed(1)
    return num.toString()
  }

  const handleWidthChange = (val) => {
    setDisplayW(val)
    const pxValue = convertToPx(val, unit)
    setWidthPx(pxValue)
  }

  const handleHeightChange = (val) => {
    setDisplayH(val)
    const pxValue = convertToPx(val, unit)
    setHeightPx(pxValue)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  const processFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
        setError("Please upload a valid image file")
        return
    }
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setError(null)
    setSuccess(false)
    
    const img = new Image()
    img.onload = () => {
      const originalW = img.width
      const originalH = img.height
      setWidthPx(originalW)
      setHeightPx(originalH)
      setDisplayW(convertFromPx(originalW, unit))
      setDisplayH(convertFromPx(originalH, unit))
    }
    img.src = URL.createObjectURL(selectedFile)
  }

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) processFile(droppedFile)
  }

  const handleDownload = async () => {
    if (!file || !widthPx || !heightPx) return
    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('width', widthPx)
    formData.append('height', heightPx)
    formData.append('format', format)
    formData.append('target_kb', targetKb)

    try {
      const response = await axios.post(`${API_BASE_URL}/resize`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `compressed_${file.name.split('.')[0]}.${format.toLowerCase()}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSuccess(true)
      setIsProcessing(false)
    } catch (err) {
      console.error(err)
      setError("Processing failed. Please check the backend logs.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-white text-slate-900 pt-6">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl"
      >
        <button onClick={onBack} className="mb-6 md:mb-12 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors group font-black text-[10px] uppercase tracking-[0.2em] ml-2">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>

        <header className="mb-10 md:mb-20 text-center md:text-left px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <Maximize className="w-4 h-4" />
            Vivid Lens Processor
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900 leading-[1] md:leading-[0.9]">
            Ultra <span className="text-emerald-600 block sm:inline italic">Compression</span> Suite
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl">
             Precise local image synthesis with pixel-perfect resolution control and target KB hunting.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-2 md:px-0 pb-20">
          {/* Main Controls */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-slate-100 bg-white/60 backdrop-blur-3xl">
              
              {/* Unit Switcher */}
              <div className="mb-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 ml-2">Resolution Units</p>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl md:rounded-[1.75rem] border border-slate-200">
                  {UNITS.map(u => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black transition-all ${unit === u ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:text-slate-900 uppercase'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Width/Height Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="relative group">
                   <div className="absolute top-4 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Width</div>
                   <input
                     type="text"
                     placeholder="0"
                     value={displayW}
                     onChange={(e) => handleWidthChange(e.target.value)}
                     className="w-full pt-12 pb-5 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black transition-all focus:bg-white focus:border-emerald-300 outline-none shadow-inner"
                   />
                   <div className="absolute top-1/2 -translate-y-1/2 right-6 text-emerald-600 font-black opacity-40 uppercase tracking-widest">{unit}</div>
                </div>
                <div className="relative group">
                   <div className="absolute top-4 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Height</div>
                   <input
                     type="text"
                     placeholder="0"
                     value={displayH}
                     onChange={(e) => handleHeightChange(e.target.value)}
                     className="w-full pt-12 pb-5 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-2xl font-black transition-all focus:bg-white focus:border-emerald-300 outline-none shadow-inner"
                   />
                   <div className="absolute top-1/2 -translate-y-1/2 right-6 text-emerald-600 font-black opacity-40 uppercase tracking-widest">{unit}</div>
                </div>
              </div>

              {/* Format & Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Export Format</p>
                   <div className="flex gap-3">
                      {['JPG', 'PNG'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`flex-1 py-4 border-2 rounded-2xl font-black text-xs transition-all ${format === f ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                          {f === 'JPG' ? 'JPEG' : 'PNG'}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2 flex justify-between">
                     Target Limit
                     <span className="text-emerald-600 font-black">{targetKb} KB</span>
                   </p>
                   <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={targetKb}
                    onChange={(e) => setTargetKb(e.target.value)}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-2"
                   />
                   <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest px-1">
                      <span>Low Res</span>
                      <span>High Fidelity</span>
                   </div>
                </div>
              </div>

                <div className="flex flex-col gap-6 md:gap-4">
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-bold text-[10px] uppercase tracking-widest">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="font-black text-[10px] uppercase tracking-[0.2em]">Synthesis Complete • Optimized Asset Exported</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={handleDownload}
                    disabled={!file || isProcessing}
                    className="w-full relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative py-8 md:py-10 bg-slate-900 leading-none rounded-[2.5rem] flex items-center justify-center gap-6 text-white overflow-hidden transition-all duration-500">
                      {isProcessing ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 animate-pulse"></div>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="relative w-12 h-12 flex items-center justify-center">
                             <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full"></div>
                             <ImageIcon className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                          <span className="text-2xl font-black uppercase tracking-[0.4em] animate-pulse italic">Processing</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-10 h-10 text-emerald-500" />
                          <span className="text-2xl font-black uppercase tracking-[0.4em] italic">Execute Core</span>
                          <div className="absolute right-10 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] group-hover:scale-150 transition-transform"></div>
                        </>
                      )}
                    </div>
                  </button>
                </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="glass-card rounded-[2.5rem] md:rounded-[3rem] h-[350px] md:h-[550px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 bg-slate-50/50 overflow-hidden group relative"
            >
              {!preview ? (
                <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer p-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform border border-slate-50">
                    <FileImage className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">Select Image</h3>
                  <p className="text-slate-400 font-medium text-xs md:text-sm">Or drop it here to begin transformation</p>
                </div>
              ) : (
                <div className="w-full h-full relative p-6 md:p-12 flex items-center justify-center">
                  <div 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: '2rem',
                        background: '#f8fafc'
                    }}
                  >
                    <motion.img 
                        layout
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                            width: unit === 'PX' ? `${widthPx}px` : '100%',
                            height: unit === 'PX' ? `${heightPx}px` : '100%',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }} 
                        className="shadow-2xl"
                    />
                  </div>
                  <div className="absolute inset-x-6 bottom-6 md:inset-x-10 md:bottom-10 flex gap-3">
                     <button onClick={() => setPreview(null)} className="flex-1 py-3 md:py-4 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black shadow-xl hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest text-slate-900">
                        <Trash2 className="w-4 h-4" /> Discard
                     </button>
                     <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 md:py-4 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black shadow-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all uppercase tracking-widest text-slate-900">
                        <RefreshCw className="w-4 h-4" /> Replace
                     </button>
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-700">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-bold text-xs uppercase tracking-widest">{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-4 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <p className="font-black text-xs uppercase tracking-[0.2em] leading-tight">Optimization Complete • High-Fidelity Asset Exported</p>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ImageProcessor
