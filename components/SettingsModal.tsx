import React, { useState, useMemo, useEffect } from 'react';
import { useAISettings } from './AISettingsContext';
import { X, Search, Eye, EyeOff, RefreshCw, Key, Image as ImageIcon, MessageSquare, Check, Settings, Terminal } from 'lucide-react';
import { OpenRouterModel } from '../types';
import PromptManager from './PromptManager';

const SettingsModal: React.FC = () => {
    const { 
        apiKey, setApiKey, 
        textModel, setTextModel, 
        imageModel, setImageModel,
        isSettingsOpen, closeSettings,
        models, loadingModels, refreshModels 
    } = useAISettings();

    const [activeTab, setActiveTab] = useState<'general' | 'prompts'>('general');
    const [tempKey, setTempKey] = useState(apiKey);
    const [showKey, setShowKey] = useState(false);
    
    const [tempTextModel, setTempTextModel] = useState(textModel);
    const [tempImageModel, setTempImageModel] = useState(imageModel);

    // Resync local state when opening the modal
    useEffect(() => {
        if (isSettingsOpen) {
            setTempKey(apiKey);
            setTempTextModel(textModel);
            setTempImageModel(imageModel);
        }
    }, [isSettingsOpen, apiKey, textModel, imageModel]);
    
    // Search states for dropdowns
    const [textSearch, setTextSearch] = useState('');
    const [imageSearch, setImageSearch] = useState('');

    const textModels = useMemo(() => {
        return models.filter(m => {
            const mods = m.architecture?.output_modalities || [];
            return mods.includes("text") || mods.length === 0; 
        });
    }, [models]);

    const imageModels = useMemo(() => {
        return models.filter(m => {
            const mods = m.architecture?.output_modalities || [];
            return mods.includes("image");
        });
    }, [models]);

    const handleSave = () => {
        setApiKey(tempKey);
        setTextModel(tempTextModel);
        setImageModel(tempImageModel);
        closeSettings();
    };

    if (!isSettingsOpen) return null;

    const renderModelSelector = (
        type: 'text' | 'image',
        icon: React.ReactNode,
        title: string,
        modelList: OpenRouterModel[],
        searchValue: string,
        setSearchValue: (val: string) => void,
        selectedModelId: string,
        onSelect: (val: string) => void
    ) => {
        const filteredList = modelList.filter(m => 
            m.name.toLowerCase().includes(searchValue.toLowerCase()) || 
            m.id.toLowerCase().includes(searchValue.toLowerCase())
        );

        return (
            <div className="bg-surface border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h3 className="font-bold text-textMain">{title}</h3>
                </div>
                
                <div className="relative mb-3">
                    <Search className="w-4 h-4 text-textSec absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Buscar modelo por nombre o ID..."
                        className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm text-textMain focus:outline-none focus:border-accent transition-colors"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <div className="max-h-60 overflow-y-auto border border-border rounded divide-y divide-border bg-background scrollbar-thin">
                    {loadingModels && modelList.length === 0 ? (
                        <div className="p-4 text-center text-sm text-textSec">Cargando modelos de OpenRouter...</div>
                    ) : filteredList.length === 0 ? (
                        <div className="p-4 text-center text-sm text-textSec">No se encontraron modelos.</div>
                    ) : (
                        filteredList.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => onSelect(m.id)}
                                className={`w-full text-left p-4 hover:bg-surfaceHover transition-colors flex flex-col gap-1.5 ${selectedModelId === m.id ? 'bg-surface/80 border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm ${selectedModelId === m.id ? 'text-accent' : 'text-textMain'}`}>{m.name}</span>
                                            {selectedModelId === m.id && <Check className="w-4 h-4 text-accent" strokeWidth={3} />}
                                        </div>
                                        <span className="text-xs text-textSec block">{m.id}</span>
                                    </div>
                                    {m.pricing?.prompt === "0" && m.pricing?.completion === "0" ? (
                                        <span className="text-[10px] uppercase font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">Gratis</span>
                                    ) : null}
                                </div>
                                
                                <div className="flex gap-4 mt-1 bg-surface py-1.5 px-3 rounded-md w-fit border border-border">
                                    {type === 'text' && m.pricing && (
                                        <span className="text-[10px] text-textSec">
                                            Cost: ${Number(m.pricing.prompt) * 1000000}/M in | ${Number(m.pricing.completion) * 1000000}/M out
                                        </span>
                                    )}
                                    {type === 'image' && m.pricing && m.pricing.image && (
                                        <span className="text-[10px] text-textSec">
                                            Cost: ${m.pricing.image}/img
                                        </span>
                                    )}
                                    {m.context_length > 0 && (
                                        <span className="text-[10px] text-textSec">
                                            Context: {(m.context_length / 1000).toFixed(0)}k
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSettings} />
            
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="p-5 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 pr-6 border-r border-border">
                            <Settings className="w-5 h-5 text-accent" />
                            <h2 className="text-xl font-bold text-textMain">Configuración</h2>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveTab('general')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'general' ? 'bg-textMain text-background shadow-lg shadow-textMain/20' : 'text-textSec hover:text-textMain hover:bg-surfaceHover'
                                }`}
                            >
                                <Key className="w-4 h-4" />
                                General
                            </button>
                            <button 
                                onClick={() => setActiveTab('prompts')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === 'prompts' ? 'bg-textMain text-background shadow-lg shadow-textMain/20' : 'text-textSec hover:text-textMain hover:bg-surfaceHover'
                                }`}
                            >
                                <Terminal className="w-4 h-4" />
                                Prompts de IA
                            </button>
                        </div>
                    </div>
                    <button onClick={closeSettings} className="text-textSec hover:text-textMain p-1 rounded hover:bg-surfaceHover">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[500px]">
                    {activeTab === 'general' ? (
                        <div className="max-w-3xl mx-auto animate-fadeIn">
                            <div className="bg-accentAmber/10 border border-accentAmber/30 rounded-lg p-4 mb-6">
                                <p className="text-sm text-amber-600 dark:text-amber-200/80 mb-2 font-medium">
                                    LaunchKit requiere tu propia clave de OpenRouter. Tu clave se guarda localmente en tu navegador.
                                </p>
                                <a 
                                    href="https://openrouter.ai/settings/keys" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-amber-600 dark:text-accent hover:underline flex items-center gap-1"
                                >
                                    Obtener clave en OpenRouter.ai ↗
                                </a>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-textMain mb-2 uppercase tracking-wider">API Key de OpenRouter</label>
                                <div className="relative">
                                    <input 
                                        type={showKey ? "text" : "password"}
                                        className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-3 text-textMain focus:outline-none focus:border-accent font-mono text-sm shadow-inner"
                                        placeholder="sk-or-v1-..."
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textSec hover:text-textMain"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {renderModelSelector(
                                'text',
                                <MessageSquare className="w-5 h-5 text-blue-400" />,
                                'Modelo de Texto',
                                textModels,
                                textSearch,
                                setTextSearch,
                                tempTextModel,
                                setTempTextModel
                            )}

                            {renderModelSelector(
                                'image',
                                <ImageIcon className="w-5 h-5 text-pink-400" />,
                                'Modelo de Imágenes',
                                imageModels,
                                imageSearch,
                                setImageSearch,
                                tempImageModel,
                                setTempImageModel
                            )}
                        </div>
                    ) : (
                        <PromptManager />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface sticky bottom-0 z-10 flex justify-between items-center">
                    {activeTab === 'general' ? (
                        <button 
                            onClick={() => {
                                setTextSearch('');
                                setImageSearch('');
                                refreshModels();
                            }}
                            disabled={loadingModels}
                            className="text-sm text-textSec hover:text-textMain flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingModels ? 'animate-spin' : ''}`} /> 
                            {loadingModels ? 'Actualizando...' : 'Actualizar catálogo'}
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button 
                            onClick={closeSettings}
                            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-surfaceHover transition-colors text-sm"
                        >
                            Cerrar
                        </button>
                        {activeTab === 'general' && (
                            <button 
                                onClick={handleSave}
                                disabled={!tempKey.trim()}
                                className="px-6 py-2 bg-textMain text-background rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-lg shadow-textMain/10"
                            >
                                Guardar Configuración
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
