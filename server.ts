import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Smart AI Assistant Endpoint powered by Gemini API
  app.post('/api/ai/recommend', async (req, res) => {
    try {
      const { budget, guestCount, governorate, eventType, language } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return structured intelligent fallback response
        return res.json({
          recommendation: language === 'en'
            ? `Based on your budget of ${budget || 30000} EGP and ${guestCount || 200} guests in ${governorate || 'Cairo'}, we recommend booking Royal Garden Hall in New Cairo (35,000 EGP) with Sarah Makeup Studio for bridal glam. Allocate 10% deposit now (${(budget || 30000) * 0.1} EGP) and settle the remaining balance 10 days before your event!`
            : `بناءً على ميزانيتك المرصودة (${budget || 30000} ج.م) وعدد ضيوفك (${guestCount || 200} ضيف) في محافظة ${governorate === 'giza' ? 'الجيزة' : governorate === 'qalyubia' ? 'القليوبية' : 'القاهرة'}، نوصيك بالتخطيط الآتي:\n1. حجز قاعة رويال جاردن بالتجمع الخامس أو فيو الأهرامات بالمنصورية.\n2. تخصيص 10% فقط الآن كعربون حجز لضمان التاريخ.\n3. اختيار باقة الميكب آرتيست والسيشن السينمائي مسبقاً لتفادي أي زيادة في الأسعار.`,
          suggestedPackage: {
            hallBudget: Math.round((budget || 30000) * 0.55),
            makeupBudget: Math.round((budget || 30000) * 0.15),
            photoBudget: Math.round((budget || 30000) * 0.18),
            musicBudget: Math.round((budget || 30000) * 0.12),
          },
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const langPrompt = language === 'en' ? 'Respond in clear, encouraging English.' : 'أجب باللغة العربية بأسلوب راقي ومشجع لمنظم المناسبة.';

      const prompt = `أنت المساعد الذكي الخبير لتطبيق "مناسباتي" في مصر (القاهرة، الجيزة، القليوبية).
تفاصيل المناسبة المطلوبة:
- الميزانية الإجمالية: ${budget} جنيه مصري
- عدد الضيوف المتوقع: ${guestCount} ضيف
- المحافظة: ${governorate}
- نوع المناسبة: ${eventType}

المطلوب:
قدّم نصيحة مخصصة توضح للعميل كيفية توزيع ميزانيته بين (القاعة/المكان، الميكب آرتيست، المصور والسيشن، الدي جي والموسيقى) وكيف يحقق أفضل استغلال لميزانيته، واذكر له إمكانية سداد 10% عربون الآن وسداد 90% المتبقية قبل المناسبة بـ 10 أيام.
${langPrompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const text = response.text || '';

      return res.json({
        recommendation: text,
        suggestedPackage: {
          hallBudget: Math.round(budget * 0.55),
          makeupBudget: Math.round(budget * 0.15),
          photoBudget: Math.round(budget * 0.18),
          musicBudget: Math.round(budget * 0.12),
        },
      });
    } catch (err: any) {
      console.error('Error generating AI recommendation:', err);
      return res.status(500).json({
        error: 'Failed to generate recommendation',
        details: err?.message || 'Internal AI Error',
      });
    }
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Munasabati Full-Stack App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
