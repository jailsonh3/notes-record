import { ChangeEvent, useState } from 'react'
import logoImg from './assets/logo-nlw-expert.svg'
import { NewNoteCard } from './components/new-note-card'
import { NoteCard } from './components/note-card'

type Note = {
  id: string
  date: Date
  content: string
}

export function App() {

  const [search, setSearch] = useState('')

  const [notes, setNotes] = useState<Note[]>(() => {
  const notesOnStorage = localStorage.getItem('note@array-notes')

  if(notesOnStorage) {
    return JSON.parse(notesOnStorage)
  }

  return []
  })

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
    }

    const noteArray = [newNote, ...notes]

    setNotes(noteArray)

    localStorage.setItem('note@array-notes', JSON.stringify(noteArray))
  }

  function onNoteDeleted(id: string) {
    const notesArray = notes.filter(note => {
      return note.id !== id
    })

    setNotes(notesArray)
    localStorage.setItem('note@array-notes', JSON.stringify(notesArray))
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value

    setSearch(query)
  }

  const filteredNote = search !== ''
    ? notes.filter(note => note.content.toLowerCase().includes(search.toLowerCase())) 
    : notes

  return (
    <div className='mx-auto max-w-6xl my-12 space-y-6 px-5'>
      <img src={logoImg} alt="NLW EXPERT" />
      <form className='w-full'>
        <input 
          type="text" 
          placeholder='Busque em suas notas...' 
          className='w-full bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-slate-500 md:placeholder:text-3xl'
          onChange={handleSearch}
          value={search}
        />
      </form>
        
      <div className='h-px bg-slate-700' />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]'>
          <NewNoteCard onNoteCreated={onNoteCreated} />

        {
          filteredNote.map(note => (
            <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
          ))
        }

      </div>
    </div>
  )
  }