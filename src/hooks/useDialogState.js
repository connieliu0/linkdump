import { useState, useCallback } from 'react';

export const useDialogState = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
};

export const useDialogWithReset = (initialState = false, resetFn) => {
  const dialogState = useDialogState(initialState);
  
  const close = useCallback(() => {
    if (resetFn) resetFn();
    dialogState.close();
  }, [resetFn, dialogState.close]);
  
  return { ...dialogState, close };
}; 