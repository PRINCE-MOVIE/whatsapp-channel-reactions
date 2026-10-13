# Deployment Guide

## 1) Backend deployment (Render)

Create a new Web Service on Render:
- Repository: `PRINCE-MOVIE/whatsapp-channel-reactions`
- Root directory: `api`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables:
  - `PORT=10000` (Render sets it automatically, but keep it if needed)
  - `VERIFY_TOKEN=your_verify_token_here`
  - `WHATSAPP_TOKEN=`
  - `PHONE_NUMBER_ID=`

Then expose the service URL, for example:
- `https://whatsapp-channel-reactions-api.onrender.com`

## 2) Frontend deployment (Vercel)

Import the repo in Vercel:
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Output directory: `.next`
- Environment variable:
  - `NEXT_PUBLIC_API_URL=https://whatsapp-channel-reactions-api.onrender.com`

## 3) Meta WhatsApp webhook configuration

In the WhatsApp Cloud API / Facebook app dashboard:
- Set webhook URL to:
  - `https://YOUR_RENDER_URL/webhook`
- Set verify token to the same value used in `VERIFY_TOKEN`
- Select event type: `messages`

## 4) Test flow

1. Send a message to your WhatsApp business number.
2. Webhook hits your backend API.
3. The message is stored in SQLite.
4. Frontend loads messages from `/messages`.
5. Visitors click reaction buttons on the site.
6. The reaction counts are stored in the database.

## 5) Notes

This project does not create native WhatsApp reactions. It creates reactions on your website under each WhatsApp message, which is the correct and supported model using the official WhatsApp API.
