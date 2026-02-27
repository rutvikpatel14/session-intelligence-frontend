## Session Intelligence Frontend – Quick Setup

### 1. Prerequisites

- Node.js 18+ and npm

### 2. Install dependencies

```bash
cd session-intelligence-frontend
npm install
```

### 3. Configure API base URL (optional)

By default the app talks to `http://localhost:4000/api`.

If your backend runs somewhere else, create a `.env.local` in `session-intelligence-frontend`:

```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

### 4. Run the frontend

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.
