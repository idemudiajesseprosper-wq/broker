This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Smartsupp replies from Zoho Mail

The application exposes a signed two-way bridge:

- `POST /api/webhooks/smartsupp` emails new visitor messages to the configured
  `ZOHO_SUPPORT_EMAIL` address.
- Replies sent from that Zoho mailbox are accepted at
  `POST /api/webhooks/zoho` and posted to the matching Smartsupp conversation.

Required deployment variables:

```text
SMARTSUPP_ACCESS_TOKEN=...
SMARTSUPP_WEBHOOK_SECRET=...
ZOHO_SUPPORT_EMAIL=support@bsxcapitalexchange.com
ZOHO_WEBHOOK_SECRET=...
```

Ask Smartsupp support to subscribe the deployed
`https://YOUR_DOMAIN/api/webhooks/smartsupp` URL to the
`conversation.contact_replied` event. Save the integration's shared secret as
`SMARTSUPP_WEBHOOK_SECRET`.

In Zoho Mail, open **Settings > Integrations > Developer Space > Outgoing
Webhooks** and create a Mail webhook pointing to
`https://YOUR_DOMAIN/api/webhooks/zoho`. Filter it to messages from
`support@bsxcapitalexchange.com` whose subject contains
`[Smartsupp conversation:`. Leave **Limited Data List** disabled so the reply
body is included. Zoho sends `X-Hook-Secret` on the first registration request;
copy that value from the deployment logs into `ZOHO_WEBHOOK_SECRET`, redeploy,
and then enable the webhook.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
