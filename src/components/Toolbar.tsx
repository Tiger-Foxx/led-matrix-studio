import React from 'react';
import {
    Brush, Eraser, PaintBucket, Trash2,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    RotateCw, RotateCcw, Zap, Grid, LayoutTemplate, Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { createEmptyGrid, fillGrid, invertGrid, rotateGrid, shiftGrid } from '../core/matrix-utils';
import { cn } from '../utils/cn';

const ToolButton: React.FC<{
    icon: React.ReactNode;
    label?: string;
    active?: boolean;
    onClick: () => void;
    danger?: boolean;
    className?: string;
}> = ({ icon, label, active, onClick, danger, className }) => (
    <button
        onClick={onClick}
        title={label}
        className={cn(
            "p-2 rounded-lg transition-all duration-200 flex items-center justify-center group relative",
            active
                ? "bg-accent text-black shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                : "bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white border border-[#333]",
            danger && "hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50",
            className
        )}
    >
        {icon}
        {label && <span className="sr-only">{label}</span>}
    </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2 mt-1 px-1">
        {children}
    </div>
);

export const Toolbar: React.FC = () => {
    const {
        currentProject, currentFrameIndex, updateGrid,
        selectedTool, setSelectedTool
    } = useStore();

    const currentGrid = currentProject?.frames[currentFrameIndex]?.grid;

    if (!currentGrid) return null;

    const handleUpdate = (newGrid: any) => updateGrid(newGrid);

    return (
        <div className="flex flex-col gap-4 p-3 bg-[#111] border-r border-[#333] h-full overflow-y-auto w-[72px] shadow-xl z-30 scrollbar-hide">

            {/* Tools */}
            <div>
                <SectionLabel>Tools</SectionLabel>
                <div className="flex flex-col gap-2">
                    <ToolButton
                        icon={<Brush size={18} />}
                        label="Brush"
                        active={selectedTool === 'brush'}
                        onClick={() => setSelectedTool('brush')}
                    />
                    <ToolButton
                        icon={<Eraser size={18} />}
                        label="Eraser"
                        active={selectedTool === 'eraser'}
                        onClick={() => setSelectedTool('eraser')}
                    />
                    <ToolButton
                        icon={<PaintBucket size={18} />}
                        label="Fill"
                        onClick={() => handleUpdate(fillGrid())}
                    />
                </div>
            </div>

            <div className="h-px bg-[#222] w-full" />

            {/* Transform */}
            <div>
                <SectionLabel>Move</SectionLabel>
                <div className="grid grid-cols-2 gap-1.5">
                    <ToolButton icon={<ArrowUp size={14} />} onClick={() => handleUpdate(shiftGrid(currentGrid, 0, -1))} />
                    <ToolButton icon={<ArrowDown size={14} />} onClick={() => handleUpdate(shiftGrid(currentGrid, 0, 1))} />
                    <ToolButton icon={<ArrowLeft size={14} />} onClick={() => handleUpdate(shiftGrid(currentGrid, -1, 0))} />
                    <ToolButton icon={<ArrowRight size={14} />} onClick={() => handleUpdate(shiftGrid(currentGrid, 1, 0))} />
                </div>
            </div>

            <div>
                <SectionLabel>Rotate</SectionLabel>
                <div className="grid grid-cols-2 gap-1.5">
                    <ToolButton icon={<RotateCcw size={14} />} onClick={() => handleUpdate(rotateGrid(currentGrid, false))} />
                    <ToolButton icon={<RotateCw size={14} />} onClick={() => handleUpdate(rotateGrid(currentGrid, true))} />
                </div>
            </div>

            <div className="h-px bg-[#222] w-full" />

            {/* Edit */}
            <div>
                <SectionLabel>Edit</SectionLabel>
                <div className="flex flex-col gap-2">
                    <ToolButton
                        icon={<Zap size={18} />}
                        label="Invert"
                        onClick={() => handleUpdate(invertGrid(currentGrid))}
                    />
                    <ToolButton
                        icon={<Trash2 size={18} />}
                        label="Clear"
                        danger
                        onClick={() => handleUpdate(createEmptyGrid())}
                    />
                </div>
            </div>

            <div className="h-px bg-[#222] w-full" />

            {/* Templates (Mock) */}
            <div>
                <SectionLabel>Presets</SectionLabel>
                <div className="flex flex-col gap-2">
                    <ToolButton
                        icon={<LayoutTemplate size={18} />}
                        label="Patterns"
                        onClick={() => alert("Templates coming soon!")}
                    />
                    <ToolButton
                        icon={<Grid size={18} />}
                        label="Checker"
                        onClick={() => {
                            const newGrid = createEmptyGrid();
                            for(let r=0; r<16; r++) for(let c=0; c<16; c++) if((r+c)%2===0) newGrid[r][c]=1;
                            handleUpdate(newGrid);
                        }}
                    />
                </div>
            </div>

             {/* Recent (Mock) */}
             <div className="mt-auto">
                <div className="h-px bg-[#222] w-full mb-4" />
                <ToolButton
                    icon={<Clock size={18} />}
                    label="Recent"
                    onClick={() => alert("Recent projects list")}
                    className="opacity-50 hover:opacity-100"
                />
            </div>
        </div>
    );
};
