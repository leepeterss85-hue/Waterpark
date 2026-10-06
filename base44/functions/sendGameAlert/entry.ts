import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { alertType, title, message, emailAlerts, pushAlerts } = body;

    if (!title || !message) return Response.json({ error: 'Title and message required' }, { status: 400 });

    const alertLabels = {
      level_up: 'Level Up!',
      award: 'Award Won!',
      disaster: 'Disaster Alert',
      milestone: 'Milestone Reached',
    };
    const label = alertLabels[alertType] || 'Park Alert';

    // Send email alert
    if (emailAlerts !== false) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `AquaTycoon — ${label}: ${title}`,
        template_name: 'GameAlert',
        variables: {
          alert_label: label,
          alert_title: title,
          alert_message: message,
          park_name: title,
        },
      });
    }

    // Send push notification (silently fails if no native mobile build with push credentials)
    if (pushAlerts !== false) {
      try {
        await base44.asServiceRole.integrations.Core.SendPushNotification({
          user_id: user.id,
          title: `AquaTycoon — ${label}`,
          content: message,
        });
      } catch (e) {
        // Push requires native mobile build with push credentials configured
      }
    }

    return Response.json({ ok: true, sent_to: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}