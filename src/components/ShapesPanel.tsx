import { 
    Circle, Square, Diamond, Plus, Heart, 
    ArrowUp, ArrowDown, Grid3x3, Sparkles, Zap,
    RotateCw, RotateCcw, MoveUp, MoveDown, MoveLeft, MoveRight,
    FlipHorizontal, FlipVertical, Trash2
} from 'lucide-react';
import { useStore, type ShapeType } from '../store/useStore';

const SHAPES: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
    { type: 'circle', icon: <Circle size={18} />, label: 'Cercle' },
    { type: 'square', icon: <Square size={18} />, label: 'Carré' },
    { type: 'diamond', icon: <Diamond size={18} />, label: 'Losange' },
    { type: 'cross', icon: <Plus size={18} />, label: 'Croix' },
    { type: 'heart', icon: <Heart size={18} />, label: 'Cœur' },
    { type: 'arrow_up', icon: <ArrowUp size={18} />, label: 'Flèche ↑' },
    { type: 'arrow_down', icon: <ArrowDown size={18} />, label: 'Flèche ↓' },
    { type: 'checker', icon: <Grid3x3 size={18} />, label: 'Damier' },
];

export function ShapesPanel() {
    const { 
        applyShape, 
        shiftFrame, 
        rotateFrame, 
        flipFrameHorizontal,
        flipFrameVertical,
        clearCurrentFrame,
        invertCurrentFrame,
        fillCurrentFrame,
        currentProject,
        currentFrameIndex,
        selectedTool
    } = useStore();

    const hasFrame = currentProject && currentProject.frames.length > 0;

    return (
        <aside className="w-40 sm:w-48 lg:w-56 bg-[#111] border-r border-[#333] flex flex-col overflow-y-auto scrollbar-thin">
            {/* Shapes Section */}
            <div className="p-2 sm:p-3 lg:p-4 border-b border-[#333]">
                <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                    <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Formes (Pinceau)</span>
                    <span className="sm:hidden">Formes</span>
                </h3>
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                    {SHAPES.map(({ type, icon, label }) => (
                        <button
                            key={type}
                            onClick={() => applyShape(type)}
                            className={`p-1.5 sm:p-2 lg:p-2.5 border rounded transition-all ${
                                selectedTool === type 
                                    ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]' 
                                    : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#555] hover:text-white'
                            }`}
                            title={label}
                            disabled={!hasFrame}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transform Section */}
            <div className="p-2 sm:p-3 lg:p-4 border-b border-[#333]">
                <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                    <RotateCw size={12} className="sm:w-3.5 sm:h-3.5" />
                    Transformer
                </h3>
                
                {/* Shift */}
                <div className="mb-2 sm:mb-3">
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-1.5">Décaler</div>
                    <div className="flex justify-center gap-1">
                        <button
                            onClick={() => shiftFrame('up')}
                            className="p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white"
                            title="Décaler vers le haut"
                            disabled={!hasFrame}
                        >
                            <MoveUp size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                        <button
                            onClick={() => shiftFrame('left')}
                            className="p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white"
                            title="Décaler vers la gauche"
                            disabled={!hasFrame}
                        >
                            <MoveLeft size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => shiftFrame('down')}
                            className="p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white"
                            title="Décaler vers le bas"
                            disabled={!hasFrame}
                        >
                            <MoveDown size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => shiftFrame('right')}
                            className="p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white"
                            title="Décaler vers la droite"
                            disabled={!hasFrame}
                        >
                            <MoveRight size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>

                {/* Rotate */}
                <div className="mb-2 sm:mb-3">
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-1.5">Rotation</div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => rotateFrame('ccw')}
                            className="flex-1 p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white flex items-center justify-center gap-1"
                            title="Rotation anti-horaire"
                            disabled={!hasFrame}
                        >
                            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-xs">90°</span>
                        </button>
                        <button
                            onClick={() => rotateFrame('cw')}
                            className="flex-1 p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white flex items-center justify-center gap-1"
                            title="Rotation horaire"
                            disabled={!hasFrame}
                        >
                            <RotateCw size={14} className="sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-xs">90°</span>
                        </button>
                    </div>
                </div>

                {/* Flip */}
                <div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-1.5">Miroir</div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => flipFrameHorizontal()}
                            className="flex-1 p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white flex items-center justify-center gap-1"
                            title="Miroir horizontal"
                            disabled={!hasFrame}
                        >
                            <FlipHorizontal size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={() => flipFrameVertical()}
                            className="flex-1 p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-gray-400 hover:text-white flex items-center justify-center gap-1"
                            title="Miroir vertical"
                            disabled={!hasFrame}
                        >
                            <FlipVertical size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-2 sm:p-3 lg:p-4">
                <h3 className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                    <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Actions Rapides</span>
                    <span className="sm:hidden">Actions</span>
                </h3>
                <div className="space-y-1 sm:space-y-1.5">
                    <button
                        onClick={() => fillCurrentFrame()}
                        className="w-full p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#00ff41] rounded text-xs sm:text-sm text-gray-300 hover:text-[#00ff41] text-left"
                        disabled={!hasFrame}
                    >
                        <span className="hidden sm:inline">Tout allumer</span>
                        <span className="sm:hidden">Allumer</span>
                    </button>
                    <button
                        onClick={() => invertCurrentFrame()}
                        className="w-full p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-[#444] rounded text-xs sm:text-sm text-gray-300 hover:text-white text-left"
                        disabled={!hasFrame}
                    >
                        Inverser
                    </button>
                    <button
                        onClick={() => clearCurrentFrame()}
                        className="w-full p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] hover:border-red-500/50 rounded text-xs sm:text-sm text-gray-300 hover:text-red-400 text-left flex items-center gap-1 sm:gap-2"
                        disabled={!hasFrame}
                    >
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Effacer frame</span>
                        <span className="sm:hidden">Effacer</span>
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="mt-auto p-2 sm:p-3 lg:p-4 border-t border-[#333] text-[10px] sm:text-xs text-gray-600">
                Frame {currentFrameIndex + 1} / {currentProject?.frames.length || 0}
            </div>
        </aside>
    );
}
