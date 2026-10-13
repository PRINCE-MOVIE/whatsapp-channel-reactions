Frontend — Instructions

Ce frontend Next.js se connecte à l'API que tu as déjà (Express). Par défaut il tourne sur le port 3001.

Installation
1. Copier ces fichiers dans un dossier `frontend/`.
2. Dans `frontend/`, copier `.env.example` -> `.env.local` et ajuster :
   NEXT_PUBLIC_API_URL=http://localhost:3000
3. Installer :
   npm install
4. Lancer en développement :
   npm run dev
5. Ouvre http://localhost:3001

Notes
- Le frontend effectue un refresh toutes les 5s pour récupérer les nouveaux messages. Tu peux remplacer par WebSocket / Supabase Realtime si tu veux du temps réel.
- Si ton API est déployée ailleurs, remplace NEXT_PUBLIC_API_URL dans `.env.local`.
- Je peux te générer une version plus jolie ou ajouter l’authentification utilisateur si tu veux.
