This is the official Website for TiT Education, Jaffna.

## Key Features

### 1. Responsive User Interface

### 2. Resource Library

The Resource Library helps users discover relevant educational content in an organized format.

### 3. Multilingual Support

Mentify includes a translation utility that allows interface content to be adapted to different languages.

## Technology Stack

| Technology       | Purpose                                   |
| ---------------- | ----------------------------------------- |
| Next.js          | Application framework and routing         |
| React            | Component-based user interface            |
| JavaScript / JSX | Application logic and UI composition      |
| CSS Modules      | Component-scoped styling                  |
| React Hooks      | State management and component logic      |
| Git              | Version control                           |
| GitHub           | Source code hosting and collaboration     |
| npm              | Dependency management and package scripts |

## Getting Started

To run Mentify locally, you will need Node.js, npm, and Git installed on your computer.

### Prerequisites

- **Node.js:** A supported LTS release compatible with your Next.js version.
- **npm:** Usually included with Node.js.
- **Git:** Required to clone the repository and manage source code changes.

Check your installations:

```bash
node --version
npm --version
git --version
```

## Installation and Setup

### 1. Clone the Repository

Replace the placeholder URL with your actual GitHub repository URL.

```bash
git clone https://github.com/<your-username>/<your-repository>.git
```

### 2. Navigate to the Project Directory

```bash
cd <your-repository>
```

### 3. Install Dependencies

```bash
npm install
```

This installs the dependencies declared in `package.json`.

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Website

Visit:

```text
http://localhost:3000
```

The development server runs the website locally. Changes to supported files are generally reflected automatically.

## Environment Variables

If the application requires environment variables for external services, APIs, or other configuration, create a local environment file in the project root:

```text
.env.local
```

Example:

```env
# Server-side URL for the backend API gateway
API_GATEWAY_URL=http://localhost:8080

# Stripe publishable key used by the browser Payment Element (never use the secret key here)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me

# Must match PRE_REGISTRATION_API_TOKEN in the backend environment
PRE_REGISTRATION_API_TOKEN=replace-with-a-long-random-server-only-token
```

Set the same `PRE_REGISTRATION_API_TOKEN` in the backend environment. Do not expose it through a
`NEXT_PUBLIC_` variable or commit real API keys, passwords, or tokens to GitHub.

The website's pre-registration API requires both values to save submissions for admin review.
The same `API_GATEWAY_URL` also connects the public Resource Library to the backend marketplace.
Only marketplace products marked **Published** by an administrator appear there; drafts and
course-only materials remain private.

Marketplace payments collect buyer name, email, and phone without requiring a student session. Configure `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and `PAYMENT_CURRENCY` in the payment-service environment. Configure a
Stripe webhook for `/api/v1/payments/stripe/webhook` and subscribe to
`payment_intent.succeeded` and `payment_intent.payment_failed`.
