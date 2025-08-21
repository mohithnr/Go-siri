# Gosiri – Smart Dairy Management System

A full-stack dairy management application built with Next.js 14 and Express.js, designed to help farmers track their dairy operations efficiently.

## 🚀 Features

- **Authentication**: Secure JWT-based login/registration for farmers
- **Dashboard**: Overview of daily milk collection, sales, expenses, and profit/loss
- **Cow Management**: Add and manage individual cows with details
- **Milk Records**: Track morning and evening milk production per cow
- **Sales Tracking**: Record milk sales with automatic calculations
- **Expense Management**: Log farm expenses with notes
- **Breeding Management**: Track insemination dates and calving reminders
- **Reports**: Visual charts for milk yield trends and financial analysis

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📁 Project Structure

```
gosiri/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   └── lib/          # API utilities
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helper functions
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/gosiri
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:3000
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📱 Usage

### First Time Setup
1. Register a new farmer account with your name, phone, and password
2. Add your cows with names, tags, breeds, and ages
3. Start recording daily milk production

### Daily Operations
- **Morning/Evening**: Record milk production for each cow
- **Sales**: Log milk sales with quantity and price
- **Expenses**: Track farm expenses (vet fees, repairs, etc.)
- **Breeding**: Record insemination dates for calving reminders

### Monitoring
- **Dashboard**: View daily and monthly summaries
- **Reports**: Analyze milk trends and financial performance
- **Reminders**: Get alerts for upcoming calving dates

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Farmer registration
- `POST /api/auth/login` - Farmer login

### Cows
- `POST /api/cows/add` - Add new cow
- `GET /api/cows/list` - List farmer's cows

### Milk Records
- `POST /api/milk/add` - Add milk record
- `GET /api/milk/list/:cowId` - Get cow's milk history
- `GET /api/milk/summary` - Daily milk totals

### Finance
- `POST /api/sales/add` - Record milk sale
- `POST /api/expenses/add` - Record expense
- `GET /api/finance/summary` - Financial summary
- `GET /api/finance/history` - Financial history

### Breeding
- `POST /api/breeding/add` - Record insemination
- `POST /api/breeding/calving` - Record calving
- `GET /api/breeding/reminders` - Upcoming calving alerts

## 🚀 Deployment

### Backend
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Set environment variables for production
- Use MongoDB Atlas for cloud database

### Frontend
- Deploy to Vercel, Netlify, or similar platforms
- Set `NEXT_PUBLIC_API_BASE` to your backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Gosiri** - Empowering farmers with smart dairy management solutions 🐄✨
