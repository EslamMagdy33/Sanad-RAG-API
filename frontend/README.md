# سند - الواجهة الأمامية

## التشغيل
1. شغّلي الباك اند على `http://localhost:5152`.
2. في هذا الفولدر:
   ```bash
   npm install
   npm run dev
   ```
3. افتحي `http://localhost:5173` (لازم يكون 5173 بالظبط، لأن الـ CORS متظبط عليه).

## ملفات مهمة
- `src/api/schema.ts`: أنواع الـ API. تقدري تولّديها من الباك بـ `npm run gen:api` وقت ما يكون شغال.
- `.env.local`: عنوان الباك، و`VITE_CHAT_MOCK` لتفعيل/تعطيل الـ mock للشات.

## ملاحظة
الـ Chat على mock حالياً. لما `/api/query` يجهز، حطي `VITE_CHAT_MOCK=false`.
