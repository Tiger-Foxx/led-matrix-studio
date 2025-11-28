import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStore, generateShape } from '../store/useStore';
import { GRID_SIZE, type PixelState } from '../core/types';

export const MatrixGrid: React.FC = () => {
    const { 
        currentProject, 
        currentFrameIndex, 
        updateGrid, 
        selectedTool, 
        blinkFrequency,
        pushToHistory 
    } = useStore();
    
    const currentGrid = currentProject?.frames[currentFrameIndex]?.grid;
    const isDrawing = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(18);

    // Calcule la taille des cellules en fonction de l'espace disponible
    useEffect(() => {
        const calculateCellSize = () => {
            // Obtenir les dimensions disponibles
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Estimer les éléments fixes
            const headerHeight = 50; // header
            const timelineHeight = 100; // timeline en bas
            const controlsHeight = 50; // boutons sous la matrice
            const verticalPadding = 32; // marges verticales
            const matrixPadding = 40; // padding interne de la matrice
            
            const leftPanelWidth = viewportWidth < 640 ? 160 : viewportWidth < 1024 ? 192 : 224; // w-40 sm:w-48 lg:w-56
            const horizontalPadding = 32; // marges horizontales
            
            // Espace disponible
            const availableHeight = viewportHeight - headerHeight - timelineHeight - controlsHeight - verticalPadding - matrixPadding;
            const availableWidth = viewportWidth - leftPanelWidth - horizontalPadding - matrixPadding;
            
            // Calculer la taille max des cellules pour rentrer dans l'espace
            // Ajouter un petit espace pour les gaps (environ 2px par cellule)
            const gapTotal = GRID_SIZE * 2;
            const maxCellFromHeight = Math.floor((availableHeight - gapTotal) / GRID_SIZE);
            const maxCellFromWidth = Math.floor((availableWidth - gapTotal) / GRID_SIZE);
            
            // Prendre le minimum des deux et limiter entre 8 et 22px
            const newSize = Math.max(8, Math.min(22, Math.min(maxCellFromHeight, maxCellFromWidth)));
            setCellSize(newSize);
        };

        calculateCellSize();
        window.addEventListener('resize', calculateCellSize);
        return () => window.removeEventListener('resize', calculateCellSize);
    }, []);

    const handleDraw = useCallback((row: number, col: number, isClick: boolean = false) => {
        if (!currentGrid) return;
        
        // If it's a shape tool, we only draw on click, not drag
        if (selectedTool !== 'brush' && selectedTool !== 'eraser') {
            if (!isClick) return;
            
            pushToHistory(); // Save state before applying shape
            
            const shapeGrid = generateShape(selectedTool);
            const newGrid = currentGrid.map(r => [...r]);
            
            // Center the shape on the clicked pixel
            const offsetX = col - 7;
            const offsetY = row - 7;
            
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (shapeGrid[r][c]) {
                        const targetR = r + offsetY;
                        const targetC = c + offsetX;
                        if (targetR >= 0 && targetR < GRID_SIZE && targetC >= 0 && targetC < GRID_SIZE) {
                            newGrid[targetR][targetC] = 1;
                        }
                    }
                }
            }
            updateGrid(newGrid);
            return;
        }

        // Brush / Eraser logic
        const newGrid = currentGrid.map(r => [...r]);
        const newValue: PixelState = selectedTool === 'brush' ? 1 : 0;
        
        if (newGrid[row][col] !== newValue) {
            newGrid[row][col] = newValue;
            updateGrid(newGrid);
        }
    }, [currentGrid, selectedTool, updateGrid, pushToHistory]);

    const handleMouseDown = (row: number, col: number) => {
        isDrawing.current = true;
        if (selectedTool === 'brush' || selectedTool === 'eraser') {
            pushToHistory(); // Save state before starting a stroke
        }
        handleDraw(row, col, true);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (isDrawing.current) {
            handleDraw(row, col, false);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    if (!currentGrid) return null;

    const blinkStyle = blinkFrequency > 0 ? {
        '--blink-duration': `${1 / blinkFrequency}s`
    } as React.CSSProperties : {};

    // Style dynamique pour les cellules basé sur la taille calculée
    const gapSize = cellSize > 16 ? 2 : 1;
    const paddingSize = cellSize > 16 ? 12 : 6;

    return (
        <div 
            ref={containerRef}
            className="bg-[#1a1a1a] rounded-xl"
            style={{ 
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 0 1px #333',
                padding: `${paddingSize}px`
            }}
        >
            <div
                className="bg-[#0a0a0a] rounded-lg"
                style={{ 
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
                    gap: `${gapSize}px`,
                    padding: `${paddingSize}px`
                }}
            >
                {currentGrid.map((row, rowIndex) =>
                    row.map((pixel, colIndex) => {
                        const isBlinking = pixel === 1 && blinkFrequency > 0;
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                style={{
                                    width: `${cellSize}px`,
                                    height: `${cellSize}px`,
                                    ...(isBlinking ? blinkStyle : {})
                                }}
                                className={`led-cell cursor-crosshair ${
                                    pixel === 1 ? 'led-on' : 'led-off'
                                } ${isBlinking ? 'led-blinking' : ''}`}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
