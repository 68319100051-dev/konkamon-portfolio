const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            response: "ไอ้สัส! ลืมใส่ API Key มาเหรอ?! ไปบอกไอ้กมล (Konkamon) ให้ใส่ Key มาเดี๋ยวนี้ กูฉลาดไปกว่านี้ไม่ได้ถ้าไม่มีข้าว (API Key) กิน!!" 
        });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    try {
        // DEBUG: List all models to see what is available
        // Note: The SDK might not expose listModels directly easily in some versions, 
        // so we attempt to return a clear error if model is NOT found
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Try stable pro first again with SDK
        
        const result = await model.generateContent(message);
        const aiResponse = result.response.text();
        res.status(200).json({ response: aiResponse.trim() });
    } catch (error) {
        console.error('Gemini SDK Error:', error);
        res.status(500).json({ 
            response: `ไอ้สัส! ระบบ Error! "${error.message}" ลองแคปหน้าจอนี้มาให้กูทีสัส!! (Model Error Debug Mode)` 
        });
    }
};
