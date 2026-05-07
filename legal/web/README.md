# FluentMate — Legal web pages

4 trang tĩnh để host ở `https://fluentmate.app/`:

| File | URL khi deploy | Dùng cho |
|---|---|---|
| `index.html` | `/` | Landing đơn giản, link tới 3 trang còn lại |
| `privacy.html` | `/privacy.html` | Privacy Policy (đã trỏ trong `src/constants/legal.ts`) |
| `terms.html` | `/terms.html` | Terms of Service (đã trỏ trong `src/constants/legal.ts`) |
| `delete-account.html` | `/delete-account.html` | Form xoá tài khoản (Google Play yêu cầu) |
| `style.css` | `/style.css` | shared stylesheet (auto dark mode) |

## Trước khi host

Tìm và thay 2 placeholder trong **all 4 HTML files** + `legal/privacy.md` + `legal/terms.md`:

- `[YOUR_NAME]` — tên cá nhân hoặc tên công ty (vd: "Le Duc Anh" hoặc "Nokasoft")
- `[YOUR_COMPANY_ADDRESS]` — địa chỉ pháp lý

```bash
cd legal/web
# Ví dụ:
sed -i '' 's/\[YOUR_NAME\]/Le Duc Anh/g' *.html
sed -i '' 's/\[YOUR_COMPANY_ADDRESS\]/123 Main St, Hanoi, Vietnam/g' *.html
```

## Cách deploy nhanh nhất (GitHub Pages, free)

1. Tạo repo mới `fluentmate-web` (public).
2. Copy toàn bộ `legal/web/*` vào root của repo đó:
   ```bash
   cd legal/web
   git init
   git add .
   git commit -m "Initial legal pages"
   git branch -M main
   git remote add origin git@github.com:<username>/fluentmate-web.git
   git push -u origin main
   ```
3. GitHub repo → Settings → Pages → Source: `main` branch / `/ (root)` → Save.
4. Chờ ~1 phút, sẽ ra URL `https://<username>.github.io/fluentmate-web/`.
5. Mua domain `fluentmate.app` (Cloudflare/Namecheap ~$15/năm) → trỏ CNAME tới `<username>.github.io`. Trong repo Settings → Pages → Custom domain: nhập `fluentmate.app`. GitHub tự cấp TLS sau ~10 phút.

## Cách deploy nhanh thứ 2 (Cloudflare Pages, free, không cần domain)

1. Push folder lên GitHub.
2. Cloudflare Dashboard → Pages → Create project → Connect Git → chọn repo.
3. Build settings: bỏ trống (static).
4. URL ra dạng `fluentmate-web.pages.dev` — có thể dùng tạm.

## Sau khi host

- Mở `https://fluentmate.app/privacy.html` xem có hiện đúng không.
- Mở `https://fluentmate.app/delete-account.html` test form (mailto: link sẽ mở mail client).
- Cập nhật `src/constants/legal.ts` nếu domain khác:
  ```ts
  export const PRIVACY_URL = 'https://<your-domain>/privacy.html';
  export const TERMS_URL = 'https://<your-domain>/terms.html';
  ```

## Form xoá tài khoản

Form dùng `mailto:` (mở mail client local của user) — đơn giản, không cần backend. Khi user submit, một email với toàn bộ field được tạo sẵn gửi đến `shopbebe56@gmail.com`.

Nếu sau này muốn nâng cấp (auto delete không cần email tay):
- Thay `action` thành endpoint Edge Function (vd: `https://qemvmnkjpnjeszltqgnu.supabase.co/functions/v1/delete-account-public`).
- Function verify email → gửi link xác nhận → user click → gọi `delete-account` Edge Function bằng service role.
