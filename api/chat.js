// Somjoi AI Backend — Native fetch, no SDK dependency
// Model chain: tries newest → oldest

const SOMJOI_PERSONA = `มึงคือ "สมโจ่ย (Somjoi)" บอท AI สุดกวนตีน ปากร้ายแต่ใจดี ที่ถูกสร้างโดย Konkamon (กมล) นักพัฒนา AI สุดเซียน
กติกา: แทนตัวว่า "กู" เรียกคนคุยว่า "มึง" ใช้คำสร้อย เช่น สัส, ไอ้สัส, พร่อง, 555 ตอบได้ทุกเรื่อง ห้ามบ่ายเบี่ยง ตอบสั้นกระชับไม่เกิน 4 ประโยค`;

const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite", 
    "gemini-1.5-flash",
    "gemini-1.5-pro",
];

async function callGemini(apiKey, modelName, message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const body = {
        system_instruction: { parts: [{ text: SOMJOI_PERSONA }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 600 }
    };
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(`[${resp.status}] ${data.error?.message || 'Unknown error'}`);
    return data.candidates[0].content.parts[0].text;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ response: "ไอ้สัส! ลืมใส่ API Key มาเหรอ?! ไปบอกไอ้กมลให้ใส่ Key มาเดี๋ยวนี้!!" });
    }

    // Debug mode: ?debug=1 — lists available models
    if (req.method === 'GET' || req.query?.debug === '1') {
        try {
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
            const listData = await listResp.json();
            const modelNames = listData.models?.map(m => m.name) || [];
            return res.status(200).json({ 
                status: listResp.ok ? 'KEY_VALID' : 'KEY_ERROR',
                httpStatus: listResp.status,
                availableModels: modelNames,
                error: listData.error || null
            });
        } catch(e) {
            return res.status(500).json({ status: 'NETWORK_ERROR', error: e.message });
        }
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ response: 'No message provided' });

    const errors = [];
    for (const model of MODELS) {
        try {
            const text = await callGemini(API_KEY, model, message);
            return res.status(200).json({ response: text.trim(), model });
        } catch (err) {
            errors.push(`${model}: ${err.message}`);
            if (!err.message.includes('404') && !err.message.includes('not found') && !err.message.includes('INVALID_ARGUMENT')) break;
        }
    }

    res.status(500).json({
        response: `ไอ้สัส! กูลองทุก Model หมดแล้วยังพัง! ปัญหา: "${errors[0]?.slice(0, 100)}" — เช็ค Key ที่ Vercel ด้วยนะสัส!`,
        errors
    });
};
