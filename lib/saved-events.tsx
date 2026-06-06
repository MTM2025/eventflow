import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'saved_event_ids';

type SavedEventsContextValue = {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  loading: boolean;
};

const SavedEventsContext = createContext<SavedEventsContextValue | undefined>(undefined);

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSavedIds(JSON.parse(raw));
      })
      .catch((error) => console.error('Error loading saved events:', error))
      .finally(() => setLoading(false));
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) =>
        console.error('Error saving events:', error)
      );
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return (
    <SavedEventsContext.Provider value={{ savedIds, isSaved, toggleSave, loading }}>
      {children}
    </SavedEventsContext.Provider>
  );
}

export function useSavedEvents() {
  const ctx = useContext(SavedEventsContext);
  if (!ctx) {
    throw new Error('useSavedEvents must be used within a SavedEventsProvider');
  }
  return ctx;
}
