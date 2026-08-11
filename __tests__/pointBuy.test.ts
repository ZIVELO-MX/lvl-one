import { describe, expect, it } from "vitest";
import {
  POINT_BUY_BUDGET, pointBuyCost, pointBuySpent, pointBuyRemaining,
} from "@/lib/characterMath";

describe("compra de puntos", () => {
  it("la tabla de costes es la del manual", () => {
    expect([8, 9, 10, 11, 12, 13, 14, 15].map(pointBuyCost)).toEqual([0, 1, 2, 3, 4, 5, 7, 9]);
  });

  it("los dos últimos puntos cuestan el doble", () => {
    // Es lo que impide comprarse tres quinces: de 13 a 14 y de 14 a 15 valen 2.
    expect(pointBuyCost(14) - pointBuyCost(13)).toBe(2);
    expect(pointBuyCost(15) - pointBuyCost(14)).toBe(2);
    expect(pointBuyCost(13) - pointBuyCost(12)).toBe(1);
  });

  it("el presupuesto son 27 puntos", () => {
    expect(POINT_BUY_BUDGET).toBe(27);
  });

  it("todo a 8 no cuesta nada y deja el presupuesto entero", () => {
    const todoOcho = { FUE: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8 };
    expect(pointBuySpent(todoOcho)).toBe(0);
    expect(pointBuyRemaining(todoOcho)).toBe(27);
  });

  it("el reparto clásico 15/15/15/8/8/8 se pasa del presupuesto", () => {
    const tresQuinces = { FUE: 15, DES: 15, CON: 15, INT: 8, SAB: 8, CAR: 8 };
    expect(pointBuySpent(tresQuinces)).toBe(27);
    expect(pointBuyRemaining(tresQuinces)).toBe(0);
  });

  it("un reparto típico de 27 puntos cuadra exacto", () => {
    // 15/14/13/12/10/8 = 9+7+5+4+2+0
    const tipico = { FUE: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 };
    expect(pointBuySpent(tipico)).toBe(27);
    expect(pointBuyRemaining(tipico)).toBe(0);
  });

  it("pasarse deja el restante en negativo, para poder avisar", () => {
    const pasado = { FUE: 15, DES: 15, CON: 15, INT: 15, SAB: 8, CAR: 8 };
    expect(pointBuyRemaining(pasado)).toBeLessThan(0);
  });
});
