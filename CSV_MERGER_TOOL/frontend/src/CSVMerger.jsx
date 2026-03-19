import React, { useState, useRef } from 'react'
import axios from 'axios'
import { 
  Database, 
  ArrowLeft, 
  Upload, 
  Loader2, 
  AlertCircle,
  FileText,
  Trash2,
  FolderOpen,
  CheckCircle2,
  Table
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE_URL = 'http://localhost:8000'

function CSVMerger({ onBack }) {
  const [files, setFiles] = useState([])
  const [isMerging, setIsMerging] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.csv'))
    if (newFiles.length < Array.from(e.target.files).length) {
      setError("Some non-CSV files were rejected.")
    } else {
      setError(null)
    }
    setFiles(prev => [...prev, ...newFiles])
    setSuccess(false)
  }

  const handleMerge = async () => {
    if (files.length === 0) return
    setIsMerging(true)
    setError(null)
    setSuccess(false)
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    try {
      const response = await axios.post(`${API_BASE_URL}/merge-csv`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'merged_data.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSuccess(true)
      setIsMerging(false)
    } catch (err) {
      console.error(err)
      setError("Merging failed. Please ensure files are not corrupted and backend is active.")
      setIsMerging(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-white text-slate-900 pt-6">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-50 blur-[120px] rounded-full"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl px-2 pb-20">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors group font-black text-[10px] uppercase tracking-[0.2em] ml-2">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>

        <header className="mb-12 text-center px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
            <Database className="w-4 h-4" />
            CSV Synthesis Engine
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-slate-900 leading-[1] md:leading-[0.9]">
            CSV <span className="text-emerald-600 block sm:inline italic">Merger</span> Suite
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            Consolidate thousands of datasets into a unified spreadsheet instantly. High-fidelity local processing.
          </p>
        </header>

        <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-14 shadow-2xl border border-slate-100 bg-white/60 backdrop-blur-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center py-10 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 hover:bg-emerald-50/20 hover:border-emerald-200 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform"><FileText className="w-7 h-7 text-emerald-600" /></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">Add CSV Files</span>
            </button>
            <button onClick={() => folderInputRef.current?.click()} className="flex flex-col items-center justify-center py-10 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 hover:bg-emerald-50/20 hover:border-emerald-200 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform"><FolderOpen className="w-7 h-7 text-emerald-600" /></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">Add Folders</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" multiple className="hidden" />
            <input type="file" ref={folderInputRef} onChange={handleFileChange} webkitdirectory="true" directory="true" className="hidden" />
          </div>

          <AnimatePresence mode="wait">
            {files.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, i) => (
                    <div key={i} className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Table className="w-5 h-5 text-emerald-500" /></div>
                        <div>
                           <h4 className="text-xs font-black text-slate-700 max-w-[150px] md:max-w-md truncate italic">{f.name}</h4>
                           <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{(f.size/1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  {error && <div className="p-5 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3"><AlertCircle className="w-4 h-4" /> {error}</div>}
                  {success && <div className="p-5 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-emerald-100 flex items-center gap-3"><CheckCircle2 className="w-4 h-4" /> Dataset Synthesis Successful</div>}
                  
                  <button onClick={handleMerge} disabled={isMerging} className="w-full py-6 md:py-8 bg-slate-900 hover:bg-black text-white rounded-3xl font-black text-xl uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all">
                    {isMerging ? <Loader2 className="w-8 h-8 animate-spin" /> : <Database className="w-8 h-8" />}
                    Execute Merge
                  </button>
                  
                  <button onClick={() => setFiles([])} className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors">Clear All Objects</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default CSVMerger
