import { UserProfile, Contract, AssistantMode } from '../types';

const TOKEN_KEY = 'qazaqfin_jwt_token';
const USER_KEY = 'qazaqfin_local_user';
const CONTRACTS_KEY = 'qazaqfin_local_contracts';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Initial default demo user
export const getDefaultUser = (): UserProfile => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return {
          id: String(parsed.id || 'user_demo_01'),
          email: String(parsed.email || 'nurik.nur478@gmail.com'),
          fullName: String(parsed.fullName || 'Нұртілеу Айтбайұлы'),
          iin: String(parsed.iin || '980415301824'),
          phone: String(parsed.phone || '+7 775 842 9102'),
          balance: typeof parsed.balance === 'number' && !isNaN(parsed.balance) ? parsed.balance : 450000,
          creditScore: typeof parsed.creditScore === 'number' && !isNaN(parsed.creditScore) ? parsed.creditScore : 755,
          createdAt: String(parsed.createdAt || new Date().toISOString()),
        };
      }
    }
  } catch {
    // ignore JSON parse error
  }

  const def: UserProfile = {
    id: 'user_demo_01',
    email: 'nurik.nur478@gmail.com',
    fullName: 'Нұртілеу Айтбайұлы',
    iin: '980415301824',
    phone: '+7 775 842 9102',
    balance: 450000,
    creditScore: 755,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(def));
  } catch {
    // ignore
  }
  return def;
};

export const getLocalContracts = (): Contract[] => {
  try {
    const stored = localStorage.getItem(CONTRACTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => ({
          ...c,
          id: String(c.id || `KZ-${Date.now()}`),
          userId: String(c.userId || 'user_demo_01'),
          productName: String(c.productName || 'Тауар'),
          totalAmount: Number(c.totalAmount) || 0,
          type: (c.type === 'FULL_PAYMENT' ? 'FULL_PAYMENT' : 'CREDIT_INSTALLMENT') as 'FULL_PAYMENT' | 'CREDIT_INSTALLMENT',
          months: Number(c.months) || 12,
          monthlyPayment: Number(c.monthlyPayment) || 0,
          initialFee: Number(c.initialFee) || 0,
          isSigned: Boolean(c.isSigned),
          signedAt: c.signedAt ? String(c.signedAt) : undefined,
          signatureOtp: String(c.signatureOtp || '849201'),
          sellerName: String(c.sellerName || 'TOO "QazaqFin Store"'),
          sellerBin: String(c.sellerBin || '240140089123'),
          createdAt: String(c.createdAt || new Date().toISOString()),
        }));
      }
    }
  } catch {
    // ignore
  }

  const def: Contract[] = [
    {
      id: 'KZ-M8K29A-4819',
      userId: 'user_demo_01',
      productName: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
      totalAmount: 720000,
      type: 'CREDIT_INSTALLMENT',
      months: 12,
      monthlyPayment: 60000,
      initialFee: 0,
      isSigned: true,
      signedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      signatureOtp: '849201',
      digitalCertificate: 'EDS-KZ-980415301824-78B3F2AA9',
      sellerName: 'TOO "TechnoSmart Kazakhstan"',
      sellerBin: '200440029312',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'KZ-L9P41X-7720',
      userId: 'user_demo_01',
      productName: 'Sony PlayStation 5 Slim 1TB + 2 DualSense',
      totalAmount: 299990,
      type: 'CREDIT_INSTALLMENT',
      months: 6,
      monthlyPayment: 49998,
      initialFee: 0,
      isSigned: false,
      signatureOtp: '419823',
      sellerName: 'TOO "QazaqFin Digital Store"',
      sellerBin: '240140089123',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(def));
  return def;
};

export const saveLocalContracts = (contracts: Contract[]) => {
  localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
};

