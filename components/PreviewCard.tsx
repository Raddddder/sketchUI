import React, { useState } from 'react';
import { GeneratedComponent } from '../types';
import { Code, Image as ImageIcon, Copy, Check } from 'lucide-react';

interface PreviewCardProps {
  data: GeneratedComponent;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'code'>('image');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mt-8 transition-all">
      <div className="bg-gray-100 border-b-4 border-black p-4 flex justify-between items-center">
        <h3 className="font-marker text-xl truncate pr-4">Result: {data.prompt}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3 py-1 rounded border-2 border-black font-bold transition-all ${activeTab === 'image' ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
          >
            <ImageIcon size={16} /> Image
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1 rounded border-2 border-black font-bold transition-all ${activeTab === 'code' ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
          >
            <Code size={16} /> Code
          </button>
        </div>
      </div>

      <div className="p-6 min-h-[400px] flex items-center justify-center bg-paper">
        {activeTab === 'image' ? (
          <div className="relative group">
            <img 
              src={data.imageUrl} 
              alt="Generated UI Design" 
              className="max-w-full h-auto max-h-[500px] rounded border-2 border-dashed border-gray-300 shadow-sm"
            />
            <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity pb-4">
                <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-hand">Gemini 2.5 Flash Image</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-[500px] relative">
            <textarea
              readOnly
              value={data.code}
              className="w-full h-full p-4 font-mono text-sm bg-gray-800 text-green-400 rounded-lg resize-none focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 bg-white border-2 border-black p-2 rounded hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              title="Copy Code"
            >
              {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;