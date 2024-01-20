import { useEffect, useState } from 'react';
import './App.css';

type Note = {
  id: number,
  title: string,
  content: string
};

const App = () => {

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notes');
        const notes: Note[] = await response.json();
        setNotes(notes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotes();
  }, []);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content
        })
      });
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.log(error)
    }
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if(!selectedNote) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content
        })
      });
      const updatedNote = await response.json();
      const updatedNotesList = notes.map((note) => note.id === selectedNote.id ? updatedNote : note);
      setNotes(updatedNotesList);
      setTitle('');
      setContent('');
      setSelectedNote(null);
    } catch (error) {
      console.log(error)
    }
  };

  const handleCancelNote = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
  };

  const handleDeleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const updatedNotesList = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotesList);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='app-container'>
      <form
        onSubmit={(e) => selectedNote ? handleUpdateNote(e) : handleAddNote(e)}
        className='note-form'>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type='text'
          placeholder='Title'
          required />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Write your note...'
          cols={30}
          rows={10}
          required></textarea>
        
        {selectedNote ? (
          <div className='edit-buttons'>
            <button type='submit'>Save</button>
            <button onClick={handleCancelNote}>Cancel</button>
          </div>
        ) : (
          <button type='submit'>Add Note</button>
        )}
      </form>
      <div className='notes-container'>
        {
          notes.map((note) => (
            <div
              className='note-item'
              key={note.id}
              onClick={() => handleNoteClick(note)}>
              <div className='note-header'>
                <button
                  onClick={(event) => handleDeleteNote(event, note.id)}>x</button>
              </div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default App;
