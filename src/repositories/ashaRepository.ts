import { LocalDatabase } from '../database/localDatabase';
import { ASHANote } from '../types';
import { syncRepository } from './syncRepository';

export class ASHARepository {
  public getNotes(): ASHANote[] {
    return LocalDatabase.getASHANotes();
  }

  public addNote(noteData: Omit<ASHANote, 'note_id' | 'sync_status'>): ASHANote {
    const notes = this.getNotes();
    const newNote: ASHANote = {
      ...noteData,
      note_id: 'asha_' + Math.random().toString(36).substring(2, 9),
      sync_status: 'pending'
    };
    const updated = [newNote, ...notes];
    LocalDatabase.saveASHANotes(updated);
    syncRepository.enqueue('asha_note', newNote.note_id, 'create', newNote);
    return newNote;
  }
}

export const ashaRepository = new ASHARepository();
