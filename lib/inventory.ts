export interface InventorySnapshot {
  equipment: string[];
  equippedItems?: string[];
}

function cleanItem(item: string): string {
  return item.trim();
}

export function addInventoryItem(equipment: string[], item: string): string[] {
  const nextItem = cleanItem(item);
  if (!nextItem || equipment.includes(nextItem)) return equipment;
  return [...equipment, nextItem];
}

export function equipInventoryItem(inventory: InventorySnapshot, item: string): string[] {
  const nextItem = cleanItem(item);
  const equippedItems = inventory.equippedItems ?? [];
  if (!nextItem || !inventory.equipment.includes(nextItem) || equippedItems.includes(nextItem)) {
    return equippedItems;
  }
  return [...equippedItems, nextItem];
}

export function unequipInventoryItem(equippedItems: string[] | undefined, item: string): string[] {
  const nextItem = cleanItem(item);
  return (equippedItems ?? []).filter((equipped) => equipped !== nextItem);
}

export function removeInventoryItem(inventory: InventorySnapshot, item: string): InventorySnapshot {
  const nextItem = cleanItem(item);
  return {
    equipment: inventory.equipment.filter((equipmentItem) => equipmentItem !== nextItem),
    equippedItems: unequipInventoryItem(inventory.equippedItems, nextItem),
  };
}
