# Security & Secrets

This project should never commit secret keys or environment files into source control.

## Immediate actions
- Rotate any keys that were shared in plaintext. Treat any key pasted into chat or stored in a committed file as compromised.
- Remove secrets from the repository history if they were committed (use `git filter-repo` or `git filter-branch`).

## Local development
- Store secrets in a local `.env.local` file (do NOT commit). Example:

```bash
# .env.local (local only)
OPENAI_API_KEY=sk-xxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_yyyy
CLERK_SECRET_KEY=sk_zzzz
```

- Ensure `.env.local` is listed in `.gitignore` (already configured).

## Deployment
- Use your hosting provider's secret management:
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site settings → Build & deploy → Environment
  - GitHub Actions: repository → Settings → Secrets and variables → Actions

Do NOT commit secrets into the repository or CI logs.

## Preventing accidental commits
- A pre-commit hook is installed to block committing `.env` files. It runs via `husky` and checks staged files; if it detects environment files it aborts the commit.
- To install hooks locally (first time):

```bash
npm install
npm run prepare
```

## If a secret leaks
1. Rotate the key immediately from the provider dashboard.
2. Revoke the old key.
3. Search your repository and remove the key from commits and PRs. Consider `git filter-repo` to purge history.
4. Audit where the key was used and ensure no unauthorized actions occurred.

If you want, I can help automate key rotation steps or remove leaked keys from the repo history.
