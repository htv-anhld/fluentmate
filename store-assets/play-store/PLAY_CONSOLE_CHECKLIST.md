# Play Console — Step-by-step Submission Checklist

> URL gốc: https://play.google.com/console
> .aab đã download: `~/Downloads/fluentmate-1.0.0.aab` (63MB)

---

## Phần 0 — Trước khi bắt đầu

- [ ] Có Google Play Developer account ($25 phí 1 lần / Personal, hoặc miễn phí nếu Organization có DUNS)
- [ ] Đã verify identity (1-3 ngày)
- [ ] Có thẻ thanh toán cho developer profile

---

## Phần 1 — Create app (5 phút)

1. Login https://play.google.com/console
2. Click **Create app**
3. Điền:
   - App name: `FluentMate`
   - Default language: `Vietnamese (vi-VN)`
   - App or game: `App`
   - Free or paid: `Free`
4. Tick 2 declarations cuối + 2 policy acknowledgments
5. **Create app**

---

## Phần 2 — Set up your app (Dashboard tasks)

Vào sidebar **Dashboard**. Hoàn thành tất cả task ở section "Set up your app":

### 2.1 App access
- Vào **Policy → App content → App access**
- Chọn "All or some functionality is restricted"
- Add login credentials cho Google reviewer:
  - Email: `anhld229@gmail.com`
  - Password: `Test123@123`
  - Notes: `Đăng nhập bằng email/password trên màn login. Tất cả tính năng đều mở.`

### 2.2 Ads
- Vào **App content → Ads**
- Chọn: **No, my app does not contain ads**

### 2.3 Content rating
- Vào **App content → Content rating** → **Start questionnaire**
- Email: `shopbebe56@gmail.com` (hoặc bất kỳ)
- Category: **Reference, news, or educational**
- Trả lời "No" cho tất cả câu hỏi về violence, sex, drugs, gambling, profanity, etc.
- Submit → app sẽ rated **Everyone** ✅

### 2.4 Target audience
- Vào **App content → Target audience and content**
- Target age: chọn `18 and over` (an toàn nhất, không phải comply Teacher Approved / Children Online Privacy)
- Appeal to children: No
- **Save**

### 2.5 News app
- Vào **App content → News app**
- "No, my app is not a news app"

### 2.6 COVID-19 contact tracing
- "No, my app is not a publicly available COVID-19 contact tracing or status app"

### 2.7 Data safety ⚠️ phần dài nhất

Vào **App content → Data safety** → **Start**

**Step 1: Data collection and security**
- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS via Supabase)
- Do you provide a way for users to request that their data is deleted? **Yes**
  - Web URL: `https://fluentmate-legal.vercel.app/delete-account`

**Step 2: Data types** — tick các loại sau:

| Category | Data types |
|---|---|
| Personal info | ✅ Name, ✅ Email address, ✅ User IDs |
| Audio files | ✅ Voice or sound recordings |
| App activity | ✅ App interactions, ✅ Other user-generated content (conversation transcripts) |

KHÔNG tick: Location, Financial info, Health, Photos, Videos, Files, Calendar, Contacts, Messages, Web browsing, App info & performance, Device IDs

**Step 3: For each data type chọn ở Step 2**, trả lời:

| Field | Answer |
|---|---|
| Collected? | Yes |
| Shared with third parties? | **Yes** (Google Gemini API, Supabase) |
| Required or optional? | Required |
| Purposes (tick all that apply) | App functionality, Account management, Analytics |

**Step 4: Review** → **Submit**

### 2.8 Government app
"No"

### 2.9 Financial features
"None of these"

### 2.10 Health features
"None of these"

### 2.11 Privacy policy
- Vào **Policy → App content → Privacy policy**
- URL: `https://fluentmate-legal.vercel.app/privacy`
- Save

---

## Phần 3 — Main store listing (15 phút)

Vào **Grow → Store presence → Main store listing**

### 3.1 App details (vi-VN default)
- **App name**: `FluentMate – Luyện nói tiếng Anh` (paste từ `listing-vi.md`)
- **Short description** (≤80): `Luyện nói tiếng Anh với AI coach: sửa ngữ pháp, phát âm, từ vựng tức thì.`
- **Full description** (≤4000): paste full từ `listing-vi.md`

