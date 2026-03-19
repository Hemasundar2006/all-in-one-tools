import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Files, 
  LayoutGrid, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  Database,
  FileJson,
  FileCode,
  FileText,
  Image as ImageIcon,
  Workflow,
  ChevronDown,
  FileUp,
  FileDigit,
  Table,
  Presentation,
  Globe,
  FileMinus,
  Maximize,
  Grid,
  Menu,
  X,
  Monitor
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CSVMerger from './CSVMerger'
import PDFConverter from './PDFConverter'
import ImageProcessor from './ImageProcessor'
import PDFCompressor from './PDFCompressor'

const TOOLS = [
  {
    id: 'csv-merger',
    title: 'CSV Merger Hub',
    description: 'Merge thousands of CSV files and folders into a clean master dataset.',
    icon: Database,
    color: 'emerald',
    status: 'active',
    category: 'Data Extraction'
  },
  {
    id: 'image-processor',
    title: 'Ultra Compress',
    description: 'AI-powered image resizing and smart compression with target KB limits.',
    icon: Maximize,
    color: 'emerald',
    status: 'active',
    category: 'Optimization'
  },
  {
    id: 'pdf-compressor',
    title: 'PDF Slimmer',
    description: 'Reduce PDF file size by up to 90% without losing visual clarity.',
    icon: FileMinus,
    color: 'emerald',
    status: 'active',
    category: 'Optimization'
  },
  {
    id: 'doc-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Word documents to high-quality PDF files.',
    icon: FileText,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  },
  {
    id: 'pdf-to-doc',
    title: 'PDF to Word',
    description: 'Deconstruct PDF documents back into editable Word files.',
    icon: FileCode,
    color: 'emerald',
    status: 'active',
    category: 'Extraction'
  },
  {
    id: 'ppt-to-pdf',
    title: 'PPT to PDF',
    description: 'Transform PowerPoint presentations into professional PDFs.',
    icon: Presentation,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Save Excel spreadsheets as clean, well-formatted PDF documents.',
    icon: Table,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  },
  {
    id: 'image-to-pdf',
    title: 'IMG to PDF',
    description: 'Convert JPG/PNG images into a combined PDF document.',
    icon: ImageIcon,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to IMG',
    description: 'Extract pages from PDF files as high-resolution images.',
    icon: ImageIcon,
    color: 'emerald',
    status: 'active',
    category: 'Extraction'
  },
  {
    id: 'ppt-to-images',
    title: 'PPT to IMG',
    description: 'Convert PowerPoint slides into high-resolution JPG images.',
    icon: ImageIcon,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  },
  {
    id: 'images-to-ppt',
    title: 'IMG to PPT',
    description: 'Create individual slides from a batch of images.',
    icon: Grid,
    color: 'emerald',
    status: 'active',
    category: 'Creative'
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PPT',
    description: 'Transform PDF pages into a PowerPoint presentation.',
    icon: Presentation,
    color: 'emerald',
    status: 'active',
    category: 'Conversion'
  }
]

