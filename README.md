# Opening Night

Opening Night helps you rediscover upcoming and released movies from trailers you liked on YouTube. Turn on reminders to receive emails when your movies are about to be released.

## Overview

Opening Night is a full-stack web application featuring:

- **YouTube Sync**: Connects to your YouTube account to analyze your liked videos OR your entire YouTube history to identify movie trailers
- **Movie Discovery**: Automatically matches trailer videos to movie data using The Movie Database (TMDB) API
- **Smart Notifications**: Sends email reminders when movies you're interested in are released
- **Personal Dashboard**: Organizes your movies into "Coming Soon" and "Released" sections
- **Email Integration**: Send yourself curated movie lists and manage notification preferences

### YouTube Sync Options

When syncing your YouTube data, you can choose between two options:

1. **Search Liked videos only** - Analyzes only videos you have explicitly liked on YouTube (faster, more targeted)
2. **Search my entire YouTube history** - Analyzes your complete YouTube activity history including likes, comments, and other interactions (comprehensive but slower)

Both sync methods are limited to 50 pages of results to ensure reasonable performance.

### Tech Stack

- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **Backend**: Convex for database, server logic, and real-time updates
- **Authentication**: Clerk with Google OAuth integration
- **External APIs**: Resend, YouTube Data API v3, and The Movie Database (TMDB) API
- **Email**: [Resend Convex Component](https://www.convex.dev/components/resend) for emails and notifications

## Getting Started

### Prerequisites

- Node.js
- Convex account
- Clerk account
- A Google account for YouTube integration
- API keys for Resend, YouTube Data API, and TMDB (see Environment Setup below)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/flock-games/opening-night.git
cd opening-night
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables (see Environment Setup section)

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

You'll need to configure the following environment variables in your Convex deployment:

```
CLERK_CLIENT_SECRET=
CLERK_JWT_ISSUER_DOMAIN=
GOOGLE_API_KEY=
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
TMDB_API_KEY=
```

They can be obtained by registering for the corresponding services: Clerk, Google Cloud, Resend, and The Movie Database.

You will also need to make your Clerk Publishable Key accessible by defining it in your `.env` file:

```
VITE_CLERK_PUBLISHABLE_KEY=
```

More information about setting up Clerk with Google OAuth in different environments can be found [here](https://clerk.com/docs/authentication/social-connections/google).

## Dev Stack Documentation

This project is built with Convex. To learn more about the development stack:

- [Convex](https://docs.convex.dev/)
- [Resend](https://resend.com/docs/introduction)
- [Clerk](https://clerk.com/docs)
- [YouTube API](https://developers.google.com/youtube/v3)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
