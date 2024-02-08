import { ChangeEvent, FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { X } from 'lucide-react';
import { toast } from 'sonner';

type NewNoteCardProps = {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if(event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()
    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Sua nota foi sava com sucesso!')
  }

  function handleGoBackOnboardingClosedDialog() {
    setShouldShowOnboarding(true)
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window 
      || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable) {
      toast.warning('Ops! Seu navegador não é compatível com a API de gravação.', {
        position: 'top-center',
      })

      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.log(event.error)
    }

    speechRecognition.start()
  }

  function handleStopRecording(event: FormEvent) {
    event.preventDefault()
    setIsRecording(false)

    if(speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className='rounded-md text-left bg-slate-700 p-5 flex flex-col gap-3 overflow-hidden outline-none relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
        
        <span className='text-sm font-medium text-slate-300'>
          Adicionar nota
        </span>
        <p className='text-sm leading-6 text-slate-400 line-clamp-3'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>

      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50'/> 
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close 
            onClick={handleGoBackOnboardingClosedDialog}
            className='absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 outline-none hover:text-red-400'
          >
            <X className='size-5'/>
          </Dialog.Close>

          <form onSubmit={handleSaveNote} className='flex-1 flex flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-300'>
                Adicionar nota
              </span>
            {shouldShowOnboarding ? (
              <p className='text-sm font-medium leading-6 text-slate-400'>
                  Comece {' '}
                    <button 
                      type='button' 
                      onClick={handleStartRecording} 
                      className='text-lime-400 hover:underline'>
                        gravando uma nota
                    </button> 
                    {' '} em áudio ou se preferir {' '}
                    <button 
                      type='button' 
                      onClick={handleStartEditor} 
                      className='text-lime-400 hover:underline'>
                        utilize apenas texto.
                    </button>
              </p>
            ) : (
              <textarea 
                autoFocus 
                className='text-sm leading-6 text-slate-400 bg-transparent outline-none resize-none flex-1'
                value={content}
                onChange={handleContentChange}
              />
            )}
            </div>

            {isRecording ? (
               <button
                type='button'
                className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-400 font-semibold outline-none hover:bg-slate-950'
                onClick={handleStopRecording}
              >
                <div className='size-3 bg-red-500 rounded-full animate-pulse ring-1 ring-slate-400' />
                Gravando! (Clique p/ interromper)
              </button>
            ) : (
              <button
                type='submit'
                disabled={!content}
                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 font-semibold outline-none hover:bg-lime-500 disabled:opacity-70 disabled:bg-lime-400 disabled:cursor-not-allowed'
              >
                Salvar nota
              </button>
            )}

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}