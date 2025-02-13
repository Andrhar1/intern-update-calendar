import { google } from 'googleapis';
//import { NowRequest, NowResponse } from '@vercel/node';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const { eventId, summary, description, start, end, attendees } = req.body;

    if (!eventId || !summary || !start || !end) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary,
            description,
            start: { dateTime: start.dateTime, timeZone: start.timeZone },
            end: { dateTime: end.dateTime, timeZone: end.timeZone },
            attendees,
        };

        const response = await calendar.events.update({
            calendarId: 'primary',
            eventId,
            resource: event,
        });

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}