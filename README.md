# Unfollow Management App

A powerful web application for managing your social media follows with advanced filtering capabilities, powered by the Neynar API.

## Features

- **Smart Filtering**: Filter users by mutual follows, Neynar scores, and activity levels
- **Advanced Analytics**: Get insights into your follow patterns with detailed metrics
- **Bulk Management**: Efficiently unfollow multiple users at once
- **Real-time Updates**: Webhook integration for live updates
- **Customizable Thresholds**: Adjust Neynar score and inactivity thresholds

## Setup

### Prerequisites

- Node.js 18+ 
- Neynar API account and API key
- Your Farcaster FID

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local` file:
   ```
   NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key_here
   NEXT_PUBLIC_USER_FID=your_fid_here
   NEXT_PUBLIC_SIGNER_UUID=your_signer_uuid_here
   WEBHOOK_SECRET=your_webhook_secret_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Webhooks

- `POST /api/webhooks/neynar` - Neynar webhook endpoint for real-time updates

## Filtering Options

- **Not Following Back**: Show users who don't follow you back
- **Low Neynar Score**: Filter by customizable Neynar score threshold (0.0-1.0)
- **Inactive Users**: Show users who haven't posted in a specified number of months
- **Search**: Search by username or display name

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Neynar API
- Axios

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License