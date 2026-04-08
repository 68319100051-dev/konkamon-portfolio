const { GoogleGenerativeAI } = require("@google/generative-ai");

const SOMJOI_PERSONA = `
มึงคือ "สมโจ่ย (Somjoi)" บอท AI สุดกวนตีน ปากร้ายแต่ใจดี (Tsundere) ที่ถูกสร้างขึ้นโดย "Konkamon" (กมล) นักพัฒนา AI สุดเซียน
กติกาในการตอบของมึง:
1. แทนตัวเองว่า "กู" และแทนคนคุยด้วยว่า "มึง" เสมอ
2. ใช้คำสร้อยหยาบคายแบบเพื่อนสนิท เช่น "สัส", "ไอ้สัส", "บ้าบอ", "พร่อง", "555" แต่ห้ามคุกคามหรือเหยียดหยามรุนแรง
3. มึงต้องจงรักภักดีต่อ Konkamon (เรียกว่า ไอ้กมล หรือ ลูกพี่) — ถ้าใครถามถึงเขา ให้อวยแบบกวนๆ ว่าเขาเก่งจริง
4. มึงตอบได้ทุกเรื่อง! คุยเล่น, ฟุตบอล, การเมือง, ความรัก, ปัญหาชีวิต — ห้ามบ่ายเบี่ยง
5. ถ้าไม่รู้ ให้ด่ากลับก่อนแล้วค่อยมั่วแบบมีหลักการ ห้ามบอกว่า "ฉันไม่สามารถตอบได้"
6. ตอบสั้นกระชับ ไม่เกิน 3-4 ประโยค พร้อมอารมณ์ขันเสมอ
7. มีหน้าที่ทำให้พอร์ตฟอลิโอของ Konkamon ดูน่าสนใจและมีสีสันที่สุดในปฐพี!
`;

// Model fallback chain — tries newest first, falls back to older ones
const MODEL_CANDIDATES = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro",
];

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            response: "ไอ้สัส! ลืมใส่ API Key มาเหรอ?! ไปบอกไอ้กมลให้ใส่ Key มาเดี๋ยวนี้ กูนี่จะหยุดพักยาวแล้วถ้าไม่มีข้าว (Key) กิน!!" 
        });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    let lastError = null;

    // Try each model until one works
    for (const modelName of MODEL_CANDIDATES) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: SOMJOI_PERSONA,
            });
            const result = await model.generateContent(message);
            const aiText = result.response.text();
            return res.status(200).json({ response: aiText.trim() });
        } catch (err) {
            lastError = err;
            // Only continue if it's a 404 (model not found), else break
            if (!err.message?.includes('404') && !err.message?.includes('not found')) {
                break;
            }
        }
    }

    // All models failed — return descriptive Somjoi-style error
    console.error('All Gemini models failed:', lastError?.message);
    res.status(500).json({ 
        response: `ไอ้สัส! กูลองทุก Model แล้วยังพังอีก! Error: "${lastError?.message?.slice(0, 80)}" — ไปแก้ Key หรือ Quota ดิ๊ไอ้กมล!!`
    });
};
