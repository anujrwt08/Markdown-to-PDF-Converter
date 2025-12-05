export type Theme = 'classic' | 'tech' | 'minimal' | 'cheatsheet';

export const themes: { id: Theme; name: string; color: string }[] = [
  { id: 'classic', name: 'Classic', color: 'bg-blue-500' },
  { id: 'tech', name: 'Tech', color: 'bg-emerald-500' },
  { id: 'minimal', name: 'Minimal', color: 'bg-neutral-800' },
  { id: 'cheatsheet', name: 'Sheet', color: 'bg-indigo-500' },
];
