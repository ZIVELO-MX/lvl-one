-- LVL ONE — Migration 009: comprobar el nombre también sin sesión
--
-- El registro público pregunta si un nombre está libre ANTES de crear la
-- cuenta, y en ese momento quien pregunta todavía es anónimo. Sin este grant
-- la llamada falla, el formulario deja pasar el nombre repetido y el alta
-- muere en el trigger con un "Database error saving new user" que no explica
-- nada al usuario.
--
-- La función es security definer y sólo devuelve un booleano: no expone
-- ninguna fila de profiles. Para un anónimo auth.uid() es null, así que
-- `id is distinct from auth.uid()` es cierto para todas las filas y cualquier
-- nombre ya usado se reporta como ocupado, que es justo lo que queremos.

grant execute on function public.username_available(text) to anon;
