import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'submit') {
      const { playerName, parkName, level, day, reputation, guests, money, empirePoints, resortRating, peakGuests } = body;
      if (!parkName) return Response.json({ error: 'Park name required' }, { status: 400 });

      const score = Math.round(
        (reputation || 0) * 100 +
        (peakGuests || 0) * 10 +
        (empirePoints || 0) * 50 +
        (level || 1) * 200 +
        (resortRating || 0) * 30
      );

      const existing = await base44.entities.LeaderboardEntry.filter(
        { created_by_id: user.id },
        { limit: 1 }
      );

      const payload = {
        player_name: playerName || user.full_name || 'Player',
        park_name: parkName,
        level: level || 1,
        day: day || 1,
        reputation: reputation || 0,
        guests: guests || 0,
        money: money || 0,
        empire_points: empirePoints || 0,
        resort_rating: resortRating || 0,
        peak_guests: peakGuests || 0,
        score,
      };

      let entry;
      if (existing.items && existing.items.length > 0) {
        entry = await base44.entities.LeaderboardEntry.update(existing.items[0].id, payload);
      } else {
        entry = await base44.entities.LeaderboardEntry.create(payload);
      }

      return Response.json({ ok: true, entry });
    }

    if (action === 'fetch') {
      const result = await base44.entities.LeaderboardEntry.filter(
        {},
        { sort: '-score', limit: 50, fields: ['player_name', 'park_name', 'level', 'day', 'reputation', 'guests', 'money', 'empire_points', 'resort_rating', 'peak_guests', 'score', 'created_date'] }
      );
      return Response.json({ ok: true, entries: result.items || [] });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}