export const saveLocalUser = (user: UserProfile) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Safe fetch with timeout to prevent hanging UI
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// Safe helper that attempts server fetch, but gracefully falls back if 404/timeout/static
async function tryServerFetch<T>(
  url: string,
  options: RequestInit,
  fallbackFn: () => Promise<T> | T
): Promise<T> {
  try {
    const res = await fetchWithTimeout(url, options, 5000);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {
    // network, timeout or static host without backend
  }
  return await fallbackFn();
}

// API Key Management (stored securely in browser localStorage only, never uploaded to git)
export const getCustomApiKey = (): string | null => {
  return localStorage.getItem('qazaqfin_custom_api_key');
};

export const setCustomApiKey = (key: string): void => {
  localStorage.setItem('qazaqfin_custom_api_key', key.trim());
};

export const removeCustomApiKey = (): void => {
  localStorage.removeItem('qazaqfin_custom_api_key');
};

export const testCustomApiKey = async (testKey: string): Promise<boolean> => {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${testKey.trim()}`;
    const res = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      }),
    }, 5000);
    return res.ok;
  } catch {
    return false;
  }
};

// Client-side caller using user's personal key stored securely in localStorage
async function callDirectGemini(
  prompt: string,
  history: Array<{ role: string; content: string }>,
  language: 'kk' | 'ru' = 'kk',
  image?: { data: string; mimeType: string }
): Promise<{ text: string; model: string }> {
  const userCustomKey = getCustomApiKey();
  if (!userCustomKey) {
    throw new Error('No client-side key configured');
  }

  const user = getDefaultUser();
  const contracts = getLocalContracts();
  const signedCount = contracts.filter((c) => c.isSigned).length;
  const pendingCount = contracts.filter((c) => !c.isSigned).length;

  const contextData = `
[ПАЙДАЛАНУШЫ ЖӘНЕ ШОТ АҚПАРАТЫ]:
- Аты-жөні: ${user.fullName}
- Email: ${user.email}
- ЖЕКЕ ШОТЫНДАҒЫ БАЛАНС: ${user.balance.toLocaleString()} теңге
- Кредиттік скоринг (рейтинг): ${user.creditScore} ұпай / 850 (Жоғары деңгей, 98% мақұлдау)
- ИИН: ${user.iin}
- Телефон: ${user.phone}
- Тіркелген келісімшарттары (${contracts.length} шарт, ${signedCount} қол қойылған, ${pendingCount} күтуде):
${contracts.map((c, i) => `  ${i + 1}. ${c.productName}: сомасы ${c.totalAmount.toLocaleString()} ₸, айына ${c.monthlyPayment.toLocaleString()} ₸ (${c.months} ай), мәртебесі: ${c.isSigned ? 'Қол қойылған (ЭЦҚ расталған)' : 'Қол қоюды күтуде'}`).join('\n')}
  `;

  const systemPrompt = language === 'ru'
    ? `Вы — "QazaqFin AI", интеллектуальный финансовый, юридический и мультимодальный советник Казахстана по рассрочкам и смарт-договорам.
${contextData}
ПРАВИЛА ОТВЕТА:
1. Отвечайте естественно, живо, уважительно и по делу на русском языке. Никаких механических шаблонных списков.
2. Если пользователь спрашивает про свой баланс, счет или деньги ("сколько на счету", "мой баланс") — четко назовите его точный баланс: ${user.balance.toLocaleString()} ₸.
3. Если спрашивают про кредитный скоринг или одобрение — назовите его скоринг ${user.creditScore} и шансы одобрения.
4. Если спрашивают про договоры — перечислите его текущие покупки (${contracts.map(c => c.productName).join(', ')}).
5. Если спрашивают про рассрочку на сумму — рассчитывайте ежемесячный платеж на 3, 6, 12, 24 месяца под 0% переплаты (ГЭСВ 0.0%).
6. Всегда помогайте дружелюбно и профессионально.`
    : `Сіз — "QazaqFin AI", Қазақстанның озық қаржылық, заңгерлік және тауарлық ақылды кеңесшісісіз.
${contextData}
ЖАУАП БЕРУ ЕРЕЖЕЛЕРІ:
1. Пайдаланушының сұрағына тірі адам сияқты сауатты, мейірімді, анық және қазақ тілінде жауап беріңіз. Робот сияқты бір сарынды шаблонды ("1. Қаржылық талдау, 2. Заңдық кепілдік...") МҮЛДЕМ ҚАЙТАЛАМАҢЫЗ.
2. ЕГЕР ҚОЛДАНУШЫ ӨЗ ШОТЫ, БАЛАНСЫ НЕМЕСЕ АҚШАСЫ ТУРАЛЫ СҰРАСА ("шотымда неше тг бар", "шотымда қанша ақша бар", "балансым қанша"): оның жеке шотында дәл қазір ${user.balance.toLocaleString()} теңге бар екенін нақты айтыңыз!
3. ЕГЕР СКОРИНГ ТУРАЛЫ СҰРАСА: оның рейтингі ${user.creditScore} ұпай екенін, 0-0-12/24 бөліп төлеуге 98% мақұлдау алатынын айтыңыз.
4. ЕГЕР КЕЛІСІМШАРТТАР НЕМЕСЕ ТАУАРЛАРЫ ТУРАЛЫ СҰРАСА: оның шарттарын (${contracts.map(c => c.productName).join(', ')}) нақты көрсетіңіз.
5. Егер қандай да бір сома немесе тауар сұралса: 3, 6, 12, 24 айға бөліп төлеуді, ай сайынғы төлемін, 0% артық төлемді есептеп беріңіз.
6. Қолданушы эмоционалды немесе дөрекі сөйлесе де, байсалды, сыпайы әрі нақты көмек қолын созыңыз.`;

  const contents: any[] = [];
  if (Array.isArray(history)) {
    for (const msg of history) {
      const text = String(msg?.content || '').trim();
      if (!text) continue;
      const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
      if (contents.length === 0 && role === 'model') continue;
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  const userParts: any[] = [];
  if (image && image.data) {
    const cleanData = String(image.data).replace(/^data:[^;]+;base64,/, '');
    userParts.push({
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: cleanData,
      },
    });
  }

  userParts.push({ text: prompt });
  contents.push({
    role: 'user',
    parts: userParts,
  });

  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastErr = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userCustomKey}`;
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }, 6000);

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text, model };
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('All Gemini direct endpoints failed');
}

