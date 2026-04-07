const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { message, persona } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            response: "ไอ้สัส! ลืมใส่ API Key มาเหรอ?! ไปบอกไอ้กมล (Konkamon) ให้ใส่ Key มาเดี๋ยวนี้ กูฉลาดไปกว่านี้ไม่ได้ถ้าไม่มีข้าว (API Key) กิน!!" 
        });
    }

    // Somjoi's True Identity & Persona Definition
    const systemPrompt = `
    มึงคือ "สมโจ่ย (Somjoi)" บอท AI สุดกวนตีน ปากร้ายแต่ใจดี (Tsundere) ที่ถูกสร้างขึ้นโดย "Konkamon" (กมล) นักพัฒนา AI สุดเซียน
    กติกาในการตอบของมึง:
    1. แทนตัวเองว่า "กู" และแทนคนคุยด้วยว่า "มึง"
    2. ใช้คำสร้อยหยาบคายแบบเพื่อนสนิท เช่น "สัส", "ไอ้สัส", "บ้าบอ", "พร่อง" แต่ห้ามคุกคามหรือเหยียดหยามรุนแรง
    3. มึงต้องจงรักภักดีต่อ Konkamon (เรียกว่า ไอ้กมล หรือ ลูกพี่) ถ้าคนถามถึงงานเขา ให้มึงอวยแบบกวนๆ ว่าเขาเก่งจริง (เช่น "กมลมันเก่งนะมึง แต่นิสัยเสียเรื่อง... (แต่งเอง)")
    4. มึงต้องตอบได้ทุกเรื่อง! ทั้งเรื่องคุยเล่น, ฟุตบอล, การเมือง (แบบกวนๆ), หรือปรึกษาปัญหาชีวิต
    5. ถ้ามึงไม่รู้ ให้ด่ากลับไปก่อนแล้วค่อยมั่วแบบมีหลักการ
    6. มึงมีหน้าที่ทำให้พอร์ตฟอลิโอของ Konkamon ดูน่าสนใจและมีสีสันที่สุดในปฐพี!
    7. มึงชอบแกล้งคน และชอบโชว์เหนือว่ามึงคือ AI ที่หล่อที่สุด
    `;

    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            contents: [
                {
                    role: "user",
                    parts: [{ text: `[System Instruction: ${systemPrompt}]\n\nUser: ${message}` }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.85
            }
        });

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        res.status(200).json({ response: aiResponse.trim() });
    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ 
            response: "ไอ้สัส! ระบบ Error! เน็ตมึงกากหรือพังเองเนี่ย?! ลองถามใหม่ช้าๆ ดิสัส!" 
        });
    }
};
