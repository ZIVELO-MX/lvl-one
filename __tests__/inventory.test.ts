import { describe, expect, it } from "vitest";
import {
  addInventoryItem,
  equipInventoryItem,
  removeInventoryItem,
  unequipInventoryItem,
} from "@/lib/inventory";

describe("inventory helpers", () => {
  it("adds an item to the inventory", () => {
    expect(addInventoryItem(["Daga"], "Cuerda")).toEqual(["Daga", "Cuerda"]);
  });

  it("does not add duplicate or empty items", () => {
    expect(addInventoryItem(["Daga"], "Daga")).toEqual(["Daga"]);
    expect(addInventoryItem(["Daga"], "   ")).toEqual(["Daga"]);
  });

  it("equips an item that exists in the inventory", () => {
    const equipped = equipInventoryItem({ equipment: ["Daga", "Escudo"], equippedItems: ["Daga"] }, "Escudo");

    expect(equipped).toEqual(["Daga", "Escudo"]);
  });

  it("does not equip missing or duplicate items", () => {
    expect(equipInventoryItem({ equipment: ["Daga"], equippedItems: ["Daga"] }, "Daga")).toEqual(["Daga"]);
    expect(equipInventoryItem({ equipment: ["Daga"], equippedItems: [] }, "Escudo")).toEqual([]);
  });

  it("removes an item from inventory and equipped items", () => {
    const inventory = removeInventoryItem(
      { equipment: ["Daga", "Escudo", "Cuerda"], equippedItems: ["Daga", "Escudo"] },
      "Escudo",
    );

    expect(inventory).toEqual({
      equipment: ["Daga", "Cuerda"],
      equippedItems: ["Daga"],
    });
  });

  it("unequips an item without removing it from inventory", () => {
    expect(unequipInventoryItem(["Daga", "Escudo"], "Daga")).toEqual(["Escudo"]);
  });
});
