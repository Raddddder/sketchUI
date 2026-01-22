import React, { useState } from 'react';
import { GenerationStatus, ArtStyle, VisualAsset, DesignSystem } from './types';
import { planUIKit, generateAssetImage, assembleFullPage } from './services/geminiService';
import StyleSelector from './components/StyleSelector';
import PageView from './components/PageView';
import LoadingState from './components/LoadingState';
import { Wand2, AlertTriangle, Sparkles, Layers, Paintbrush, Download } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.DOODLE);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [assets, setAssets] = useState<VisualAsset[]>([]);
  const [finalHtml, setFinalHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(GenerationStatus.PLANNING);
    setError(null);
    setAssets([]);
    setFinalHtml('');
    setDesignSystem(null);

    try {
      // 1. Plan Ingredients (Gemini 3 Pro)
      const projectPlan = await planUIKit(prompt);
      
      setDesignSystem(projectPlan.designSystem);
      const initialAssets: VisualAsset[] = projectPlan.assets.map(a => ({
        ...a,
        status: 'pending'
      } as VisualAsset));
      
      setAssets(initialAssets);
      setStatus(GenerationStatus.GENERATING_ASSETS);

      // 2. Paint Ingredients (Gemini 2.5 Flash Image) - Parallel
      // We wait for ALL images because the Assembler needs them all to plan the layout.
      const paintedAssets = await Promise.all(initialAssets.map(async (asset) => {
        try {
          // Update status to working
          setAssets(current => current.map(a => a.id === asset.id ? { ...a, status: 'working' } : a));

          const imageUrl = await generateAssetImage(asset, selectedStyle, projectPlan.designSystem);
          
          const completedAsset = { ...asset, imageUrl, status: 'completed' } as VisualAsset;
          
          // Update status to completed
          setAssets(current => current.map(a => a.id === asset.id ? completedAsset : a));
          
          return completedAsset;
        } catch (err) {
          console.error(`Failed asset ${asset.name}`, err);
          return { ...asset, status: 'error' } as VisualAsset;
        }
      }));

      // Filter out failed assets to avoid breaking the page
      const validAssets = paintedAssets.filter(a => a.status === 'completed' && a.imageUrl);

      if (validAssets.length === 0) {
        throw new Error("Failed to generate any visual assets.");
      }

      setStatus(GenerationStatus.ASSEMBLING_PAGE);

      // 3. Assemble the Chef's Dish (Gemini 3 Pro)
      const pageHtml = await assembleFullPage(validAssets, projectPlan.designSystem, prompt);
      
      setFinalHtml(pageHtml);
      setStatus(GenerationStatus.COMPLETED);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during generation.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!finalHtml || !designSystem) return;
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designSystem.themeName.replace(/\s+/g, '_')}_Site.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto font-sans text-ink">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-block relative">
            <h1 className="text-5xl md:text-7xl font-marker mb-2 transform -rotate-2">
            Sketch<span className="text-blue-600">UI</span> <span className="text-gray-400">Gen</span>
            </h1>
            <Sparkles className="absolute -top-4 -right-8 text-yellow-400 w-12 h-12 animate-bounce" />
        </div>
        <p className="text-xl font-hand text-gray-600 mt-2">
          Natural Language &rarr; Artistic Assets &rarr; Full Website
        </p>
      </header>

      {/* Main Layout */}
      <main className="relative z-10 pb-20 grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Controls Column */}
        <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-8 flex flex-col gap-6">
          <form onSubmit={handleGenerate}>
            <label className="block text-xl font-bold mb-3 font-marker">1. Art Style</label>
            <StyleSelector 
              selectedStyle={selectedStyle} 
              onSelect={setSelectedStyle} 
              disabled={status !== GenerationStatus.IDLE && status !== GenerationStatus.COMPLETED && status !== GenerationStatus.ERROR}
            />

            <label className="block text-xl font-bold mb-3 font-marker mt-6">2. Concept</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A digital lemonade stand run by robots. I want lemon textures, metallic buttons, and a sunny vibe."
              className="w-full h-32 p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-black focus:ring-0 focus:outline-none resize-none font-hand transition-colors bg-paper"
              disabled={status !== GenerationStatus.IDLE && status !== GenerationStatus.COMPLETED && status !== GenerationStatus.ERROR}
            />

            <button
              type="submit"
              disabled={!prompt.trim() || (status !== GenerationStatus.IDLE && status !== GenerationStatus.COMPLETED && status !== GenerationStatus.ERROR)}
              className={`
                mt-6 w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-xl border-4 border-transparent hover:border-black hover:bg-blue-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all
                ${(!prompt.trim() || (status !== GenerationStatus.IDLE && status !== GenerationStatus.COMPLETED && status !== GenerationStatus.ERROR)) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {status === GenerationStatus.IDLE || status === GenerationStatus.COMPLETED || status === GenerationStatus.ERROR ? (
                 <><Wand2 size={24} /> Create Website</>
              ) : (
                 <><Layers className="animate-spin" size={24} /> Processing...</>
              )}
            </button>
          </form>

          {/* Asset Gallery (The Ingredients) */}
          {assets.length > 0 && (
            <div className="border-t-2 border-dashed border-gray-300 pt-6">
              <h3 className="font-marker text-lg mb-4 flex items-center gap-2">
                <Paintbrush size={18} /> Generated Assets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="relative aspect-square bg-gray-100 rounded border border-gray-300 overflow-hidden group">
                    {asset.status === 'completed' && asset.imageUrl ? (
                      <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                      {asset.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="flex flex-col min-h-[600px]">
          
          {/* Status Messages */}
          <div className="mb-4">
             {status === GenerationStatus.ERROR && (
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded">
                  <AlertTriangle size={24} />
                  <p className="font-bold">{error}</p>
                </div>
              )}
             <LoadingState status={status} />
          </div>

          {/* Final Result */}
          {finalHtml && status === GenerationStatus.COMPLETED && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-black shadow-sm">
                <span className="font-marker text-xl">🚀 Final Website Preview</span>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold font-hand hover:bg-gray-800 transition-all hover:scale-105"
                >
                  <Download size={18} /> Download HTML
                </button>
              </div>
              <PageView html={finalHtml} title={designSystem?.themeName || 'Generated Site'} />
            </div>
          )}

          {/* Empty State placeholder */}
          {!finalHtml && status === GenerationStatus.IDLE && (
            <div className="flex-1 border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 min-h-[500px]">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Wand2 size={48} className="text-gray-300" />
              </div>
              <p className="font-hand text-2xl">Ready to dream up a website?</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;
