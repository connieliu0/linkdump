import { useEffect } from 'react';
import { TimeSettings } from '../types';

export const useAgingEffect = (timeSettings: TimeSettings | null): void => {
  useEffect(() => {
    // ...
  }, [timeSettings]);
}; 