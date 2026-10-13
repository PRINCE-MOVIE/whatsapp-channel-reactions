# WhatsApp Channel Reactions

Petit projet qui permet de recevoir les messages WhatsApp via webhook et d’afficher des réactions sur un site web.

Ce repo a été simplifié pour un seul déploiement sur Vercel.

## Structure
auto
- frontend/ : l’application accessible sur Vercel
- `frontend/api/` : les fonctions Lambda / Serverless pour webhook et API
- `frontend/lib/db.js` : connexion PostgreSQL
- `frontend/public/index.html` : landing page professionnelle

## Déploiement sur Vercel
1. Créer un projet Vercel et choisir le dossier `frontend`
2. Ajouter les variables d’environnement :
   - `DATABASE_URL` : la chaîne de connexion PostgreSQL (Supabase, Vercel Postgres, ou autre)
   - `VERIFY_TOKEN` : token Meta/WhatsApp de vérification du webhook
   - `WHATSAPP_TOKEN` : optionnel, pour l’envoi de messages
   - `PHONE_NUMBER_ID` : optionnel, pour l’envoi de messages
3. Déployer

## WhatsApp webhook
Dans Meta / WhatsApp Cloud API, ajouter le webhook:
- URL : `https://<votre-site-vercel>/api/webhook`
- Verify Token : la même valeur que `VERIFY_TOKEN`
- Event : `messages`

## Important
Les “réactions” ne sont pas des réactions natives WhatsApp. C’est un site qui affiche des réactions sous les messages reçus, ce qui est compatible avec l’API officielle.
