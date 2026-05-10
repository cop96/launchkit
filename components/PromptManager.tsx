import React, { useState } from 'react';
import { useAISettings } from './AISettingsContext';
import { DynamicPrompt, PromptHistory } from '../types';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Save, History, RotateCcw, Info, ChevronRight, MessageSquare, Image as ImageIcon, Layout, Mail, Search } from 'lucide-react';

const PromptManager: React.FC = () => {
    const { prompts, updatePrompt } = useAISettings();
    const [selectedPrompt, setSelectedPrompt] = useState<DynamicPrompt | null>(null);
    const [editContent, setEditContent] = useState('');
    const [changeDesc, setChangeDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch history for selected prompt
    const history = useQuery(api.prompts.getHistory, selectedPrompt ? { promptId: selectedPrompt._id as any } : "skip");

    const handleSelect = (p: DynamicPrompt) => {
        setSelectedPrompt(p);
        setEditContent(p.content);
        setChangeDesc('');
        setShowHistory(false);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        setIsSaving(true);
        try {
            await updatePrompt(selectedPrompt._id, editContent, changeDesc);
            setChangeDesc('');
            // Optional: show toast
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestore = (h: PromptHistory) => {
        setEditContent(h.content);
        setChangeDesc(`Restaurado desde versión del ${new Date(h.createdAt).toLocaleString()}`);
        setShowHistory(false);
    };

    const filteredPrompts = prompts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (key: string) => {
        if (key.toLowerCase().includes('image')) return <ImageIcon className="w-4 h-4" />;
        if (key.toLowerCase().includes('email')) return <Mail className="w-4 h-4" />;
        if (key.toLowerCase().includes('plan')) return <Layout className="w-4 h-4" />;
        return <MessageSquare className="w-4 h-4" />;
    };

    return (
        <div className="flex h-full gap-6 animate-fadeIn">
            {/* List */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="relative">
                    <Search className="w-4 h-4 text-textSec absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Buscar prompt..."
                        className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-textMain focus:outline-none focus:border-accent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin">
                    {filteredPrompts.map(p => (
                        <button
                            key={p._id}
                            onClick={() => handleSelect(p)}
                            className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1 ${
                                selectedPrompt?._id === p._id 
                                ? 'bg-accent/10 border-accent shadow-sm' 
                                : 'bg-background border-border hover:border-textSec'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={selectedPrompt?._id === p._id ? 'text-accent' : 'text-textSec'}>
                                    {getIcon(p.key)}
                                </span>
                                <span className="font-bold text-sm text-textMain">{p.name}</span>
                            </div>
                            <span className="text-[10px] text-textSec truncate">{p.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 bg-background border border-border rounded-xl flex flex-col overflow-hidden shadow-inner">
                {selectedPrompt ? (
                    <>
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                            <div>
                                <h3 className="font-bold text-textMain flex items-center gap-2">
                                    {selectedPrompt.name}
                                    <span className="text-[10px] font-normal px-2 py-0.5 bg-border rounded-full text-textSec">{selectedPrompt.key}</span>
                                </h3>
                                <p className="text-xs text-textSec mt-1">{selectedPrompt.description}</p>
                            </div>
                            <button 
                                onClick={() => setShowHistory(!showHistory)}
                                className={`p-2 rounded-lg border transition-colors flex items-center gap-2 text-xs font-medium ${
                                    showHistory ? 'bg-accent text-white border-accent' : 'bg-surface border-border hover:bg-surfaceHover text-textMain'
                                }`}
                            >
                                <History className="w-4 h-4" />
                                {showHistory ? 'Cerrar Historial' : 'Ver Historial'}
                            </button>
                        </div>

                        <div className="flex-1 relative flex flex-col">
                            {showHistory ? (
                                <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm overflow-y-auto p-4 animate-slideIn">
                                    <h4 className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
                                        <History className="w-4 h-4 text-accent" />
                                        Historial de Versiones
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                        {history?.length === 0 ? (
                                            <div className="text-center py-10 text-textSec text-sm">No hay versiones anteriores guardadas.</div>
                                        ) : (
                                            history?.map(h => (
                                                <div key={h._id} className="p-4 rounded-lg border border-border bg-surface flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-xs font-bold text-textMain">
                                                            {new Date(h.createdAt).toLocaleString()}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRestore(h)}
                                                            className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                            RESTAURAR
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-textSec italic">"{h.changeDescription}"</p>
                                                    <pre className="text-[10px] bg-background p-2 rounded border border-border mt-1 line-clamp-3 text-textSec font-mono">
                                                        {h.content}
                                                    </pre>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            <textarea
                                className="flex-1 p-4 bg-transparent text-sm text-textMain font-mono focus:outline-none resize-none leading-relaxed"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Escribe el prompt aquí..."
                            />
                        </div>

                        <div className="p-4 border-t border-border bg-surface/50 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[10px] text-accent font-medium bg-accent/5 p-2 rounded-lg border border-accent/10">
                                <Info className="w-3 h-3" />
                                <span>Utiliza variables como {"{project.name}"} o {"{prompt}"} según corresponda a la función.</span>
                            </div>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="¿Qué has cambiado? (ej: Mejorado tono profesional)"
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-textMain focus:outline-none focus:border-accent"
                                    value={changeDesc}
                                    onChange={(e) => setChangeDesc(e.target.value)}
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || editContent === selectedPrompt.content}
                                    className="px-6 py-2 bg-accent text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-xs flex items-center gap-2 shadow-lg shadow-accent/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Guardando...' : 'Guardar Nueva Versión'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-textSec opacity-50 p-10 text-center">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="text-sm font-medium">Selecciona un prompt de la lista para empezar a editarlo.</p>
                        <p className="text-xs mt-2">Podrás modificar su comportamiento y ver versiones anteriores.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptManager;
