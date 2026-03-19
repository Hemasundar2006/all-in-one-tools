import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { 
  FileText, 
  FileCode, 
  ArrowLeft, 
  Download, 
  Loader2, 
  AlertCircle,
  FileUp,
  RefreshCw,
  CheckCircle2,
  FileDigit,
  Presentation,
  Table,
  Image as ImageIcon,
  Trash2,
  Plus,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'http://localhost:8000'

const CONVERSION_CONFIG = {
  'doc-to-pdf': {
    title: 'Word to PDF',
    inputExt: ['.docx', '.doc'],
    outputExt: '.pdf',
    endpoint: '/doc-to-pdf',
    icon: FileText,
    accent: 'emerald',
    description: 'Transform Word documents into professional PDF files.'
  },
  'pdf-to-doc': {
    title: 'PDF to Word',
    inputExt: ['.pdf'],
    outputExt: '.docx',
    endpoint: '/pdf-to-doc',
    icon: FileCode,
    accent: 'emerald',
    description: 'Convert PDF files back into editable Word documents.'
  },
  'ppt-to-pdf': {
    title: 'PPT to PDF',
    inputExt: ['.pptx', '.ppt'],
    outputExt: '.pdf',
    endpoint: '/ppt-to-pdf',
    icon: Presentation,
    accent: 'emerald',
    description: 'Convert PowerPoint presentations into high-quality PDFs.'
  },
  'excel-to-pdf': {
    title: 'Excel to PDF',
    inputExt: ['.xlsx', '.xls'],
    outputExt: '.pdf',
    endpoint: '/excel-to-pdf',
    icon: Table,
    accent: 'emerald',
    description: 'Save Excel spreadsheets as clean, well-formatted PDF documents.'
  },
  'image-to-pdf': {
    title: 'IMG to PDF',
    inputExt: ['.jpg', '.jpeg', '.png'],
    outputExt: '.pdf',
    endpoint: '/image-to-pdf',
    icon: ImageIcon,
    accent: 'emerald',
    description: 'Convert images into high-resolution PDF assets.'
  },
  'pdf-to-image': {
    title: 'PDF to IMG',
    inputExt: ['.pdf'],
    outputExt: '.jpg',
    endpoint: '/pdf-to-image',
    icon: FileDigit,
    accent: 'emerald',
    description: 'Extract pages from PDF files as high-quality images.'
  }
}

function PDFConverter({ toolId, onBack }) {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const config = CONVERSION_CONFIG[toolId]

  useEffect(() => {
    setFiles([])
    setError(null)
    setSuccess(false)
  }, [toolId])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (!selectedFiles.length) return
    
    const validFiles = selectedFiles.filter(f => 
      config.inputExt.some(ext => f.name.toLowerCase().endsWith(ext))
    )

    if (validFiles.length !== selectedFiles.length) {
      setError(`Some files have invalid formats. Expected ${config.inputExt.join(', ')}`)
    }

    if (config.multi) {
      setFiles(prev => [...prev, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }
    setError(null)
    setSuccess(false)
  }

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const valid = droppedFiles.filter(f => config.inputExt.some(ext => f.name.toLowerCase().endsWith(ext)))
    if (valid.length) {
      if (config.multi) setFiles(prev => [...prev, ...valid])
      else setFiles(valid.slice(0, 1))
      setError(null)
    }
  }

  const handleConvert = async () => {
    if (!files.length) return
    setIsProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      // For now, we handle one by one if not a multi-endpoint
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await axios.post(`${API_BASE_URL}${config.endpoint}`, formData, {
          responseType: 'blob',
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const outputName = file.name.split('.')[0] + config.outputExt
        link.setAttribute('download', outputName)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      setSuccess(true)
      setIsProcessing(false)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 500 && window.setAllInOneError) {
        window.setAllInOneError(true)
      } else {
        setError("Synthesis failed. Check if local backend is active.")
      }
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-white text-slate-900 pt-6">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 blur-[120px] rounded-full"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl px-2">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors group font-black text-[10px] uppercase tracking-[0.2em] ml-2">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>

        <header className="mb-12 text-center px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-950 border-2 border-emerald-500/30 text-emerald-400 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Conversion Engine v2.0
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900 leading-[1] md:leading-[0.9]">
            {config.title.split(' ')[0]} <span className="text-emerald-600 block sm:inline italic">{config.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-slate-700 font-bold text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            {config.description} Experience zero-cloud, high-fidelity synthesis.
          </p>
        </header>

        <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-2xl border border-slate-100 bg-white/60 backdrop-blur-3xl shadow-emerald-500/5">
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
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
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Drop Assets Here</h3>
                <p className="text-slate-500 font-medium text-xs md:text-sm">Ready for local synthesis</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={config.inputExt.join(',')} multiple={config.multi} className="hidden" />
              </motion.div>
            ) : (
              <motion.div key="fileview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, i) => (
                    <div key={i} className="p-6 md:p-8 bg-slate-950 rounded-3xl flex items-center justify-between group shadow-xl">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                           <config.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-sm md:text-base font-black text-white max-w-[150px] md:max-w-md truncate italic">{f.name}</h4>
                          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                             {(f.size / 1024).toFixed(1)} KB • READY
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} disabled={isProcessing} className="p-4 text-slate-400 hover:text-white transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  {config.multi && (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-emerald-100 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add More Files
                    </button>
                  )}

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
                    onClick={handleConvert}
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
                             <Zap className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                          <span className="text-2xl font-black uppercase tracking-[0.4em] animate-pulse italic">Applying Synthesis</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-10 h-10 group-hover:rotate-180 transition-transform duration-700 text-emerald-500" />
                          <span className="text-2xl font-black uppercase tracking-[0.4em] italic group-hover:tracking-[0.6em] transition-all duration-700">Execute Core</span>
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

export default PDFConverter
