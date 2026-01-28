

skill2hire/
├── apps/
│   ├── client/              # Vite + React (Talent/HR/Mentor)
│   └── admin-panel/         # Vite + React (Admin/Managers Only)
├── server/                  # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma    # Database Schema (PostgreSQL)
│   ├── src/
│   │   ├── controllers/     # Business Logic (Auth, Jobs, etc.)
│   │   ├── db/              # Database connection setup
│   │   ├── middlewares/     # Auth & Role-based checks
│   │   ├── models/          # Optional if using Prisma (mostly schema.prisma)
│   │   ├── routes/          # API Endpoints
│   │   └── utils/           # Cloudinary, Mailers, Helpers
│   ├── .env                 # API Keys (Cloudinary, DB_URL, JWT)
│   ├── app.js               # Express app config
│   └── index.js             # Server Entry Point
├── package.json             # Root dependencies
└── README.md                # Project Guide (Documentation)


updated 

server/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/           <-- NEW: Background tasks yahan honge
│   │   ├── mail.service.js  # Nodemailer configuration
│   │   └── queue.service.js # Redis/BullMQ (High scale mailing)
│   ├── utils/
│   │   ├── cloudinary.js    # Image/PDF Storage
│   │   └── ApiResponse.js   # Standard response format
│   ├── app.js
│   └── index.js


Folder Name,Description & Usage
controllers/,"Saara main logic yahan rahega. Jaise: authController.js login handles karega, adminController.js managers ko power dega."
db/,PostgreSQL/Prisma connection initialization logic yahan setup hota hai.
middlewares/,"Security Gatekeepers. auth.middleware.js check karega token sahi hai ya nahi, aur role.middleware.js check karega user Admin hai ya Talent."
routes/,Endpoints define karta hai. Example: /api/v1/jobs ya /api/v1/admin/monitor. Ye seedha controllers ko call karte hain.
utils/,"External Services. Cloudinary upload logic, Nodemailer for auto-mails, aur reusable functions yahan honge."
prisma/,"Database ka dil (Heart). Saare tables (Users, Jobs, Badges) yahan define hote hain."
app.js,"Saare middlewares (CORS, JSON Parser) aur routes ko ek saath jodne ke liye."
index.js,Server ko start karne ke liye entry point.


Package,Use Case
express,Humara main web framework.
@prisma/client,Database (PostgreSQL) se baat karne ke liye.
dotenv,".env file se secret keys (Password, API keys) read karne ke liye."
cors,Frontend aur Backend ko connect karne ki permission dene ke liye.
cookie-parser,Browser mein tokens (Cookies) save aur read karne ke liye.
bcryptjs,"User ka password database mein save karne se pehle ""Hash"" (Secure) karne ke liye."
jsonwebtoken (JWT),Login ke baad secure session banane ke liye.
cloudinary,Photos aur Resumes cloud par store karne ke liye.
multer,Frontend se aane wali files (Image/PDF) ko backend mein pakadne ke liye.
nodemailer,"Auto-emails (Welcome, Badge verification) bhejne ke liye."