import React from 'react';

interface PopupProps {
  children: React.ReactNode;
  onClose: () => void;
  onGenerate?: () => void;
}

const Popup: React.FC<PopupProps> = ({ children, onClose, onGenerate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">
          &times;
        </button>
        {children}
        <div className="flex justify-center mt-4">
          {onGenerate && (
            <button 
              onClick={onGenerate} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
