# eSports Tournaments React Client

## Description
A React-based platform to create and manage video game tournaments focused on sports titles like FIFA (EA FC). Users can register accounts, invite friends, and join tournaments. The client communicates with a backend API for authentication, tournament management, and real-time updates.

## Features
- **User Authentication**: Sign up, log in, and manage profile.
- **Tournament Creation**: Create, edit, and delete tournaments.
- **Brackets Visualization**: Display tournament brackets using @g-loot/react-tournament-brackets.
- **Friend Invitations**: Invite friends to join tournaments via links or email.
- **Real-time Updates**: Socket.IO for real-time match results and bracket progression.
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
- **Network**: Axios, Socket.IO Client
- **Forms**: Formik, Yup
- **Authentication**: Firebase Auth
- **Realtime**: Socket.IO
- **Utilities**: moment, validator
- **Notifications**: react-hot-toast
- **ReCAPTCHA**: react-google-recaptcha

## Prerequisites
- Node.js >= 16
- npm or yarn
- Backend API endpoint (provided via environment variables)
- Firebase project for authentication
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
   Create a `.env` file in the project root:
   ```env
   VITE_NODE_ENV= 
   VITE_PROD_URL= 
   VITE_DEV_URL=
   VITE_RECAPTCHA_SITE_KEY= 
   VITE_RECAPTCHA_SECRET_KEY= 
   VITE_DISCORD_WEBHOOK=
   VITE_GOOGLE_CLIENT_ID=
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
