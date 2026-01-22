import React, { useEffect, useRef } from 'react';

interface PageViewProps {
  html: string;
  title: string;
}

const PageView: React.FC<PageViewProps> = ({ html, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      // Use Blob URL to handle the large base64 images within the HTML efficiently
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      // Cleanup
      return () => URL.revokeObjectURL(url);
    }
  }, [html]);

  return (
    <div className="w-full bg-gray-50 rounded-xl border-4 border-black overflow-hidden shadow-2xl flex flex-col h-[800px]">
      {/* Browser Bar */}
      <div className="bg-gray-800 p-3 flex items-center gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 ml-4 bg-gray-700 rounded px-3 py-1 text-xs text-gray-400 font-mono text-center truncate">
          {title.toLowerCase().replace(/\s+/g, '-')}.com
        </div>
      </div>

      {/* Content Area */}
      <iframe 
        ref={iframeRef}
        title="Website Preview"
        className="w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PageView;
