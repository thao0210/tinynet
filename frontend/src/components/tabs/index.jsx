// Tabs.jsx
import { useState, createContext, useContext } from 'react';
import styles from './tabs.module.scss';

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`${styles.tabs} ${className || ''}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return <div className={`${styles.tabsList} ${className || ''}`}>{children}</div>;
}

export function TabsTrigger({ value, children }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <span
      className={isActive ? styles.triggerActive : styles.trigger}
      onClick={() => ctx.onValueChange(value)}
    >
      {children}
    </span>
  );
}

export function TabsContent({ value, children }) {
  const ctx = useContext(TabsContext);
  return ctx.value === value ? <div>{children}</div> : null;
} 
