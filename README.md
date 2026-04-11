<!-- ============================================================ -->
<!--           THE LEGACY TRUNK — README                         -->
<!-- ============================================================ -->

<div align="center">

<br/>

```
✦  ᚦ ᛖ  ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ  ᛏ ᚱ ᚢ ᚾ ᚲ  ✦
```

<img src="./frontend/public/finall_logo.png" alt="The Legacy Trunk" width="130"/>

<br/><br/>

# ✦ &nbsp; THE LEGACY TRUNK &nbsp; ✦

### *A Dark Fantasy Family Memory Vault*

> *"Every family has a story. Seal yours for the generations to come."*

<br/>

![React](https://img.shields.io/badge/⚛_React_19-d4a850?style=for-the-badge&labelColor=06080f)
![Vite](https://img.shields.io/badge/⚡_Vite_8-d4a850?style=for-the-badge&labelColor=06080f)
![Node](https://img.shields.io/badge/🛡_Node_+_Express-d4a850?style=for-the-badge&labelColor=06080f)
![MongoDB](https://img.shields.io/badge/🗄_MongoDB-d4a850?style=for-the-badge&labelColor=06080f)
![Socket.io](https://img.shields.io/badge/⚡_Socket.io-d4a850?style=for-the-badge&labelColor=06080f)
![Gemini](https://img.shields.io/badge/🤖_Gemini_AI-d4a850?style=for-the-badge&labelColor=06080f)

<br/>

---

*Created & Developed by* &nbsp; **Ajay Thakur**

---

<br/>

</div>


## 📜 &nbsp; Table of Contents

> [About](#%EF%B8%8F-about-the-project) &nbsp;·&nbsp; [Features](#%EF%B8%8F-live-features) &nbsp;·&nbsp; [Tech Stack](#%EF%B8%8F-tech-stack) &nbsp;·&nbsp; [Structure](#-project-structure) &nbsp;·&nbsp; [Setup](#-getting-started) &nbsp;·&nbsp; [API](#-api-routes) &nbsp;·&nbsp; [Design System](#-design-system) &nbsp;·&nbsp; [Contributing](#-contributing)

<br/>

---

<br/>

## 🏛️ About the Project

**The Legacy Trunk**, *created and developed entirely by **Ajay Thakur***, is a full-stack private family memory vault web application built with the MERN stack + Socket.io.

It allows families to create **private circles**, share encrypted stories and photos, chat in real time, track locations, compete on leaderboards, and preserve their legacy for future generations — all wrapped in a bespoke **Dark Fantasy** cinematic design system.

Think of it as a **private, encrypted, beautifully designed family social network** — where every memory is a treasure sealed in gold, and every page transition feels like opening an ancient vault.

<br/>

### ✦ Core Philosophy

| Pillar | Description |
|:---:|:---|
| 🔐 **Privacy First** | All stories remain sealed within your family circle |
| 🌟 **Gamified Legacy** | Bond Points, Tier Ranks, and a Global Family Leaderboard |
| 🤖 **AI-Powered** | Google Gemini for story enhancement and title generation |
| 🎨 **Cinematic Design** | Animated star fields, floating gold dust, rune typography |

<br/>

---

<br/>

## ⚔️ Live Features

```
  ✦  Every feature — forged in the fires of the vault  ✦
```

| &nbsp; | Feature | Description |
|:---:|:---|:---|
| 🔐 | **Auth System** | JWT login, signup, OTP email verification, forgot password |
| 👨‍👩‍👧 | **Family Circles** | Private groups via invite links, QR codes, or family codes |
| 📸 | **Vault Stories** | Post memories with 5 photos, AI enhancement & tone selection |
| 💬 | **Real-Time Chat** | Encrypted Socket.io family chat with typing indicators |
| 📡 | **Live Radar** | Real-time family location tracking with Leaflet maps |
| 🤖 | **AI Oracle** | Gemini-powered story enhancer, title generator & family oracle |
| 🏆 | **Leaderboard** | Global family rankings with cinematic podium & Bond Points |
| 👤 | **Profile System** | Avatar, bio, family role, activity heatmap & streak tracking |
| 📅 | **Family Calendar** | Upcoming birthdays & milestone events widget |
| 🔔 | **Notifications** | Real-time bell for invites and family activity |
| 🔲 | **Collage Maker** | In-browser photo collage builder before posting |
| 📖 | **Legacy Book** | Export family stories as a beautiful PDF legacy book |
| 🔍 | **Search** | Full-text search across stories and family members |
| 📊 | **Timeline** | Chronological family event timeline view |
| 🌍 | **Explore** | Browse public stories from other families globally |

<br/>

---

<br/>

## 🛠️ Tech Stack

### ✦ Frontend

| Technology | Version | Purpose |
|:---|:---:|:---|
| **React** | `19.x` | Core UI framework |
| **Vite** | `8.x` | Lightning-fast build tool & dev server |
| **Framer Motion** | `12.x` | Cinematic page animations & transitions |
| **React Router DOM** | `7.x` | Client-side routing |
| **Socket.io Client** | `4.x` | Real-time WebSocket communication |
| **Axios** | `1.x` | HTTP API client with interceptors |
| **React Leaflet** | `5.x` | Interactive maps for the Live Radar |
| **QRCode React** | `4.x` | QR code generation for family invites |
| **React Hot Toast** | `2.x` | Elegant toast notifications |
| **React Confetti** | `6.x` | Celebration particle effects |
| **html2canvas + jsPDF** | `latest` | Legacy Book PDF export |
| **date-fns** | `4.x` | Date manipulation utilities |
| **DOMPurify** | `3.x` | XSS sanitization for user content |

### ✦ Backend

| Technology | Version | Purpose |
|:---|:---:|:---|
| **Node.js + Express** | `5.x` | REST API server |
| **MongoDB + Mongoose** | `8.x` | Database & Object Document Mapper |
| **Socket.io** | `4.x` | Real-time WebSocket server |
| **JSON Web Token** | `9.x` | Stateless authentication tokens |
| **bcryptjs** | `3.x` | Secure password hashing |
| **Cloudinary** | `2.x` | Cloud image & media storage |
| **Multer** | `2.x` | Multipart file upload middleware |
| **Nodemailer** | `8.x` | OTP & invite transactional emails |
| **Google Generative AI** | `0.24.x` | Gemini AI story enhancement |
| **Puppeteer** | `24.x` | Headless browser PDF generation |
| **Nodemon** | `3.x` | Dev server with hot reload |

<br/>

---

<br/>

## 📁 Project Structure

```
The-Legacy-Trunk/
├── 📁 frontend/          ──  React + Vite Single Page Application
└── 📁 backend/           ──  Node.js + Express REST API + Socket.io
```

<br/>

### ✦ Frontend Structure

```
frontend/
│
├── index.html                          ← Root HTML shell
├── vite.config.js                      ← Vite bundler config
├── jsconfig.json                       ← JS path aliases
├── eslint.config.js                    ← Linting rules
├── package.json                        ← Frontend dependencies
├── .env                                ← VITE_API_URL environment variable
│
├── 📁 public/                          ← Static assets (served directly)
│   ├── finall_logo.png                 ⭐ Main brand logo (used in LogoRing)
│   ├── favicon.ico / .svg / -96x96    ← Browser favicons
│   ├── apple-touch-icon.png            ← iOS home screen icon
│   ├── site.webmanifest                ← PWA manifest
│   ├── web-app-manifest-192x192.png    ← PWA icon
│   └── web-app-manifest-512x512.png   ← PWA icon
│
└── 📁 src/
    │
    ├── main.jsx                        ← React DOM render entry point
    ├── App.jsx                         ← Root router — all page routes defined here
    ├── App.css                         ← Global component styles
    ├── index.css                       ← CSS reset + root variables
    │
    ├── 📁 api/                         ← All server communication (Axios)
    │   ├── axios.js                    ⭐ Axios instance (base URL + auth interceptors)
    │   ├── authApi.js                  ← Login, signup, OTP, profile update calls
    │   ├── circleApi.js                ← Family circle CRUD + invite + leaderboard
    │   ├── locationApi.js              ← Location share & fetch
    │   ├── messageApi.js               ← Chat message history fetch
    │   ├── searchApi.js                ← Global search
    │   └── storyApi.js                 ← Story CRUD + like + comment
    │
    ├── 📁 context/
    │   └── AuthContext.jsx             ⭐ Global user state — auth, active circle, profile
    │
    ├── 📁 services/
    │   └── socket.js                   ← Socket.io client singleton
    │
    ├── 📁 utils/
    │   └── constant.js                 ← API base URL + app-wide constants
    │
    ├── 📁 pages/                       ← Top-level standalone route pages
    │   ├── VaultStoriesPage.jsx        ⭐ Story posting + vault page
    │   ├── LeaderboardPage.jsx         ⭐ Global leaderboard with cinematic podium
    │   ├── CollageMaker.jsx            ← In-browser photo collage tool
    │   ├── ExploreStoriesPage.jsx      ← Public stories from all families
    │   ├── FamilyOraclePage.jsx        ← AI-powered family oracle chatbot
    │   ├── FamilyTimelinePage.jsx      ← Chronological family events timeline
    │   ├── InvitePage.jsx              ← Accept invite link landing page
    │   ├── SearchResultsPage.jsx       ← Search results display
    │   └── StoryDetailPage.jsx         ← Single story full-view page
    │
    └── 📁 components/                  ← Feature-grouped reusable components
        │
        ├── 📁 auth/                    ── Authentication flow
        │   ├── LoginPage.jsx           ⭐ Dark fantasy login (star canvas + runes)
        │   ├── SignupPage.jsx          ← Registration with family code support
        │   ├── OTPVerificationModal.jsx ← Email OTP 6-digit verify modal
        │   └── ForgotPasswordModal.jsx  ← Password reset via OTP
        │
        ├── 📁 dashboard/              ── Main dashboard hub
        │   ├── DashboardPage.jsx       ⭐ Vault hub — room cards + family management
        │   └── UpcomingEventsWidget.jsx ← Birthdays & milestone calendar widget
        │
        ├── 📁 profile/                ── User profile system
        │   ├── ProfilePage.jsx         ⭐ Full profile — avatar, bio, role, stats
        │   ├── FamilyLegacyCard.jsx    ← Bond points + rank badge + progress bar
        │   └── ActivityHeatmap.jsx     ← GitHub-style yearly activity heatmap
        │
        ├── 📁 story/                  ── Story posting & display
        │   ├── StoryComposer.jsx       ⭐ Rich story creation with AI tools
        │   ├── StoryCard.jsx           ⭐ Individual story display card
        │   ├── StoryCommentBox.jsx     ← Comment thread component
        │   ├── StoryExportTemplate.jsx ← Story card image export template (ref)
        │   └── MyStoriesPage.jsx       ← User's personal stories list
        │
        ├── 📁 chat/                   ── Real-time family chat
        │   ├── VaultRoomPage.jsx       ← Main chat room page container
        │   ├── ChatWindow.jsx          ← Message list + scroll container
        │   ├── ChatMessage.jsx         ← Individual message bubble
        │   ├── MessageInput.jsx        ← Chat input with emoji + file support
        │   └── TypingIndicator.jsx     ← Animated "someone is typing..." indicator
        │
        ├── 📁 radar/                  ── Location tracking
        │   └── FamilyRadarPage.jsx     ← Live Leaflet map with family member pins
        │
        ├── 📁 Feed/                   ── Home feed
        │   ├── HomePage.jsx            ← Main home feed page
        │   ├── FamilyLedgerFeed.jsx    ← Family-only private stories feed
        │   └── StrangersMemoriesFeed.jsx ← Public explore feed
        │
        ├── 📁 modals/                 ── App-wide overlays
        │   ├── VaultGateway.jsx        ⭐ Cinematic vault-door entry animation
        │   └── ChampionDetailModal.jsx ← Leaderboard champion detail popup
        │
        ├── 📁 features/               ── Standalone feature components
        │   └── LegacyBookExporter.jsx  ← PDF legacy book generator
        │
        └── 📁 shared/                 ── Global utility components
            ├── AnimatedPage.jsx        ⭐ Page transition wrapper (4 cinematic variants)
            ├── Navbar.jsx              ← Top navigation with circle switcher
            ├── Sidebar.jsx             ← Side navigation menu
            ├── ProtectedRoute.jsx      ← Auth guard for private routes
            ├── ErrorBoundary.jsx       ← React error boundary wrapper
            ├── Loader.jsx              ← Global loading spinner
            └── StorySkeleton.jsx       ← Story card loading skeleton
```

<br/>

### ✦ Backend Structure

```
backend/
│
├── index.js                            ⭐ Entry — Express + Socket.io bootstrap
├── nodemon.json                        ← Nodemon watch config
├── package.json                        ← Backend dependencies
├── .gitignore
│
├── 📁 config/
│   └── cloudinaryConfig.js             ← Cloudinary SDK + storage engine setup
│
├── 📁 models/                          ← MongoDB Mongoose schemas
│   ├── familyMember.js                 ⭐ User — auth, profile, bond points, streak
│   ├── familyCircleModel.js            ← Family circle / group schema
│   ├── storyModel.js                   ← Story — media, likes, comments, milestone
│   ├── messageModel.js                 ← Chat message schema
│   ├── notificationModel.js            ← Notification schema
│   ├── eventModel.js                   ← Family event / birthday schema
│   └── timelineModel.js                ← Family timeline entry schema
│
├── 📁 controllers/                     ← Feature business logic
│   ├── userController.js               ⭐ Auth, profile, OTP, invite flow
│   ├── circleController.js             ⭐ Circle CRUD, members, leaderboard
│   ├── storyController.js              ⭐ Story CRUD, likes, comments, feed
│   ├── aiController.js                 ← Gemini AI — title + story enhance + oracle
│   ├── gamificationService.js          ← Bond points + streak + rank engine
│   ├── locationController.js           ← Real-time location share & fetch
│   ├── messageController.js            ← Chat message history
│   ├── notificationController.js       ← Notification CRUD + mark read
│   ├── exportController.js             ← PDF legacy book (Puppeteer)
│   ├── searchController.js             ← Full-text search: stories + users
│   ├── timelineController.js           ← Family timeline CRUD
│   └── otpmsg.js                       ← Nodemailer OTP email sender
│
├── 📁 routes/                          ← Express route definitions
│   ├── userRoutes.js                   ← /api/users/*
│   ├── circleRoutes.js                 ← /api/circles/*
│   ├── storyRoutes.js                  ← /api/stories/*
│   ├── aiRoutes.js                     ← /api/ai/*
│   ├── locationRoutes.js               ← /api/location/*
│   ├── messageRoutes.js                ← /api/messages/*
│   ├── notificationRoutes.js           ← /api/notifications/*
│   ├── exportRoutes.js                 ← /api/export/*
│   ├── searchRoutes.js                 ← /api/search/*
│   └── timelineRoutes.js               ← /api/timeline/*
│
├── 📁 middleware/
│   ├── authMiddleware.js               ← JWT verify + attach user to req
│   └── uploadMiddleware.js             ← Multer + Cloudinary upload handler
│
└── 📁 socket/
    └── socketHandler.js                ⭐ Chat, location, typing, notifications
```

<br/>

---

<br/>

## 🚀 Getting Started

### ✦ Prerequisites

```bash
node --version    # v18+ required
npm --version     # v9+ required
```

You'll also need free accounts at:

| Service | Purpose |
|:---|:---|
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Cloud database |
| [Cloudinary](https://cloudinary.com/) | Media storage |
| [Google AI Studio](https://aistudio.google.com/) | Gemini API key |
| Gmail (App Password) | OTP transactional email |

<br/>

### ✦ Installation

**1 — Clone the repository**

```bash
git clone https://github.com/yourusername/the-legacy-trunk.git
cd the-legacy-trunk
```

**2 — Install Backend dependencies**

```bash
cd backend
npm install
```

**3 — Install Frontend dependencies**

```bash
cd ../frontend
npm install
```

<br/>

### ✦ Environment Variables

**`backend/.env`**

```env
# ── Server ──────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB ─────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/legacy-trunk

# ── JWT ─────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here

# ── Cloudinary ──────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Google Gemini AI ────────────────────
GEMINI_API_KEY=your_gemini_api_key

# ── Nodemailer (Gmail) ──────────────────
EMAIL_USER=yourmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# ── CORS ────────────────────────────────
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:5000
```

<br/>

### ✦ Running the App

**Start the Backend** — from `/backend`:

```bash
npm start
```

**Start the Frontend** — from `/frontend`:

```bash
npm run dev
```

**Production Build** — from `/frontend`:

```bash
npm run build
```

```
  App live at → http://localhost:5173  ✦
```

<br/>

---

<br/>

## 🌐 API Routes

### ✦ Auth & Users &nbsp;—&nbsp; `/api/users`

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login with email + password |
| `POST` | `/verify-otp` | Verify email OTP |
| `POST` | `/resend-otp` | Resend OTP email |
| `POST` | `/forgot-password` | Send password reset OTP |
| `POST` | `/reset-password` | Reset password with OTP |
| `GET` | `/profile` | Get current user profile |
| `PUT` | `/profile` | Update profile — name, bio, avatar, DOB |
| `GET` | `/notifications` | Get user notifications |
| `PUT` | `/notifications/:id/read` | Mark notification as read |

### ✦ Family Circles &nbsp;—&nbsp; `/api/circles`

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/create` | Create a new family circle |
| `GET` | `/my-circles` | Get all circles the user belongs to |
| `GET` | `/:circleId` | Get circle details with members list |
| `POST` | `/:circleId/invite-link` | Generate magic invite link + token |
| `POST` | `/:circleId/invite-email` | Send direct email invite |
| `POST` | `/join/:token` | Join circle via invite token |
| `DELETE` | `/:circleId/members/:memberId` | Remove a member (admin only) |
| `DELETE` | `/:circleId` | Permanently delete circle (admin only) |
| `GET` | `/leaderboard` | Get global family leaderboard |
| `GET` | `/:circleId/events` | Get upcoming birthdays & milestones |

### ✦ Stories &nbsp;—&nbsp; `/api/stories`

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/` | Create new story with media upload |
| `GET` | `/circle/:circleId` | Get all stories for a circle |
| `GET` | `/public` | Get all public stories (Explore feed) |
| `GET` | `/my-stories` | Get current user's stories |
| `GET` | `/:storyId` | Get single story detail |
| `PUT` | `/:storyId` | Edit story (author/admin only) |
| `DELETE` | `/:storyId` | Delete story (author/admin only) |
| `POST` | `/:storyId/like` | Toggle like / protect a story |
| `POST` | `/:storyId/comment` | Add a reflection / comment |

### ✦ AI &nbsp;—&nbsp; `/api/ai`

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/generate-title` | Generate AI title from story text |
| `POST` | `/enhance-story` | Enhance story with selected tone via Gemini |
| `POST` | `/oracle` | Family Oracle AI chat query |

### ✦ Other Routes

| Prefix | Description |
|:---|:---|
| `/api/messages` | Chat message history fetch |
| `/api/location` | Share & fetch family locations |
| `/api/search` | Full-text search across stories + users |
| `/api/export` | PDF Legacy Book generation via Puppeteer |
| `/api/timeline` | Family event timeline CRUD |

<br/>

---

<br/>

## 🎨 Design System

```
  ✦  The Dark Fantasy Design System — applied on every single page  ✦
```

The Legacy Trunk uses a fully custom design system. Every component follows these rules exactly.

<br/>

### ✦ Color Palette

```css
/* Backgrounds */
--bg-cosmos:      #06080f                  /* Deep cosmos black — page background */
--bg-card:        rgba(12, 16, 32, 0.85)   /* Card & modal background */

/* Gold Accents */
--gold-bright:    #e8c87a                  /* Headings, active states */
--gold-primary:   #d4a850                  /* Buttons, borders */
--gold-dim:       rgba(212, 168, 80, 0.22) /* Subtle card borders */
--gold-label:     rgba(212, 168, 80, 0.55) /* Monospace labels */
--gold-muted:     rgba(212, 168, 80, 0.18) /* Rune footer text */

/* Text */
--text-primary:   rgba(255, 255, 255, 0.88) /* Main body text */
--text-secondary: rgba(255, 255, 255, 0.38) /* Italic muted text */

/* Semantic */
--error:          #f08080                   /* on rgba(220, 60, 60, 0.12) bg */
--success:        #6ee87a                   /* on rgba(60, 168, 80, 0.10) bg */
--online:         #4ade80                   /* Online status dot */
```

<br/>

### ✦ Typography

```
Headings    →  'Cinzel', serif
               font-weight: 700
               color: #e8c87a
               text-shadow: 0 0 40px rgba(212,168,80,0.3)

Body Text   →  'Cormorant Garamond', serif
               font-style: italic
               font-size: 16–18px

Labels      →  'Space Mono', monospace
               font-size: 9px
               letter-spacing: 2.5px
               text-transform: uppercase
               color: rgba(212,168,80,0.55)
```

<br/>

### ✦ Card & Modal Structure

Every card and modal in the app follows this exact anatomy:

```
┌──────────────────────────────────────────┐  ← border: 1px solid rgba(212,168,80,0.22)
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  │  ← Gold shimmer line top
│ ◤                                    ◥  │  ← Corner accents (18×18px, 2-side gold border)
│                                          │
│      background: rgba(12,16,32,0.85)     │
│      border-radius: 20px                 │
│      box-shadow: 0 20px 60px rgba(0,0,0,0.6)
│      + Mouse spotlight radial-gradient   │
│        follows cursor on hover           │
│                                          │
│ ◣                                    ◢  │  ← Corner accents
│ ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │  ← Gold shimmer line bottom (dimmer)
└──────────────────────────────────────────┘
```

<br/>

### ✦ Background Effects (every full-page component)

```
Layer 0 — CSS background: #06080f

Layer 1 — <StarCanvas />
           140+ gold dots (rgba 212,180,80) twinkle via sin wave opacity
           Drawn on HTML5 <canvas> with requestAnimationFrame

Layer 2 — <DustLayer />
           18–24 gold/blue radial-gradient motes
           Float upward via CSS @keyframes ltFloat
           Random duration 6–14s, random delay 0–12s

Layer 3 — Atmospheric radial-gradient overlay
           rgba(212,130,40,0.05) glow from top-center
```

<br/>

### ✦ Animation Keyframes

```css
@keyframes ltFloat      { /* Dust mote float: opacity 0→1→0, translate upward */   }
@keyframes ltRingSpin   { /* Logo ring: rotate(0deg) → rotate(360deg) 18s */        }
@keyframes ltShine      { /* Button shimmer sweep: left -100% → 150% */             }
@keyframes ltDot        { /* Loading dot bounce: scale 0.6 → 1 → 0.6 */            }
@keyframes ltPulseGlow  { /* Button glow pulse: box-shadow dim ↔ bright */          }
@keyframes ltScrollRune { /* Top ticker: translateX(0) → translateX(-50%) */        }
```

<br/>

### ✦ Page Transition Variants (`AnimatedPage.jsx`)

```javascript
'runeRise'   // Default — rises from depth with blur dissolve
'vaultDoor'  // Vault door opens from center outward via clipPath
'scroll'     // Ancient parchment unfurls from top via scaleY
'goldFade'   // Gold shimmer dissolve via brightness + saturate filter
```

<br/>

### ✦ Rune Footer

Every card, modal, and page ends with:

```
✦   ᚦ ᛖ   ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ   ᛏ ᚱ ᚢ ᚾ ᚲ   ✦

font-family: 'Cinzel', serif
font-size: 10–11px | letter-spacing: 4–6px
color: rgba(212,168,80,0.18) | user-select: none
```

<br/>

---

<br/>

## 🤝 Contributing

Contributions are welcome! Please follow the existing **Dark Fantasy Design System** for all UI changes.

```bash
# 1. Fork the repo

# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add AmazingFeature'

# 4. Push to your branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

<br/>

---

<br/>

## 📄 License

Distributed under the **MIT License**.

<br/>

---

<br/>

## 🙏 Acknowledgements

| Library / Service | Role |
|:---|:---|
| **Google Gemini AI** | Powering the Family Oracle & AI story tools |
| **Leaflet.js + React Leaflet** | Family Radar interactive map |
| **Framer Motion** | All cinematic animations & page transitions |
| **Cloudinary** | Cloud media storage & optimization |
| **Socket.io** | Real-time chat, location & notifications |
| **Google Fonts** | Cinzel · Cormorant Garamond · Space Mono |
| **QRCode React** | Invite QR code generation |
| **Puppeteer** | Legacy Book PDF generation |

<br/>

---

<br/>

<div align="center">

```
✦  ᚦ ᛖ  ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ  ᛏ ᚱ ᚢ ᚾ ᚲ  ✦
```

**Created & Developed by &nbsp; Ajay Thakur**

*Built with ❤️ for families who believe their stories deserve to live forever.*

> *"Your family's story deserves to be legendary."*

<br/>

```
✦  ᚦ ᛖ  ᛚ ᛖ ᚷ ᚨ ᚲ ᛃ  ᛏ ᚱ ᚢ ᚾ ᚲ  ✦
```

</div>