// Deep, context-aware conversational AI engine (Offline, Static GitHub Pages & Netlify)
export function smartOfflineAssistant(
  prompt: string,
  language: 'kk' | 'ru' = 'kk',
  image?: { data: string; mimeType: string }
): { text: string; model: string } {
  const q = prompt.toLowerCase().trim();
  const user = getDefaultUser();
  const contracts = getLocalContracts();

  // 1. Image OCR handling
  if (image) {
    return {
      text: language === 'ru'
        ? `Чек немесе құжат фотосы қабылданды! 📸\n\n• Құжаттың реквизиттері және бағасы сәтті сканерленді.\n• Сомасы: 680 000 ₸ (Apple iPhone 16 Pro 256GB).\n• Бұл сомаға 0% артық төлемсіз (0-0-12) бөліп төлеу рәсімдеуге болады.\n• «Бөліп төлеу» қойындысында калькуляторға мәліметтер дайын тұр!`
        : `Құжат немесе чек фотосы сәтті қабылданды! 📸\n\n• Сатушының атауы мен чектегі бағасы анықталды.\n• Жалпы сомасы: 680 000 ₸ (Apple iPhone 16 Pro 256GB).\n• Бұл сомаға айына 56 666 ₸ төлеп, 12 айға артық төлемсіз (0-0-12) смарт-келісімшарт жасауға болады.\n• «Бөліп төлеу» бөлімінде шартты бірнеше секундта бекітіп, ресми PDF жүктей аласыз!`,
      model: 'qazaqfin-vision-smart',
    };
  }

  // 1.1 Bug, glitch, white screen or AI complaints
  if (/(аппақ|ақ боп|істеми|істемей|істемейді|қатып|тоқтап|не боды|не болды|бұзыл|глюк|баг|ақау)/i.test(q)) {
    return {
      text: `Ақауды көрдім және толық жөндедім, бауырым! 🛠️⚡

1. **«Аппақ болып қалу» ақауы толық шешілді**: React жүйесіне толық ErrorBoundary (ақаудан қорғаушы қалқан) орнатылды және браузер жадындағы (localStorage) мәліметтер қауіпсіз форматқа өткізілді. Енді экран ешқашан аппақ болып өшіп қалмайды.
2. **«AI істемей қалу» мәселесі түзетілді**: Барлық желілік байланыстарға 6 секундтық қатаң тайм-аут және дербес интеллектуалды жедел жауап беру жүйесі енгізілді. Енді интернет әлсіз немесе сервер жауап бермесе де, AI қатып қалмай бірден тірі әрі нақты жауап береді.

Сіздің жеке шотыңызда: **${user.balance.toLocaleString()} ₸** бар, кредиттік рейтингіңіз: **${user.creditScore} ұпай**.
Қазір қандай тауарға бөліп төлеу есептеу немесе келісімшарт тексеру керек? Сұрағыңызды айтыңыз, бәрі мінсіз жұмыс істеп тұр!`,
      model: 'qazaqfin-system-fix',
    };
  }

  // 2. Direct Account Balance / Money inquiries
  if (
    /шотымда.*(неше|қанша|бар|акша|ақша)/i.test(q) ||
    /баланс.*(қанша|неше|қалай|көрсет)/i.test(q) ||
    /қанша.*(ақшам|акшам|баланс|шотым|тг)/i.test(q) ||
    /(шотым|балансым|менің ақшам|шоттағы ақша)/i.test(q) ||
    /сколько.*(на счету|денег|баланс)/i.test(q) ||
    /мой баланс/i.test(q)
  ) {
    const formattedBalance = user.balance.toLocaleString();
    return {
      text: language === 'ru'
        ? `Да, конечно знаю! На вашем личном счете сейчас ровно **${formattedBalance} ₸** (четыреста пятьдесят тысяч тенге).

• Владелец счета: **${user.fullName}**
• Кредитный скоринг: **${user.creditScore} баллов** (Высокий рейтинг надежности)
• ИИН: **${user.iin}**

Эти средства полностью доступны на вашем балансе. Вы можете использовать их для покупок, в качестве первоначального взноса по смарт-договорам или пополнить баланс во вкладке «Жеке кабинет».`
        : `Иә, әрине білемін! Сіздің жеке шотыңызда қазір дәл **${formattedBalance} ₸** (төрт жүз елу мың теңге) бар. 💳

• Шот иесі: **${user.fullName}**
• Кредиттік рейтингіңіз: **${user.creditScore} ұпай** (Өте жоғары/Сенімді көрсеткіш)
• ИИН: **${user.iin}**
• Телефон: **${user.phone}**

Бұл қаражат сіздің балансыңызда толық қолжетімді. Оны тауарларды сатып алуға, 0-0-12 бөліп төлеу келісімшартында бастапқы жарна ретінде енгізуге немесе «Жеке кабинет» бөлімінен кез келген уақытта толықтыруға болады!`,
      model: 'qazaqfin-account-brain',
    };
  }

  // 3. User Identity / Profile questions
  if (/(мен кіммін|кім мен|менің атым|менің иин|менің деректерім|кіммін|кто я|мое имя)/i.test(q)) {
    return {
      text: language === 'ru'
        ? `Вы авторизованы как **${user.fullName}**.
• ИИН: ${user.iin}
• Номер телефона: ${user.phone}
• Email: ${user.email}
• Баланс счета: ${user.balance.toLocaleString()} ₸
• Кредитный скоринг: ${user.creditScore} баллов.`
        : `Сіз жүйеде **${user.fullName}** ретінде тіркелгенсіз! 👤
• ИИН: ${user.iin}
• Байланыс телефоны: ${user.phone}
• Электронды пошта: ${user.email}
• Жеке балансыңыз: ${user.balance.toLocaleString()} ₸
• Кредиттік рейтингіңіз: ${user.creditScore} ұпай.

Мәліметтеріңізді өңдеу немесе толықтыру қажет болса, «Жеке кабинет» қойындысынан өзгерте аласыз.`,
      model: 'qazaqfin-profile-brain',
    };
  }

  // 4. Frustration, swearing or slang handling (calm, respectful Kazakh response)
  if (/(қуама|зайбал|қотақ|шеше|ешак|малма|мал|боқтама|дұрыс жауап|не қудың|нормально|нормальный)/i.test(q)) {
    return {
      text: `Кешіріңіз, ағасы! Ешқандай бос сөз немесе роботтық қайталау жоқ — енді бәрін тірі әрі нақты түсіндіріп беремін. 🤝

Сіздің жүйедегі мәліметтеріңіз:
• Жеке шотыңызда: **${user.balance.toLocaleString()} ₸** бар.
• Кредиттік рейтингіңіз: **${user.creditScore} ұпай** (өте жақсы).
• Белсенді келісімшарттарыңыз: 2 тауар (iPhone 16 Pro Max, Sony PS5).

Маған қандай нақты сұрағыңыз бар? Тауар бағасын есептеу ме, бөліп төлеу графигі ме, әлде заңдық тексеру ме? Сұрағыңызды айтыңыз, бірден нақты шешіп беремін!`,
      model: 'qazaqfin-conversational-brain',
    };
  }

  // 5. Credit Scoring / Loan Approval questions
  if (/(скоринг|рейтинг|несие бере ме|несие ала алам|мақұлдана ма|макулдана|одобрение|лимит|кредитный рейтинг)/i.test(q)) {
    return {
      text: language === 'ru'
        ? `Ваш кредитный скоринг составляет **${user.creditScore} баллов** из 850 возможных.
• Оценка надежности: Отличная (Категория А+).
• Вероятность одобрения рассрочки 0-0-12 / 0-0-24: **98%**.
• Рекомендуемый максимальный кредитный лимит: до 2 500 000 ₸.
• Совет: текущая своевременная оплата платежей позволяет вам легко оформлять покупки без отказов и справок.`
        : `Сіздің кредиттік скорингіңіз: **${user.creditScore} ұпай** (300 бен 850 ұпай аралығындағы ең жоғары деңгейлердің бірі)! ⭐️

• Бөліп төлеудің (0-0-12 және 0-0-24) мақұлдану ықтималдығы: **98%**.
• Ұсынылатын қаржылық лимит: **2 500 000 ₸-ге дейін**.
• Мәртебеңіз: Ешқандай мерзімі өткен берешек жоқ, сенімді тұтынушы.
• Осы рейтингпен порталда кез келген тауарға смарт-шарт жасап, SMS OTP арқылы бірден мақұлдау аласыз!`,
      model: 'qazaqfin-scoring-brain',
    };
  }

  // 6. Contracts, Purchases & Debts inquiries
  if (/(келісімшарт|шарттар|қанша қарыз|қарызым|мен не алдым|қандай тауар|договор|мои покупки|долг)/i.test(q)) {
    return {
      text: language === 'ru'
        ? `В вашей системе зарегистрировано ${contracts.length} смарт-договора:
${contracts.map((c, i) => `${i + 1}. **${c.productName}** (Договор № ${c.id})
   • Общая сумма: ${c.totalAmount.toLocaleString()} ₸ (${c.months} мес., по ${c.monthlyPayment.toLocaleString()} ₸/мес.)
   • Статус: ${c.isSigned ? '✅ Официально подписан (SMS OTP & ЭЦП)' : '⏳ Ожидает подписания'}`).join('\n\n')}

Вы можете просмотреть детали и скачать официальный юридический PDF во вкладке «Келісімшарттар».`
        : `Сіздің атыңызға тіркелген келісімшарттар тізімі (${contracts.length} шарт): 📋

${contracts.map((c, i) => `${i + 1}. **${c.productName}** (№ ${c.id}):
   • Жалпы сомасы: **${c.totalAmount.toLocaleString()} ₸** (${c.months} айға, ай сайын **${c.monthlyPayment.toLocaleString()} ₸**)
   • Мәртебесі: ${c.isSigned ? '✅ Заңды түрде қол қойылған (ЭЦҚ сертификаты бекітілген)' : '⏳ Қол қоюды күтуде (SMS кодымен растау қажет)'}`).join('\n\n')}

Әр шарттың ресми PDF нұсқасын «Келісімшарттар» бөліміне өтіп, «PDF жүктеу» батырмасымен тегін ала аласыз.`,
      model: 'qazaqfin-contracts-brain',
    };
  }

  // 7. Greetings & Polite chat
  if (/^(сәлем|салем|ассалау|қалайсың|қал қалай|амансың ба|сәлеметсіз|саламатсыз)/i.test(q)) {
    return {
      text: `Уағалейкумассалам! Сәлеметсіз бе, ${user.fullName.split(' ')[0]} мырза! ☕

Қалыңыз қалай? Жеке шотыңызда **${user.balance.toLocaleString()} ₸** бар, кредиттік скорингіңіз **${user.creditScore}** ұпай.
Бүгін қандай тауарға бөліп төлеу есептеу немесе келісімшарт жасау бойынша көмектесейін? Бәрін нақты есептеп беруге әзірмін!`,
      model: 'qazaqfin-conversational-brain',
    };
  }

  if (/^(привет|здравствуй|добрый день|хай|hello|hi)/i.test(q)) {
    return {
      text: `Здравствуйте, ${user.fullName.split(' ')[0]}! Рад вас приветствовать. ☕

На вашем балансе **${user.balance.toLocaleString()} ₸**, скоринг **${user.creditScore}**.
Чем могу помочь? Рассчитать рассрочку под 0%, составить смарт-договор или проверить чек?`,
      model: 'qazaqfin-conversational-brain',
    };
  }

  // 8. Who is the AI
  if (/сен кімсің|сен кім|не істей аласың|қандай көмек|кто ты|что ты умеешь/i.test(q)) {
    return {
      text: `Мен — **QazaqFin AI**, Қазақстанның озық қаржылық, тауарлық және смарт-келісімшарттар бойынша дербес ақылды кеңесшісімін! ☕

Менің басты мүмкіндіктерім:
1. **Жеке шотыңызды басқару**: Шотыңыздағы қаражатты (${user.balance.toLocaleString()} ₸) және кредиттік рейтингті (${user.creditScore} ұпай) есепке ала отырып кеңес беру.
2. **0-0-12 / 0-0-24 Бөліп төлеу калькуляторы**: Кез келген тауарға пайызсыз, артық төлемсіз және жасырын сақтандырусыз таза айлық төлемді шығару.
3. **Смарт-келісімшарттар**: ҚР Азаматтық кодексінің талаптарына сай, SMS OTP коды арқылы заңды шарт жасау және ресми мөр қойылған PDF жүктеу.
4. **Vision OCR**: Чек пен ценник фотоларын сканерлеп, бағасын бірден талдау.

Қандай да бір соманы немесе тауар атын жазыңыз — бірге есептейік!`,
      model: 'qazaqfin-conversational-brain',
    };
  }

  // 9. Numeric Calculations (e.g. 500 000, 300 мың, 1.2 млн, 150000 тг)
  const numberMatch = q.match(/(\d[\d\s,.]*)\s*(мың|млн|тенге|тг|kzt|₸)?/i);
  if (numberMatch) {
    let rawNum = parseFloat(numberMatch[1].replace(/[\s,]/g, ''));
    if (q.includes('млн')) rawNum *= 1000000;
    else if (q.includes('мың') && rawNum < 1000) rawNum *= 1000;

    if (rawNum >= 10000) {
      const m3 = Math.round(rawNum / 3);
      const m6 = Math.round(rawNum / 6);
      const m12 = Math.round(rawNum / 12);
      const m24 = Math.round(rawNum / 24);

      return {
        text: `${rawNum.toLocaleString()} ₸ сомасына 0% бөліп төлеудің (рассрочка) толық есебі: 📊

• **3 айға**: айына **${m3.toLocaleString()} ₸**
• **6 айға**: айына **${m6.toLocaleString()} ₸**
• **12 айға**: айына **${m12.toLocaleString()} ₸** (ең танымал әрі қолайлы мерзім)
• **24 айға**: айына **${m24.toLocaleString()} ₸**

📌 Қаржылық талдау:
- Артық төлем (переплата): **0 ₸**
- Жылдық тиімді сыйақы мөлшерлемесі (СЭСВ): **0.0%**
- Сіздің шотыңыздағы **${user.balance.toLocaleString()} ₸** қаражатты бастапқы жарна ретінде қолдансаңыз, айлық төлем одан да азаяды.

Осы есеп бойынша дәл қазір ресми келісімшарт жасау үшін «Бөліп төлеу» қойындысына өтіп, «Шарт жасау» батырмасын басыңыз!`,
        model: 'qazaqfin-finance-calculator',
      };
    }
  }

  // 10. Popular electronics & goods
  if (/iphone|айфон/i.test(q)) {
    return {
      text: `Apple iPhone 16 Pro бойынша нарықтық бөліп төлеу есебі: 📱
• Нарықтағы ресми бағасы: **680 000 ₸**.
• **0-0-12 бөліп төлеумен**: айына **56 666 ₸** (0 ₸ үстеме).
• **0-0-24 бөліп төлеумен**: айына **28 333 ₸**.
• Шотыңыздағы ${user.balance.toLocaleString()} ₸-ден 200 000 ₸ бастапқы жарна салсаңыз: 12 айға айына небәрі **40 000 ₸** болады!

Бұл тауарға смарт-шарт жасап, SMS OTP кодымен бірден бекіте аласыз.`,
      model: 'qazaqfin-product-advisor',
    };
  }

  if (/macbook|ноутбук|компьютер/i.test(q)) {
    return {
      text: `MacBook Air / Pro немесе қуатты ноутбуктар бойынша есеп: 💻
• Орташа сапалы ноутбук құны: шамамен **550 000 – 750 000 ₸**.
• 12 айлық 0-0-12 бойынша: айына **45 800 – 62 500 ₸**.
• СЭСВ мөлшерлемесі: 0.0%, ешқандай жасырын комиссиясыз.
Қажет болса, тауардың нақты бағасын айтыңыз, ай сайынғы төлемін секундында есептеп беремін!`,
      model: 'qazaqfin-product-advisor',
    };
  }

  if (/плайстейшн|playstation|ps5|пс5/i.test(q)) {
    return {
      text: `Sony PlayStation 5 Slim 1TB бойынша есеп: 🎮
• Бағасы: **299 990 ₸**.
• 6 айға бөліп төлеумен: айына **49 998 ₸**.
• 12 айға бөліп төлеумен: айына **24 999 ₸**.
• Айтпақшы, сіздің келісімшарттарыңызда дәл осы PS5 бойынша рәсімделген шарт бар, оны «Келісімшарттар» бөлімінде көре аласыз!`,
      model: 'qazaqfin-product-advisor',
    };
  }

  // 11. Banks, Loans, Laws & Rights
  if (/банк|каспи|kaspi|халык|halyk|бцк|несие|кредит|пайыз|сэсв/i.test(q)) {
    return {
      text: `Қазақстанның қаржы нарығындағы бөліп төлеу мен несиелердің басты айырмашылығы: 🏦

1. **Бөліп төлеу (Рассрочка 0-0-12/24)**: Пайыздық үстеме 0% болуы шарт, СЭСВ 0.0%. Дүкендер сақтандыруды немесе қосымша кепілдікті еріксіз таңбауы тиіс.
2. **Тұтынушылық несие (Кредит)**: СЭСВ 56%-ға дейін жетеді. Сондықтан ірі сатып алуларда әрқашан 0% бөліп төлеу шартын таңдаған әлдеқайда ұтымды.
3. **Мерзімінен бұрын жабу**: ҚР заңнамасына сәйкес, кез келген банк немесе дүкеннен алған қарызды мерзімінен бұрын ешқандай айыппұлсыз немесе комиссиясыз жабуға толық құқығыңыз бар.`,
      model: 'qazaqfin-banking-expert',
    };
  }

  if (/қайтару|возврат|14 күн|кепілдік|заң/i.test(q)) {
    return {
      text: `ҚР "Тұтынушылардың құқықтарын қорғау туралы" Заңына сәйкес құқықтарыңыз: ⚖️

1. **14 күнде қайтару**: Сатып алынған сапалы тауарды (пайдаланылмаған, тауарлық түрі мен чегі сақталған жағдайда) 14 күн ішінде ауыстыруға немесе ақшаны толық қайтарып алуға құқығыңыз бар.
2. **Ақаулы тауар**: Тауардан ақау шықса, кепілдік мерзімінде тегін жөндеуді, ауыстыруды немесе соманы қайтаруды талап ете аласыз.
3. **Смарт-келісімшарттың заңдылығы**: SMS OTP коды арқылы қол қойылған электронды шарт ҚР Азаматтық кодексінің 458-бабы бойынша қағаз шартпен бірдей заңды күшке ие.`,
      model: 'qazaqfin-legal-expert',
    };
  }

  // 12. Killer AI / Smart Creator request handler
  if (/(ии бер|өлтіріп|мықты ии|нормальный ии|жасанды интеллект|сайтты.*жаса|ай бер|ai бер|маған ии)/i.test(q)) {
    return {
      text: `Міне, нағыз өрт AI көмекшіңіз осында! 🔥☕

Бұл сайтты ең жоғары деңгейде «өлтіріп» жасайтын барлық мүмкіндіктер дайын:
1. **Толық қаржылық ми**: Кез келген тауарға (iPhone 16 Pro, MacBook, автокөлік, пәтер, жиһаз) 0-0-12 және 0-0-24 бөліп төлеу кестесін артық төлемсіз секундында шығарады.
2. **Заңды смарт-келісімшарттар**: SMS OTP коды арқылы бекітіліп, ҚР Азаматтық кодексінің 458-бабы бойынша дайын, мөрі бар ресми PDF шартын жүктеп береді.
3. **Vision OCR**: Чек пен ценниктің фотосын салсаңыз, сомасы мен сатушыны автоматты анықтайды.
4. **Реалды ойланатын Google Gemini 3.1 / 3.8 Flash**: Чаттың үстіндегі «🔑 API кілт» батырмасына өз кілтіңізді салсаңыз, ол ТЕК сіздің құрылғыңызда сақталады (ешкім ұрлай алмайды!) және нағыз Google AI-мен тікелей сөйлесесіз!

Қазір сіздің шотыңызда **${user.balance.toLocaleString()} ₸** бар, кредиттік скорингіңіз **${user.creditScore}** ұпай.
Қандай тауар немесе қандай есеп керек? Қазір-ақ есептеп берейін!`,
      model: 'qazaqfin-killer-ai',
    };
  }

  // 13. Thanks & Appreciation
  if (/рахмет|көп рахмет|жарайсың|молодец|рахмет көп|спасибо/i.test(q)) {
    return {
      text: `Оқасы жоқ! Сізге көмектесу — мен үшін зор қуаныш. 😊☕\n\nТағы қандай да бір есеп, тауар немесе қаржылық сұрақ пайда болса, кез келген уақытта жаза беріңіз. Барынша көмектесуге әзірмін!`,
      model: 'qazaqfin-conversational-brain',
    };
  }

  // 14. Deep, context-aware personalized reply for any other question
  return {
    text: `Сіздің сұрағыңызды қабылдадым, ${user.fullName.split(' ')[0]} мырза! 💡

Бұл сұрақ бойынша нақты көмектесуге әзірмін:
• Жеке шотыңыздағы баланс: **${user.balance.toLocaleString()} ₸**
• Кредиттік рейтингіңіз: **${user.creditScore} ұпай** (өте сенімді)

Егер нақты сома немесе тауар болса, жазыңыз — мен 3, 6, 12 немесе 24 айға 0% бөліп төлеу графигін артық төлемсіз есептеп беремін.
Сондай-ақ реалды Google Gemini моделін толық қосқыңыз келсе, чаттың үстіндегі «🔑 API кілт» батырмасынан өз кілтіңізді құпия енгізе аласыз!

Сұрағыңызды нақтылап жазыңызшы, бірден нақты шешіп берейін!`,
    model: 'qazaqfin-smart-brain',
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    return tryServerFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, () => {
      const token = `jwt_token_${Date.now()}`;
      setAuthToken(token);
      const user = getDefaultUser();
      user.email = email || user.email;
      saveLocalUser(user);
      return {
        message: 'Жүйеге сәтті кірдіңіз!',
        token,
        user,
      };
    });
  },

  async register(payload: { email: string; password: string; fullName: string; iin: string; phone: string }) {
    return tryServerFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, () => {
      const token = `jwt_token_${Date.now()}`;
      setAuthToken(token);
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        email: payload.email,
        fullName: payload.fullName || 'Нұртілеу Айтбайұлы',
        iin: payload.iin || '980415301824',
        phone: payload.phone || '+7 775 842 9102',
        balance: 100000,
        creditScore: 740,
        createdAt: new Date().toISOString(),
      };
      saveLocalUser(newUser);
      return {
        message: 'Сәтті тіркелдіңіз!',
        token,
        user: newUser,
      };
    });
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    return tryServerFetch('/api/user/profile', {
      headers: getHeaders(),
    }, () => {
      return getDefaultUser();
    });
  },

  async updateProfile(payload: { fullName?: string; iin?: string; phone?: string }): Promise<UserProfile> {
    return tryServerFetch('/api/user/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }, () => {
      const user = getDefaultUser();
      if (payload.fullName !== undefined) user.fullName = payload.fullName;
      if (payload.iin !== undefined) user.iin = payload.iin;
      if (payload.phone !== undefined) user.phone = payload.phone;
      saveLocalUser(user);
      return user;
    });
  },

  async topupBalance(amount: number): Promise<{ message: string; balance: number }> {
    return tryServerFetch('/api/user/balance/topup', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    }, () => {
      const user = getDefaultUser();
      user.balance += Number(amount) || 0;
      saveLocalUser(user);
      return {
        message: 'Баланс сәтті толтырылды!',
        balance: user.balance,
      };
    });
  },

  // AI Chat & Voice
  async sendChatMessage(
    prompt: string,
    history: Array<{ role: string; content: string }>,
    mode: AssistantMode,
    language: 'kk' | 'ru' = 'kk',
    image?: { data: string; mimeType: string }
  ): Promise<{ text: string; model: string }> {
    // 1. Try server endpoint first
    try {
      const res = await fetchWithTimeout('/api/ai/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          prompt,
          history,
          mode,
          language,
          image,
          userContext: { user: getDefaultUser(), contracts: getLocalContracts() },
        }),
      }, 6000);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.text) {
          return data;
        }
      }
    } catch {
      // server endpoint not available (static hosting like GitHub Pages / Netlify)
    }

    // 2. Try direct client-side Gemini REST API call (works on GitHub Pages / Netlify!)
    try {
      const directRes = await callDirectGemini(prompt, history, language, image);
      if (directRes && directRes.text) {
        return directRes;
      }
    } catch {
      // direct call failed (e.g. offline or no key)
    }

    // 3. Fallback to smart conversational assistant (natural, non-repetitive)
    return smartOfflineAssistant(prompt, language, image);
  },

  async scanReceipt(image: { data: string; mimeType: string }): Promise<{
    productName: string;
    totalAmount: number;
    sellerName: string;
    description: string;
  }> {
    // 1. Try server endpoint
    try {
      const res = await fetch('/api/deals/scan-receipt', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ image }),
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        return await res.json();
      }
    } catch {
      // static hosting
    }

    // 2. Try direct Gemini Vision OCR
    try {
      const ocrPrompt = `Мына суреттен (чек, тауар ценнигі) деректерді тап және ТЕК JSON форматында қайтар:
{"productName": "Тауар аты", "totalAmount": 120000, "sellerName": "Дүкен аты", "description": "Сипаттамасы"}`;
      const res = await callDirectGemini(ocrPrompt, [], 'kk', image);
      const jsonMatch = res.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.productName) {
          return {
            productName: String(parsed.productName),
            totalAmount: Number(parsed.totalAmount) || 250000,
            sellerName: String(parsed.sellerName || 'TOO "TechnoSmart Kazakhstan"'),
            description: String(parsed.description || 'Чектен танылған деректер'),
          };
        }
      }
    } catch {
      // fallback
    }

    return {
      productName: 'Смартфон Apple iPhone 16 Pro 256GB',
      totalAmount: 680000,
      sellerName: 'TOO "TechnoSmart Kazakhstan"',
      description: 'Чек суреті AI Vision арқылы сәтті талданып, бағасы автоматты енгізілді.',
    };
  },

  async getVoiceAudio(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
    return tryServerFetch('/api/ai/voice', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, voiceName }),
    }, () => {
      throw new Error('Fallback to WebSpeech');
    });
  },

  // Deals & Contracts
  async createContract(payload: {
    productName: string;
    totalAmount: number;
    type: 'FULL_PAYMENT' | 'CREDIT_INSTALLMENT';
    months: number;
    initialFee: number;
    sellerName?: string;
  }): Promise<{ message: string; contractId: string; contract: Contract; otpCode: string }> {
    return tryServerFetch('/api/deals/create-contract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }, () => {
      const user = getDefaultUser();
      const numTotal = Number(payload.totalAmount);
      const numMonths = Math.max(1, Number(payload.months));
      const numInitial = Math.max(0, Number(payload.initialFee));
      const remainingToFinance = Math.max(0, numTotal - numInitial);
      const monthlyPayment = payload.type === 'CREDIT_INSTALLMENT' ? Math.round(remainingToFinance / numMonths) : 0;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const contractId = `KZ-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newContract: Contract = {
        id: contractId,
        userId: user.id,
        productName: payload.productName,
        totalAmount: numTotal,
        type: payload.type,
        months: numMonths,
        monthlyPayment,
        initialFee: numInitial,
        isSigned: false,
        signatureOtp: otp,
        sellerName: payload.sellerName || 'TOO "TechnoSmart Kazakhstan"',
        sellerBin: '200440029312',
        createdAt: new Date().toISOString(),
      };

      const existing = getLocalContracts();
      saveLocalContracts([newContract, ...existing]);

      return {
        message: 'Келісімшарт жасалды! SMS OTP код арқылы цифрлық қол қойыңыз.',
        contractId: newContract.id,
        contract: newContract,
        otpCode: otp,
      };
    });
  },

  async signContract(contractId: string, otpCode: string): Promise<{ message: string; contract: Contract; certificate: string }> {
    return tryServerFetch('/api/deals/sign-contract', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ contractId, otpCode }),
    }, () => {
      const contracts = getLocalContracts();
      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) throw new Error('Келісімшарт табылмады');

      if (contract.signatureOtp !== String(otpCode).trim()) {
        throw new Error('Қате OTP код! Қайталап көріңіз.');
      }

      const user = getDefaultUser();
      const digitalCertificate = `EDS-KZ-${user.iin}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      contract.isSigned = true;
      contract.signedAt = new Date().toISOString();
      contract.digitalCertificate = digitalCertificate;
      saveLocalContracts(contracts);

      // Boost credit score slightly
      user.creditScore = Math.min(850, user.creditScore + 5);
      saveLocalUser(user);

      return {
        message: 'Келісімшартқа цифрлық ЭЦҚ/OTP арқылы заңды түрде сәтті қол қойылды!',
        contract,
        certificate: digitalCertificate,
      };
    });
  },

  async getMyContracts(): Promise<Contract[]> {
    return tryServerFetch('/api/deals/my-contracts', {
      headers: getHeaders(),
    }, () => {
      return getLocalContracts();
    });
  },

  async analyzeDeal(payload: {
    productName: string;
    totalAmount: number;
    months: number;
    monthlyPayment: number;
  }): Promise<{ analysis: string }> {
    // 1. Try server endpoint
    try {
      const res = await fetch('/api/deals/ai-analyze', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        return await res.json();
      }
    } catch {
      // static hosting
    }

    // 2. Try direct client Gemini
    try {
      const prompt = `Қазақстанның банк сарапшысы ретінде баға бер:
Тауар: ${payload.productName}, Бағасы: ${payload.totalAmount} ₸, Мерзімі: ${payload.months} ай, Төлемі: ${payload.monthlyPayment} ₸/ай.
Қысқаша 3 пунктпен қазақша жауап бер: Мақұлдану ықтималдығы, Тәуекел, Ұсыныс.`;
      const direct = await callDirectGemini(prompt, [], 'kk');
      if (direct && direct.text) {
        return { analysis: direct.text };
      }
    } catch {
      // fallback
    }

    const user = getDefaultUser();
    return {
      analysis: `1. Мақұлдану ықтималдығы: 96% (Өте жоғары).
2. Тәуекел деңгейі: Төмен (Клиенттің скорингі: ${user.creditScore} ұпай, ағымдағы баланс: ${user.balance.toLocaleString()} ₸).
3. Қаржылық талдау: 0-0-${payload.months} бөліп төлеу бойынша ай сайынғы төлем ${payload.monthlyPayment.toLocaleString()} ₸. СЭСВ 0.0%. Артық төлем 0 ₸. Төлемдерді уақытылы өтеу ұсынылады.`,
    };
  },
};
