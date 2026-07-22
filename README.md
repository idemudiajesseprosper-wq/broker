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

## Smartsupp replies from Zoho Mail or Spark

The application exposes a signed two-way bridge:

- The chat widget posts each visitor message to `POST /api/support/message`,
  which immediately emails it to `ZOHO_SUPPORT_EMAIL` without depending on a
  Smartsupp webhook.
- `POST /api/webhooks/smartsupp` emails new visitor messages to the configured
  `ZOHO_SUPPORT_EMAIL` address.
- Replies sent from that Zoho mailbox are received by Resend at
  `POST /api/webhooks/resend` and posted to the matching Smartsupp conversation.

Required deployment variables:

```text
SMARTSUPP_ACCESS_TOKEN=...
SMARTSUPP_WEBHOOK_SECRET=...
ZOHO_SUPPORT_EMAIL=support@bsxcapitalexchange.com
RESEND_REPLY_EMAIL=anything@your-id.resend.app
RESEND_WEBHOOK_SECRET=whsec_...
```

Ask Smartsupp support to subscribe the deployed
`https://YOUR_DOMAIN/api/webhooks/smartsupp` URL to the
`conversation.contact_replied` event. Save the integration's shared secret as
`SMARTSUPP_WEBHOOK_SECRET`.

In Resend, open **Emails > Receiving**, copy the managed `*.resend.app`
receiving address into `RESEND_REPLY_EMAIL`, then create a webhook pointing to
`https://YOUR_DOMAIN/api/webhooks/resend` with the `email.received` event.
Copy its signing secret into `RESEND_WEBHOOK_SECRET`. The notification's
Reply-To address will use the Resend inbox, so replying from either Zoho Mail or
Spark sends the response through this signed bridge without requiring Zoho
Developer Space.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
