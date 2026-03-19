import React, { useState, useRef } from 'react'
import axios from 'axios'
import { 
  ArrowLeft, 
  Download, 
  AlertCircle,
  FileMinus,
  CheckCircle2,
  FileUp,
  Files,
  RefreshCw,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'https://all-in-one-tools-iz5e.onrender.com'

function PDFCompressor({ onBack }) {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('preset') // 'preset' or 'precision'
  const [level, setLevel] = useState('medium')
  const [targetVal, setTargetVal] = useState('')
  const [targetUnit, setTargetUnit] = useState('kb')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    if (!selectedFile.name.endsWith('.pdf')) {
      setError("Please select a valid PDF file")
      return
    }
    setFile(selectedFile)
    setError(null)
    setSuccess(false)
  }

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.pdf')) {
        setFile(droppedFile)
        setError(null)
        setSuccess(false)
    }
  }

  const handleDownload = async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData()
    formData.append('file', file)
    
    if (mode === 'precision' && targetVal) {
      const kbValue = targetUnit === 'mb' ? parseFloat(targetVal) * 1024 : parseFloat(targetVal)
      formData.append('target_kb', Math.round(kbValue))
    } else {
      formData.append('level', level)
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/compress-pdf`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `optimized_${file.name}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSuccess(true)
      setIsProcessing(false)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 500 && window.setAllInOneError) {
        window.setAllInOneError(true)
      } else {
        setError("Compression failed. Ensure PDF is not corrupted.")
      }
      setIsProcessing(false)
    }
  }

  const levels = [
    { id: 'fast', label: 'Fast', desc: 'Light cleanup' },
    { id: 'medium', label: 'Balanced', desc: 'Standard' },
    { id: 'extreme', label: 'Extreme', desc: 'Max Shrink' }
  ]

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-white text-slate-900 pt-6 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 blur-[120px] rounded-full"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl px-2">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors group font-black text-[10px] uppercase tracking-[0.2em] ml-2">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>

        <header className="mb-12 text-center px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-950 border-2 border-emerald-500/30 text-emerald-400 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm px-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            PDF Precision Slimmer v2.2
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900 leading-[1] md:leading-[0.9] px-4">
            Target <span className="text-emerald-600 block sm:inline italic">Compression</span>
          </h1>
          <p className="text-slate-700 font-bold text-sm md:text-lg max-w-xl mx-auto leading-relaxed px-6">
             Secure, local-first synthesis for asset optimization. Set your target size or use a high-fidelity preset.
          </p>
        </header>

        <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-2xl border border-slate-100 bg-white/60 backdrop-blur-3xl shadow-emerald-500/5">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver} onDrop={handleDrop}
                className="py-16 md:py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] cursor-pointer bg-slate-50/50 hover:bg-emerald-50/10 transition-all group"
              >
                <div className="bg-white w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg border border-slate-50">
                  <FileUp className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Drop Asset Here</h3>
                <p className="text-slate-500 font-medium text-xs md:text-sm">Ready for precision synthesis</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
              </motion.div>
            ) : (
              <motion.div key="fileview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="p-8 bg-slate-950 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 group shadow-2xl shadow-slate-200">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                       <Files className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm md:text-base font-black text-white truncate italic">{file.name}</h4>
                      <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                         {(file.size / 1024 / 1024).toFixed(2)} MB • READY
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} disabled={isProcessing} className="p-4 text-slate-400 hover:text-white transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-Navigation for Mode */}
                <div className="flex flex-col sm:flex-row bg-slate-50 p-2 rounded-3xl border border-slate-100 gap-2">
                   <button 
                    onClick={() => setMode('preset')}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'preset' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                    Synthesis Presets
                   </button>
                   <button 
                    onClick={() => setMode('precision')}
                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'precision' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                    Precision Target
                   </button>
                </div>

                {/* Mode Specific UI */}
                <div className="space-y-6">
                   {mode === 'preset' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
                        {levels.map(l => (
                           <button
                             key={l.id}
                             onClick={() => setLevel(l.id)}
                             className={`p-8 md:p-6 rounded-[2rem] md:rounded-2xl border-2 transition-all text-left ${level === l.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200' : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'}`}
                           >
                              <p className="text-[10px] font-black uppercase tracking-widest mb-1">{l.label}</p>
                              <p className="text-[11px] md:text-[9px] font-bold opacity-60 leading-tight">{l.desc}</p>
                           </button>
                        ))}
                      </div>
                   ) : (
                      <div className="space-y-6">
                         <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-[2] relative group">
                               <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                               <input 
                                 type="number" 
                                 value={targetVal}
                                 onChange={(e) => setTargetVal(e.target.value)}
                                 placeholder="Target"
                                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-6 pl-14 pr-4 font-black text-2xl text-slate-900 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all placeholder:text-slate-300"
                               />
                            </div>
                            <div className="flex flex-1 bg-slate-100 p-2 rounded-[2rem] gap-2 min-h-[72px]">
                               {['kb', 'mb'].map(unit => (
                                 <button
                                   key={unit}
                                   onClick={() => setTargetUnit(unit)}
                                   className={`flex-1 flex items-center justify-center rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${targetUnit === unit ? 'bg-white text-slate-900 shadow-xl shadow-slate-200 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                   {unit}
                                 </button>
                               ))}
                            </div>
                         </div>
                         <p className="text-[10px] md:text-[11px] font-bold text-slate-500 px-2 uppercase tracking-[0.2em] leading-relaxed">
                            <span className="text-emerald-600 font-black">Synthesis Core</span> will attempt to reach this objective via structural trimming.
                         </p>
                      </div>
                   )}
                </div>

                <div className="flex flex-col gap-4">
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
                    disabled={isProcessing}
                    className="w-full relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative py-8 md:py-10 bg-slate-900 leading-none rounded-[3rem] flex items-center justify-center gap-6 text-white overflow-hidden transition-all duration-500">
                      {isProcessing ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 animate-pulse"></div>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="relative w-12 h-12 flex items-center justify-center">
                             <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full"></div>
                             <FileMinus className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                          <span className="text-2xl font-black uppercase tracking-[0.4em] animate-pulse italic">Applying Synthesis</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default PDFCompressor
