# PureFlow Water — GitHub Pages Store

A static dropship storefront for Waterdrop water filtration products, built for GitHub Pages + Stripe.

## 📁 Structure

```
waterdrop-store/
├── index.html              # Homepage
├── css/
│   └── style.css           # All styles
├── js/
│   └── main.js             # Nav, animations, form logic
├── pages/
│   ├── product-g3p800.html # G3P800 product detail
│   ├── product-g3p600.html # G3P600 product detail (TODO)
│   ├── product-tsu.html    # TSU product detail (TODO)
│   ├── product-x12.html    # X12 product detail (TODO)
│   ├── filters.html        # Replacement filters page
│   ├── why.html            # How RO works / about
│   └── contact.html        # Contact form
└── README.md
```

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repo: `your-username/pureflow-store`
2. Push this entire folder as the repo root
3. Go to **Settings → Pages → Source → main branch / root**
4. Your store will be live at `https://your-username.github.io/pureflow-store`
5. (Optional) Add a custom domain in Settings → Pages → Custom domain

## 💳 Stripe Integration (Step 2)

Each product page has a `handleCheckout()` placeholder. Replace with:
- Stripe Payment Links (easiest — no code)
- Stripe Checkout (embedded JS)
- Stripe Buy Button (web component)

See `pages/product-g3p800.html` for the integration point.

## 📦 Order Fulfillment (Step 3)

When Stripe payment succeeds:
1. Stripe sends a webhook event
2. A serverless function (Cloudflare Workers / Netlify Functions) receives it
3. Function places the order with Waterdrop via their dropship portal

## 🌐 Custom Domain Recommended

Register `pureflowwater.com` or similar via Namecheap/Cloudflare (~$10/yr)
Set CNAME record pointing to your GitHub Pages URL.
