import { GoogleGenAI } from '@google/genai';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { prompt, language = 'kk', userContext } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          text: 'Netlify-де GEMINI_API_KEY орнатылмаған. Site settings -> Environment variables бөлімінен қосыңыз.',
          model: 'fallback-netlify',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const user = userContext?.user || { fullName: 'Нұртілеу Айтбайұлы', balance: 450000, creditScore: 755 };

    const systemInstruction = language === 'ru'
      ? `Вы — "QazaqFin AI", умный финансовый и юридический ассистент Казахстана. Пользователь: ${user.fullName}, баланс: ${Number(user.balance).toLocaleString()} ₸, скоринг: ${user.creditScore}. Отвечайте живо, точно и профессионально.`
      : `Сіз — "QazaqFin AI", Қазақстанның озық қаржылық, тауарлық және смарт-келісімшарттар ассистентісіз. Пайдаланушы: ${user.fullName}, шотындағы қаражат: ${Number(user.balance).toLocaleString()} ₸, скорингі: ${user.creditScore}. Ешқандай шаблонсыз, өте табиғи, сауатты, адамша қазақ тілінде жауап беріңіз.`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: { systemInstruction },
    });

    return new Response(
      JSON.stringify({
        text: response.text || 'Жауап алынды.',
        model: 'gemini-3.1-flash-lite',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
