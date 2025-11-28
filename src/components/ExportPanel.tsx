import React from 'react';
import { Download, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateBinaryFiles } from '../core/binary-export';

interface ExportPanelProps {
    onClose?: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
    const { currentProject, updateExportConfig } = useStore();
    
    if (!currentProject) return null;
    
    const { exportConfig, frames } = currentProject;

    const handleExport = async () => {
        await generateBinaryFiles(frames, exportConfig);
        onClose?.();
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Info */}
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                    Génère 4 fichiers .bin pour les quadrants TL, TR, BL, BR.
                    Les frames sont dupliquées jusqu'à {exportConfig.loopSize} frames pour la boucle EEPROM.
                </div>
            </div>

            {/* Hardware Config */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Configuration matérielle</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportConfig.bitReversal}
                        onChange={(e) => updateExportConfig({ bitReversal: e.target.checked })}
                        className="w-4 h-4 rounded border-[#444] bg-[#111] text-[#00ff41] focus:ring-[#00ff41]/50"
                    />
                    <span className="text-sm">Bit Reversal (D0↔D7)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportConfig.invertOutput}
                        onChange={(e) => updateExportConfig({ invertOutput: e.target.checked })}
                        className="w-4 h-4 rounded border-[#444] bg-[#111] text-[#00ff41] focus:ring-[#00ff41]/50"
                    />
                    <span className="text-sm">Inverser output (Active Low)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportConfig.flipX}
                        onChange={(e) => updateExportConfig({ flipX: e.target.checked })}
                        className="w-4 h-4 rounded border-[#444] bg-[#111] text-[#00ff41] focus:ring-[#00ff41]/50"
                    />
                    <span className="text-sm">Miroir horizontal (X)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={exportConfig.flipY}
                        onChange={(e) => updateExportConfig({ flipY: e.target.checked })}
                        className="w-4 h-4 rounded border-[#444] bg-[#111] text-[#00ff41] focus:ring-[#00ff41]/50"
                    />
                    <span className="text-sm">Miroir vertical (Y)</span>
                </label>
            </div>

            {/* Offset Y */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Offset Y</label>
                    <span className="text-sm font-mono text-[#00ff41]">{exportConfig.offsetY}</span>
                </div>
                <input
                    type="range"
                    min="-8"
                    max="8"
                    value={exportConfig.offsetY}
                    onChange={(e) => updateExportConfig({ offsetY: Number(e.target.value) })}
                    className="w-full h-2 bg-[#333] rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00ff41] [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>

            {/* Loop Size */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Taille boucle EEPROM</label>
                <input
                    type="number"
                    min="1"
                    max="1024"
                    value={exportConfig.loopSize}
                    onChange={(e) => updateExportConfig({ loopSize: Number(e.target.value) })}
                    className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-[#00ff41] outline-none"
                />
            </div>

            {/* Stats */}
            <div className="text-xs text-gray-500 bg-[#0a0a0a] rounded p-3">
                <div className="flex justify-between">
                    <span>Frames:</span>
                    <span className="text-white">{frames.length}</span>
                </div>
                <div className="flex justify-between">
                    <span>Taille par quadrant:</span>
                    <span className="text-white">{exportConfig.loopSize * 8} octets</span>
                </div>
            </div>

            {/* Export Button */}
            <button 
                onClick={handleExport} 
                className="btn btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
                <Download size={18} />
                Générer les fichiers .bin
            </button>
        </div>
    );
};
