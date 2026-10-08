# eSports Tournaments React Client

## Description
A React-based platform to create and manage video game tournaments for sports titles: FIFA (EA FC) and MLB The Show. Users can register accounts, invite friends, and join tournaments. There is no custom server: the whole backend (auth, database, business logic, realtime, file storage) runs on Supabase.

## Features
- **User Authentication**: Sign up, log in, and manage profile.
- **Tournament Creation**: Create, edit, and delete tournaments.
- **Brackets Visualization**: Display tournament brackets using @g-loot/react-tournament-brackets.
- **Friend Invitations**: Invite friends to join tournaments via links or email.
- **Real-time Updates**: Supabase Realtime for friend notifications and online presence.
- **Game modes**: FIFA (club search via api-sports) and MLB The Show (all 30 MLB teams from the free MLB Stats API). Baseball games cannot end in a tie. Each side of an MLB game can have a starting pitcher (searched in the MLB Stats API), and the Rotation tab shows each player's starters and how many games ago each pitched.
- **Responsive UI**: Styled with PrimeReact, PrimeFlex, and styled-components.
- **Form Handling & Validation**: Formik + Yup for robust form workflows.
- **Notifications**: Toast notifications via react-hot-toast.
- **ReCAPTCHA**: Google ReCAPTCHA v2 integration for secure sign-ups.

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite
- **State Management**: Redux Toolkit (react-redux)
- **UI Components**: PrimeReact, PrimeFlex, styled-components
- **Icons**: FontAwesome
- **Network**: supabase-js, Axios
- **Forms**: Formik, Yup
- **Backend**: Supabase (Auth, Postgres + RLS, SQL functions, Realtime, Storage)
- **Utilities**: moment, validator
- **Notifications**: react-hot-toast
- **ReCAPTCHA**: react-google-recaptcha

## Prerequisites
- Node.js >= 16
- npm or yarn
- A Supabase project (free tier works)
- Google ReCAPTCHA site key

## Installation
1. **Clone the repo**  
   ```bash
   git clone https://github.com/maidelrego/eSportsTournaments-react-client.git
   cd esportstournaments-react-client
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**  
   Copy `.env.example` to `.env` and fill it in:
   ```env
   VITE_NODE_ENV=development
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon / publishable key>
   VITE_FOOTBALL_API_KEY=<api-sports.io key, FIFA team search>
   VITE_RECAPTCHA_SITE_KEY=
   VITE_DISCORD_WEBHOOK=
   ```
   Never put the `service_role` key in the client.

## Supabase setup
All database objects live in [`supabase/migrations`](supabase/migrations) (tables, RLS policies, SQL functions, storage bucket, realtime). No Docker is needed, they are pushed straight to your hosted project:
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```
Then, in the Supabase dashboard (Authentication):
- **URL Configuration**: set Site URL to `http://localhost:5173` (and your Vercel URL when deployed) and add both to Redirect URLs. Password reset and email confirmation links use them.
- **Sign In / Providers**: decide whether "Confirm email" is on. Optional: enable Google with your Google OAuth client ID and secret.

Smoke test of schema, RLS and functions (runs in a transaction that is always rolled back):
```bash
npx supabase db query --linked -f supabase/tests/smoke.sql
```

## Development
Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Building for Production
Generate a production build:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```
Deploy on Vercel (`vercel.json` already rewrites everything to the SPA): set the same `VITE_*` variables in the project settings.
Note: Supabase free projects pause after 7 days without activity.

## Code Quality
- **Linting**: ESLint configured for React and hooks  
```bash
npm run lint
```

## Contributing
1. Fork the repository  
2. Create a branch: `git checkout -b feature/your-feature`  
3. Commit your changes: `git commit -m "feat: your feature"`  
4. Push to branch: `git push origin feature/your-feature`  
5. Open a Pull Request

## License
This project is licensed under the MIT License.  
Feel free to use, modify, and distribute responsibly.
