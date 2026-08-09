import { createClient } from "@/lib/supabaseClient";

export const MIN_USERNAME = 2;
export const MAX_USERNAME = 50;

/**
 * Valida el nombre de aventurero y comprueba que no lo tenga ya otra cuenta.
 * Devuelve el mensaje de error a mostrar, o null si el nombre sirve.
 *
 * La comprobación va por RPC (username_available) porque RLS no deja mirar
 * las filas de otros usuarios: un select directo diría siempre "libre".
 */
export async function checkUsername(raw: string): Promise<string | null> {
  const name = raw.trim();
  if (name.length < MIN_USERNAME) return `El nombre debe tener al menos ${MIN_USERNAME} caracteres.`;
  if (name.length > MAX_USERNAME) return "Nombre demasiado largo.";

  const { data, error } = await createClient().rpc("username_available", { name });

  // Si la comprobación no llega a responder se deja pasar: el índice único de
  // la base es el respaldo real, esto sólo existe para dar un error legible.
  if (error) return null;

  return data === false ? "Ese nombre ya está en uso. Elige otro." : null;
}
