import React from 'react';
import { ArtStyle } from '../types';
import { Paintbrush, PenTool, SprayCan, FileDigit, Pen } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
  disabled: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  
  const styles = [
    { value: ArtStyle.DOODLE, icon: PenTool, label: 'Doodle' },
    { value: ArtStyle.MARKER, icon: Pen, label: 'Marker' },
    { value: ArtStyle.GRAFFITI, icon: SprayCan, label: 'Graffiti' },
    { value: ArtStyle.WATERCOLOR, icon: Paintbrush, label: 'Watercolor' },
    { value: ArtStyle.BLUEPRINT, icon: FileDigit, label: 'Blueprint' },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {styles.map((style) => (
        <button
          key={style.value}
          onClick={() => onSelect(style.value)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all transform
            ${selectedStyle === style.value 
              ? 'bg-ink text-white border-ink -rotate-1 shadow-lg scale-105' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-ink hover:-rotate-1'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <style.icon size={18} />
          <span className="font-hand font-bold text-lg">{style.label}</span>
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;