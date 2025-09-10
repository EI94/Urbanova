'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    // Sostituisce **text** con <strong>text</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Sostituisce *text* con <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Sostituisce `text` con <code>text</code>
    html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Sostituisce # Title con <h1>Title</h1>
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>');
    
    // Sostituisce ## Title con <h2>Title</h2>
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mb-2">$1</h2>');
    
    // Sostituisce ### Title con <h3>Title</h3>
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mb-1">$1</h3>');
    
    // Sostituisce - item con <li>item</li>
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
    
    // Sostituisce • item con <li>item</li>
    html = html.replace(/^• (.*$)/gm, '<li class="ml-4">• $1</li>');
    
    // Sostituisce 1. item con <li>item</li>
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>');
    
    // Sostituisce \n\n con <br><br>
    html = html.replace(/\n\n/g, '<br><br>');
    
    // Sostituisce \n con <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
