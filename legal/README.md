# Legal documents

These markdown files are templates for the **Privacy Policy** and **Terms of Service** that the app links to. Both Apple App Store and Google Play **require working URLs** for these before they will accept the app.

## Required steps before store submission

1. **Edit the placeholders** in `privacy.md` and `terms.md`:
   - `[YOUR_NAME]` — your legal name or company name
   - `[YOUR_EMAIL]` — a real support inbox you check (e.g. Gmail)
   - `[YOUR_COMPANY_ADDRESS]` — required for GDPR compliance

2. **Convert markdown to HTML** (one option):
   ```bash
   # Using pandoc
   pandoc legal/privacy.md -o legal/privacy.html --standalone --metadata title="Privacy Policy"
   pandoc legal/terms.md -o legal/terms.html --standalone --metadata title="Terms of Service"
   ```
   Or paste the markdown into a tool like https://markdowntohtml.com.

3. **Host the HTML somewhere public** (free options):
   - **Cloudflare Pages**: free, custom domain, 5 minutes setup
   - **Vercel**: free, custom domain, drag-drop deploy
   - **GitHub Pages**: free, public repo only

4. **Update [src/constants/legal.ts](../src/constants/legal.ts)** with the live URLs:
   ```ts
   export const SUPPORT_EMAIL = 'support@yourdomain.com';
   export const PRIVACY_URL = 'https://yourdomain.com/privacy.html';
   export const TERMS_URL = 'https://yourdomain.com/terms.html';
   ```

5. **Verify the URLs open in a browser** before submitting to stores. Apple reviewers will visit them — broken links cause rejection.

## Quick alternative — generators

If you'd rather have a lawyer-vetted template:
- **termly.io** — free tier, good Privacy Policy generator
- **iubenda.com** — paid (~$30/year) but covers GDPR/CCPA/COPPA properly

These markdown files cover the basics for an MVP launch but **are not a substitute for legal advice**.
