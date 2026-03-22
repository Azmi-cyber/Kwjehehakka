import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const logs = await kv.get('login_attempts') || [];
        res.status(200).json({ logs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
}
