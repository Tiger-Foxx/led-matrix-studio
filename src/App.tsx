import { useEffect, useState, useRef } from 'react';
import { 
    Download, Save, FolderOpen, Plus, FileJson, Upload, X, 
    Trash2, Clock, Edit3, Check, Undo, Redo
} from 'lucide-react';
import logo from './assets/logo.png';
import { MatrixGrid } from './components/MatrixGrid';
import { Timeline } from './components/Timeline';
import { ControlPanel } from './components/ControlPanel';
import { ExportPanel } from './components/ExportPanel';
import { ShapesPanel } from './components/ShapesPanel';
import { useStore } from './store/useStore';
import { saveTextFile } from './utils/tauri-export';

function App() {
    const { 
        currentProject,
        recentProjects,
        isPlaying, 
        currentFrameIndex, 
        setCurrentFrameIndex,
        createNewProject,
        saveCurrentProject,
        loadProject,
        deleteProject,
        renameProject,
        exportProjectAsJson,
        importProjectFromJson,
        undo,
        redo,
        toastMessage,
        showToast
    } = useStore();

    const [showExport, setShowExport] = useState(false);
    const [showRecentProjects, setShowRecentProjects] = useState(!currentProject);
    const [newProjectName, setNewProjectName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const frames = currentProject?.frames ?? [];
    const playbackSpeed = currentProject?.playbackSpeed ?? 200;

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        redo();
                        break;
                    case 's':
                        e.preventDefault();
                        saveCurrentProject();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, saveCurrentProject]);

    // Animation Loop
    useEffect(() => {
        let interval: number;
        if (isPlaying && frames.length > 0) {
            interval = window.setInterval(() => {
                const nextIndex = (currentFrameIndex + 1) % frames.length;
                setCurrentFrameIndex(nextIndex);
            }, playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentFrameIndex, frames.length, playbackSpeed, setCurrentFrameIndex]);

    // Auto-save every 60 seconds
    useEffect(() => {
        if (currentProject) {
            const timer = setInterval(() => {
                saveCurrentProject(false);
            }, 60000);
            return () => clearInterval(timer);
        }
    }, [currentProject, saveCurrentProject]);

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createNewProject(newProjectName.trim());
            setNewProjectName('');
            setShowRecentProjects(false);
        }
    };

    const handleExportJson = async () => {
        try {
            console.log('[handleExportJson] Début export JSON');
            const json = exportProjectAsJson();
            console.log('[handleExportJson] JSON généré, longueur:', json.length);
            const filename = `${currentProject?.name || 'project'}.json`;
            console.log('[handleExportJson] Nom fichier:', filename);
            const success = await saveTextFile(json, filename, [{ name: 'Fichiers JSON', extensions: ['json'] }]);
            console.log('[handleExportJson] Export terminé, success:', success);
            if (success) {
                showToast('Projet JSON exporté !');
            }
        } catch (error) {
            console.error('[handleExportJson] Erreur:', error);
            showToast('Erreur lors de l\'export');
        }
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const json = event.target?.result as string;
                if (importProjectFromJson(json)) {
                    setShowRecentProjects(false);
                }
            };
            reader.readAsText(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRename = () => {
        if (editedName.trim()) {
            renameProject(editedName.trim());
            setIsEditingName(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Welcome / Recent Projects Screen
    if (!currentProject || showRecentProjects) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 relative bg-[#0a0a0a]">
                {/* Toast */}
                {toastMessage && (
                    <div className="fixed top-4 right-4 bg-[#00ff41] text-black px-4 py-2 rounded shadow-lg z-50 animate-fade-in-down font-bold">
                        {toastMessage}
                    </div>
                )}
                
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            <img src={logo} alt="Logo" className="w-12 h-12" />
                            LED Matrix Studio
                        </h1>
                        <p className="text-gray-500">Éditeur d'animations pour matrice LED 16×16</p>
                    </div>

                    {/* New Project */}
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-[#00ff41]" />
                            Nouveau Projet
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                placeholder="Nom du projet..."
                                className="flex-1 bg-[#111] border border-[#333] rounded px-4 py-2 text-white focus:border-[#00ff41] outline-none"
                            />
                            <button 
                                onClick={handleCreateProject}
                                className="btn btn-primary px-6"
                                disabled={!newProjectName.trim()}
                            >
                                Créer
                            </button>
                        </div>
                    </div>

                    {/* Import */}
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-blue-400" />
                            Importer un Projet
                        </h2>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportJson}
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="btn w-full flex items-center justify-center gap-2"
                        >
                            <FileJson size={16} />
                            Charger un fichier JSON
                        </button>
                    </div>

                    {/* Recent Projects */}
                    {recentProjects.length > 0 && (
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-purple-400" />
                                Projets Récents
                            </h2>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {recentProjects.map((project) => (
                                    <div 
                                        key={project.id}
                                        className="flex items-center gap-3 p-3 bg-[#111] rounded border border-[#222] hover:border-[#444] cursor-pointer group"
                                        onClick={() => {
                                            loadProject(project.id);
                                            setShowRecentProjects(false);
                                        }}
                                    >
                                        {/* Mini Preview */}
                                        <div className="w-12 h-12 bg-black rounded flex-shrink-0 grid grid-cols-16 gap-[0.5px] p-0.5">
                                            {project.frames[0]?.grid.flat().slice(0, 256).map((pixel, i) => (
                                                <div
                                                    key={i}
                                                    className={pixel ? 'bg-[#00ff41]' : 'bg-[#1a1a1a]'}
                                                    style={{ width: '2px', height: '2px' }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-white truncate">{project.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {project.frames.length} frame{project.frames.length > 1 ? 's' : ''} • {formatDate(project.updatedAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProject(project.id);
                                            }}
                                            className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentProject && (
                        <button 
                            onClick={() => setShowRecentProjects(false)}
                            className="mt-4 btn w-full"
                        >
                            Retour au projet actuel
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-4 right-4 bg-[#00ff41] text-black px-4 py-2 rounded shadow-lg z-50 animate-fade-in-down font-bold flex items-center gap-2">
                    <Check size={16} />
                    {toastMessage}
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-[#333] bg-[#111] flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="font-bold text-white text-sm sm:text-base hidden sm:inline">LED Matrix Studio</span>
                    </div>
                    
                    <div className="h-5 w-px bg-[#333] hidden sm:block"></div>
                    
                    {/* Project Name */}
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                className="bg-[#222] border border-[#444] rounded px-2 py-1 text-white text-sm w-32 sm:w-48"
                                autoFocus
                            />
                            <button onClick={handleRename} className="text-[#00ff41] hover:text-white">
                                <Check size={16} />
                            </button>
                            <button onClick={() => setIsEditingName(false)} className="text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setEditedName(currentProject.name);
                                setIsEditingName(true);
                            }}
                            className="flex items-center gap-2 text-gray-300 hover:text-white"
                        >
                            <span className="text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{currentProject.name}</span>
                            <Edit3 size={14} className="text-gray-500" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={undo} className="btn p-1.5 sm:p-2" title="Annuler (Ctrl+Z)">
                        <Undo size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button onClick={redo} className="btn p-1.5 sm:p-2" title="Rétablir (Ctrl+Y)">
                        <Redo size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <div className="w-px h-5 bg-[#333] mx-0.5 sm:mx-1 hidden sm:block"></div>
                    <button 
                        onClick={() => setShowRecentProjects(true)} 
                        className="btn p-1.5 sm:p-2" 
                        title="Projets"
                    >
                        <FolderOpen size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button 
                        onClick={() => saveCurrentProject()} 
                        className="btn p-1.5 sm:p-2" 
                        title="Sauvegarder (Ctrl+S)"
                    >
                        <Save size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button 
                        onClick={handleExportJson} 
                        className="btn p-1.5 sm:p-2" 
                        title="Exporter JSON"
                    >
                        <FileJson size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button 
                        className="btn btn-primary flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2"
                        onClick={() => setShowExport(true)}
                    >
                        <Download size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline text-sm">Exporter Binaires</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Panel - Shapes */}
                <ShapesPanel />

                {/* Center - Matrix & Controls */}
                <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 overflow-auto scrollbar-minimal min-h-0">
                    <div className="flex-shrink-0">
                        <MatrixGrid />
                    </div>
                    <div className="flex-shrink-0">
                        <ControlPanel />
                    </div>
                </main>
            </div>

            {/* Export Modal */}
            {showExport && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowExport(false)}>
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Exporter Binaires EEPROM</h2>
                            <button onClick={() => setShowExport(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <ExportPanel onClose={() => setShowExport(false)} />
                    </div>
                </div>
            )}

            {/* Timeline at bottom */}
            <Timeline />
        </div>
    );
}

export default App;