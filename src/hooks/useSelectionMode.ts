import { useState, useCallback } from "react";

export const useSelectionMode = () => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelection = useCallback((fullLabel: string) => {
    setSelectedItems((prev) => {
      const exists = prev.includes(fullLabel);
      if (exists) return prev.filter((l) => l !== fullLabel);
      return [...prev, fullLabel];
    });
  }, []);

  const selectAll = useCallback((items: string[]) => {
    setSelectedItems(items);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedItems([]);
  }, []);

  const enterSelectionMode = useCallback((initialItem?: string) => {
    setSelectionMode(true);
    if (initialItem) {
      setSelectedItems([initialItem]);
    }
  }, []);

  return {
    selectionMode,
    selectedItems,
    toggleSelection,
    selectAll,
    exitSelectionMode,
    enterSelectionMode,
    setSelectionMode, // Exposed if needed for direct manipulation
  };
};
