import { useState, useCallback } from "react";

export function useBulkSelection<T = string>() {
    const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

    // Toggle selection for a single item
    const toggleSelection = useCallback((id: T) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Select all items in a list (e.g., current page)
    const selectAll = useCallback((ids: T[]) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.add(id));
            return next;
        });
    }, []);

    // Deselect all items in a list (e.g., current page)
    const deselectAll = useCallback((ids: T[]) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => next.delete(id));
            return next;
        });
    }, []);

    // Clear all selections
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    // Check if an item is selected
    const isSelected = useCallback(
        (id: T) => selectedIds.has(id),
        [selectedIds]
    );

    // Check if all items in a list are selected (for header checkbox)
    const isAllSelected = useCallback(
        (ids: T[]) => ids.length > 0 && ids.every((id) => selectedIds.has(id)),
        [selectedIds]
    );

    // Check if some but not all items are selected
    const isIndeterminate = useCallback(
        (ids: T[]) => {
            const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
            return selectedCount > 0 && selectedCount < ids.length;
        },
        [selectedIds]
    );

    return {
        selectedIds,
        toggleSelection,
        selectAll,
        deselectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        isIndeterminate,
        count: selectedIds.size,
    };
}
