
import React, { useState, useEffect } from 'react';
import { Note } from '../types.ts';

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('gemini_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
    return [
      {
        id: 'note-sample-1',
        title: 'Math Study Notes',
        content: 'Key Identities:\n• sin^2(x) + cos^2(x) = 1\n• e^(i*pi) + 1 = 0\n• Quadratic formula: x = (-b ± sqrt(b^2 - 4ac)) / (2a)',
        updatedAt: Date.now(),
      }
    ];
  });
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('gemini_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 11),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('gemini_notes', JSON.stringify(updated));
    if (activeNoteId === id) {
      setActiveNoteId(updated.length > 0 ? updated[0].id : null);
    }
    setDeleteConfirmId(null);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col h-full bg-slate-900/30">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <button 
            onClick={createNote}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-white active:scale-98"
          >
            <i className="fas fa-plus"></i> New Note
          </button>
          <div className="mt-4 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input 
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center text-slate-600 italic text-sm">
              {search ? 'No matching notes found' : 'No notes yet. Click New Note!'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left p-4 border-b border-slate-900/80 transition-all cursor-pointer group relative ${
                  activeNoteId === note.id 
                    ? 'bg-slate-800/80 border-l-4 border-l-blue-500' 
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-slate-200 truncate pr-2 flex-1">
                    {note.title || 'Untitled Note'}
                  </h3>
                  
                  {/* Inline Delete Button with instant action */}
                  <button 
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all opacity-80 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-snug font-sans">
                  {note.content ? note.content : <span className="italic text-slate-700">Empty note...</span>}
                </p>
                <div className="mt-2 text-[10px] text-slate-600 font-mono">
                  {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {activeNote ? (
          <div className="h-full flex flex-col p-6 md:p-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/60">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                placeholder="Note Title"
                className="bg-transparent text-2xl md:text-3xl font-black text-white focus:outline-none flex-1 placeholder:text-slate-700"
              />
              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-2 transition-colors"
                title="Delete this note"
              >
                <i className="fas fa-trash-alt"></i>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
            
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateActiveNote({ content: e.target.value })}
              placeholder="Write formulas, proofs, problem solutions, or notes here..."
              className="flex-1 bg-transparent text-slate-200 text-base leading-relaxed focus:outline-none resize-none font-mono custom-scrollbar placeholder:text-slate-700"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-900/60 flex items-center justify-center mb-4 border border-slate-800">
              <i className="fas fa-file-alt text-3xl opacity-30 text-blue-400"></i>
            </div>
            <p className="text-lg font-bold text-slate-400 mb-1">No Note Selected</p>
            <p className="text-xs text-slate-600 max-w-sm mb-6">Create a new note or choose one from the sidebar to start recording mathematical insights.</p>
            <button
              onClick={createNote}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-plus"></i> Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

