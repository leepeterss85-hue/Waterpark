import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, name, gameData, day, money, reputation, guests } = body;

    if (!action) return Response.json({ error: 'Missing action' }, { status: 400 });

    // --- SAVE (upsert by name) ---
    if (action === 'save') {
      if (!name || !name.trim()) return Response.json({ error: 'Save name required' }, { status: 400 });
      const trimmed = name.trim();
      const existing = await base44.entities.GameSave.filter({ save_name: trimmed }, { limit: 1 });
      const payload = {
        save_name: trimmed,
        game_data: gameData || {},
        day: day || 0,
        money: money || 0,
        reputation: reputation || 0,
        guests: guests || 0,
      };
      if (existing.items && existing.items.length > 0) {
        const updated = await base44.entities.GameSave.update(existing.items[0].id, payload);
        return Response.json({ ok: true, save: updated });
      }
      const created = await base44.entities.GameSave.create(payload);
      return Response.json({ ok: true, save: created });
    }

    // --- LIST ---
    if (action === 'list') {
      const result = await base44.entities.GameSave.filter({}, { sort: '-updated_date', limit: 50 });
      return Response.json({ ok: true, saves: result.items || [] });
    }

    // --- LOAD ---
    if (action === 'load') {
      if (!name || !name.trim()) return Response.json({ error: 'Save name required' }, { status: 400 });
      const result = await base44.entities.GameSave.filter({ save_name: name.trim() }, { limit: 1 });
      if (!result.items || result.items.length === 0) {
        return Response.json({ error: 'Save not found' }, { status: 404 });
      }
      return Response.json({ ok: true, save: result.items[0] });
    }

    // --- DELETE ---
    if (action === 'delete') {
      if (!name || !name.trim()) return Response.json({ error: 'Save name required' }, { status: 400 });
      const result = await base44.entities.GameSave.filter({ save_name: name.trim() }, { limit: 1 });
      if (!result.items || result.items.length === 0) {
        return Response.json({ error: 'Save not found' }, { status: 404 });
      }
      await base44.entities.GameSave.delete(result.items[0].id);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}