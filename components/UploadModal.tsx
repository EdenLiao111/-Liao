import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { PortfolioItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (item: PortfolioItem, file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);

      if (selectedFile.type.startsWith('image/')) {
        setFileType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !fileType || !preview) return;

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      type: fileType,
      url: preview, // Note: This URL is transient, but DB will store the blob
      title,
      description,
      timestamp: Date.now(),
    };

    onUpload(newItem, file);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPreview(null);
    setFileType(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-black border border-[#9D00FF]/30 shadow-[0_0_50px_rgba(157,0,255,0.1)] rounded-sm relative animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-900">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            <span className="text-[#9D00FF]">New</span> Entry
          </h2>
          <button 
            onClick={handleClose} 
            className="text-zinc-500 hover:text-[#00CCFF] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* File Upload Area */}
          <div 
            className={`border border-dashed rounded-sm h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
              preview 
                ? 'border-[#00CCFF]/50 bg-black' 
                : 'border-zinc-800 hover:border-[#9D00FF] hover:bg-zinc-900'
            }`}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
             {preview ? (
               <div className="relative w-full h-full p-2 flex items-center justify-center">
                 {fileType === 'image' ? (
                   <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                 ) : (
                   <video src={preview} className="max-w-full max-h-full object-contain" />
                 )}
                 <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setFileType(null);
                    }}
                    className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:text-red-500 transition"
                 >
                   <X size={16} />
                 </button>
               </div>
             ) : (
               <>
                 <div className="p-4 rounded-full bg-zinc-900 group-hover:bg-[#9D00FF]/20 transition-colors mb-3">
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-[#9D00FF]" />
                 </div>
                 <p className="text-sm text-zinc-400 font-light tracking-wider">CLICK TO UPLOAD ASSET</p>
               </>
             )}
             <input 
               ref={fileInputRef}
               type="file" 
               accept="image/*,video/*" 
               className="hidden" 
               onChange={handleFileChange}
             />
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            <div className="relative group">
              <label htmlFor="title" className="block text-[10px] font-bold text-[#00CCFF] mb-2 uppercase tracking-[0.2em]">Work Title *</label>
              <input 
                type="text" 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-800 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-[#00CCFF] transition-colors font-light text-lg"
                placeholder="ENTER TITLE..."
                required
              />
            </div>

            <div className="relative group">
              <label htmlFor="description" className="block text-[10px] font-bold text-[#9D00FF] mb-2 uppercase tracking-[0.2em]">Description (Optional)</label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-transparent border-b border-zinc-800 py-2 text-white placeholder-zinc-800 focus:outline-none focus:border-[#9D00FF] transition-colors font-light text-sm resize-none"
                placeholder="ENTER CONTEXT..."
              />
            </div>
          </div>

          {/* Footer */}
          <button 
            type="submit"
            disabled={!file || !title}
            className={`w-full py-4 mt-4 font-bold tracking-widest uppercase text-sm transition-all duration-300 ${
              !file || !title 
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-[#00CCFF] hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }`}
          >
            Confirm Upload
          </button>

        </form>
      </div>
    </div>
  );
};

export default UploadModal;