const MENU_CATEGORIES = [
  {
    name: 'Optimization',
    tools: ['image-processor', 'pdf-compressor']
  },
  {
    name: 'PDF Suite',
    tools: ['doc-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'image-to-pdf']
  },
  {
    name: 'PPT Suite',
    tools: ['ppt-to-images', 'images-to-ppt', 'pdf-to-ppt']
  },
  {
    name: 'Extraction',
    tools: ['pdf-to-doc', 'pdf-to-image', 'csv-merger']
  }
]

function App() {
  const [activeTool, setActiveTool] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [globalError, setGlobalError] = useState(false)
  
  // Expose error handler to children (simplified global bus)
  useEffect(() => {
    window.setAllInOneError = (val) => setGlobalError(val)
    return () => delete window.setAllInOneError
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen || globalError) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileMenuOpen, globalError])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent browser from navigating to files on drop globally
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault()
    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  const handleToolSelect = (id) => {
    setActiveTool(id)
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogoClick = () => {
    setActiveTool(null)
    setIsMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800', // darker for better visibility
      icon: 'text-emerald-500',
      glow: 'group-hover:bg-emerald-100/50'
    }
  }

  const filteredTools = TOOLS.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'csv-merger': return <CSVMerger onBack={() => setActiveTool(null)} />
      case 'image-processor': return <ImageProcessor onBack={() => setActiveTool(null)} />
      case 'pdf-compressor': return <PDFCompressor onBack={() => setActiveTool(null)} />
      default:
        // Use PDFConverter for all others - its internal gate will handle missing configs
        return <PDFConverter toolId={activeTool} onBack={() => setActiveTool(null)} />
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 font-sans overflow-x-hidden">
      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full"
            >
              <div className="w-full h-48 rounded-[3.5rem] mb-12 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200">
                <AlertCircle className="w-16 h-16 text-slate-300" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-4">Core Engine Offline</h2>
              <p className="text-slate-500 font-bold text-lg mb-12">The synthesis core is in deep sleep. We've notified the architecture team.</p>
              
              <button 
                onClick={() => {
                   setGlobalError(false)
                   setActiveTool(null)
                }}
                className="px-12 py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
              >
                Re-Initialize Hub
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[100%] md:w-[40%] h-[40%] bg-emerald-100/30 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[100%] md:w-[40%] h-[40%] bg-blue-50/30 blur-[150px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Persistent Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled || activeTool || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-2xl border-b border-black/5 py-3 md:py-4 shadow-sm' : 'bg-transparent py-6 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={handleLogoClick}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transform group-hover:rotate-12 transition-all duration-500">
              <Workflow className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 block -mb-1 uppercase">
                ALL<span className="text-emerald-600">INONE</span>
              </span>
              <span className="text-[8px] md:text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">Tool Hub</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            <div 
              className="relative group"
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-emerald-700 transition-colors uppercase tracking-widest py-4">
                All Tools
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-[-200px] w-[900px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-100 p-10 grid grid-cols-4 gap-8 overflow-hidden origin-top"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                    {MENU_CATEGORIES.map((cat, idx) => (
                      <div key={idx} className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat.name}</h4>
                        <div className="space-y-4">
                          {cat.tools.map(toolId => {
                            const tool = TOOLS.find(t => t.id === toolId)
                            if (!tool) return null
                            return (
                              <button 
                                key={toolId}
                                onClick={() => handleToolSelect(toolId)}
                                className="flex items-center gap-3 w-full group/item text-left"
                              >
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all shadow-sm">
                                  <tool.icon className="w-4 h-4" />
                                </div>
                                <span className="text-[12px] font-bold text-slate-600 group-hover/item:text-emerald-600 transition-colors tracking-tight">{tool.title}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-600 transition-colors">Resources</a>
              <button className="px-7 py-3.5 bg-slate-900 text-white rounded-full font-black hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200">
                Sign In
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-100 overflow-y-auto max-h-[85vh] custom-scrollbar"
            >
              <div className="p-6 space-y-10">
                {MENU_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{cat.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {cat.tools.map(toolId => {
                         const tool = TOOLS.find(t => t.id === toolId)
                         return (
                           <button 
                             key={toolId}
                             onClick={() => handleToolSelect(toolId)}
                             className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 active:bg-emerald-50 active:border-emerald-200 transition-all text-left"
                           >
                              <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-sm">
                                <tool.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-700">{tool.title}</span>
                           </button>
                         )
                       })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="pt-20 md:pt-32">
        <AnimatePresence mode="wait">
          {activeTool ? (
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderActiveTool()}
            </motion.div>
          ) : (
            <motion.main 
              key="hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-20 px-4 md:px-8"
            >
              <div className="max-w-7xl mx-auto px-4">
                {/* Cinema Hero Section */}
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1, 
                      transition: { staggerChildren: 0.12, delayChildren: 0.2 } 
                    }
                  }}
                  className="text-center mb-24 md:mb-40 relative pt-16 md:pt-24"
                >
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-slate-950 border-2 border-emerald-500/30 text-emerald-400 text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mb-12 shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse"></div>
                    Local Core Synthesis Engine v2.0
                  </motion.div>
                  
                  <motion.h1 
                    variants={{
                      hidden: { opacity: 0, y: 40 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="text-5xl sm:text-8xl md:text-[10rem] font-black mb-10 md:mb-16 tracking-tighter text-slate-900 leading-[0.95] sm:leading-[0.8] md:leading-[0.75] px-4 uppercase"
                  >
                    ULTRA <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-clip-text text-transparent italic drop-shadow-[0_10px_10px_rgba(16,185,129,0.1)]">
                       MODULAR
                    </span>
                  </motion.h1>

                  {/* High-End Search Interface */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="relative max-w-3xl mx-auto group mt-24"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3.5rem] blur-2xl opacity-10 group-focus-within:opacity-30 transition-opacity duration-700"></div>
                    <div className="relative glass-card-dark bg-white/40 backdrop-blur-3xl border-2 border-slate-100 rounded-[3rem] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.05)] transition-all duration-500 group-focus-within:border-emerald-200">
                      <div className="flex items-center">
                        <div className="w-20 h-20 flex items-center justify-center">
                           <Search className="h-8 w-8 text-slate-900 group-focus-within:text-emerald-500 group-focus-within:scale-110 transition-all duration-500" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search the synthesis core..."
                          className="flex-1 bg-transparent border-none py-6 text-2xl md:text-3xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                        />
                        <div className="hidden md:flex items-center gap-3 pr-8">
                           <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">CMD + K</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Tools Grid - Layered Synthesis Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 pb-32">
                  {filteredTools.map((tool, index) => {
                    const colors = colorClasses[tool.color || 'emerald']
                    return (
                      <motion.article
                        key={tool.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -20, scale: 1.02 }}
                        onClick={() => tool.status === 'active' && handleToolSelect(tool.id)}
                        className={`group relative leading-none rounded-[3.5rem] bg-white border-2 border-slate-50 transition-all duration-700 cursor-pointer overflow-hidden ${tool.status !== 'active' ? 'opacity-40 grayscale pointer-events-none' : 'hover:shadow-[0_80px_120px_rgba(16,185,129,0.12)]'}`}
                      >
                        {/* Background Identity Element */}
                        <div className={`absolute -right-20 -top-20 w-80 h-80 ${colors.bg} blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700`}></div>
                        
                        <div className="p-12 md:p-16 relative z-10 h-full flex flex-col">
                           <div className="flex items-center justify-between mb-16">
                              <motion.div 
                                whileHover={{ rotate: -10, scale: 1.15 }}
                                className="w-24 h-24 rounded-[2.5rem] bg-slate-900 border-4 border-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center justify-center text-white transition-all duration-500 group-hover:bg-emerald-600 group-hover:shadow-emerald-500/40"
                              >
                                <tool.icon className="w-10 h-10" />
                              </motion.div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-emerald-500 transition-colors mb-2">MODE</span>
                                 <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900">{tool.status}</span>
                              </div>
                           </div>
                           
                           <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 text-emerald-600 leading-none">IDENTITY: {tool.category}</p>
                           <h3 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 leading-[0.9] tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500">{tool.title}</h3>
                           <p className="text-slate-600 text-base leading-relaxed mb-12 font-bold pr-4">
                              {tool.description}
                           </p>
                           
                           <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-4 text-[13px] font-black uppercase tracking-[0.2em] text-slate-900 overflow-hidden">
                                 <span className="relative z-10">Launch Process</span>
                                 <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-all duration-500 text-emerald-600" />
                              </div>
                              <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors duration-500">
                                 <Zap className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 fill-transparent group-hover:fill-emerald-500/20 transition-all" />
                              </div>
                           </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
                
                {/* Stats section */}
                <div className="pt-24 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 text-center">
                   <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto shadow-sm group hover:scale-110 transition-transform">
                         <Zap className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Warp Speed</h4>
                      <p className="text-slate-500 font-medium leading-relaxed px-6">Processing gigabytes of data in milliseconds using localized synthesis engines.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto shadow-sm">
                         <Shield className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Cold Isolation</h4>
                      <p className="text-slate-500 font-medium leading-relaxed px-6">Your identity and assets never touch the cloud. Total privacy, guaranteed.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto shadow-sm">
                         <LayoutGrid className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Mega Hub</h4>
                      <p className="text-slate-500 font-medium leading-relaxed px-6">One unified interface for every file transformation need in your workflow.</p>
                   </div>
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-slate-100 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-12 text-center">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-3 mb-6">
                <Workflow className="w-8 h-8 text-emerald-600" />
                <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">ALLINONE</span>
             </div>
             <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">The architectural standard for local data transformation and high-fidelity extraction hubs.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Network</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Security</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">OSINT</a>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest pt-10">
            Designed and Developed by <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent font-black drop-shadow-sm brightness-110">HEMASUNDAR MAROTI</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
