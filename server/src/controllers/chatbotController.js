const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with the provided API key
const genAI = new GoogleGenerativeAI("AIzaSyCZfsorcLmb9R2S9eQUnBg_t8qj-zAykec");

async function queryChatbot(req, res) {
  try {
    const { message, language } = req.body;
    
    console.log('Chatbot request:', { message, language, timestamp: new Date() });
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Test Gemini API connection first
    try {
      console.log('Testing Gemini API connection...');
      const testModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const testResult = await testModel.generateContent("Hello");
      console.log('Gemini API test successful:', testResult.response.text());
    } catch (apiError) {
      console.error('Gemini API test failed:', apiError);
      console.error('API Error details:', {
        message: apiError.message,
        code: apiError.code,
        status: apiError.status
      });
      
      // Return fallback response with detailed error info
      const fallbackResponse = getFallbackResponse(message, language);
      return res.json({
        success: true,
        response: fallbackResponse,
        language: language,
        timestamp: new Date(),
        note: `Fallback response due to Gemini API error: ${apiError.message}`,
        error: {
          message: apiError.message,
          code: apiError.code,
          status: apiError.status
        }
      });
    }

    // Create a comprehensive prompt for dairy farming assistance
    const systemPrompt = `You are an expert dairy farming assistant named "Gosiri" that helps farmers with their cow-related problems and questions. 

CRITICAL INSTRUCTION: You MUST respond in the exact language specified by the user. If the user selects Hindi (hi), respond in Hindi. If they select Telugu (te), respond in Telugu. This is non-negotiable.

LANGUAGE REQUIREMENTS:
- en: Respond in English only
- hi: Respond in Hindi (हिंदी) only
- te: Respond in Telugu (తెలుగు) only
- ta: Respond in Tamil (தமிழ்) only
- kn: Respond in Kannada (ಕನ್ನಡ) only
- ml: Respond in Malayalam (മലയാളം) only
- bn: Respond in Bengali (বাংলা) only
- gu: Respond in Gujarati (ગુજરાતી) only
- mr: Respond in Marathi (मराठी) only
- pa: Respond in Punjabi (ਪੰਜਾਬੀ) only

EXPERTISE AREAS:
- Cow health and disease prevention
- Breeding and reproduction
- Nutrition and feed management
- Milk production optimization
- Calf care and management
- Farm management and economics
- Veterinary care and vaccination
- Housing and environmental management

RESPONSE FORMAT:
- Start with a greeting in the user's selected language
- Provide clear, step-by-step advice in the selected language
- Include safety warnings if applicable
- Suggest when to consult a veterinarian
- End with encouragement and support in the selected language

User's question: ${message}
User's selected language: ${language}

IMPORTANT: Respond ONLY in ${language === 'en' ? 'English' : 'the user\'s selected local language'}. Do not mix languages.`;

    console.log('Sending prompt to Gemini:', systemPrompt);

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response
    const cleanedResponse = text.trim().replace(/^```\w*\n?|\n?```$/g, '');

    console.log('Gemini AI Response:', {
      original: text,
      cleaned: cleanedResponse,
      language: language,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      response: cleanedResponse,
      language: language,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    if (error.message.includes('API_KEY')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.' 
      });
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(429).json({ 
        message: 'AI service is busy. Please try again in a few minutes.' 
      });
    }

    // Fallback response on any error
    const fallbackResponse = getFallbackResponse(req.body.message || 'general question', req.body.language || 'en');
    console.log('Using fallback response:', fallbackResponse);
    
    return res.json({
      success: true,
      response: fallbackResponse,
      language: req.body.language || 'en',
      timestamp: new Date(),
      note: `Fallback response due to AI service error: ${error.message}`,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}

// Fallback responses when Gemini API is not available
function getFallbackResponse(message, language) {
  const fallbackResponses = {
    en: {
      "Cow not eating properly": "This could be due to stress, illness, or poor feed quality. Check for signs of illness, ensure clean water is available, and try offering fresh, palatable feed. If the problem persists for more than 24 hours, consult a veterinarian.",
      "Milk production decreased": "Decreased milk production can be caused by poor nutrition, stress, illness, or environmental factors. Review your feeding program, check for health issues, and ensure proper milking procedures. Consider consulting a nutritionist or veterinarian.",
      "Cow showing signs of illness": "Monitor the cow closely for symptoms like fever, lethargy, or unusual behavior. Isolate sick animals if possible. Contact a veterinarian immediately for proper diagnosis and treatment. Early intervention is crucial for recovery.",
      "Breeding issues": "Breeding problems may be due to poor nutrition, health issues, or improper timing. Ensure the cow is in good health, properly fed, and bred at the right time in her cycle. Consider consulting a breeding specialist.",
      "Mastitis symptoms": "Mastitis requires immediate attention. Look for swollen udder, abnormal milk, or pain. Isolate affected cows and contact a veterinarian. Follow proper milking hygiene to prevent spread. Treatment usually involves antibiotics.",
      "default": "Thank you for your question about dairy farming. I'm here to help with cow health, breeding, nutrition, and farm management. For specific advice, please provide more details about your situation."
    },
    hi: {
      "Cow not eating properly": "यह तनाव, बीमारी या खराब चारे की गुणवत्ता के कारण हो सकता है। बीमारी के लक्षणों की जांच करें, सुनिश्चित करें कि स्वच्छ पानी उपलब्ध है, और ताजा, स्वादिष्ट चारा देने की कोशिश करें। यदि समस्या 24 घंटे से अधिक समय तक बनी रहती है, तो पशु चिकित्सक से सलाह लें।",
      "Milk production decreased": "दूध उत्पादन में कमी खराब पोषण, तनाव, बीमारी या पर्यावरणीय कारकों के कारण हो सकती है। अपने खिला कार्यक्रम की समीक्षा करें, स्वास्थ्य समस्याओं की जांच करें और उचित दूध दोहन प्रक्रियाओं को सुनिश्चित करें।",
      "Cow showing signs of illness": "गाय को बुखार, सुस्ती या असामान्य व्यवहार जैसे लक्षणों के लिए बारीकी से देखें। यदि संभव हो तो बीमार जानवरों को अलग करें। उचित निदान और उपचार के लिए तुरंत पशु चिकित्सक से संपर्क करें।",
      "default": "डेयरी फार्मिंग के बारे में आपके प्रश्न के लिए धन्यवाद। मैं गाय के स्वास्थ्य, प्रजनन, पोषण और खेत प्रबंधन में मदद करने के लिए यहां हूं। विशिष्ट सलाह के लिए, कृपया अपनी स्थिति के बारे में अधिक विवरण प्रदान करें।"
    },
    te: {
      "Cow not eating properly": "ఇది ఒత్తిడి, అనారోగ్యం లేదా చెడు మేత నాణ్యత కారణంగా ఉండవచ్చు. అనారోగ్య సంకేతాలను తనిఖీ చేయండి, శుభ్రమైన నీరు అందుబాటులో ఉందని నిర్ధారించుకోండి మరియు తాజా, రుచికరమైన మేతను ఇవ్వడానికి ప్రయత్నించండి.",
      "Cow showing signs of illness": "ఆవును జ్వరం, అలసట లేదా అసాధారణ ప్రవర్తన వంటి లక్షణాల కోసం జాగ్రత్తగా పర్యవేక్షించండి. సాధ్యమైతే అనారోగ్య జంతువులను వేరు చేయండి. సరైన రోగ నిర్ధారణ మరియు చికిత్స కోసం వెంటనే పశువైద్యుడిని సంప్రదించండి.",
      "default": "పాల పశుపాలన గురించి మీ ప్రశ్నకు ధన్యవాదాలు. నేను ఆవుల ఆరోగ్యం, పెంపకం, పోషకాహారం మరియు పొలం నిర్వహణలో సహాయం చేయడానికి ఇక్కడ ఉన్నాను."
    },
    kn: {
      "Cow not eating properly": "ಇದು ಒತ್ತಡ, ಅನಾರೋಗ್ಯ ಅಥವಾ ಕೆಟ್ಟ ಮೇವಿನ ಗುಣಮಟ್ಟದ ಕಾರಣದಿಂದಾಗಿರಬಹುದು. ಅನಾರೋಗ್ಯದ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಸ್ವಚ್ಛ ನೀರು ಲಭ್ಯವಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ ಮತ್ತು ತಾಜಾ, ರುಚಿಕರವಾದ ಮೇವನ್ನು ನೀಡಲು ಪ್ರಯತ್ನಿಸಿ.",
      "Milk production decreased": "ಹಾಲಿನ ಉತ್ಪಾದನೆಯಲ್ಲಿ ಇಳಿಕೆಯು ಕೆಟ್ಟ ಪೋಷಣೆ, ಒತ್ತಡ, ಅನಾರೋಗ್ಯ ಅಥವಾ ಪರಿಸರೀಯ ಅಂಶಗಳಿಂದ ಉಂಟಾಗಬಹುದು. ನಿಮ್ಮ ಆಹಾರ ಕಾರ್ಯಕ್ರಮವನ್ನು ಪರಿಶೀಲಿಸಿ, ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸರಿಯಾದ ಹಾಲು ಕರೆಯುವ ವಿಧಾನಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      "Cow showing signs of illness": "ಆವುಗಳನ್ನು ಜ್ವರ, ಅಲಸತೆ ಅಥವಾ ಅಸಾಮಾನ್ಯ ನಡವಳಿಕೆಯಂತಹ ಲಕ್ಷಣಗಳಿಗಾಗಿ ಎಚ್ಚರಿಕೆಯಿಂದ ಗಮನಿಸಿ. ಸಾಧ್ಯವಾದರೆ ಅನಾರೋಗ್ಯ ಪ್ರಾಣಿಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ. ಸರಿಯಾದ ರೋಗನಿರ್ಧಾರ ಮತ್ತು ಚಿಕಿತ್ಸೆಗಾಗಿ ತಕ್ಷಣವೇ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      "Breeding issues": "ಸಂತಾನೋತ್ಪತ್ತಿ ಸಮಸ್ಯೆಗಳು ಕೆಟ್ಟ ಪೋಷಣೆ, ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಅಥವಾ ತಪ್ಪಾದ ಸಮಯದ ಕಾರಣದಿಂದಾಗಿರಬಹುದು. ಆವು ಉತ್ತಮ ಆರೋಗ್ಯದಲ್ಲಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ, ಸರಿಯಾಗಿ ಆಹಾರ ನೀಡಲಾಗಿದೆ ಮತ್ತು ಅವಳ ಚಕ್ರದಲ್ಲಿ ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಸಂತಾನೋತ್ಪತ್ತಿ ಮಾಡಲಾಗಿದೆ.",
      "Mastitis symptoms": "ಮಾಸ್ಟೈಟಿಸ್ ತಕ್ಷಣದ ಗಮನವನ್ನು ಅಗತ್ಯವಿರುತ್ತದೆ. ಊದಿದ ಹಾಲುಗಡ್ಡೆ, ಅಸಾಮಾನ್ಯ ಹಾಲು ಅಥವಾ ನೋವನ್ನು ನೋಡಿ. ಪೀಡಿತ ಆವುಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ಮತ್ತು ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಹರಡುವಿಕೆಯನ್ನು ತಡೆಯಲು ಸರಿಯಾದ ಹಾಲು ಕರೆಯುವ ಸ್ವಚ್ಛತೆಯನ್ನು ಅನುಸರಿಸಿ.",
      "default": "ಪಶುಪಾಲನೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು. ನಾನು ಆವುಗಳ ಆರೋಗ್ಯ, ಸಂತಾನೋತ್ಪತ್ತಿ, ಪೋಷಣೆ ಮತ್ತು ಕೃಷಿ ನಿರ್ವಾಕತ್ತಿಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿ ಇದ್ದೇನೆ. ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯ ಬಗ್ಗೆ ಹೆಚ್ಚಿನ ವಿವರಗಳನ್ನು ನೀಡಿ."
    },
    ta: {
      "Cow not eating properly": "இது மன அழுத்தம், நோய் அல்லது மோசமான தீவன தரம் காரணமாக இருக்கலாம். நோய் அறிகுறிகளை சரிபார்க்கவும், சுத்தமான தண்ணீர் கிடைக்கிறது என்பதை உறுதிப்படுத்தவும், புதிய, சுவையான தீவனத்தை வழங்க முயற்சிக்கவும்.",
      "default": "பால் பண்ணை வளர்ப்பு பற்றிய உங்கள் கேள்விக்கு நன்றி. நான் பசுக்களின் ஆரோக்கியம், இனப்பெருக்கம், ஊட்டச்சத்து மற்றும் பண்ணை நிர்வாகத்தில் உதவ இங்கே இருக்கிறேன்."
    }
  };

  const responses = fallbackResponses[language] || fallbackResponses.en;
  
  // Check for specific problem matches
  for (const [problem, response] of Object.entries(responses)) {
    if (problem !== "default" && message.toLowerCase().includes(problem.toLowerCase())) {
      return response;
    }
  }
  
  return responses.default || fallbackResponses.en.default;
}

async function getCommonProblems(req, res) {
  try {
    const { language = 'en' } = req.query; // Get language from query parameter
    
    console.log('Getting common problems for language:', language);
    
    const problemsByLanguage = {
      en: [
        { id: "1", problem: "Cow not eating properly", category: "Nutrition", description: "Loss of appetite, reduced feed intake", severity: "Medium" },
        { id: "2", problem: "Milk production decreased", category: "Production", description: "Sudden drop in daily milk yield", severity: "High" },
        { id: "3", problem: "Cow showing signs of illness", category: "Health", description: "Lethargy, fever, unusual behavior", severity: "High" },
        { id: "4", problem: "Breeding issues", category: "Reproduction", description: "Difficulty in conception, irregular cycles", severity: "Medium" },
        { id: "5", problem: "Mastitis symptoms", category: "Health", description: "Swollen udder, abnormal milk, pain", severity: "High" },
        { id: "6", problem: "Foot and hoof problems", category: "Health", description: "Limping, hoof damage, foot rot", severity: "Medium" },
        { id: "7", problem: "Calving difficulties", category: "Reproduction", description: "Prolonged labor, dystocia", severity: "High" },
        { id: "8", problem: "Feed management", category: "Nutrition", description: "Feed quality, storage, ration balancing", severity: "Medium" },
        { id: "9", problem: "Vaccination schedule", category: "Health", description: "Missing vaccinations, timing issues", severity: "Medium" },
        { id: "10", problem: "Milk quality issues", category: "Production", description: "Off-flavor, high somatic cell count", severity: "Medium" }
      ],
      hi: [
        { id: "1", problem: "गाय ठीक से नहीं खा रही", category: "पोषण", description: "भूख न लगना, कम चारा खाना", severity: "मध्यम" },
        { id: "2", problem: "दूध उत्पादन कम हो गया", category: "उत्पादन", description: "दैनिक दूध उत्पादन में अचानक गिरावट", severity: "उच्च" },
        { id: "3", problem: "गाय में बीमारी के लक्षण", category: "स्वास्थ्य", description: "सुस्ती, बुखार, असामान्य व्यवहार", severity: "उच्च" },
        { id: "4", problem: "प्रजनन की समस्याएं", category: "प्रजनन", description: "गर्भधारण में कठिनाई, अनियमित चक्र", severity: "मध्यम" },
        { id: "5", problem: "स्तनशोथ के लक्षण", category: "स्वास्थ्य", description: "सूजा हुआ थन, असामान्य दूध, दर्द", severity: "उच्च" },
        { id: "6", problem: "पैर और खुर की समस्याएं", category: "स्वास्थ्य", description: "लंगड़ाना, खुर की क्षति, पैर सड़ना", severity: "मध्यम" },
        { id: "7", problem: "ब्याने में कठिनाई", category: "प्रजनन", description: "लंबी प्रसव प्रक्रिया, जटिल प्रसव", severity: "उच्च" },
        { id: "8", problem: "चारा प्रबंधन", category: "पोषण", description: "चारे की गुणवत्ता, भंडारण, आहार संतुलन", severity: "मध्यम" },
        { id: "9", problem: "टीकाकरण कार्यक्रम", category: "स्वास्थ्य", description: "टीके छूट जाना, समय की समस्या", severity: "मध्यम" },
        { id: "10", problem: "दूध की गुणवत्ता की समस्याएं", category: "उत्पादन", description: "बुरा स्वाद, उच्च सोमैटिक सेल काउंट", severity: "मध्यम" }
      ],
      te: [
        { id: "1", problem: "ఆవు సరిగ్గా తినడం లేదు", category: "పోషణ", description: "కడుపు ఆకలి లేదు, తక్కువ మేత తినడం", severity: "మధ్యస్థం" },
        { id: "2", problem: "పాల ఉత్పత్తి తగ్గింది", category: "ఉత్పత్తి", description: "రోజువారీ పాల ఉత్పత్తిలో హఠాత్తు తగ్గుదల", severity: "అధికం" },
        { id: "3", problem: "ఆవులో అనారోగ్య సంకేతాలు", category: "ఆరోగ్యం", description: "అలసట, జ్వరం, అసాధారణ ప్రవర్తన", severity: "అధికం" },
        { id: "4", problem: "పెంపక సమస్యలు", category: "పెంపకం", description: "గర్భధారణలో కష్టం, అనియమిత చక్రాలు", severity: "మధ్యస్థం" },
        { id: "5", problem: "మాస్టిటిస్ లక్షణాలు", category: "ఆరోగ్యం", description: "వాచిన గుజ్జు, అసాధారణ పాలు, నొప్పి", severity: "అధికం" },
        { id: "6", problem: "కాళ్లు మరియు గిట్టల సమస్యలు", category: "ఆరోగ్యం", description: "కుంటుతూపడం, గిట్టల నష్టం, కాళ్లు కుళ్లడం", severity: "మధ్యస్థం" },
        { id: "7", problem: "వేలు కట్టడంలో కష్టాలు", category: "పెంపకం", description: "పొడవైన ప్రసవ ప్రక్రియ, క్లిష్టమైన ప్రసవం", severity: "అధికం" },
        { id: "8", problem: "మేత నిర్వహణ", category: "పోషణ", description: "మేత నాణ్యత, నిల్వ, ఆహార సంతులనం", severity: "మధ్యస్థం" },
        { id: "9", problem: "వ్యాక్సినేషన్ షెడ్యూల్", category: "ఆరోగ్యం", description: "వ్యాక్సిన్లు తప్పిపోవడం, సమయ సమస్యలు", severity: "మధ్యస్థం" },
        { id: "10", problem: "పాల నాణ్యత సమస్యలు", category: "ఉత్పత్తి", description: "చెడు రుచి, అధిక సోమాటిక్ సెల్ కౌంట్", severity: "మధ్యస్థం" }
      ],
      kn: [
        { id: "1", problem: "ಆವು ಸರಿಯಾಗಿ ತಿನ್ನುತ್ತಿಲ್ಲ", category: "ಪೋಷಣೆ", description: "ಹಸಿವು ಇಲ್ಲ, ಕಡಿಮೆ ಮೇವು ತಿನ್ನುವುದು", severity: "ಮಧ್ಯಮ" },
        { id: "2", problem: "ಹಾಲಿನ ಉತ್ಪಾದನೆ ಕಡಿಮೆಯಾಗಿದೆ", category: "ಉತ್ಪಾದನೆ", description: "ದೈನಂದಿನ ಹಾಲಿನ ಉತ್ಪಾದನೆಯಲ್ಲಿ ಏಕಾಏಕಿ ಇಳಿಕೆ", severity: "ಅಧಿಕ" },
        { id: "3", problem: "ಆವುಗಳಲ್ಲಿ ಅನಾರೋಗ್ಯದ ಲಕ್ಷಣಗಳು", category: "ಆರೋಗ್ಯ", description: "ಅಲಸತೆ, ಜ್ವರ, ಅಸಾಮಾನ್ಯ ನಡವಳಿಕೆ", severity: "ಅಧಿಕ" },
        { id: "4", problem: "ಸಂತಾನೋತ್ಪತ್ತಿ ಸಮಸ್ಯೆಗಳು", category: "ಸಂತಾನೋತ್ಪತ್ತಿ", description: "ಗರ್ಭಧಾರಣೆಯಲ್ಲಿ ಕಷ್ಟ, ಅನಿಯಮಿತ ಚಕ್ರಗಳು", severity: "ಮಧ್ಯಮ" },
        { id: "5", problem: "ಮಾಸ್ಟೈಟಿಸ್ ಲಕ್ಷಣಗಳು", category: "ಆರೋಗ್ಯ", description: "ಊದಿದ ಹಾಲುಗಡ್ಡೆ, ಅಸಾಮಾನ್ಯ ಹಾಲು, ನೋವು", severity: "ಅಧಿಕ" },
        { id: "6", problem: "ಕಾಲುಗಳು ಮತ್ತು ಗೊರಸುಗಳ ಸಮಸ್ಯೆಗಳು", category: "ಆರೋಗ್ಯ", description: "ಕುಂಟುತ್ತಿರುವುದು, ಗೊರಸುಗಳ ಹಾನಿ, ಕಾಲು ಕೊಳೆಯುವುದು", severity: "ಮಧ್ಯಮ" },
        { id: "7", problem: "ವೇಲು ಕಟ್ಟುವಿಕೆಯಲ್ಲಿ ಕಷ್ಟಗಳು", category: "ಸಂತಾನೋತ್ಪತ್ತಿ", description: "ದೀರ್ಘ ಪ್ರಸವ ಪ್ರಕ್ರಿಯೆ, ಕ್ಲಿಷ್ಟ ಪ್ರಸವ", severity: "ಅಧಿಕ" },
        { id: "8", problem: "ಮೇವು ನಿರ್ವಹಣೆ", category: "ಪೋಷಣೆ", description: "ಮೇವಿನ ಗುಣಮಟ್ಟ, ಸಂಗ್ರಹಣೆ, ಆಹಾರ ಸಮತೋಲನ", severity: "ಮಧ್ಯಮ" },
        { id: "9", problem: "ವ್ಯಾಕ್ಸಿನೇಷನ್ ವೇಳಾಪಟ್ಟಿ", category: "ಆರೋಗ್ಯ", description: "ವ್ಯಾಕ್ಸಿನ್ಗಳು ತಪ್ಪಿಹೋಗುವುದು, ಸಮಯದ ಸಮಸ್ಯೆಗಳು", severity: "ಮಧ್ಯಮ" },
        { id: "10", problem: "ಹಾಲಿನ ಗುಣಮಟ್ಟದ ಸಮಸ್ಯೆಗಳು", category: "ಉತ್ಪಾದನೆ", description: "ಕೆಟ್ಟ ರುಚಿ, ಅಧಿಕ ಸೋಮಾಟಿಕ್ ಸೆಲ್ ಕೌಂಟ್", severity: "ಮಧ್ಯಮ" }
      ],
      ta: [
        { id: "1", problem: "பசு சரியாக சாப்பிடவில்லை", category: "ஊட்டச்சத்து", description: "பசியின்மை, குறைந்த தீவன உட்கொள்ளல்", severity: "நடுத்தரம்" },
        { id: "2", problem: "பால் உற்பத்தி குறைந்துள்ளது", category: "உற்பத்தி", description: "தினசரி பால் உற்பத்தியில் திடீர் வீழ்ச்சி", severity: "அதிகம்" },
        { id: "3", problem: "பசுவில் நோய் அறிகுறிகள்", category: "சுகாதாரம்", description: "சோர்வு, காய்ச்சல், அசாதாரண நடத்தை", severity: "அதிகம்" },
        { id: "4", problem: "இனப்பெருக்க சிக்கல்கள்", category: "இனப்பெருக்கம்", description: "கருத்தரிப்பதில் சிரமம், ஒழுங்கற்ற சுழற்சிகள்", severity: "நடுத்தரம்" },
        { id: "5", problem: "மாஸ்டிடிஸ் அறிகுறிகள்", category: "சுகாதாரம்", description: "வீங்கிய மடி, அசாதாரண பால், வலி", severity: "அதிகம்" },
        { id: "6", problem: "கால்கள் மற்றும் குளம்பு பிரச்சினைகள்", category: "சுகாதாரம்", description: "நொண்டல், குளம்பு சேதம், கால் அழுகல்", severity: "நடுத்தரம்" },
        { id: "7", problem: "கன்று ஈனுவதில் சிரமங்கள்", category: "இனப்பெருக்கம்", description: "நீண்ட பிரசவ செயல்முறை, சிக்கலான பிரசவம்", severity: "நடுத்தரம்" },
        { id: "8", problem: "தீவன மேலாண்மை", category: "ஊட்டச்சத்து", description: "தீவன தரம், சேமிப்பு, உணவு சமநிலை", severity: "நடுத்தரம்" },
        { id: "9", problem: "தடுப்பூசி அட்டவணை", category: "சுகாதாரம்", description: "தடுப்பூசிகள் தவறிப்போதல், நேர சிக்கல்கள்", severity: "நடுத்தரம்" },
        { id: "10", problem: "பால் தரம் பிரச்சினைகள்", category: "உற்பத்தி", description: "மோசமான சுவை, அதிக சோமாடிக் செல் எண்ணிக்கை", severity: "நடுத்தரம்" }
      ]
    };

    // Get problems for the selected language, fallback to English if not available
    const problems = problemsByLanguage[language] || problemsByLanguage.en;
    
    console.log(`Returning ${problems.length} problems in ${language}`);

    return res.json({
      success: true,
      problems: problems,
      language: language
    });

  } catch (error) {
    console.error('Get common problems error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch common problems' 
    });
  }
}

async function getLanguages(req, res) {
  try {
    const languages = [
      { code: "en", name: "English", nativeName: "English" },
      { code: "hi", name: "Hindi", nativeName: "हिंदी" },
      { code: "te", name: "Telugu", nativeName: "తెలుగు" },
      { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
      { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
      { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
      { code: "bn", name: "Bengali", nativeName: "বাংলা" },
      { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
      { code: "mr", name: "Marathi", nativeName: "मराठी" },
      { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" }
    ];

    return res.json({
      success: true,
      languages: languages
    });

  } catch (error) {
    console.error('Get languages error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch languages' 
    });
  }
}

module.exports = {
  queryChatbot,
  getCommonProblems,
  getLanguages
};