### 3.2 Graphics
- **App icon**: upload `store-assets/play-store/icons/play-store-icon-512.png`
- **Feature graphic**: upload `store-assets/play-store/feature-graphic-1024x500.png`
- **Phone screenshots**: upload tất cả 6 file từ `store-assets/play-store/screenshots/final/`:
  1. `01-today.png`
  2. `02-talk.png`
  3. `03-learn.png`
  4. `04-progress.png`
  5. `05-report.png`
  6. `06-profile.png`
- **7-inch tablet** + **10-inch tablet** screenshots: skip (chỉ optional, có thể thêm sau)

### 3.3 Categorization (Grow → Store settings)
- App category: **Education**
- Tags (chọn 3-5): `Language Learning`, `English`, `Speaking Practice`
- Contact details:
  - Email: `shopbebe56@gmail.com`
  - Website: `https://fluentmate-legal.vercel.app/`
  - Phone: optional

### 3.4 Tab Translations (optional)
- Add `English (en-US)` locale
- Paste từ `listing-en.md`
- Upload `feature-graphic-1024x500-en.png`
- Phone screenshots: cùng 6 file (Play Store accept reuse)

---

## Phần 4 — Internal testing release (10 phút)

Vào **Testing → Internal testing**

### 4.1 Testers
- Tab **Testers** → Create email list
  - List name: `FluentMate-internal-testers`
  - Add emails (Gmail accounts của bạn + max 100 tester):
    - `anhld229@gmail.com`
    - `shopbebe56@gmail.com`
    - (thêm bạn bè muốn test)
- **Save changes**

### 4.2 Create release
- Tab **Releases** → **Create new release**
- **App bundles**: drag-drop file `~/Downloads/fluentmate-1.0.0.aab`
- Đợi Play Console verify (~30s)
- **Release name**: tự fill thành `2 (1.0.0)` — OK
- **Release notes**:
  - vi-VN: paste từ `release-notes.md` (vi-VN block)
  - en-US: paste từ `release-notes.md` (en-US block)
- **Save** → **Review release** → **Start rollout to Internal testing**

### 4.3 Lấy testing URL
- Sau rollout (~5 phút), tab **Internal testing → Testers**
- Copy URL "Join on the web" — link share cho tester
  - Ví dụ: `https://play.google.com/apps/internaltest/4701234567890123456`

### 4.4 Tester install (Android device)
1. Tester mở URL trên Android phone (đã login Gmail có trong list)
2. Click **Become a tester**
3. Đợi 5-15 phút → mở Play Store app → search "FluentMate" → Install như app bình thường
4. Test golden path:
   - Sign up / login
   - Onboarding flow
   - Today hub → start a conversation
   - End conversation → xem report
   - Check Profile → Settings

---

## Phần 5 — Sau Internal Testing OK (1-3 ngày test)

### 5.1 Personal account → Closed Testing (BẮT BUỘC)
- Đây là requirement mới của Google 2024 cho personal accounts
- Vào **Testing → Closed testing** → **Create track**
- Cần ≥12 testers chạy ≥14 ngày liên tục
- Có thể reuse cùng .aab + cùng store listing

### 5.2 Sau 14 ngày Closed Testing
- Vào **Production** → **Create release**
- Upload cùng .aab (hoặc bản mới hơn)
- Submit → Google review 1-7 ngày → **App live trên Play Store!** 🎉

### 5.3 Organization account
- Skip Closed Testing — đi thẳng từ Internal → Production
- Submit cho Google review

---

## Liên kết nhanh

| Resource | URL |
|---|---|
| Play Console | https://play.google.com/console |
| EAS build dashboard | https://expo.dev/accounts/anhld29/projects/fluentmate/builds |
| .aab file | `~/Downloads/fluentmate-1.0.0.aab` |
| Legal site | https://fluentmate-legal.vercel.app |
| GitHub repo | https://github.com/htv-anhld/fluentmate |

---

## Troubleshoot

**"Your app's data safety section is missing required information"**
→ Vào lại Data safety, đảm bảo cả 3 step đã save

**"Privacy policy URL not accessible"**
→ Test mở link `/privacy` ở incognito; nếu Vercel có password protection bật, vào Vercel project → Settings → Deployment Protection → Disabled

**"Couldn't process your app bundle"**
→ Hiếm khi xảy ra. Có thể do sign mismatch. Re-build với `eas build` và upload lại

**Tester không thấy app sau khi join**
→ Đợi đủ 15 phút sau rollout, đảm bảo Gmail đã login trên device và device là Android (không phải iPhone)
