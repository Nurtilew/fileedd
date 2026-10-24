# AtTimeLine

QazaqFin AI & Smart Contracts — Қазақстандық озық AI қаржылық кеңесші және Смарт-Келісімшарттар порталы (Coffee Bean стилінде).

---

## 🚀 Netlify-ге жүктеу (Deploy to Netlify)

### 1-әдіс (Ең оңайы - Drag & Drop):
1. Жоба папкасында терминалда `npm run build` орындаңыз.
2. Пайда болған `dist` папкасын [app.netlify.com/drop](https://app.netlify.com/drop) бетіне апарып тастаңыз.
3. Сайт 5 секундта қатесіз қосылады!

### 2-әдіс (GitHub арқылы):
1. GitHub репозиторийіңізді Netlify-ге қосыңыз.
2. Жоба ішіндегі `netlify.toml` барлық параметрлерді автоматты түрде реттейді:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
   - **SPA Redirects**: автоматты бапталған (`/* -> /index.html 200`)

---

## 🐙 GitHub Pages-ке жүктеу (Deploy to GitHub Pages)

1. Репозиторий параметрлеріне өтіңіз: **Settings > Pages**.
2. **Source** бөлімінен **GitHub Actions** таңдаңыз.
3. `.github/workflows/deploy.yml` файлы кез келген папка атында (сансыз, кез келген атауда) автоматты анықтап, жобаны жинап жариялайды.
4. `vite.config.ts` ішінде `base: './'` орнатылғандықтан, кез келген ішкі жолда (`/repo-name/`) барлық скрипттер мен стилдер 100% қатесіз ашылады.

---

## 💻 Жергілікті ортада іске қосу (Local Development)

```bash
# 1. Тәуелділіктерді орнату
npm install

# 2. Дамыту серверін іске қосу (Port 3000)
npm run dev

# 3. Өндірістік нұсқаны жинау
npm run build
```
