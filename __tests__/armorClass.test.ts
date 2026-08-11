import { describe, expect, it } from "vitest";
import { armorClassFrom } from "@/lib/characterMath";
import { EQUIPMENT_ITEMS } from "@/data/equipment";

const item = (id: string) => {
  const found = EQUIPMENT_ITEMS.find(i => i.id === id);
  if (!found) throw new Error(`no existe el objeto "${id}"`);
  return found;
};

// DES +3 es alta a propósito: es donde se nota el tope de las armaduras medias
// y pesadas, que es justo lo que la fórmula vieja se saltaba.
const mods = { DES: 3, CON: 2, SAB: 1 };

describe("clase de armadura", () => {
  it("sin nada encima: 10 + DES", () => {
    expect(armorClassFrom([], mods, "wizard")).toBe(13);
  });

  it("armadura ligera: suma toda la Destreza", () => {
    expect(armorClassFrom([item("leather_armor")], mods, "rogue")).toBe(14);
    expect(armorClassFrom([item("studded_leather")], mods, "rogue")).toBe(15);
  });

  it("armadura media: la Destreza tope a +2", () => {
    // 14 + min(3, 2) = 16, no 17.
    expect(armorClassFrom([item("scale_mail")], mods, "cleric")).toBe(16);
  });

  it("armadura pesada: la Destreza no cuenta", () => {
    expect(armorClassFrom([item("chain_mail")], mods, "fighter")).toBe(16);
  });

  it("el escudo suma +2 encima de lo que sea", () => {
    expect(armorClassFrom([item("chain_mail"), item("shield")], mods, "fighter")).toBe(18);
    expect(armorClassFrom([item("shield")], mods, "wizard")).toBe(15);
  });

  it("defensa sin armadura del bárbaro y del monje", () => {
    expect(armorClassFrom([], mods, "barbarian")).toBe(15); // 10 + 3 + CON 2
    expect(armorClassFrom([], mods, "monk")).toBe(14); // 10 + 3 + SAB 1
  });

  it("el monje pierde su defensa sin armadura al empuñar escudo", () => {
    expect(armorClassFrom([item("shield")], mods, "monk")).toBe(15); // 10 + 3 + 2, sin SAB
  });

  it("ponerse armadura anula la defensa sin armadura del bárbaro", () => {
    expect(armorClassFrom([item("chain_mail")], mods, "barbarian")).toBe(16);
  });

  it("la CA responde al equipo, no a la clase", () => {
    // El fallo que arregla esto: un mago con cota de mallas mostraba 10 + DES,
    // y un guerrero sin nada encima, 18.
    expect(armorClassFrom([item("chain_mail")], mods, "wizard")).toBe(16);
    expect(armorClassFrom([], mods, "fighter")).toBe(13);
  });
});
