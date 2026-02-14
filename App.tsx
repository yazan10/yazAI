import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { LoadingScreen } from './components/LoadingScreen';
import { TransitionLoader } from './components/TransitionLoader';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SendIcon3D } from './components/SendIcon3D'; // Import new icon
import { MODELS } from './constants';
import { Message, ModelId } from './types';
import { generateTextResponse } from './services/geminiService';
import { Menu, Paperclip, Loader2, Sparkles, X, Image as ImageIcon } from 'lucide-react'; 

const STORAGE_KEY = 'yaz_ai_chats';
const MAX_HISTORY_LENGTH = 50; // Maximum number of messages to store per model

const App: React.FC = () => {
  const [appLoading, setAppLoading] = useState(true);
  const [currentModel, setCurrentModel] = useState<ModelId>('deepseek');
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);
  const [targetModelName, setTargetModelName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal State
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
  // State to hold messages for ALL models
  const [chats, setChats] = useState<Record<ModelId, Message[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load chats from local storage", e);
    }
    
    return {
      deepseek: [{ id: 'welcome-ds', role: 'model', text: 'أهلاً بك! أنا DeepSeek R1، كيف يمكنني مساعدتك في البرمجة أو التحليل اليوم؟', timestamp: Date.now() }],
      gemini: [{ id: 'welcome-gem', role: 'model', text: 'مرحباً! أنا Gemini، جاهز لمساعدتك في أي مهمة عامة أو إبداعية.', timestamp: Date.now() }],
      gpt: [{ id: 'welcome-gpt', role: 'model', text: 'أهلاً! أنا ChatGPT، لنتحدث عن أي موضوع يهمك.', timestamp: Date.now() }]
    };
  });

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const messages = chats[currentModel] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentModel, appLoading, selectedImage]); // Scroll when image selected too

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  // Handle Model Switching with Effect
  const handleModelSelect = (newModelId: ModelId) => {
    if (newModelId === currentModel) return;

    const newModelName = MODELS.find(m => m.id === newModelId)?.name || '';
    setTargetModelName(newModelName);
    setIsSwitchingModel(true);

    // Simulate transition delay (iOS style feel)
    setTimeout(() => {
      setCurrentModel(newModelId);
      setIsSwitchingModel(false);
      setSelectedImage(null); // Clear image on switch
      setInputValue('');
    }, 1200);
  };

  const updateCurrentChat = (updateFn: (prevMessages: Message[]) => Message[]) => {
    setChats(prevChats => {
      const currentMessages = prevChats[currentModel] || [];
      const updatedMessages = updateFn(currentMessages);
      
      // Robust History Management: Enforce Limit
      if (updatedMessages.length > MAX_HISTORY_LENGTH) {
        const welcomeMsg = updatedMessages.find(m => m.id.startsWith('welcome'));
        
        // Slice the array to get the most recent messages
        // If we have a welcome message we want to keep, we effectively reserve 1 slot for it
        const sliceCount = MAX_HISTORY_LENGTH - (welcomeMsg ? 1 : 0);
        const recentMessages = updatedMessages.slice(-sliceCount);

        // If welcome message exists and was cut off, prepend it
        if (welcomeMsg && !recentMessages.some(m => m.id === welcomeMsg.id)) {
          return {
            ...prevChats,
            [currentModel]: [welcomeMsg, ...recentMessages]
          };
        }

        return {
          ...prevChats,
          [currentModel]: recentMessages
        };
      }

      return {
        ...prevChats,
        [currentModel]: updatedMessages
      };
    });
  };

  const openClearHistoryModal = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClearHistory = () => {
    setChats(prev => {
      const currentMessages = prev[currentModel] || [];
      const welcomeMsg = currentMessages.find(m => m.id.startsWith('welcome'));
      return {
        ...prev,
        [currentModel]: welcomeMsg ? [welcomeMsg] : []
      };
    });
    
    setIsClearModalOpen(false);
    
    // Close sidebar on mobile after action
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Image Upload Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSend = async () => {
    // Allow sending if text OR image is present
    if ((!inputValue.trim() && !selectedImage) || isProcessing) return;

    const userText = inputValue;
    const userImage = selectedImage; // Capture current image state
    
    setInputValue('');
    setSelectedImage(null); // Clear image immediately
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: userImage || undefined,
      timestamp: Date.now()
    };

    const botMessageId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      isLoading: true,
      timestamp: Date.now()
    };

    updateCurrentChat(prev => [...prev, userMessage, botPlaceholder]);
    setIsProcessing(true);

    try {
      // Build history for context (exclude current message image from history for now to save tokens/complexity)
      // Note: In a production app, you might want to send history images too, 
      // but typically multimodal history consumes a lot of quota.
      const history = messages
        .filter(m => !m.error && !m.isLoading && !m.id.startsWith('welcome'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text || '' }]
        }));

      // Send request with optional image
      const responseText = await generateTextResponse(currentModel, userText, history, userImage || undefined);
      
      updateCurrentChat(prev => prev.map(msg => {
        if (msg.id === botMessageId) {
          return {
            ...msg,
            isLoading: false,
            text: responseText
          };
        }
        return msg;
      }));

    } catch (error: any) {
      console.error("API Error:", error);
      
      let errorType: 'PERMISSION_DENIED' | 'QUOTA_EXCEEDED' | 'UNKNOWN' = 'UNKNOWN';
      if (error.code === 'PERMISSION_DENIED') errorType = 'PERMISSION_DENIED';
      if (error.code === 'QUOTA_EXCEEDED') errorType = 'QUOTA_EXCEEDED';

      updateCurrentChat(prev => prev.map(msg => {
        if (msg.id === botMessageId) {
          return {
            ...msg,
            isLoading: false,
            error: true,
            errorType: errorType,
            text: '' 
          };
        }
        return msg;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (appLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden font-sans text-right" dir="rtl">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        hidden
      />

      {/* Modals & Overlays */}
      {isSwitchingModel && <TransitionLoader modelName={targetModelName} />}
      
      <ConfirmationModal 
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearHistory}
        title="مسح المحادثة"
        message="هل أنت متأكد من رغبتك في مسح سجل المحادثة بالكامل لهذا النموذج؟ لا يمكن التراجع عن هذا الإجراء."
      />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/10 to-transparent opacity-50"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Sidebar 
        currentModel={currentModel} 
        onSelectModel={handleModelSelect}
        onClearHistory={openClearHistoryModal}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative w-full h-full z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl z-30 sticky top-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-gray-300 hover:text-white rounded-lg active:bg-white/5">
            <Menu size={24} />
          </button>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Yaz AI</span>
          <div className="w-8" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-0 scroll-smooth">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end md:px-8 py-8">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center text-slate-500 my-auto animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-2xl">
                  <Sparkles className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">كيف يمكنني مساعدتك اليوم؟</h2>
                <p className="text-slate-500 text-sm max-w-xs">اختر نموذجاً من القائمة الجانبية وابدأ المحادثة</p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-20">
          <div className="max-w-4xl mx-auto relative group">
             
             {/* Model Badge */}
             <div className="absolute -top-12 right-0 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-slate-800/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-blue-300 flex items-center gap-2 shadow-lg">
                   {MODELS.find(m => m.id === currentModel)?.name}
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                </span>
             </div>

            <div className={`
              bg-[#1e293b]/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col transition-all duration-300 
              focus-within:bg-[#1e293b] focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/10 hover:border-white/20
              ${selectedImage ? 'rounded-tl-lg rounded-tr-lg' : ''}
            `}>
              
              {/* Image Preview Area */}
              {selectedImage && (
                <div className="px-4 pt-4 pb-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative inline-block group">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="h-20 w-auto rounded-xl border border-white/10 shadow-lg object-cover"
                    />
                    <button 
                      onClick={removeSelectedImage}
                      className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    {/* Hover info */}
                    <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <ImageIcon size={16} className="text-white/80" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-end p-2">
                <button 
                  onClick={triggerFileInput}
                  className={`
                    p-3.5 transition-all hover:bg-white/5 rounded-2xl flex-shrink-0
                    ${selectedImage ? 'text-blue-400' : 'text-slate-400 hover:text-white'}
                  `}
                  title="إرفاق صورة"
                >
                  <Paperclip size={20} />
                </button>

                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedImage ? "أضف وصفاً للصورة (اختياري)..." : "اكتب رسالتك هنا..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 p-3.5 min-h-[56px] max-h-[160px] resize-none leading-relaxed text-[15px]"
                  rows={1}
                  style={{ height: 'auto' }}
                />

                <button 
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && !selectedImage) || isProcessing}
                  className={`
                    p-3.5 rounded-2xl mb-1 ml-1 transition-all duration-300 flex items-center justify-center flex-shrink-0
                    ${(!inputValue.trim() && !selectedImage) || isProcessing 
                      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] text-white shadow-lg transform hover:-translate-y-0.5'}
                  `}
                >
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <SendIcon3D size={24} className={document.dir === 'rtl' ? '-scale-x-100' : ''} />}
                </button>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-600 mt-4 font-medium tracking-wide">
              Yaz AI يمكن أن يرتكب أخطاء. يرجى التحقق من المعلومات المهمة.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;