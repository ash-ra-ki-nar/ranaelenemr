# Portfolio CMS - Notebook Flare

A modern, full-stack portfolio content management system built with React, TypeScript, Node.js, and Supabase. Features a sleek admin interface, dynamic content management, and seamless media handling with Cloudflare R2.

## ✨ Features

### Frontend
- **Modern React 18** with TypeScript and Vite
- **Responsive Design** with Tailwind CSS
- **Dynamic Project Cards** with hover animations
- **Custom Video Player** with hover controls
- **Animated WavyMarquee** for coming soon projects
- **Rich Text Editor** with TipTap
- **Drag & Drop** project reordering
- **Media Library** with upload and management

### Backend
- **Express.js API** with TypeScript support
- **Supabase Database** with Row Level Security
- **Cloudflare R2** for media storage
- **JWT Authentication** for admin access
- **File Upload** with automatic optimization

### Admin Features
- **Project Management** - Create, edit, delete projects
- **Section Editor** - Rich content with multiple element types
- **Media Library** - Upload and manage images/videos
- **Live Preview** - See changes in real-time
- **Drag & Drop** reordering for projects and content

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- Supabase account
- Cloudflare account with R2 storage

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd notebook-flare2
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. **Configure Environment Variables**
```env
# API Configuration
VITE_API_URL=

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://pub-your-bucket-id.r2.dev

# JWT Secret
JWT_SECRET=your_jwt_secret
```

5. **Database Setup**
Run the SQL schema in your Supabase dashboard:
```bash
# Execute the contents of supabase-schema.sql in Supabase SQL Editor
```

6. **Start Development Server**
```bash
npm run dev
```

## 🔧 Configuration Guide

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Schema**
   - Open Supabase Dashboard → SQL Editor
   - Copy and execute `supabase-schema.sql`
   - This creates all tables and RLS policies

3. **Configure Row Level Security**
   The schema automatically sets up:
   - Public read access for all content
   - Authenticated write access for admin operations
   - **IMPORTANT**: Media table public read policy (required for image display)

### Cloudflare R2 Setup

1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Create a new bucket (e.g., `your-portfolio-media`)
   - Note the bucket name

2. **Generate API Keys**
   - Go to R2 → Manage R2 API tokens
   - Create a new token with read/write permissions
   - Note the Access Key ID and Secret Access Key

3. **Enable Public Access** ⚠️ **CRITICAL STEP**
   - Select your bucket → Settings → Public Access
   - Click "Allow Access" or "Connect Custom Domain"
   - Copy the public URL (format: `https://pub-xxxxxxxx.r2.dev`)
   - **This step is essential** - images won't load without public access

4. **Update Environment Variables**
   ```env
   CLOUDFLARE_R2_PUBLIC_URL=https://pub-your-actual-id.r2.dev
   ```

### Common Issues & Solutions

#### Images Not Loading (401 Unauthorized)
**Problem**: Cloudflare R2 bucket not publicly accessible
**Solution**: 
1. Go to Cloudflare Dashboard → R2 → Your Bucket → Settings
2. Enable "Public Access"
3. Verify the public URL matches your `.env` file

#### Database Connection Errors
**Problem**: Incorrect Supabase configuration
**Solution**:
1. Verify Supabase URL and keys in `.env`
2. Check RLS policies are properly set
3. Ensure service role key has admin privileges

#### Media Upload Failures
**Problem**: R2 credentials or permissions incorrect
**Solution**:
1. Verify R2 API keys in `.env`
2. Check bucket name matches configuration
3. Ensure API token has read/write permissions

## 📁 Project Structure

```
notebook-flare2/
├── api/                    # Backend API
│   ├── services/
│   │   └── cloudflareR2.js # R2 storage integration
│   └── index.js           # Express server
├── src/                   # Frontend React app
│   ├── components/
│   │   ├── admin/         # Admin interface components
│   │   ├── project/       # Project display components
│   │   └── ui/            # Reusable UI components
│   ├── pages/             # Route components
│   ├── services/          # API client
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── supabase-schema.sql    # Database schema
├── vercel.json           # Vercel deployment config
└── README.md
```

## 🎨 Key Components

### WavyMarquee
Animated text overlay for coming soon projects with SVG path animation.

### VideoPlayer
Custom video player that appears as an image until hover, then shows play controls.

### MediaLibrary
Drag-and-drop media management with R2 integration and thumbnail previews.

### ElementRenderer
Renders different content types (text, images, videos, embeds) with proper fallbacks.

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables

2. **Environment Variables**
   Add all variables from `.env.example` to Vercel dashboard

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **API Routes**
   The `vercel.json` configuration handles API routing automatically.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔐 Security

- **Row Level Security** enabled on all Supabase tables
- **JWT Authentication** for admin access
- **Environment variables** for sensitive data
- **CORS** configured for secure API access
- **Input validation** on all forms

## 📝 Content Management

### Project Categories
- **Works**: Main portfolio projects
- **Parallel Discourses**: Secondary content

### Element Types
- **Text**: Rich text with formatting
- **Image**: Images with captions and alt text
- **Video**: Custom video player with hover controls
- **Quote**: Styled blockquotes
- **Embed**: External content (YouTube, etc.)

### Coming Soon Projects
- Display with animated WavyMarquee
- Lime green hover effects
- "Coming Up" label with hover transitions

## 🆘 Troubleshooting

For issues and questions:
1. Check this README for common solutions
2. Verify environment configuration
3. Check browser console for errors
4. Ensure Supabase and R2 are properly configured

---

**Built with ❤️ using React, TypeScript, Supabase, and Cloudflare R2**