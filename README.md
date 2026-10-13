# Whatsapp Channel Reactions

Ce dépôt contient une API Express (backend) et un frontend Next.js minimal pour recevoir les messages d'une chaîne WhatsApp via webhook et afficher des réactions sur un site.

Structure:
- /api : backend Express
- /frontend : frontend Next.js

Getting started (local)

Backend:
1. cd api
2. npm install
3. cp .env.example .env  # remplir VERIFY_TOKEN, optional WHATSAPP_TOKEN et PHONE_NUMBER_ID
4. npm start

Frontend:
1. cd frontend
2. npm install
3. cp .env.example .env.local
4. npm run dev

Exposer le backend pour WhatsApp webhook (ngrok):
- ngrok http 3000
- Configurer l'URL de webhook dans Meta WhatsApp Cloud API à: https://<ngrok>.ngrok.io/webhook
- Utiliser le VERIFY_TOKEN configuré

Notes:
- Les réactions sont stockées localement et n'apparaissent pas comme réactions natives dans WhatsApp (impossible via l'API officielle).
- Pour envoyer des récapitulatifs vers WhatsApp, renseigne WHATSAPP_TOKEN et PHONE_NUMBER_ID dans api/.env
