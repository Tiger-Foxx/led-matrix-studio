import React from 'react';
import { Brush, Eraser } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ControlPanel: React.FC = () => {
    const {
        currentProject,
        selectedTool, setSelectedTool,
        blinkFrequency, setBlinkFrequency
    } = useStore();

    if (!currentProject) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1.5 border border-[#333]">
                <button
                    onClick={() => setSelectedTool('brush')}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                        selectedTool === 'brush' 
                            ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/50' 
                            : 'text-gray-400 hover:text-white hover:bg-[#333]'
                    }`}
                    title="Dessiner"
                >
                    <Brush size={16} />
                    <span>Dessiner</span>
                </button>
                <button
                    onClick={() => setSelectedTool('eraser')}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
                        selectedTool === 'eraser' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                            : 'text-gray-400 hover:text-white hover:bg-[#333]'
                    }`}
                    title="Effacer"
                >
                    <Eraser size={16} />
                    <span>Effacer</span>
                </button>
            </div>

            {/* Blink Frequency */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-2 border border-[#333]">
                <span className="text-xs text-gray-500">Clignotement:</span>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={blinkFrequency}
                    onChange={(e) => setBlinkFrequency(Number(e.target.value))}
                    className="w-20 h-1 bg-[#333] rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#00ff41] [&::-webkit-slider-thumb]:rounded-full"
                />
                <span className="text-xs font-mono w-8 text-[#00ff41]">
                    {blinkFrequency === 0 ? 'OFF' : `${blinkFrequency}Hz`}
                </span>
            </div>
        </div>
    );
};
