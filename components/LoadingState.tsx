import React from 'react';
import { GenerationStatus } from '../types';
import { Loader2, BrainCircuit, Paintbrush, Hammer } from 'lucide-react';

interface LoadingStateProps {
  status: GenerationStatus;
}

const LoadingState: React.FC<LoadingStateProps> = ({ status }) => {
  if (status === GenerationStatus.IDLE || status === GenerationStatus.COMPLETED || status === GenerationStatus.ERROR) {
    return null;
  }

  const getContent = () => {
    switch (status) {
      case GenerationStatus.PLANNING:
        return {
          icon: <BrainCircuit size={48} className="text-purple-600 animate-pulse" />,
          title: "Dreaming up the Concept...",
          desc: "Our AI Art Director is deciding what assets are needed."
        };
      case GenerationStatus.GENERATING_ASSETS:
        return {
          icon: <Paintbrush size={48} className="text-pink-600 animate-bounce" />,
          title: "Painting Ingredients...",
          desc: "Generating custom textures, illustrations, and UI elements in parallel."
        };
      case GenerationStatus.ASSEMBLING_PAGE:
        return {
          icon: <Hammer size={48} className="text-blue-600 animate-pulse" />,
          title: "Assembling the Website...",
          desc: "The AI Developer is writing the HTML & CSS to fuse all assets together."
        };
      default:
        return { icon: null, title: "", desc: "" };
    }
  };

  const content = getContent();

  return (
    <div className="w-full mt-4 p-12 border-4 border-black border-dashed rounded-xl bg-yellow-50 flex flex-col items-center justify-center transition-all duration-500">
      <div className="mb-6 relative">
         {content.icon}
         <Loader2 size={64} className="absolute -top-2 -left-2 text-black/10 animate-spin" />
      </div>
      
      <h3 className="font-marker text-3xl mb-3 text-center transition-all">
        {content.title}
      </h3>
      <p className="font-hand text-2xl text-gray-600 text-center max-w-lg transition-all">
        {content.desc}
      </p>
    </div>
  );
};

export default LoadingState;
