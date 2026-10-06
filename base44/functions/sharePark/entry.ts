import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'share') {
      const { parkName, playerName, gameData, day, reputation, guests, level } = body;
      if (!parkName) return Response.json({ error: 'Park name required' }, { status: 400 });

      const shareCode = Math.random().toString(36).slice(2, 8).toUpperCase();

      const entry = await base44.entities.SharedPark.create({
        share_code: shareCode,
        park_name: parkName,
        player_name: playerName || user.full_name || 'Player',
        game_data: gameData || {},
        day: day || 1,
        reputation: reputation || 0,
        guests: guests || 0,
        level: level || 1,
      });

      return Response.json({ ok: true, shareCode, id: entry.id });
    }

    if (action === 'view') {
      const { shareCode } = body;
      if (!shareCode) return Response.json({ error: 'Share code required' }, { status: 400 });

      const result = await base44.entities.SharedPark.filter(
        { share_code: shareCode.toUpperCase().trim() },
        { limit: 1 }
      );

      if (!result.items || result.items.length === 0) {
        return Response.json({ error: 'Park not found' }, { status: 404 });
      }

      return Response.json({ ok: true, park: result.items[0] });
    }

    if (action === 'list') {
      const result = await base44.entities.SharedPark.filter(
        {},
        { sort: '-created_date', limit: 20, fields: ['share_code', 'park_name', 'player_name', 'day', 'reputation', 'guests', 'level', 'created_date'] }
      );
      return Response.json({ ok: true, parks: result.items || [] });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}