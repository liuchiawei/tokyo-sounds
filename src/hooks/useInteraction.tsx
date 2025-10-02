import React, { createContext, useContext, useState, ReactNode } from "react";

interface InteractionContextType {
  hoveredId: string | null;
  selectedId: string | null;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
}

/**
 * InteractionContext - Context for managing hover and selection states of 3D objects
 * 3Dオブジェクトのホバーおよび選択状態を管理するコンテキスト
 */
const InteractionContext = createContext<InteractionContextType | null>(null);

/**
 * InteractionProvider - Provides interaction context to child components
 * 子コンポーネントにインタラクションコンテキストを提供するプロバイダー
 */
export function InteractionProvider({ children }: { children: ReactNode }) {
  const [hoveredId, setHovered] = useState<string | null>(null);
  const [selectedId, setSelected] = useState<string | null>(null);

  return (
    <InteractionContext.Provider
      value={{ 
        hoveredId, 
        selectedId, 
        setHovered, 
        setSelected 
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

/**
 * useInteraction - Custom hook to access interaction context
 * インタラクションコンテキストにアクセスするためのカスタムフック
 */
export function useInteraction() {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used within an InteractionProvider");
  }
  return context;
}