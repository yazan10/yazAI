import React, { useState } from 'react';
import { Message } from '../types';
import { Bot, User, AlertTriangle, Copy, Check, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`group flex w-full mb-8 ${isUser ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`
          w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg hidden md:flex
          ${isUser 
            ? 'bg-slate-800 ring-1 ring-white/10' 
            : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-900/20'}
        `}>
          {isUser ? <User size={20} className="text-slate-400" /> : <Bot size={20} className="text-white" />}
        </div>

        {/* Bubble Container */}
        <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} w-full min-w-0`}>
          
          {/* Name & Time */}
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-medium text-slate-400">
              {isUser ? 'أنت' : 'Yaz AI'}
            </span>
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Bubble Content */}
          <div className={`
            relative w-full p-4 md:p-5 rounded-2xl shadow-md transition-all duration-200 overflow-hidden
            ${isUser 
              ? 'bg-slate-800/80 backdrop-blur-sm border border-white/5 text-slate-100 rounded-tr-none' 
              : 'bg-gradient-to-bl from-[#1e293b] to-[#1e293b] text-slate-200 rounded-tl-none shadow-blue-900/10 border border-white/5'}
            ${message.error ? 'border-red-500/50 bg-red-900/10' : ''}
          `}>
            
            {/* Attached Image */}
            {message.image && (
              <div className="mb-4 rounded-lg overflow-hidden border border-white/10 shadow-lg max-w-sm">
                <img 
                  src={message.image} 
                  alt="Attached content" 
                  className="w-full h-auto object-cover max-h-64"
                  loading="lazy"
                />
              </div>
            )}

            {message.text && (
              <div className="markdown-body text-[15px] leading-7 font-normal tracking-wide w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom Code Block Renderer
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'code';
                      const codeText = String(children).replace(/\n$/, '');

                      if (!inline && match) {
                        return (
                          <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-lg" dir="ltr">
                            {/* Code Header */}
                            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                <Terminal size={12} />
                                <span>{language}</span>
                              </div>
                              <button
                                onClick={() => handleCopy(codeText)}
                                className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors py-1 px-2 rounded hover:bg-white/5"
                              >
                                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                              </button>
                            </div>
                            {/* Code Content */}
                            <div className="overflow-x-auto">
                              <code className={`${className} block p-4 text-sm font-mono leading-relaxed`} {...props}>
                                {children}
                              </code>
                            </div>
                          </div>
                        );
                      }
                      
                      // Inline Code
                      return (
                        <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-blue-200 font-mono text-sm border border-white/5" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Link Renderer
                    a({node, children, ...props}) {
                      return (
                        <a 
                          className="text-blue-400 hover:text-blue-300 underline underline-offset-4" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    }
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
            
            {message.isLoading && (
              <div className="flex gap-1.5 items-center py-2 px-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {/* Error States */}
            {message.error && (
              <div className="mt-3 p-3 bg-red-950/30 border border-red-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                  <AlertTriangle size={14} />
                  <span>تنبيه</span>
                </div>
                
                {message.errorType === 'QUOTA_EXCEEDED' ? (
                  <p className="text-red-200/80 text-xs">
                    تم تجاوز حد الاستخدام لهذا النموذج. يرجى الانتظار قليلاً أو تجربة نموذج آخر.
                  </p>
                ) : (
                  <p className="text-red-200/80 text-xs">
                    حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
                  </p>
                )}
              </div>
            )}

            {/* General Message Actions (Copy full message) */}
            {!isUser && !message.isLoading && !message.error && (
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleCopy(message.text || '')}
                  className="p-1.5 rounded-lg bg-slate-800/80 backdrop-blur border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
                  title="نسخ النص بالكامل"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};