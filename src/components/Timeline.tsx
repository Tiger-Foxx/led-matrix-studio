import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Plus, Copy, Trash2, GripVertical } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Timeline: React.FC = () => {
    const {
        currentProject, currentFrameIndex, isPlaying,
        addFrame, duplicateFrame, deleteFrame,
        setCurrentFrameIndex, togglePlayback, setPlaybackSpeed, moveFrame,
        timelineHeight, setTimelineHeight
    } = useStore();

    const frames = currentProject?.frames ?? [];
    const playbackSpeed = currentProject?.playbackSpeed ?? 200;

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

    // Context Menu Handlers
    const handleContextMenu = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, index });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Drag handlers for frames
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDropTarget(index);
        }
    };

    const handleDragLeave = () => {
        setDropTarget(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            moveFrame(draggedIndex, dropIndex);
        }
        setDraggedIndex(null);
        setDropTarget(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDropTarget(null);
    };

    // Resize handlers
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeRef.current = { startY: e.clientY, startHeight: timelineHeight };

        const handleMouseMove = (e: MouseEvent) => {
            if (resizeRef.current) {
                const delta = resizeRef.current.startY - e.clientY;
                const newHeight = Math.max(120, Math.min(400, resizeRef.current.startHeight + delta));
                setTimelineHeight(newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeRef.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!currentProject) return null;

    return (
        <div 
            className="flex-shrink-0 border-t border-[#333] bg-[#111] flex flex-col"
            style={{ height: timelineHeight }}
        >
            {/* Resize handle */}
            <div
                onMouseDown={handleResizeStart}
                className={`h-2 cursor-ns-resize hover:bg-[#00ff41]/20 flex items-center justify-center group ${isResizing ? 'bg-[#00ff41]/20' : ''}`}
            >
                <div className="w-12 h-1 bg-[#333] rounded group-hover:bg-[#00ff41]/50" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-[#333] flex-shrink-0">
                <button
                    onClick={togglePlayback}
                    className={`btn ${isPlaying ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'btn-primary'}`}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Vitesse:</span>
                    <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="w-24 h-1 bg-[#333] rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#00ff41] [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-xs text-[#00ff41] font-mono w-14">{playbackSpeed}ms</span>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <button onClick={addFrame} className="btn" title="Nouvelle frame">
                        <Plus size={16} />
                    </button>
                    <button onClick={() => duplicateFrame()} className="btn" title="Dupliquer">
                        <Copy size={16} />
                    </button>
                    <button 
                        onClick={() => deleteFrame()} 
                        className="btn hover:bg-red-600/20 hover:border-red-600/50 hover:text-red-400" 
                        title="Supprimer"
                        disabled={frames.length <= 1}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="text-sm text-gray-400 font-mono">
                    <span className="text-white">{currentFrameIndex + 1}</span>
                    <span className="text-gray-600">/</span>
                    <span>{frames.length}</span>
                </div>
            </div>

            {/* Frames */}
            <div 
                className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-3 flex items-start gap-2 scrollbar-thin"
                ref={containerRef}
            >
                {frames.map((frame, index) => (
                    <div
                        key={frame.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setCurrentFrameIndex(index)}
                        onContextMenu={(e) => handleContextMenu(e, index)}
                        className={`
                            flex-shrink-0 rounded-lg border-2 cursor-pointer select-none
                            transition-all duration-75
                            ${index === currentFrameIndex 
                                ? 'border-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_12px_rgba(0,255,65,0.3)]' 
                                : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'
                            }
                            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                            ${dropTarget === index ? 'border-blue-500 scale-105' : ''}
                        `}
                        style={{ width: 72, height: 90 }}
                    >
                        {/* Drag handle */}
                        <div className="flex items-center justify-center py-1 text-gray-600">
                            <GripVertical size={12} />
                        </div>
                        
                        {/* Mini preview */}
                        <div 
                            className="mx-auto grid gap-[0.5px] bg-black rounded p-0.5"
                            style={{ 
                                gridTemplateColumns: 'repeat(16, 1fr)',
                                width: 56,
                                height: 56,
                            }}
                        >
                            {frame.grid.map((row, r) =>
                                row.map((pixel, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={pixel ? 'bg-[#00ff41]' : 'bg-[#1a1a1a]'}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                ))
                            )}
                        </div>
                        
                        {/* Frame number */}
                        <div className={`text-center text-xs mt-1 ${index === currentFrameIndex ? 'text-[#00ff41]' : 'text-gray-500'}`}>
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-[#1a1a1a] border border-[#333] rounded shadow-xl py-1 min-w-[150px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-[#333] text-sm flex items-center gap-2 text-gray-200"
                        onClick={() => duplicateFrame(contextMenu.index)}
                    >
                        <Copy size={14} />
                        <span>Dupliquer</span>
                    </button>
                    <button
                        className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 text-sm flex items-center gap-2"
                        onClick={() => deleteFrame(contextMenu.index)}
                        disabled={frames.length <= 1}
                    >
                        <Trash2 size={14} />
                        <span>Supprimer</span>
                    </button>
                </div>
            )}
        </div>
    );
};
