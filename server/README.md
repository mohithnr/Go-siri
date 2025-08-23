# Gosiri Backend - Chatbot Setup

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gosiri

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file

## Features

### AI Chatbot
- Multi-language support (10+ Indian languages)
- Expert dairy farming advice
- Common problem solutions
- Real-time AI assistance

### Supported Languages
- English (en)
- Hindi (hi) - हिंदी
- Telugu (te) - తెలుగు
- Tamil (ta) - தமிழ்
- Kannada (kn) - ಕನ್ನಡ
- Malayalam (ml) - മലയാളം
- Bengali (bn) - বাংলা
- Gujarati (gu) - ગુજરાતી
- Marathi (mr) - मराठी
- Punjabi (pa) - ਪੰਜਾਬੀ

### Common Problems Covered
- Cow health and disease prevention
- Breeding and reproduction issues
- Nutrition and feed management
- Milk production optimization
- Calf care and management
- Farm management and economics
- Veterinary care and vaccination
- Housing and environmental management

## API Endpoints

### Chatbot
- `POST /api/chatbot/query` - Send message to AI assistant
- `GET /api/chatbot/problems` - Get list of common problems
- `GET /api/chatbot/languages` - Get supported languages

## Usage

The chatbot is integrated into the frontend and appears as a floating chat button on all authenticated pages. Users can:

1. Select their preferred language
2. Choose from common problems or type custom questions
3. Get instant AI-powered advice
4. Chat naturally with the farming assistant

## Security

- All chatbot endpoints require JWT authentication
- API key is stored securely in environment variables
- User queries are processed through Google's secure Gemini API
