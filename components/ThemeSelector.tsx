'use client';

import { Theme, themes } from '@/types/theme';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex p-1 space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          className={clsx(
            'relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 outline-none focus-visible:ring-2',
            currentTheme === theme.id
              ? 'text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          )}
        >
          {currentTheme === theme.id && (
            <motion.div
              layoutId="activeTheme"
              className={clsx('absolute inset-0 rounded-md shadow-sm', theme.color)}
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{theme.name}</span>
        </button>
      ))}
    </div>
  );
}
