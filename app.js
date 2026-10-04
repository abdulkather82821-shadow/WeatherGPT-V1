const API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const ARCHIVE_API = "https://archive-api.open-meteo.com/v1/archive";
const AIR_API = "https://air-quality-api.open-meteo.com/v1/air-quality";
const MARINE_API = "https://marine-api.open-meteo.com/v1/marine";
const RADAR_API = "https://api.rainviewer.com/public/weather-maps.json";
const DEFAULT_LOCATION = { name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };
const locationAliases = [
  { search: "Thanjavur", aliases: ["தஞ்சாவூர்", "தஞ்சாவூரில்", "तंजावुर", "तंजावूर"] },
  { search: "Chennai", aliases: ["சென்னை", "चेन्नई"] },
  { search: "Coimbatore", aliases: ["கோயம்புத்தூர்", "கோயம்புத்தூரில்", "கோயம்புத்தூர்"] },
  { search: "Madurai", aliases: ["மதுரை", "மதுரையில்", "मदुरै"] },
  { search: "Tiruchirappalli", aliases: ["திருச்சிராப்பள்ளி", "திருச்சியில்"] },
  { search: "Mumbai", aliases: ["मुंबई", "मुम्बई", "ممبئی", "মুম্বাই"] },
  { search: "Delhi", aliases: ["दिल्ली", "دہلی", "দিল্লি"] },
  { search: "Bengaluru", aliases: ["ಬೆಂಗಳೂರು", "ಬೆಂಗಳೂರುದಲ್ಲಿ", "பெங்களூரு", "பெங்களூரில்"] },
  { search: "Hyderabad", aliases: ["హైదరాబాద్", "ஹைதராபாத்", "హైదరాబాదులో"] },
  { search: "Kolkata", aliases: ["কলকাতা", "কলকাতায়", "কলকাতায়"] }
];
const translations = {
  en: { newChat: "New conversation", workspace: "YOUR WORKSPACE", overview: "Overview", forecast: "7-day forecast", advisories: "Advisories", savedLocations: "SAVED LOCATIONS", addLocation: "Add a location", liveData: "Live weather data", weatherFriend: "Weather friend", freePlan: "Free plan", home: "Home", updatedJustNow: "Updated just now", language: "Language", yourWeather: "YOUR WEATHER, AT A GLANCE", goodMorning: "Good morning", weatherCanHelp: "A little weather insight can go a long way.", feelsLike: "FEELS LIKE", humidity: "HUMIDITY", wind: "WIND", rainChance: "RAIN CHANCE", daylight: "DAYLIGHT", sunTimes: "Sun times", sunrise: "SUNRISE", sunset: "SUNSET", theWeekAhead: "THE WEEK AHEAD", sevenDayForecast: "7-day forecast", moreDetails: "More details", weatherWatch: "WEATHER WATCH", littleTip: "A LITTLE TIP", askWeatherGPT: "Ask WeatherGPT", chatDescription: "Your personal weather companion, ready when you are.", ready: "READY", rainToday: "Will it rain today?", whatToWear: "What should I wear?", weekForecast: "The week ahead", askPlaceholder: "Ask anything about the weather…", dataDisclaimer: "Weather data from Open-Meteo. Forecasts are guidance, not official emergency alerts.", builtForEveryone: "Weather intelligence for everyone", servicesOperational: "Weather services operational" },
  hi: { newChat: "नई बातचीत", workspace: "आपका कार्यक्षेत्र", overview: "अवलोकन", forecast: "7-दिन का पूर्वानुमान", advisories: "मौसम सलाह", savedLocations: "सहेजे गए स्थान", addLocation: "स्थान जोड़ें", liveData: "लाइव मौसम जानकारी", weatherFriend: "मौसम साथी", freePlan: "निःशुल्क योजना", home: "होम", updatedJustNow: "अभी अपडेट किया गया", language: "भाषा", yourWeather: "आपका मौसम, एक नज़र में", goodMorning: "सुप्रभात", weatherCanHelp: "मौसम की थोड़ी जानकारी दिन बेहतर बना सकती है।", feelsLike: "महसूस होगा", humidity: "नमी", wind: "हवा", rainChance: "बारिश की संभावना", daylight: "दिन का उजाला", sunTimes: "सूर्य समय", sunrise: "सूर्योदय", sunset: "सूर्यास्त", theWeekAhead: "आने वाला सप्ताह", sevenDayForecast: "7-दिन का पूर्वानुमान", moreDetails: "और जानकारी", weatherWatch: "मौसम पर नज़र", littleTip: "एक छोटी सलाह", askWeatherGPT: "WeatherGPT से पूछें", chatDescription: "आपका निजी मौसम साथी, जब भी ज़रूरत हो।", ready: "तैयार", rainToday: "क्या आज बारिश होगी?", whatToWear: "आज क्या पहनूँ?", weekForecast: "आने वाला सप्ताह", askPlaceholder: "मौसम के बारे में कुछ भी पूछें…", dataDisclaimer: "मौसम जानकारी Open-Meteo से। पूर्वानुमान सलाह है, आधिकारिक आपातकालीन चेतावनी नहीं।", builtForEveryone: "सबके लिए मौसम की जानकारी", servicesOperational: "मौसम सेवाएँ चालू हैं" },
  bn: { newChat: "নতুন কথোপকথন", workspace: "আপনার কর্মক্ষেত্র", overview: "সংক্ষিপ্ত বিবরণ", forecast: "৭ দিনের পূর্বাভাস", advisories: "আবহাওয়া পরামর্শ", savedLocations: "সংরক্ষিত স্থান", addLocation: "স্থান যোগ করুন", liveData: "লাইভ আবহাওয়ার তথ্য", weatherFriend: "আবহাওয়ার বন্ধু", freePlan: "বিনামূল্যের পরিকল্পনা", home: "হোম", updatedJustNow: "এইমাত্র আপডেট হয়েছে", language: "ভাষা", yourWeather: "আপনার আবহাওয়া, এক নজরে", goodMorning: "সুপ্রভাত", weatherCanHelp: "আবহাওয়ার একটু খবর দিনটাকে সহজ করে।", feelsLike: "অনুভূত তাপমাত্রা", humidity: "আর্দ্রতা", wind: "বাতাস", rainChance: "বৃষ্টির সম্ভাবনা", daylight: "দিনের আলো", sunTimes: "সূর্যের সময়", sunrise: "সূর্যোদয়", sunset: "সূর্যাস্ত", theWeekAhead: "সামনের সপ্তাহ", sevenDayForecast: "৭ দিনের পূর্বাভাস", moreDetails: "আরও জানুন", weatherWatch: "আবহাওয়ার নজরদারি", littleTip: "একটি ছোট পরামর্শ", askWeatherGPT: "WeatherGPT-কে জিজ্ঞাসা করুন", chatDescription: "আপনার ব্যক্তিগত আবহাওয়ার সঙ্গী, যখনই প্রয়োজন।", ready: "প্রস্তুত", rainToday: "আজ কি বৃষ্টি হবে?", whatToWear: "আজ কী পরব?", weekForecast: "সামনের সপ্তাহ", askPlaceholder: "আবহাওয়া সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন…", dataDisclaimer: "আবহাওয়ার তথ্য Open-Meteo থেকে। পূর্বাভাস পরামর্শ, সরকারি জরুরি সতর্কতা নয়।", builtForEveryone: "সবার জন্য আবহাওয়ার তথ্য", servicesOperational: "আবহাওয়া পরিষেবা চালু আছে" },
  ta: { newChat: "புதிய உரையாடல்", workspace: "உங்கள் பணியிடம்", overview: "கண்ணோட்டம்", forecast: "7 நாள் முன்னறிவிப்பு", advisories: "வானிலை அறிவிப்புகள்", savedLocations: "சேமித்த இடங்கள்", addLocation: "இடத்தைச் சேர்க்கவும்", liveData: "நேரடி வானிலைத் தகவல்", weatherFriend: "வானிலை நண்பர்", freePlan: "இலவசத் திட்டம்", home: "முகப்பு", updatedJustNow: "இப்போது புதுப்பிக்கப்பட்டது", language: "மொழி", yourWeather: "உங்கள் வானிலை, ஒரே பார்வையில்", goodMorning: "காலை வணக்கம்", weatherCanHelp: "சிறிய வானிலைத் தகவல் உங்கள் நாளை மேம்படுத்தும்.", feelsLike: "உணரப்படும் வெப்பநிலை", humidity: "ஈரப்பதம்", wind: "காற்று", rainChance: "மழை வாய்ப்பு", daylight: "பகலொளி", sunTimes: "சூரிய நேரங்கள்", sunrise: "சூரிய உதயம்", sunset: "சூரிய அஸ்தமனம்", theWeekAhead: "வரும் வாரம்", sevenDayForecast: "7 நாள் முன்னறிவிப்பு", moreDetails: "மேலும் விவரங்கள்", weatherWatch: "வானிலை கண்காணிப்பு", littleTip: "ஒரு சிறிய குறிப்பு", askWeatherGPT: "WeatherGPT-யிடம் கேளுங்கள்", chatDescription: "உங்கள் தனிப்பட்ட வானிலைத் துணை, எப்போதும் தயார்.", ready: "தயார்", rainToday: "இன்று மழை பெய்யுமா?", whatToWear: "இன்று என்ன அணியலாம்?", weekForecast: "வரும் வாரம்", askPlaceholder: "வானிலை பற்றி எதையும் கேளுங்கள்…", dataDisclaimer: "Open-Meteo வானிலைத் தரவு. முன்னறிவிப்பு வழிகாட்டுதல் மட்டுமே; அதிகாரப்பூர்வ அவசர எச்சரிக்கை அல்ல.", builtForEveryone: "அனைவருக்குமான வானிலைத் தகவல்", servicesOperational: "வானிலைச் சேவைகள் இயங்குகின்றன" },
  te: { newChat: "కొత్త సంభాషణ", workspace: "మీ కార్యస్థలం", overview: "అవలోకనం", forecast: "7 రోజుల అంచనా", advisories: "వాతావరణ సూచనలు", savedLocations: "సేవ్ చేసిన ప్రదేశాలు", addLocation: "ప్రదేశాన్ని జోడించండి", liveData: "ప్రత్యక్ష వాతావరణ సమాచారం", weatherFriend: "వాతావరణ మిత్రుడు", freePlan: "ఉచిత ప్లాన్", home: "హోమ్", updatedJustNow: "ఇప్పుడే నవీకరించబడింది", language: "భాష", yourWeather: "మీ వాతావరణం, ఒక్క చూపులో", goodMorning: "శుభోదయం", weatherCanHelp: "వాతావరణ సమాచారం మీ రోజును సులభతరం చేస్తుంది.", feelsLike: "అనుభూతి ఉష్ణోగ్రత", humidity: "తేమ", wind: "గాలి", rainChance: "వర్షం వచ్చే అవకాశం", daylight: "పగటి వెలుతురు", sunTimes: "సూర్య సమయాలు", sunrise: "సూర్యోదయం", sunset: "సూర్యాస్తమయం", theWeekAhead: "రాబోయే వారం", sevenDayForecast: "7 రోజుల అంచనా", moreDetails: "మరిన్ని వివరాలు", weatherWatch: "వాతావరణ పరిశీలన", littleTip: "ఒక చిన్న సూచన", askWeatherGPT: "WeatherGPTని అడగండి", chatDescription: "మీ వ్యక్తిగత వాతావరణ సహాయకుడు, మీకు ఎల్లప్పుడూ అందుబాటులో.", ready: "సిద్ధం", rainToday: "ఈరోజు వర్షం పడుతుందా?", whatToWear: "ఈరోజు ఏం ధరించాలి?", weekForecast: "రాబోయే వారం", askPlaceholder: "వాతావరణం గురించి ఏదైనా అడగండి…", dataDisclaimer: "Open-Meteo వాతావరణ సమాచారం. అంచనాలు మార్గదర్శకం మాత్రమే, అధికారిక అత్యవసర హెచ్చరికలు కావు.", builtForEveryone: "అందరికీ వాతావరణ సమాచారం", servicesOperational: "వాతావరణ సేవలు అందుబాటులో ఉన్నాయి" },
  mr: { newChat: "नवीन संभाषण", workspace: "तुमचे कार्यक्षेत्र", overview: "आढावा", forecast: "७ दिवसांचा अंदाज", advisories: "हवामान सूचना", savedLocations: "जतन केलेली ठिकाणे", addLocation: "ठिकाण जोडा", liveData: "थेट हवामान माहिती", weatherFriend: "हवामान मित्र", freePlan: "मोफत योजना", home: "होम", updatedJustNow: "आत्ताच अपडेट केले", language: "भाषा", yourWeather: "तुमचे हवामान, एका नजरेत", goodMorning: "शुभ सकाळ", weatherCanHelp: "हवामानाची छोटीशी माहिती दिवस सोपा करू शकते.", feelsLike: "जाणवणारे तापमान", humidity: "आर्द्रता", wind: "वारा", rainChance: "पावसाची शक्यता", daylight: "दिवसाचा प्रकाश", sunTimes: "सूर्य वेळा", sunrise: "सूर्योदय", sunset: "सूर्यास्त", theWeekAhead: "पुढील आठवडा", sevenDayForecast: "७ दिवसांचा अंदाज", moreDetails: "अधिक माहिती", weatherWatch: "हवामानावर लक्ष", littleTip: "एक छोटी सूचना", askWeatherGPT: "WeatherGPT ला विचारा", chatDescription: "तुमचा वैयक्तिक हवामान साथी, कधीही तयार.", ready: "तयार", rainToday: "आज पाऊस पडेल का?", whatToWear: "आज काय घालावे?", weekForecast: "पुढील आठवडा", askPlaceholder: "हवामानाबद्दल काहीही विचारा…", dataDisclaimer: "Open-Meteo कडून हवामान माहिती. अंदाज हे मार्गदर्शन आहे, अधिकृत आपत्कालीन इशारे नाहीत.", builtForEveryone: "सर्वांसाठी हवामान माहिती", servicesOperational: "हवामान सेवा सुरू आहेत" },
  kn: { newChat: "ಹೊಸ ಸಂಭಾಷಣೆ", workspace: "ನಿಮ್ಮ ಕಾರ್ಯಸ್ಥಳ", overview: "ಅವಲೋಕನ", forecast: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ", advisories: "ಹವಾಮಾನ ಸಲಹೆಗಳು", savedLocations: "ಉಳಿಸಿದ ಸ್ಥಳಗಳು", addLocation: "ಸ್ಥಳ ಸೇರಿಸಿ", liveData: "ನೇರ ಹವಾಮಾನ ಮಾಹಿತಿ", weatherFriend: "ಹವಾಮಾನ ಸ್ನೇಹಿತ", freePlan: "ಉಚಿತ ಯೋಜನೆ", home: "ಮುಖಪುಟ", updatedJustNow: "ಈಗಷ್ಟೇ ನವೀಕರಿಸಲಾಗಿದೆ", language: "ಭಾಷೆ", yourWeather: "ನಿಮ್ಮ ಹವಾಮಾನ, ಒಂದೇ ನೋಟದಲ್ಲಿ", goodMorning: "ಶುಭೋದಯ", weatherCanHelp: "ಸ್ವಲ್ಪ ಹವಾಮಾನ ಮಾಹಿತಿ ನಿಮ್ಮ ದಿನವನ್ನು ಸುಲಭಗೊಳಿಸುತ್ತದೆ.", feelsLike: "ಅನುಭವದ ತಾಪಮಾನ", humidity: "ಆರ್ದ್ರತೆ", wind: "ಗಾಳಿ", rainChance: "ಮಳೆಯ ಸಾಧ್ಯತೆ", daylight: "ಹಗಲು ಬೆಳಕು", sunTimes: "ಸೂರ್ಯನ ಸಮಯ", sunrise: "ಸೂರ್ಯೋದಯ", sunset: "ಸೂರ್ಯಾಸ್ತ", theWeekAhead: "ಮುಂದಿನ ವಾರ", sevenDayForecast: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ", moreDetails: "ಹೆಚ್ಚಿನ ವಿವರ", weatherWatch: "ಹವಾಮಾನ ಗಮನ", littleTip: "ಒಂದು ಸಣ್ಣ ಸಲಹೆ", askWeatherGPT: "WeatherGPT ಅನ್ನು ಕೇಳಿ", chatDescription: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹವಾಮಾನ ಸಂಗಾತಿ, ಯಾವಾಗಲೂ ಸಿದ್ಧ.", ready: "ಸಿದ್ಧ", rainToday: "ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?", whatToWear: "ಇಂದು ಏನು ಧರಿಸಲಿ?", weekForecast: "ಮುಂದಿನ ವಾರ", askPlaceholder: "ಹವಾಮಾನದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ…", dataDisclaimer: "Open-Meteo ಹವಾಮಾನ ಮಾಹಿತಿ. ಮುನ್ಸೂಚನೆ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ; ಅಧಿಕೃತ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಲ್ಲ.", builtForEveryone: "ಎಲ್ಲರಿಗೂ ಹವಾಮಾನ ಮಾಹಿತಿ", servicesOperational: "ಹವಾಮಾನ ಸೇವೆಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ" },
  ml: { newChat: "പുതിയ സംഭാഷണം", workspace: "നിങ്ങളുടെ ഇടം", overview: "അവലോകനം", forecast: "7 ദിവസത്തെ പ്രവചനം", advisories: "കാലാവസ്ഥാ അറിയിപ്പുകൾ", savedLocations: "സൂക്ഷിച്ച സ്ഥലങ്ങൾ", addLocation: "സ്ഥലം ചേർക്കുക", liveData: "തത്സമയ കാലാവസ്ഥാ വിവരം", weatherFriend: "കാലാവസ്ഥാ സുഹൃത്ത്", freePlan: "സൗജന്യ പ്ലാൻ", home: "ഹോം", updatedJustNow: "ഇപ്പോൾ പുതുക്കി", language: "ഭാഷ", yourWeather: "നിങ്ങളുടെ കാലാവസ്ഥ, ഒറ്റനോട്ടത്തിൽ", goodMorning: "സുപ്രഭാതം", weatherCanHelp: "കാലാവസ്ഥാ വിവരം നിങ്ങളുടെ ദിവസം എളുപ്പമാക്കും.", feelsLike: "അനുഭവപ്പെടുന്ന ചൂട്", humidity: "ഈർപ്പം", wind: "കാറ്റ്", rainChance: "മഴസാധ്യത", daylight: "പകൽവെളിച്ചം", sunTimes: "സൂര്യസമയം", sunrise: "സൂര്യോദയം", sunset: "സൂര്യാസ്തമയം", theWeekAhead: "വരുന്ന ആഴ്ച", sevenDayForecast: "7 ദിവസത്തെ പ്രവചനം", moreDetails: "കൂടുതൽ വിവരങ്ങൾ", weatherWatch: "കാലാവസ്ഥാ നിരീക്ഷണം", littleTip: "ഒരു ചെറിയ നിർദേശം", askWeatherGPT: "WeatherGPT-യോട് ചോദിക്കൂ", chatDescription: "നിങ്ങളുടെ സ്വകാര്യ കാലാവസ്ഥാ കൂട്ടാളി, എപ്പോഴും തയ്യാറാണ്.", ready: "തയ്യാർ", rainToday: "ഇന്ന് മഴ പെയ്യുമോ?", whatToWear: "ഇന്ന് എന്ത് ധരിക്കണം?", weekForecast: "വരുന്ന ആഴ്ച", askPlaceholder: "കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ…", dataDisclaimer: "Open-Meteo കാലാവസ്ഥാ വിവരം. പ്രവചനം മാർഗ്ഗനിർദ്ദേശം മാത്രം; ഔദ്യോഗിക അടിയന്തര മുന്നറിയിപ്പല്ല.", builtForEveryone: "എല്ലാവർക്കും കാലാവസ്ഥാ വിവരം", servicesOperational: "കാലാവസ്ഥാ സേവനങ്ങൾ പ്രവർത്തിക്കുന്നു" },
  gu: { newChat: "નવી વાતચીત", workspace: "તમારું કાર્યસ્થળ", overview: "ઝાંખી", forecast: "7 દિવસની આગાહી", advisories: "હવામાન સલાહ", savedLocations: "સાચવેલાં સ્થળો", addLocation: "સ્થળ ઉમેરો", liveData: "હવામાનની જીવંત માહિતી", weatherFriend: "હવામાન મિત્ર", freePlan: "મફત યોજના", home: "હોમ", updatedJustNow: "હમણાં અપડેટ થયું", language: "ભાષા", yourWeather: "તમારું હવામાન, એક નજરમાં", goodMorning: "સુપ્રભાત", weatherCanHelp: "હવામાનની થોડી માહિતી તમારો દિવસ સરળ બનાવે.", feelsLike: "અનુભવાતું તાપમાન", humidity: "ભેજ", wind: "પવન", rainChance: "વરસાદની શક્યતા", daylight: "દિવસનો પ્રકાશ", sunTimes: "સૂર્ય સમય", sunrise: "સૂર્યોદય", sunset: "સૂર્યાસ્ત", theWeekAhead: "આગામી અઠવાડિયું", sevenDayForecast: "7 દિવસની આગાહી", moreDetails: "વધુ વિગતો", weatherWatch: "હવામાન પર નજર", littleTip: "એક નાની સલાહ", askWeatherGPT: "WeatherGPTને પૂછો", chatDescription: "તમારો વ્યક્તિગત હવામાન સાથી, જ્યારે પણ તૈયાર.", ready: "તૈયાર", rainToday: "શું આજે વરસાદ પડશે?", whatToWear: "આજે શું પહેરવું?", weekForecast: "આગામી અઠવાડિયું", askPlaceholder: "હવામાન વિશે કંઈપણ પૂછો…", dataDisclaimer: "Open-Meteoની હવામાન માહિતી. આગાહી માર્ગદર્શન છે, સત્તાવાર કટોકટીની ચેતવણી નથી.", builtForEveryone: "દરેક માટે હવામાન માહિતી", servicesOperational: "હવામાન સેવાઓ કાર્યરત છે" },
  pa: { newChat: "ਨਵੀਂ ਗੱਲਬਾਤ", workspace: "ਤੁਹਾਡਾ ਕਾਰਜ-ਸਥਾਨ", overview: "ਸੰਖੇਪ ਜਾਣਕਾਰੀ", forecast: "7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ", advisories: "ਮੌਸਮ ਦੀਆਂ ਸਲਾਹਾਂ", savedLocations: "ਸੰਭਾਲੇ ਸਥਾਨ", addLocation: "ਸਥਾਨ ਸ਼ਾਮਲ ਕਰੋ", liveData: "ਲਾਈਵ ਮੌਸਮ ਜਾਣਕਾਰੀ", weatherFriend: "ਮੌਸਮ ਸਾਥੀ", freePlan: "ਮੁਫ਼ਤ ਯੋਜਨਾ", home: "ਮੁੱਖ ਪੰਨਾ", updatedJustNow: "ਹੁਣੇ ਅੱਪਡੇਟ ਕੀਤਾ", language: "ਭਾਸ਼ਾ", yourWeather: "ਤੁਹਾਡਾ ਮੌਸਮ, ਇੱਕ ਨਜ਼ਰ ਵਿੱਚ", goodMorning: "ਸ਼ੁਭ ਸਵੇਰ", weatherCanHelp: "ਮੌਸਮ ਦੀ ਥੋੜ੍ਹੀ ਜਾਣਕਾਰੀ ਦਿਨ ਸੌਖਾ ਬਣਾਉਂਦੀ ਹੈ।", feelsLike: "ਮਹਿਸੂਸ ਤਾਪਮਾਨ", humidity: "ਨਮੀ", wind: "ਹਵਾ", rainChance: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ", daylight: "ਦਿਨ ਦੀ ਰੌਸ਼ਨੀ", sunTimes: "ਸੂਰਜ ਦਾ ਸਮਾਂ", sunrise: "ਸੂਰਜ ਚੜ੍ਹਨਾ", sunset: "ਸੂਰਜ ਡੁੱਬਣਾ", theWeekAhead: "ਆਉਣ ਵਾਲਾ ਹਫ਼ਤਾ", sevenDayForecast: "7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ", moreDetails: "ਹੋਰ ਵੇਰਵੇ", weatherWatch: "ਮੌਸਮ ਉੱਤੇ ਨਜ਼ਰ", littleTip: "ਇੱਕ ਛੋਟੀ ਸਲਾਹ", askWeatherGPT: "WeatherGPT ਨੂੰ ਪੁੱਛੋ", chatDescription: "ਤੁਹਾਡਾ ਨਿੱਜੀ ਮੌਸਮ ਸਾਥੀ, ਜਦੋਂ ਵੀ ਲੋੜ ਹੋਵੇ।", ready: "ਤਿਆਰ", rainToday: "ਕੀ ਅੱਜ ਮੀਂਹ ਪਵੇਗਾ?", whatToWear: "ਅੱਜ ਕੀ ਪਹਿਨਾਂ?", weekForecast: "ਆਉਣ ਵਾਲਾ ਹਫ਼ਤਾ", askPlaceholder: "ਮੌਸਮ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ…", dataDisclaimer: "Open-Meteo ਤੋਂ ਮੌਸਮ ਜਾਣਕਾਰੀ। ਭਵਿੱਖਬਾਣੀ ਸਲਾਹ ਹੈ, ਅਧਿਕਾਰਤ ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ ਨਹੀਂ।", builtForEveryone: "ਸਾਰਿਆਂ ਲਈ ਮੌਸਮ ਜਾਣਕਾਰੀ", servicesOperational: "ਮੌਸਮ ਸੇਵਾਵਾਂ ਚਾਲੂ ਹਨ" },
  ur: { newChat: "نئی گفتگو", workspace: "آپ کی جگہ", overview: "جائزہ", forecast: "7 دن کی پیش گوئی", advisories: "موسمی مشورے", savedLocations: "محفوظ مقامات", addLocation: "مقام شامل کریں", liveData: "براہ راست موسم کی معلومات", weatherFriend: "موسمی ساتھی", freePlan: "مفت منصوبہ", home: "ہوم", updatedJustNow: "ابھی تازہ کیا گیا", language: "زبان", yourWeather: "آپ کا موسم، ایک نظر میں", goodMorning: "صبح بخیر", weatherCanHelp: "موسم کی تھوڑی سی خبر آپ کا دن آسان بنا سکتی ہے۔", feelsLike: "محسوس ہونے والا درجہ حرارت", humidity: "نمی", wind: "ہوا", rainChance: "بارش کا امکان", daylight: "دن کی روشنی", sunTimes: "سورج کے اوقات", sunrise: "طلوع آفتاب", sunset: "غروب آفتاب", theWeekAhead: "آنے والا ہفتہ", sevenDayForecast: "7 دن کی پیش گوئی", moreDetails: "مزید تفصیلات", weatherWatch: "موسم پر نظر", littleTip: "ایک چھوٹا مشورہ", askWeatherGPT: "WeatherGPT سے پوچھیں", chatDescription: "آپ کا ذاتی موسمی ساتھی، جب بھی ضرورت ہو۔", ready: "تیار", rainToday: "کیا آج بارش ہوگی؟", whatToWear: "آج کیا پہنوں؟", weekForecast: "آنے والا ہفتہ", askPlaceholder: "موسم کے بارے میں کچھ بھی پوچھیں…", dataDisclaimer: "Open-Meteo سے موسم کی معلومات۔ پیش گوئی رہنمائی ہے، سرکاری ہنگامی انتباہ نہیں۔", builtForEveryone: "سب کے لیے موسم کی معلومات", servicesOperational: "موسمی خدمات فعال ہیں" }
};

const weatherCodes = {
  0: ["Clear sky", "☀"], 1: ["Mostly clear", "🌤"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁"],
  45: ["Foggy", "☁"], 48: ["Icy fog", "☁"], 51: ["Light drizzle", "☂"], 53: ["Drizzle", "☂"],
  55: ["Heavy drizzle", "☂"], 56: ["Freezing drizzle", "☂"], 57: ["Freezing drizzle", "☂"],
  61: ["Light rain", "☂"], 63: ["Rain", "☂"], 65: ["Heavy rain", "☂"], 66: ["Freezing rain", "☂"],
  67: ["Heavy freezing rain", "☂"], 71: ["Light snow", "❄"], 73: ["Snow", "❄"], 75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"], 80: ["Light showers", "☂"], 81: ["Rain showers", "☂"],
  82: ["Heavy showers", "☂"], 85: ["Snow showers", "❄"], 86: ["Heavy snow showers", "❄"],
  95: ["Thunderstorm", "⚡"], 96: ["Thunderstorm with hail", "⚡"], 99: ["Thunderstorm with hail", "⚡"]
};
const languageLocales = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", mr: "mr-IN", kn: "kn-IN", ml: "ml-IN", gu: "gu-IN", pa: "pa-IN", ur: "ur-IN" };
const navigationLabels = {
  en: { home: "Home", gpt: "Ask GPT", map: "Map", alerts: "Alerts", climate: "Climate", profile: "Profile" },
  hi: { home: "होम", gpt: "पूछें", map: "नक्शा", alerts: "चेतावनी", climate: "जलवायु", profile: "प्रोफ़ाइल" },
  bn: { home: "হোম", gpt: "জিজ্ঞাসা", map: "মানচিত্র", alerts: "সতর্কতা", climate: "জলবায়ু", profile: "প্রোফাইল" },
  ta: { home: "முகப்பு", gpt: "கேளுங்கள்", map: "வரைபடம்", alerts: "எச்சரிக்கை", climate: "காலநிலை", profile: "சுயவிவரம்" },
  te: { home: "హోమ్", gpt: "అడగండి", map: "మ్యాప్", alerts: "హెచ్చరికలు", climate: "వాతావరణం", profile: "ప్రొఫైల్" },
  mr: { home: "मुख्य", gpt: "विचारा", map: "नकाशा", alerts: "इशारे", climate: "हवामान", profile: "प्रोफाइल" },
  kn: { home: "ಮುಖಪುಟ", gpt: "ಕೇಳಿ", map: "ನಕ್ಷೆ", alerts: "ಎಚ್ಚರಿಕೆ", climate: "ಹವಾಮಾನ", profile: "ಪ್ರೊಫೈಲ್" },
  ml: { home: "ഹോം", gpt: "ചോദിക്കൂ", map: "ഭൂപടം", alerts: "അറിയിപ്പുകൾ", climate: "കാലാവസ്ഥ", profile: "പ്രൊഫൈൽ" },
  gu: { home: "હોમ", gpt: "પૂછો", map: "નકશો", alerts: "ચેતવણી", climate: "આબોહવા", profile: "પ્રોફાઇલ" },
  pa: { home: "ਮੁੱਖ", gpt: "ਪੁੱਛੋ", map: "ਨਕਸ਼ਾ", alerts: "ਚੇਤਾਵਨੀ", climate: "ਜਲਵਾਯੂ", profile: "ਪ੍ਰੋਫ਼ਾਈਲ" },
  ur: { home: "ہوم", gpt: "پوچھیں", map: "نقشہ", alerts: "انتباہ", climate: "آب و ہوا", profile: "پروفائل" }
};
const chatReplies = {
  en: { current: "{location}: {temp}°C, {condition}; feels like {feels}°C, humidity {humidity}%, wind {wind} km/h.", rain: "Rain is {outlook} in {location} today ({chance}% chance). {advice}", tomorrow: "Tomorrow in {location}: {condition}, high {high}°C, low {low}°C, with a {chance}% chance of rain.", wear: "In {location} it’s {temp}°C and {condition}. {advice}", fallback: "You can also ask about rain, what to wear, tomorrow, or the 7-day outlook." },
  hi: { current: "{location} में अभी {temp}°C और {condition} है; महसूस {feels}°C जैसा। नमी {humidity}%, हवा {wind} km/h।", rain: "{location} में आज बारिश की {outlook} संभावना है ({chance}%)। {advice}", tomorrow: "कल {location} में {condition}; अधिकतम {high}°C, न्यूनतम {low}°C, बारिश की संभावना {chance}%。", wear: "{location} में {temp}°C और {condition} है। {advice}", fallback: "बारिश, पहनावे, कल के मौसम या 7-दिन के पूर्वानुमान के बारे में भी पूछें।" },
  bn: { current: "{location}-এ এখন {temp}°C ও {condition}; অনুভূত তাপমাত্রা {feels}°C। আর্দ্রতা {humidity}%, বাতাস {wind} km/h।", rain: "{location}-এ আজ বৃষ্টির সম্ভাবনা {outlook} ({chance}%)। {advice}", tomorrow: "আগামীকাল {location}-এ {condition}; সর্বোচ্চ {high}°C, সর্বনিম্ন {low}°C, বৃষ্টির সম্ভাবনা {chance}%。", wear: "{location}-এ তাপমাত্রা {temp}°C, {condition}। {advice}", fallback: "বৃষ্টি, পোশাক, আগামীকালের আবহাওয়া বা ৭ দিনের পূর্বাভাস সম্পর্কে জিজ্ঞাসা করুন।" },
  ta: { current: "{location}: இப்போது {temp}°C, {condition}; உணரப்படும் வெப்பநிலை {feels}°C. ஈரப்பதம் {humidity}%, காற்று {wind} km/h.", rain: "{location}-இல் இன்று மழை வாய்ப்பு {outlook} ({chance}%). {advice}", tomorrow: "நாளை {location}-இல் {condition}; அதிகபட்சம் {high}°C, குறைந்தபட்சம் {low}°C, மழை வாய்ப்பு {chance}%.", wear: "{location}-இல் {temp}°C, {condition}. {advice}", fallback: "மழை, உடை, நாளைய வானிலை அல்லது 7 நாள் முன்னறிவிப்பு பற்றியும் கேளுங்கள்." },
  te: { current: "{location}: ఇప్పుడు {temp}°C, {condition}; అనుభూతి {feels}°C. తేమ {humidity}%, గాలి {wind} km/h.", rain: "{location}లో ఈరోజు వర్షం అవకాశం {outlook} ({chance}%). {advice}", tomorrow: "రేపు {location}లో {condition}; గరిష్ఠం {high}°C, కనిష్ఠం {low}°C, వర్షం అవకాశం {chance}%.", wear: "{location}లో {temp}°C, {condition}. {advice}", fallback: "వర్షం, దుస్తులు, రేపటి వాతావరణం లేదా 7 రోజుల అంచనా గురించి కూడా అడగండి." },
  mr: { current: "{location} येथे सध्या {temp}°C आणि {condition}; जाणवणारे तापमान {feels}°C. आर्द्रता {humidity}%, वारा {wind} km/h.", rain: "{location} येथे आज पावसाची शक्यता {outlook} ({chance}%). {advice}", tomorrow: "उद्या {location} येथे {condition}; कमाल {high}°C, किमान {low}°C, पावसाची शक्यता {chance}%.", wear: "{location} येथे {temp}°C आणि {condition}. {advice}", fallback: "पाऊस, कपडे, उद्याचे हवामान किंवा ७ दिवसांच्या अंदाजाबद्दल विचारा." },
  kn: { current: "{location}: ಈಗ {temp}°C, {condition}; ಅನುಭವದ ತಾಪಮಾನ {feels}°C. ಆರ್ದ್ರತೆ {humidity}%, ಗಾಳಿ {wind} km/h.", rain: "{location}ನಲ್ಲಿ ಇಂದು ಮಳೆಯ ಸಾಧ್ಯತೆ {outlook} ({chance}%). {advice}", tomorrow: "ನಾಳೆ {location}ನಲ್ಲಿ {condition}; ಗರಿಷ್ಠ {high}°C, ಕನಿಷ್ಠ {low}°C, ಮಳೆಯ ಸಾಧ್ಯತೆ {chance}%.", wear: "{location}ನಲ್ಲಿ {temp}°C, {condition}. {advice}", fallback: "ಮಳೆ, ಉಡುಗೆ, ನಾಳೆಯ ಹವಾಮಾನ ಅಥವಾ 7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ ಬಗ್ಗೆ ಕೇಳಿ." },
  ml: { current: "{location}: ഇപ്പോൾ {temp}°C, {condition}; അനുഭവപ്പെടുന്നത് {feels}°C. ഈർപ്പം {humidity}%, കാറ്റ് {wind} km/h.", rain: "{location}-ൽ ഇന്ന് മഴയ്ക്ക് സാധ്യത {outlook} ({chance}%). {advice}", tomorrow: "നാളെ {location}-ൽ {condition}; കൂടിയ താപനില {high}°C, കുറഞ്ഞത് {low}°C, മഴയ്ക്ക് {chance}% സാധ്യത.", wear: "{location}-ൽ {temp}°C, {condition}. {advice}", fallback: "മഴ, വസ്ത്രം, നാളത്തെ കാലാവസ്ഥ അല്ലെങ്കിൽ 7 ദിവസത്തെ പ്രവചനം ചോദിക്കാം." },
  gu: { current: "{location}: અત્યારે {temp}°C અને {condition}; અનુભવાતું તાપમાન {feels}°C. ભેજ {humidity}%, પવન {wind} km/h.", rain: "{location}માં આજે વરસાદની શક્યતા {outlook} ({chance}%) છે. {advice}", tomorrow: "આવતી કાલે {location}માં {condition}; મહત્તમ {high}°C, લઘુત્તમ {low}°C, વરસાદની શક્યતા {chance}%.", wear: "{location}માં {temp}°C અને {condition}. {advice}", fallback: "વરસાદ, કપડાં, આવતી કાલના હવામાન અથવા 7 દિવસની આગાહી વિશે પૂછો." },
  pa: { current: "{location}: ਇਸ ਵੇਲੇ {temp}°C ਅਤੇ {condition}; ਮਹਿਸੂਸ ਤਾਪਮਾਨ {feels}°C। ਨਮੀ {humidity}%, ਹਵਾ {wind} km/h।", rain: "{location} ਵਿੱਚ ਅੱਜ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ {outlook} ({chance}%) ਹੈ। {advice}", tomorrow: "ਕੱਲ੍ਹ {location} ਵਿੱਚ {condition}; ਵੱਧ ਤੋਂ ਵੱਧ {high}°C, ਘੱਟ ਤੋਂ ਘੱਟ {low}°C, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ {chance}%।", wear: "{location} ਵਿੱਚ {temp}°C ਅਤੇ {condition} ਹੈ। {advice}", fallback: "ਮੀਂਹ, ਕੱਪੜਿਆਂ, ਕੱਲ੍ਹ ਦੇ ਮੌਸਮ ਜਾਂ 7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਬਾਰੇ ਪੁੱਛੋ।" },
  ur: { current: "{location}: ابھی {temp}°C اور {condition}؛ محسوس درجہ حرارت {feels}°C۔ نمی {humidity}%، ہوا {wind} km/h۔", rain: "{location} میں آج بارش کا امکان {outlook} ({chance}%) ہے۔ {advice}", tomorrow: "کل {location} میں {condition}؛ زیادہ سے زیادہ {high}°C، کم سے کم {low}°C، بارش کا امکان {chance}%。", wear: "{location} میں {temp}°C اور {condition} ہے۔ {advice}", fallback: "بارش، لباس، کل کے موسم یا 7 دن کی پیش گوئی کے بارے میں بھی پوچھیں۔" }
};
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.warn(`Unable to read saved preference "${key}":`, error);
    return fallback;
  }
}
const state = {
  location: readStorage("wg-current-location", { ...DEFAULT_LOCATION }), weather: null, air: null, marine: null,
  weatherRequestId: 0, auxiliaryRequestId: 0, weatherUpdatedAt: null, weatherStale: false, isWeatherLoading: false,
  weatherAbortController: null, airAbortController: null, lastWeatherAttemptAt: 0, weatherMonitorTimer: null, freshnessTimer: null,
  loadedLocationKey: null, locationAccuracy: null,
  language: readStorage("wg-language", "en"),
  units: readStorage("wg-units", "celsius"), role: readStorage("wg-role", "general"),
  savedLocations: readStorage("wg-locations", []), notifications: readStorage("wg-notifications", { rain: false, storm: false, wind: false, heat: false, cold: false }),
  notificationsEnabled: readStorage("wg-notifications-enabled", false),
  voiceResponses: readStorage("wg-voice-responses", false),
  emailUser: null, emailPreferences: null, emailLocation: null, emailPreferenceRequestId: 0, emailLocationUpdatePending: false,
  conversationId: readStorage("wg-conversation-id", ""), conversationMessages: readStorage("wg-conversation-messages", []),
  conversations: [], aiProviders: [],
  voiceName: readStorage("wg-voice-name", "auto"), voiceLanguage: readStorage("wg-voice-language", "auto"),
  voiceRate: readStorage("wg-voice-rate", 1), voiceVolume: readStorage("wg-voice-volume", 1), voiceRefreshId: 0,
  voiceQuestionPending: false,
  fieldCrop: readStorage("wg-field-crop", "general"), fieldStage: readStorage("wg-field-stage", "land-preparation"),
  localAgent: null, briefing: null, activity: readStorage("wg-activity", "walking"),
  mode: "general", currentTab: "home", forecastDays: 7, map: null, mapMarker: null, mapBaseLayer: null, mapTileProvider: null, mapTileErrors: 0, mapFallbackUsed: false, radarLayer: null,
  mapWeatherMarkers: [], mapRequestId: 0, mapUpdateTimeout: null,
  mapWeatherLayer: "temperature", radarFrames: null, radarLoaded: false, toastTimeout: null
};
const $ = (id) => document.getElementById(id);

function t(key) { return translations[state.language]?.[key] || translations.en[key] || key; }
function storeValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.error(`Unable to save preference "${key}":`, error); showToast("Your settings could not be saved on this device."); }
}
function displayTemperature(celsius) {
  return state.units === "fahrenheit" ? Math.round(celsius * 9 / 5 + 32) : Math.round(celsius);
}
function compassDirection(degrees) {
  if (!Number.isFinite(degrees)) return "--";
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
}
function formatShortTime(date) {
  return new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { hour: "numeric", timeZone: state.location.timezone || "UTC" }).format(date);
}
function chatReply(key, values = {}) {
  const template = chatReplies[state.language]?.[key] || chatReplies.en[key];
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(values[name] ?? ""));
}
function safeText(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function dayName(date, format = "short") { return new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: format, timeZone: "UTC" }).format(date); }
function localHour(iso) { return new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: state.location.timezone || "auto" }).format(new Date(iso)); }
function setText(id, value) { const element = $(id); if (element) element.textContent = value; }

function normalizeLocation(candidate, fallback = DEFAULT_LOCATION) {
  const latitude = Number(candidate?.latitude);
  const longitude = Number(candidate?.longitude);
  if (!candidate || candidate.latitude === "" || candidate.longitude === "" ||
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { ...fallback };
  }
  const accuracy = Number(candidate.accuracy);
  return {
    name: String(candidate.name || "Weather location").trim().slice(0, 100),
    country: String(candidate.country || "").trim().slice(0, 100),
    latitude,
    longitude,
    timezone: typeof candidate.timezone === "string" && candidate.timezone.length <= 80 ? candidate.timezone || "auto" : "auto",
    source: ["gps", "geocoded", "coordinates", "profile"].includes(candidate.source) ? candidate.source : "geocoded",
    ...(Number.isFinite(accuracy) && accuracy >= 0 ? { accuracy: Math.round(accuracy) } : {})
  };
}

function formatLocationCoordinates(location) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  return `${Math.abs(latitude).toFixed(5)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(5)}° ${longitude < 0 ? "W" : "E"}`;
}

function locationPrecisionLabel(location) {
  const accuracy = Number(location.accuracy);
  if (location.source === "gps") {
    return Number.isFinite(accuracy) ? `GPS fix ±${Math.round(accuracy)} m · forecast uses a model grid` : "GPS point · reported accuracy unavailable · forecast uses a model grid";
  }
  return "Forecast coordinate · model grid; street address not available";
}

function renderCurrentLocationDetails() {
  const location = normalizeLocation(state.location);
  state.location = location;
  setText("current-coordinates", formatLocationCoordinates(location));
  setText("saved-coordinates", formatLocationCoordinates(location));
  setText("current-location-source", locationPrecisionLabel(location));
  const gpsAccuracy = location.source === "gps" && Number.isFinite(Number(location.accuracy))
    ? `GPS accuracy: ±${Math.round(Number(location.accuracy))} m · forecast is still model-grid data.`
    : `${locationPrecisionLabel(location)}.`;
  setText("location-accuracy", gpsAccuracy);
}

function formatAge(timestamp) {
  const elapsed = Math.max(0, Date.now() - Number(timestamp || 0));
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function readWeatherSnapshot(location = state.location) {
  try { return window.WeatherGPTOfflineCache?.read(location) || null; }
  catch (error) { console.warn("Offline forecast cache is unavailable:", error); return null; }
}

function clearOfflineWeatherCache() {
  try {
    const key = window.WeatherGPTOfflineCache?.STORAGE_KEY;
    if (key) localStorage.removeItem(key);
    updateOfflineCapabilityStatus();
    showToast("Cached weather snapshots cleared from this device.");
  } catch (error) {
    console.error("Unable to clear offline weather snapshots:", error);
    showToast("The offline weather cache could not be cleared.");
  }
}

function updateOfflineCapabilityStatus() {
  const cached = readWeatherSnapshot();
  const placeCount = state.savedLocations?.length || 0;
  const forecast = cached ? `Forecast snapshot saved ${formatAge(cached.weatherSavedAt)}` : "No saved forecast for this place yet";
  setText("offline-capability-status", `${placeCount} saved ${placeCount === 1 ? "place" : "places"} on this device · ${forecast}. Recent chats and preferences are also stored locally.`);
}

function updateWeatherFreshness() {
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const updatedAt = Number(state.weatherUpdatedAt);
  let label = "Waiting for forecast…";
  if (state.weather && Number.isFinite(updatedAt)) {
    label = state.weatherStale || !online
      ? `${online ? "Cached" : "Offline snapshot"} · ${formatAge(updatedAt)}`
      : `Live · updated ${formatAge(updatedAt)}`;
  } else if (!online) label = "Offline · no saved forecast";
  else if (state.isWeatherLoading) label = "Loading live forecast…";
  else if (state.lastWeatherAttemptAt) label = "Live forecast unavailable";
  setText("weather-freshness", label);
  $("weather-status")?.classList.toggle("offline", !online || state.weatherStale);

  const notice = $("offline-notice");
  if (!notice) return;
  if (state.weather && (state.weatherStale || !online) && Number.isFinite(updatedAt)) {
    notice.hidden = false;
    notice.textContent = `${online ? "Live refresh unavailable" : "Offline"} · showing the last saved model forecast, updated ${formatAge(updatedAt)}. Reconnect for current conditions; this snapshot is not an official warning.`;
  } else if (!online) {
    notice.hidden = false;
    notice.textContent = "You’re offline. Saved places, settings and recent chats are available; connect to load weather for a new place.";
  } else if (!state.weather && state.lastWeatherAttemptAt) {
    notice.hidden = false;
    notice.textContent = "No saved forecast is available for this place. Connect to the internet and refresh weather.";
  } else {
    notice.hidden = true;
    notice.textContent = "";
  }
  updateOfflineCapabilityStatus();
}

function setLanguage(language) {
  state.language = translations[language] ? language : "en";
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ur" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n);
    if (value) element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-tab-label]").forEach((element) => {
    element.textContent = navigationLabels[state.language]?.[element.dataset.tabLabel] || navigationLabels.en[element.dataset.tabLabel];
  });
  const profileLanguage = $("profile-language");
  if (profileLanguage) profileLanguage.value = state.language;
  storeValue("wg-language", state.language);
  saveSignedInProfile();
  if (state.weather) renderWeather(state.weather);
  $("language-select").value = state.language;
  refreshAvailableVoices();
  updateWeatherFreshness();
}

function getCondition(code) {
  const [english, icon] = weatherCodes[code] || ["Variable conditions", "☁"];
  const localized = {
    hi: { "Clear sky": "साफ़ आसमान", "Mostly clear": "ज़्यादातर साफ़", "Partly cloudy": "आंशिक बादल", Overcast: "बादल छाए", "Light rain": "हल्की बारिश", Rain: "बारिश", "Heavy rain": "तेज़ बारिश", Thunderstorm: "आंधी-तूफ़ान", Foggy: "कोहरा" },
    bn: { "Clear sky": "পরিষ্কার আকাশ", "Mostly clear": "বেশিরভাগ পরিষ্কার", "Partly cloudy": "আংশিক মেঘলা", Overcast: "মেঘাচ্ছন্ন", "Light rain": "হালকা বৃষ্টি", Rain: "বৃষ্টি", "Heavy rain": "ভারী বৃষ্টি", Thunderstorm: "বজ্রঝড়", Foggy: "কুয়াশা" },
    ta: { "Clear sky": "தெளிவான வானம்", "Mostly clear": "பெரும்பாலும் தெளிவு", "Partly cloudy": "ஓரளவு மேகமூட்டம்", Overcast: "மேகமூட்டம்", "Light rain": "லேசான மழை", Rain: "மழை", "Heavy rain": "கனமழை", Thunderstorm: "இடியுடன் கூடிய மழை", Foggy: "மூடுபனி" },
    te: { "Clear sky": "ఆకాశం నిర్మలంగా ఉంది", "Mostly clear": "చాలావరకు నిర్మలం", "Partly cloudy": "పాక్షికంగా మేఘావృతం", Overcast: "మేఘావృతం", "Light rain": "తేలికపాటి వర్షం", Rain: "వర్షం", "Heavy rain": "భారీ వర్షం", Thunderstorm: "ఉరుములతో కూడిన వర్షం", Foggy: "పొగమంచు" },
    mr: { "Clear sky": "निरभ्र आकाश", "Mostly clear": "बहुतेक निरभ्र", "Partly cloudy": "अंशतः ढगाळ", Overcast: "ढगाळ", "Light rain": "हलका पाऊस", Rain: "पाऊस", "Heavy rain": "मुसळधार पाऊस", Thunderstorm: "वादळ", Foggy: "धुके" },
    kn: { "Clear sky": "ಸ್ಪಷ್ಟ ಆಕಾಶ", "Mostly clear": "ಬಹುತೇಕ ಸ್ಪಷ್ಟ", "Partly cloudy": "ಭಾಗಶಃ ಮೋಡ", Overcast: "ಮೋಡ ಕವಿದಿದೆ", "Light rain": "ಲಘು ಮಳೆ", Rain: "ಮಳೆ", "Heavy rain": "ಭಾರೀ ಮಳೆ", Thunderstorm: "ಗುಡುಗು ಸಹಿತ ಮಳೆ", Foggy: "ಮಂಜು" },
    ml: { "Clear sky": "തെളിഞ്ഞ ആകാശം", "Mostly clear": "മിക്കവാറും തെളിഞ്ഞത്", "Partly cloudy": "ഭാഗികമായി മേഘാവൃതം", Overcast: "മേഘാവൃതം", "Light rain": "നേരിയ മഴ", Rain: "മഴ", "Heavy rain": "കനത്ത മഴ", Thunderstorm: "ഇടിമിന്നലോടു കൂടിയ മഴ", Foggy: "മൂടൽമഞ്ഞ്" },
    gu: { "Clear sky": "ચોખ્ખું આકાશ", "Mostly clear": "મોટેભાગે ચોખ્ખું", "Partly cloudy": "આંશિક વાદળછાયું", Overcast: "વાદળછાયું", "Light rain": "હળવો વરસાદ", Rain: "વરસાદ", "Heavy rain": "ભારે વરસાદ", Thunderstorm: "વાવાઝોડું", Foggy: "ધુમ્મસ" },
    pa: { "Clear sky": "ਸਾਫ਼ ਅਸਮਾਨ", "Mostly clear": "ਜ਼ਿਆਦਾਤਰ ਸਾਫ਼", "Partly cloudy": "ਥੋੜ੍ਹੇ ਬੱਦਲ", Overcast: "ਬੱਦਲਵਾਈ", "Light rain": "ਹਲਕਾ ਮੀਂਹ", Rain: "ਮੀਂਹ", "Heavy rain": "ਭਾਰੀ ਮੀਂਹ", Thunderstorm: "ਤੂਫ਼ਾਨ", Foggy: "ਧੁੰਦ" },
    ur: { "Clear sky": "صاف آسمان", "Mostly clear": "زیادہ تر صاف", "Partly cloudy": "جزوی ابر آلود", Overcast: "ابر آلود", "Light rain": "ہلکی بارش", Rain: "بارش", "Heavy rain": "تیز بارش", Thunderstorm: "گرج چمک کے ساتھ طوفان", Foggy: "دھند" }
  };
  return { text: localized[state.language]?.[english] || english, english, icon };
}

function renderWeather(data) {
  state.weather = data;
  renderCurrentLocationDetails();
  const current = data.current;
  const daily = data.daily;
  const today = new Date();
  const condition = getCondition(current.weather_code);
  const date = new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: "long", month: "long", day: "numeric", timeZone: state.location.timezone }).format(today);
  setText("current-city", state.location.name);
  setText("current-region", state.location.country);
  setText("saved-city", state.location.name);
  setText("saved-region", state.location.country);
  setText("current-date", date);
  setText("today-date", new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: "long", month: "short", day: "numeric", timeZone: state.location.timezone }).format(today));
  $("temperature").innerHTML = `${displayTemperature(current.temperature_2m)}<span>°</span><small class="temperature-unit">${state.units === "fahrenheit" ? "F" : "C"}</small>`;
  setText("condition", condition.text);
  setText("feels-like", `${displayTemperature(current.apparent_temperature)}°`);
  setText("humidity", `${Math.round(current.relative_humidity_2m)}%`);
  setText("wind", `${Math.round(current.wind_speed_10m)} km/h`);
  setText("wind-direction", `${compassDirection(current.wind_direction_10m)} ${Math.round(current.wind_direction_10m)}°`);
  setText("pressure", `${Math.round(current.pressure_msl)} hPa`);
  setText("visibility", `${Number(current.visibility / 1000).toFixed(1)} km`);
  setText("uv-index", Number(current.uv_index).toFixed(1));
  setText("data-updated", `Open-Meteo · ${formatShortTime(new Date(current.time))}${state.weatherStale ? ` · cached ${formatAge(state.weatherUpdatedAt)}` : ""}`);
  setText("map-location", state.location.name);
  const todayRainChance = daily.precipitation_probability_max?.[0] ?? 0;
  setText("rain-chance", `${todayRainChance}%`);
  setText("saved-temp", `${displayTemperature(current.temperature_2m)}°`);
  $("weather-illustration").dataset.condition = current.weather_code;
  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];
  if (sunrise && sunset) {
    setText("sunrise", localHour(sunrise));
    setText("sunset", localHour(sunset));
    const daylight = (new Date(sunset) - new Date(sunrise)) / 3_600_000;
    setText("daylight-duration", `${daylight.toFixed(1)} hours of daylight`);
    const progress = Math.max(0, Math.min(1, (Date.now() - new Date(sunrise)) / (new Date(sunset) - new Date(sunrise))));
    $("arc-sun").style.left = `${8 + progress * 84}%`;
    $("arc-sun").style.top = `${48 - Math.sin(progress * Math.PI) * 43}px`;
    $("sun-progress").style.strokeDashoffset = `${283 * (1 - progress)}`;
  }
  renderForecast(daily);
  renderHourly(data.hourly, current);
  applyNowcast(data);
  renderExtraVitals(data);
  renderBriefing();
  renderActivityPlanner();
  renderAdvisory(current, daily);
  updateMapLocation();
  updateAgriculturePanel(current, daily);
  if (!state.weatherStale && (typeof navigator === "undefined" || navigator.onLine !== false)) checkNotificationRules(current, daily);
  updateEmailLocationIfSubscribed();
}

function renderForecast(daily) {
  const weekdays = state.language;
  const count = state.forecastDays || 7;
  $("forecast-strip").dataset.extended = count > 7 ? "true" : "false";
  $("forecast-strip").innerHTML = daily.time.slice(0, count).map((dateString, index) => {
    const date = new Date(`${dateString}T12:00:00Z`);
    const condition = getCondition(daily.weather_code[index]);
    const symbolClass = /rain|drizzle|shower|storm/i.test(condition.english) ? "rain" : /cloud|fog|overcast/i.test(condition.english) ? "cloud" : "";
    const label = index === 0 ? (weekdays === "hi" ? "आज" : weekdays === "ta" ? "இன்று" : weekdays === "te" ? "ఈరోజు" : dayName(date)) : dayName(date);
    return `<div class="forecast-day ${index === 0 ? "today" : ""}" title="${safeText(condition.text)}"><span class="forecast-name">${safeText(index < 7 || index % 2 === 0 ? label : new Intl.DateTimeFormat(languageLocales[state.language], { day: "numeric", month: "short", timeZone: "UTC" }).format(date))}</span><span class="forecast-symbol ${symbolClass}" aria-label="${safeText(condition.text)}">${condition.icon}</span><span class="forecast-temps"><strong>${displayTemperature(daily.temperature_2m_max[index])}°</strong><span>${displayTemperature(daily.temperature_2m_min[index])}°</span></span><span class="forecast-rain">☂ ${daily.precipitation_probability_max?.[index] ?? 0}% · ${daily.precipitation_sum?.[index]?.toFixed(1) ?? "0"} mm</span></div>`;
  }).join("");
}

function renderHourly(hourly, current) {
  if (!hourly?.time?.length) {
    $("hourly-strip").innerHTML = '<div class="forecast-loading">Hourly forecast unavailable.</div>';
    return;
  }
  const currentHour = current.time.slice(0, 13);
  const requestedStart = hourly.time.findIndex((time) => time >= currentHour);
  const start = Math.max(0, requestedStart);
  $("hourly-strip").innerHTML = hourly.time.slice(start, start + 24).map((time, offset) => {
    const index = start + offset;
    const condition = getCondition(hourly.weather_code[index]);
    return `<div class="hourly-item ${offset === 0 ? "current-hour" : ""}" title="${safeText(condition.text)}"><span class="hourly-time">${offset === 0 ? "Now" : safeText(formatShortTime(new Date(`${time}:00Z`)))}</span><span class="hourly-icon">${condition.icon}</span><span class="hourly-temp">${displayTemperature(hourly.temperature_2m[index])}°</span><span class="hourly-rain">☂ ${hourly.precipitation_probability[index] ?? 0}%</span></div>`;
  }).join("");
  const currentHourIndex = hourly.time.findIndex((time) => time >= currentHour);
  const nextRainIndex = hourly.precipitation.slice(Math.max(currentHourIndex, 0), Math.max(currentHourIndex, 0) + 24).findIndex((amount) => amount >= 0.2);
  const rainElement = $("rain-countdown");
  if (nextRainIndex === 0) rainElement.textContent = `Rain may be falling now · ${hourly.precipitation[currentHourIndex]?.toFixed(1)} mm forecast this hour.`;
  else if (nextRainIndex > 0) rainElement.textContent = `Rain may start in about ${nextRainIndex} ${nextRainIndex === 1 ? "hour" : "hours"} · hourly forecast, not a radar nowcast.`;
  else rainElement.textContent = "No meaningful rainfall signal in the next 24 hours · forecast guidance, not a guarantee.";
}

function renderAirQuality(data) {
  const air = data?.current;
  if (!air || !Number.isFinite(air.us_aqi)) {
    state.air = null;
    setText("air-quality", "Unavailable");
    setText("pm25", "-- µg/m³");
    renderBriefing();
    renderActivityPlanner();
    return;
  }
  state.air = air;
  const index = Math.round(air.us_aqi);
  const category = index <= 50 ? "Good" : index <= 100 ? "Moderate" : index <= 150 ? "Sensitive groups" : index <= 200 ? "Unhealthy" : index <= 300 ? "Very unhealthy" : "Hazardous";
  setText("air-quality", `${category} · ${index}`);
  setText("pm25", Number.isFinite(air.pm2_5) ? `${Math.round(air.pm2_5)} µg/m³` : "-- µg/m³");
  renderBriefing();
  renderActivityPlanner();
}

function renderAdvisory(current, daily) {
  const rain = daily.precipitation_probability_max?.[0] ?? 0;
  const wind = current.wind_speed_10m ?? 0;
  const code = current.weather_code;
  const isStorm = code >= 95;
  const isHeavy = code === 65 || code === 82 || (rain >= 80 && (daily.precipitation_sum?.[0] ?? 0) >= 20);
  const elevated = isStorm || isHeavy || wind >= 50;
  $("advisory-card")?.classList.toggle("elevated", elevated);
  setText("advisory-level", elevated ? (state.language === "hi" ? "ध्यान दें" : "CAUTION") : (state.language === "hi" ? "सामान्य" : "LOW RISK"));
  const title = isStorm ? "Thunderstorm conditions" : isHeavy ? "Heavy rain possible" : wind >= 50 ? "Strong winds expected" : rain >= 60 ? "Rain likely today" : "No significant weather risks";
  const description = isStorm ? "Thunderstorms are indicated in the current forecast. Check official local alerts and shelter guidance." :
    isHeavy ? "The forecast indicates potentially heavy rain. Allow extra travel time and check official local alerts." :
      wind >= 50 ? `Winds near ${Math.round(wind)} km/h. Secure loose outdoor items and check local guidance.` :
        rain >= 60 ? `${rain}% chance of rain today. Consider carrying an umbrella when heading out.` :
          "No major rain, storm or high-wind signal in this forecast. Conditions can change; stay alert to local updates.";
  setText("advisory-title", title);
  setText("advisory-description", description);
  const severity = isStorm || (daily.precipitation_sum?.[0] ?? 0) >= 50 || wind >= 70 || current.temperature_2m >= 42 ? "WARNING" :
    elevated ? "WATCH" : rain >= 40 || current.temperature_2m >= 36 ? "ADVISORY" : "LOW";
  setText("alert-count", severity === "LOW" ? "0" : "!");
  setText("alerts-summary", severity === "LOW" ? "No high-impact weather signal in this forecast" : `${severity}: ${title}`);
  setText("alerts-updated", `Forecast-derived guidance · Open-Meteo · ${formatShortTime(new Date(current.time))} · not an official alert`);
  setText("feed-title", title);
  setText("feed-description", description);
  setText("feed-time", `Source: Open-Meteo forecast · ${new Date(current.time).toLocaleString(languageLocales[state.language] || "en-IN", { timeZone: state.location.timezone || "UTC" })} · not an official warning`);
  updateCommunityGuidance(current, daily);
  const feedSeverity = $("feed-severity");
  setText("feed-severity", severity === "LOW" ? "ADVISORY" : severity);
  feedSeverity.className = `severity severity-${severity === "LOW" ? "advisory" : severity.toLowerCase()}`;
  $("notification-button").classList.toggle("has-alert", elevated);
  const tip = rain >= 40 ? "A rain chance above 40% is on the forecast. An umbrella could come in handy." :
    current.temperature_2m >= 35 ? "It’s a hot day. Carry water, seek shade, and limit strenuous outdoor activity." :
      current.temperature_2m <= 8 ? "It’s chilly today. A warm layer will make time outdoors more comfortable." :
        "Ask WeatherGPT what to wear, when to travel, or how the forecast could affect your day.";
  setText("weather-tip", tip);
}

async function loadWeather() {
  state.weatherAbortController?.abort();
  state.airAbortController?.abort();
  const controller = new AbortController();
  state.weatherAbortController = controller;
  const requestId = ++state.weatherRequestId;
  const location = normalizeLocation(state.location);
  state.location = location;
  const cacheKey = window.WeatherGPTOfflineCache?.locationKey(location) || `${location.latitude},${location.longitude}`;
  const previousWeather = state.loadedLocationKey === cacheKey ? state.weather : null;
  const previousAir = state.loadedLocationKey === cacheKey ? state.air : null;
  const cached = readWeatherSnapshot(location);
  state.loadedLocationKey = cacheKey;
  state.isWeatherLoading = true;
  state.lastWeatherAttemptAt = Date.now();
  storeValue("wg-current-location", location);
  renderCurrentLocationDetails();
  setText("current-city", location.name);
  setText("current-region", location.country);
  setText("saved-city", location.name);
  setText("saved-region", location.country);

  if (cached?.weather) {
    state.weather = cached.weather;
    state.air = cached.air;
    state.weatherUpdatedAt = cached.weatherSavedAt;
    state.weatherStale = true;
    renderWeather(cached.weather);
    renderAirQuality(cached.air ? { current: cached.air } : null);
  } else if (previousWeather) {
    state.weather = previousWeather;
    state.air = previousAir;
    state.weatherStale = true;
    renderWeather(previousWeather);
    if (previousAir) renderAirQuality({ current: previousAir });
  } else {
    state.weather = null;
    state.air = null;
    state.weatherUpdatedAt = null;
    state.weatherStale = false;
    setText("saved-temp", "--°");
    setText("condition", "Getting your forecast…");
    setText("temperature", "--°");
    setText("feels-like", "--°");
    setText("humidity", "--%");
    setText("wind", "-- km/h");
    setText("rain-chance", "--%");
    setText("sunrise", "--:--");
    setText("sunset", "--:--");
    setText("daylight-duration", "Loading daylight hours");
    setText("alert-count", "0");
    $("notification-button").classList.remove("has-alert");
    $("forecast-strip").innerHTML = '<div class="forecast-loading">Loading forecast…</div>';
    $("hourly-strip").innerHTML = '<div class="forecast-loading">Loading hourly forecast…</div>';
    setText("air-quality", "Loading…");
    setText("pm25", "-- µg/m³");
  }
  updateWeatherFreshness();

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    state.isWeatherLoading = false;
    updateWeatherFreshness();
    return;
  }

  const timeout = window.setTimeout(() => controller.abort(), 20_000);
  try {
    const params = new URLSearchParams(window.WeatherGPTAgentCore.forecastParams(location, 16));
    const response = await fetch(`${API}?${params}`, { signal: controller.signal });
    if (requestId !== state.weatherRequestId) return;
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const data = await response.json();
    if (requestId !== state.weatherRequestId) return;
    if (!data.current || !data.daily?.time?.length) throw new Error("Weather service returned incomplete forecast data");
    const fetchedAt = Date.now();
    state.weather = data;
    state.weatherUpdatedAt = fetchedAt;
    state.weatherStale = false;
    state.loadedLocationKey = cacheKey;
    window.WeatherGPTOfflineCache?.saveWeather(location, data, fetchedAt);
    renderWeather(data);
    updateWeatherFreshness();
    void loadAirQuality(location, requestId);
  } catch (error) {
    if (requestId !== state.weatherRequestId) return;
    console.error("Unable to load weather:", error);
    state.weatherStale = Boolean(state.weather);
    if (!state.weather) {
      setText("condition", "Weather data unavailable");
      setText("temperature", "--°");
      setText("feels-like", "--°");
      setText("humidity", "--%");
      setText("wind", "-- km/h");
      setText("rain-chance", "--%");
      setText("wind-direction", "--");
      setText("pressure", "-- hPa");
      setText("visibility", "-- km");
      setText("uv-index", "--");
      setText("air-quality", "Unavailable");
      setText("pm25", "-- µg/m³");
      $("forecast-strip").innerHTML = '<div class="forecast-loading">Forecast unavailable. Check your connection and try again.</div>';
      $("hourly-strip").innerHTML = '<div class="forecast-loading">Forecast unavailable.</div>';
      setText("advisory-title", "Forecast unavailable");
      setText("advisory-description", "Could not reach the weather service. Check your connection and try again.");
    }
    updateWeatherFreshness();
    showToast(state.weather ? "Live refresh failed. Showing the last saved forecast." : "Weather data could not be loaded. Please check your connection.");
  } finally {
    window.clearTimeout(timeout);
    if (requestId === state.weatherRequestId) {
      state.isWeatherLoading = false;
      if (state.weatherAbortController === controller) state.weatherAbortController = null;
      updateWeatherFreshness();
    }
  }
}

async function loadAirQuality(location = state.location, weatherRequestId = state.weatherRequestId) {
  state.airAbortController?.abort();
  const controller = new AbortController();
  state.airAbortController = controller;
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  const params = new URLSearchParams({
    latitude: location.latitude, longitude: location.longitude, timezone: location.timezone || "auto",
    current: "us_aqi,european_aqi,pm10,pm2_5,uv_index"
  });
  try {
    const response = await fetch(`${AIR_API}?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Air-quality service returned ${response.status}`);
    const data = await response.json();
    if (weatherRequestId !== state.weatherRequestId) return;
    if (data.current) window.WeatherGPTOfflineCache?.saveAir(location, data.current, Date.now());
    renderAirQuality(data);
  } catch (error) {
    if (weatherRequestId !== state.weatherRequestId) return;
    console.warn("Air-quality data is unavailable:", error);
    if (!state.air) renderAirQuality(null);
  } finally {
    window.clearTimeout(timeout);
    if (state.airAbortController === controller) state.airAbortController = null;
  }
}

function renderLocationResults(results) {
  const container = $("location-search-results");
  if (!results.length) {
    container.textContent = "No matching places found. Try a nearby city, district or state.";
    return;
  }
  container.replaceChildren(...results.map((result) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "location-result";
    const name = document.createElement("strong");
    name.textContent = result.name;
    const detail = document.createElement("small");
    detail.textContent = [result.admin2, result.admin1, result.country].filter(Boolean).join(", ");
    button.append(name, detail);
    button.addEventListener("click", async () => {
      state.location = normalizeLocation({ name: result.name, country: result.country || result.admin1 || "", latitude: result.latitude, longitude: result.longitude, timezone: result.timezone || "auto", source: result.source || "geocoded" });
      saveSignedInProfile();
      $("location-dialog").close();
      try { await loadWeather(); } catch (error) { console.error("Unable to load the selected location:", error); }
    });
    return button;
  }));
}

async function findLocation(query) {
  const params = new URLSearchParams({ name: query, count: "5", language: state.language, format: "json" });
  const response = await fetch(`${GEO_API}?${params}`);
  if (!response.ok) throw new Error(`Location service returned ${response.status}`);
  const result = await response.json();
  if (!result.results?.length) throw new Error(`I couldn't find "${query}". Try a nearby city or a different spelling.`);
  const found = result.results[0];
  state.location = normalizeLocation({ name: found.name, country: found.country || found.admin1 || "", latitude: found.latitude, longitude: found.longitude, timezone: found.timezone || "auto", source: "geocoded" });
  saveSignedInProfile();
  await loadWeather();
}

function addMessage(text, role, isError = false, extras = {}) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}${isError ? " error" : ""}`;
  const main = document.createElement("div");
  main.className = "msg-main";
  const content = document.createElement("div");
  content.className = "msg-text";
  if (role === "assistant") renderRichText(content, text);
  else content.textContent = text;
  main.append(content);
  if (role === "assistant" && !isError) {
    const trace = buildTrace(extras.steps, extras.sourceLabel);
    if (trace) main.append(trace);
    const actions = document.createElement("div");
    actions.className = "agent-followups";
    if (extras.switchTo) {
      const place = extras.switchTo;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "followup-chip location-chip";
      button.textContent = `⌖ Make ${place.name} my location`;
      button.addEventListener("click", () => { button.disabled = true; switchToLocation(place); });
      actions.append(button);
    }
    for (const followUp of extras.followUps || []) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "followup-chip";
      button.textContent = followUp;
      button.addEventListener("click", () => { actions.remove(); sendQuestion(followUp); });
      actions.append(button);
    }
    if (actions.childElementCount) main.append(actions);
  }
  message.append(main);
  if (role === "assistant" && !isError) {
    const spoken = plainSpeechText(text);
    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "message-speak";
    replay.textContent = "🔊";
    replay.setAttribute("aria-label", "Read this answer aloud");
    replay.title = "Read this answer aloud";
    replay.addEventListener("click", () => speakAnswer(spoken));
    message.append(replay);
    if (state.voiceResponses && !extras.silent) speakAnswer(spoken);
  }
  $("chat-messages").append(message);
  message.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function createConversationId() {
  return globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function persistLocalConversation() {
  const conversations = readStorage("wg-local-conversations", []);
  const existing = conversations.filter((item) => item.id !== state.conversationId);
  const firstQuestion = state.conversationMessages.find((message) => message.role === "user")?.content;
  const conversation = {
    id: state.conversationId,
    title: String(firstQuestion || "New conversation").slice(0, 80),
    location: { ...state.location },
    updatedAt: Date.now(),
    searchText: state.conversationMessages.map((message) => message.content).join(" ").slice(-2000),
    messages: state.conversationMessages.slice(-100)
  };
  storeValue("wg-local-conversations", [conversation, ...existing].slice(0, 50));
  if (!state.emailUser) state.conversations = [conversation, ...state.conversations.filter((item) => item.id !== conversation.id)];
  renderConversationList();
}

async function persistConversationMessage(message) {
  state.conversationMessages.push(message);
  state.conversationMessages = state.conversationMessages.slice(-100);
  storeValue("wg-conversation-messages", state.conversationMessages);
  if (!state.conversationId) {
    state.conversationId = createConversationId();
    storeValue("wg-conversation-id", state.conversationId);
  }
  persistLocalConversation();
  const firebase = window.WeatherGPTFirebase;
  if (!firebase?.getSignedInUser()) return;
  try {
    const question = state.conversationMessages.find((item) => item.role === "user")?.content || "New conversation";
    await firebase.saveConversation({
      id: state.conversationId,
      title: question.slice(0, 80),
      location: state.location,
      searchText: state.conversationMessages.map((item) => item.content).join(" ").slice(-2000)
    });
    await firebase.saveConversationMessage(state.conversationId, message);
  } catch (error) {
    console.error("Conversation cloud sync failed:", error);
    showToast("This conversation is saved on this device, but cloud sync failed.");
  }
}

function renderConversationList(search = $("chat-history-search").value.trim().toLocaleLowerCase()) {
  const list = $("chat-history-list");
  list.replaceChildren();
  const localConversations = readStorage("wg-local-conversations", []);
  const conversations = state.emailUser
    ? [...state.conversations, ...localConversations.map((item) => ({ ...item, isLocal: true }))]
      .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
    : localConversations;
  const filtered = conversations.filter((item) => !search || `${item.title} ${item.location?.name || ""} ${item.searchText || item.messages?.map((message) => message.content).join(" ") || ""}`.toLocaleLowerCase().includes(search));
  if (!filtered.length) {
    list.textContent = search ? "No matching saved conversations." : state.emailUser ? "No cloud conversations yet." : "Sign in to sync chats between devices. Guest chats remain on this device.";
    return;
  }
  for (const conversation of filtered.slice(0, 20)) {
    const row = document.createElement("div");
    row.className = "chat-history-item";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "chat-history-open";
    open.textContent = `${conversation.title || "Weather chat"} · ${conversation.location?.name || "Location"}`;
    open.addEventListener("click", () => openConversation(conversation));
    row.append(open);
    if (state.emailUser && !conversation.isLocal) {
      const rename = document.createElement("button");
      rename.type = "button";
      rename.textContent = "Rename";
      rename.addEventListener("click", () => renameConversation(conversation));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => removeConversation(conversation.id));
      row.append(rename, remove);
    }
    list.append(row);
  }
}

async function openConversation(conversation) {
  try {
    const local = readStorage("wg-local-conversations", []).find((item) => item.id === conversation.id);
    const messages = state.emailUser && !conversation.isLocal ? await window.WeatherGPTFirebase.loadConversationMessages(conversation.id) : local?.messages || [];
    state.conversationId = conversation.id;
    state.conversationMessages = messages.map(({ role, content, provider, model }) => ({ role, content, provider, model }));
    storeValue("wg-conversation-id", state.conversationId);
    storeValue("wg-conversation-messages", state.conversationMessages);
    $("chat-messages").replaceChildren();
    state.conversationMessages.forEach((message) => addMessage(message.content, message.role));
    setActiveTab("gpt");
  } catch (error) {
    console.error("Unable to load saved conversation:", error);
    showToast("Could not open that saved conversation.");
  }
}

async function renameConversation(conversation) {
  const title = window.prompt("Enter a new conversation title:", conversation.title || "");
  if (!title?.trim()) return;
  try {
    await window.WeatherGPTFirebase.renameConversation(conversation.id, title);
    await loadConversationList();
  } catch (error) {
    console.error("Unable to rename conversation:", error);
    showToast("Could not rename this conversation.");
  }
}

async function removeConversation(id) {
  if (!window.confirm("Delete this conversation and its saved messages?")) return;
  try {
    await window.WeatherGPTFirebase.deleteConversation(id);
    state.conversations = state.conversations.filter((item) => item.id !== id);
    renderConversationList();
  } catch (error) {
    console.error("Unable to delete conversation:", error);
    showToast("Could not delete this conversation.");
  }
}

async function loadConversationList() {
  if (!state.emailUser) {
    renderConversationList();
    return;
  }
  try {
    state.conversations = await window.WeatherGPTFirebase.listConversations();
    renderConversationList();
  } catch (error) {
    console.error("Unable to load saved conversations:", error);
    state.conversations = [];
    renderConversationList();
    if (!readStorage("wg-local-conversations", []).length) {
      $("chat-history-list").textContent = "Cloud chat history is temporarily unavailable. Conversations saved on this device remain available offline.";
    }
  }
}

function setAssistantModels(providers) {
  state.aiProviders = Array.isArray(providers) ? providers : [];
  const badge = $("assistant-mode-label");
  if (badge) badge.textContent = state.aiProviders.length && state.emailUser?.emailVerified ? "AI READY" : "LOCAL MODE";
}

async function loadAiModels() {
  if (!state.emailUser?.emailVerified || !window.WeatherGPTFirebase?.configured) {
    setAssistantModels([]);
    return;
  }
  try {
    const result = await window.WeatherGPTFirebase.getAiModels();
    setAssistantModels(result?.providers);
  } catch (error) {
    console.error("AI model list could not be loaded:", error);
    setAssistantModels([]);
  }
}

async function saveSignedInProfile() {
  const firebase = window.WeatherGPTFirebase;
  if (!(state.emailUser?.emailVerified || state.emailUser?.isAnonymous) || state.loadingProfile || !firebase) return;
  try {
    await firebase.saveProfile({
      displayName: $("account-name").value,
      preferredLanguage: state.language,
      temperatureUnit: state.units,
      defaultLocation: state.location,
      voiceResponses: state.voiceResponses
    });
  } catch (error) {
    console.error("Unable to sync profile settings:", error);
    setText("account-status", "Profile changes remain available on this device; cloud sync failed.");
  }
}

function getSpeechLocale() {
  const voiceLanguage = state.voiceLanguage === "auto" ? state.language : state.voiceLanguage;
  return languageLocales[voiceLanguage] || languageLocales[state.language] || "en-IN";
}

function voiceLanguageName() {
  const selected = $("voice-language")?.selectedOptions?.[0]?.textContent;
  return selected && state.voiceLanguage !== "auto" ? selected : `app language (${languageLocales[state.language] || "English"})`;
}

const voiceTestPhrases = {
  en: "WeatherGPT voice test. Your local weather assistant is ready.",
  hi: "WeatherGPT आवाज़ परीक्षण। आपका मौसम सहायक तैयार है।",
  bn: "WeatherGPT কণ্ঠ পরীক্ষা। আপনার আবহাওয়া সহকারী প্রস্তুত।",
  ta: "WeatherGPT குரல் சோதனை. உங்கள் வானிலை உதவியாளர் தயாராக உள்ளது.",
  te: "WeatherGPT వాయిస్ పరీక్ష. మీ వాతావరణ సహాయకుడు సిద్ధంగా ఉన్నారు.",
  mr: "WeatherGPT आवाज चाचणी. तुमचा हवामान सहाय्यक तयार आहे.",
  kn: "WeatherGPT ಧ್ವನಿ ಪರೀಕ್ಷೆ. ನಿಮ್ಮ ಹವಾಮಾನ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.",
  ml: "WeatherGPT ശബ്ദ പരിശോധന. നിങ്ങളുടെ കാലാവസ്ഥാ സഹായി തയ്യാറാണ്.",
  gu: "WeatherGPT અવાજ પરીક્ષણ. તમારો હવામાન સહાયક તૈયાર છે.",
  pa: "WeatherGPT ਆਵਾਜ਼ ਜਾਂਚ। ਤੁਹਾਡਾ ਮੌਸਮ ਸਹਾਇਕ ਤਿਆਰ ਹੈ।",
  ur: "WeatherGPT آواز کی جانچ۔ آپ کا موسمی معاون تیار ہے۔"
};

function getVoiceTestText() {
  const language = state.voiceLanguage === "auto" ? state.language : state.voiceLanguage;
  return voiceTestPhrases[language] || voiceTestPhrases.en;
}

async function refreshAvailableVoices() {
  const refreshId = ++state.voiceRefreshId;
  const select = $("voice-select");
  if (!select) return;
  const selected = state.voiceName;
  const speechLocale = getSpeechLocale();
  const locale = speechLocale.toLowerCase().replace(/_/g, "-").split("-")[0];
  const nativeSpeech = window.WeatherGPTSpeech;
  if (nativeSpeech?.isNative) {
    try {
      const result = await nativeSpeech.textToSpeech.getSupportedVoices();
      if (refreshId !== state.voiceRefreshId) return;
      const voices = Array.isArray(result?.voices) ? result.voices : [];
      const languageVoices = voices.filter((voice) => String(voice.lang || "").toLowerCase().replace(/_/g, "-").split("-")[0] === locale);
      select.replaceChildren(new Option(languageVoices.length ? "Device default" : "No installed voice for this language", "auto"));
      languageVoices.forEach((voice) => {
        const voiceUri = String(voice.voiceURI || voice.name || "");
        select.add(new Option(`${voice.name || "Device voice"} (${voice.lang || speechLocale})`, `native:${voiceUri}`));
      });
      if ([...select.options].some((option) => option.value === selected)) select.value = selected;
      else { select.value = "auto"; state.voiceName = "auto"; }
      const installHint = nativeSpeech.platform === "android"
        ? "Tap Install device voice data to open Android’s built-in voice installer."
        : nativeSpeech.platform === "ios"
          ? "Install voices in Settings → Accessibility → Spoken Content → Voices."
          : "Install a matching voice in this device’s speech settings.";
      setText("voice-device-status", languageVoices.length
        ? `${languageVoices.length} built-in ${languageVoices.length === 1 ? "voice" : "voices"} available for ${voiceLanguageName()}. Speech stays on this device.`
        : `No installed voice was found for ${voiceLanguageName()}. ${installHint}`);
      return;
    } catch (error) {
      if (refreshId !== state.voiceRefreshId) return;
      console.error("Unable to list device text-to-speech voices:", error);
      select.replaceChildren(new Option("Device default", "auto"));
      setText("voice-device-status", "The device could not list installed voices. Check its Text-to-speech settings and download the selected language pack.");
      return;
    }
  }
  if (!("speechSynthesis" in window)) {
    select.replaceChildren(new Option("Speech not available", "auto"));
    setText("voice-device-status", "This device does not provide a built-in speech engine.");
    return;
  }
  const voices = window.speechSynthesis.getVoices().filter((voice) => String(voice.lang || "").toLowerCase().replace(/_/g, "-").split("-")[0] === locale);
  select.replaceChildren(new Option(voices.length ? "Device default" : "No installed voice for this language", "auto"));
  for (const voice of voices) select.add(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI));
  if ([...select.options].some((option) => option.value === selected)) select.value = selected;
  else { select.value = "auto"; state.voiceName = "auto"; }
  setText("voice-device-status", voices.length
    ? `${voices.length} built-in ${voices.length === 1 ? "voice" : "voices"} available for ${voiceLanguageName()}.`
    : `No browser voice is installed for ${voiceLanguageName()}. Download speech data in device settings.`);
}

async function installDeviceVoiceData() {
  const speech = window.WeatherGPTSpeech;
  if (speech?.platform === "android" && typeof speech.textToSpeech?.openInstall === "function") {
    try {
      await speech.textToSpeech.openInstall();
      setText("voice-device-status", `Android’s built-in voice-data installer opened. Choose ${voiceLanguageName()}, install its voice pack, then return to refresh the voice list.`);
      return;
    } catch (error) {
      console.warn("The built-in voice-data installer could not open:", error);
      setText("voice-device-status", "Android could not open the voice-data installer. Open Settings → Accessibility → Text-to-speech output and install the selected language there.");
      return;
    }
  }
  if (speech?.platform === "ios") {
    setText("voice-device-status", `To add ${voiceLanguageName()}, open Settings → Accessibility → Spoken Content → Voices and download the language pack.`);
    return;
  }
  setText("voice-device-status", `Voice packs are provided by this device. To add ${voiceLanguageName()}, open its Accessibility or Text-to-speech settings, install the language, then return here.`);
}

async function speakAnswer(text) {
  const nativeSpeech = window.WeatherGPTSpeech;
  if (nativeSpeech?.isNative) {
    try {
      await nativeSpeech.textToSpeech.stop();
      const { voices } = await nativeSpeech.textToSpeech.getSupportedVoices();
      const voiceURI = state.voiceName.startsWith("native:") ? state.voiceName.slice("native:".length) : null;
      const voiceIndex = voiceURI ? voices.findIndex((voice) => voice.voiceURI === voiceURI) : -1;
      await nativeSpeech.textToSpeech.speak({
        text,
        lang: getSpeechLocale(),
        rate: Math.min(1.3, Math.max(0.7, Number(state.voiceRate) || 1)),
        volume: Math.min(1, Math.max(0, Number(state.voiceVolume) || 0)),
        queueStrategy: 0,
        ...(voiceIndex >= 0 ? { voice: voiceIndex } : {})
      });
      setText("voice-device-status", "Speaking with the device's built-in voice. Audio stays on this device.");
    } catch (error) {
      console.error("Device text-to-speech could not speak:", error);
      setText("voice-device-status", "The built-in voice could not start. Check your device’s Text-to-speech settings and try again.");
      showToast("Built-in speech failed. Check that a text-to-speech engine and voice are installed.");
    }
    return;
  }
  if (!("speechSynthesis" in window)) {
    setText("voice-device-status", "This device does not provide a built-in speech engine.");
    showToast("Text-to-speech is not available on this device.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLocale();
  utterance.rate = Math.min(1.3, Math.max(0.7, Number(state.voiceRate) || 1));
  utterance.volume = Math.min(1, Math.max(0, Number(state.voiceVolume) || 0));
  const voices = window.speechSynthesis.getVoices();
  if (state.voiceName !== "auto") utterance.voice = voices.find((voice) => voice.voiceURI === state.voiceName) || null;
  utterance.onerror = (event) => {
    console.error("Browser text-to-speech could not speak:", event.error);
    setText("voice-device-status", "The browser could not start its built-in voice.");
    showToast("Text-to-speech could not start. Check this device's speech settings.");
  };
  window.speechSynthesis.speak(utterance);
}

function answerQuestion(question) {
  const q = String(question || "").trim().toLocaleLowerCase();
  if (/^(?:hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(q)) {
    return "Hello! I’m WeatherGPT. I can help with local weather, app controls, and saved forecast details.";
  }
  if (/^(?:thanks|thank you|many thanks|cheers)[!. ]*$/.test(q)) {
    return "You’re welcome. Ask me about your forecast, or say “open profile” for app settings.";
  }
  if (/^(?:who are you|what is your name|what's your name|introduce yourself)[?.! ]*$/.test(q)) {
    return "I’m WeatherGPT, here to explain forecasts and help you use the app.";
  }
  if (/\b(help|what can you|capabilit|what do you)\b/.test(q) || /मदद|எப்படி|సహాయం/.test(q)) {
    return "I can help with current conditions, rain chances, what to wear, the 7-day outlook, and recent climate context. You can also ask me to open Home, Map, Alerts, Climate or Profile, refresh weather, or request GPS.";
  }
  if (/climate|histor|trend|last month|last year|last \d+ years?|past \d+ years?|20-year|19\d{2}|20\d{2}|जलवायु|ऐतिहासिक|காலநிலை|ஆண்டுகள|વર્ષો|آب و ہوا|বছর|வெப்பநிலை.*மாற்ற|આબોહવા|જલવાયુ/.test(q)) return null;
  const hasWeatherIntent = /\b(weather|forecast|rain|umbrella|temperature|temp|hot|cold|wind|humidity|uv|pressure|visibility|feels like|outside|sunny|sunrise|sunset|cloud|air quality|aqi|farm|crop|irrigat|spray|pesticide|harvest|aviation|flight|airport|marine|wave|coast|sea|travel|commute|road|drive|alert|warning|danger|safe|conditions)\b/.test(q) || /मौसम|बारिश|बरसात|तापमान|हवा|वर्षा|வானிலை|மழை|வெப்ப|காற்று|వాతావరణ|వర్షం|ఉష్ణ|పంట|खेती|फसल|વરસાદ|موسم|بارش/.test(q);
  if (!hasWeatherIntent) return null;
  const data = state.weather;
  if (!data) return "I can’t access a saved or current forecast yet. Connect to the internet, load a forecast, then ask me again.";
  const current = data.current;
  const daily = data.daily;
  const location = state.location.name;
  const temp = displayTemperature(current.temperature_2m);
  const condition = getCondition(current.weather_code);
  const rain = daily.precipitation_probability_max?.[0] ?? 0;
  const tomorrowRain = daily.precipitation_probability_max?.[1] ?? 0;
  const days = daily.time.slice(0, 7).map((date, index) => {
    const day = dayName(new Date(`${date}T12:00:00`));
    const forecastCondition = getCondition(daily.weather_code[index]).text;
    return `${day}: ${forecastCondition}, ${displayTemperature(daily.temperature_2m_max[index])}°/${displayTemperature(daily.temperature_2m_min[index])}°${state.units === "fahrenheit" ? "F" : "C"} (rain ${daily.precipitation_probability_max?.[index] ?? 0}%)`;
  });
  const values = { location, temp, condition: condition.text.toLowerCase(), feels: displayTemperature(current.apparent_temperature), humidity: Math.round(current.relative_humidity_2m), wind: Math.round(current.wind_speed_10m) };
  const weatherContext = chatReply("current", values);
  if (/climate|histor|trend|last month|last year|last \d+ years?|past \d+ years?|20-year|19\d{2}|20\d{2}|जलवायु|ऐतिहासिक|காலநிலை|ஆண்டுகள|வெப்பநிலை.*மாற்ற|હવામાન પરિવર્તન|આબોહવા|موسمیاتی|ਵਰ੍ਹੇ|ਜਲਵਾਯூ|জলবায়ু|গত.*বছর/.test(q)) return null;
  if (/forecast|week|7.day|next few days|आने वाले|வார|వార/.test(q)) return `${weatherContext} ${t("sevenDayForecast")}: ${days.join("; ")}.`;
  if (/tomorrow|कल|நாளை|రేపు/.test(q)) {
    const tomorrow = getCondition(daily.weather_code[1]).text;
    return chatReply("tomorrow", { location, condition: tomorrow.toLowerCase(), high: displayTemperature(daily.temperature_2m_max[1]), low: displayTemperature(daily.temperature_2m_min[1]), chance: tomorrowRain });
  }
  if (/farm|agricultur|irrigat|spray|pesticide|harvest|sow|crop|விவசாய|பயிர்|தெளி|நீர்ப்பாசன|விதை|खेत|किसान|सिंच|फसल|వ్యవసాయ|పంట|పిచికారీ|शेती|पीक|ખેતી|કૃષિ|ਖੇਤੀ|کاشت|فصل|চাষ|ফসল/.test(q)) {
    const forecast = tomorrowRain >= 50
      ? `Rain is likely tomorrow in ${location} (${tomorrowRain}% chance). Check field soil moisture before irrigating and avoid a scheduled spray if rain is expected.`
      : `Tomorrow in ${location}: ${getCondition(daily.weather_code[1]).text.toLowerCase()}, ${displayTemperature(daily.temperature_2m_min[1])}–${displayTemperature(daily.temperature_2m_max[1])}°${state.units === "fahrenheit" ? "F" : "C"}, ${tomorrowRain}% rain chance.`;
    const nextDayWinds = Math.max(...(data.hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m]));
    const guidance = tomorrowRain >= 40 || nextDayWinds >= 15
      ? "Rain or wind may affect spray operations. Check the product label, actual field conditions, and a local agricultural adviser before spraying."
      : "Forecast rain and wind look lower for now, but confirm a rain-free window, actual wind, and the product label locally before spraying.";
    return `${forecast} ${guidance} This weather guidance is not professional agronomic advice.`;
  }
  if (/aviation|flight|airport|metar|taf|visibility|pilot|விமான|విమాన|विमान|ہوا بازی/.test(q) || state.mode === "aviation") {
    return `${location} forecast: visibility ${Number(current.visibility / 1000).toFixed(1)} km, wind ${Math.round(current.wind_speed_10m)} km/h from ${compassDirection(current.wind_direction_10m)}, pressure ${Math.round(current.pressure_msl)} hPa, ${condition.text.toLowerCase()}. This is surface-weather guidance—not an aviation briefing. METAR/TAF, NOTAMs and official aviation alerts are not integrated; follow the relevant aviation authority.`;
  }
  if (/marine|wave|coast|sea state|fisher|fishing|cyclone|கடல்|மீன்|அலை|കടൽ|മത്സ്യ|సముద్ర|అలలు|समुद्र|लाट|ਸਮੁੰਦਰ|سمندر/.test(q) || state.mode === "marine") {
    if (state.marine) return `Nearest marine grid near ${location}: waves ${state.marine.wave_height.toFixed(1)} m, direction ${Math.round(state.marine.wave_direction)}°, period ${Math.round(state.marine.wave_period)} s. Model guidance, not an official marine or cyclone warning. Check verified coastal advisories before going to sea.`;
    return `No nearby marine forecast is loaded for ${location}. Choose Marine mode at a coastal location. Official coastal and cyclone warnings are not connected; check your local meteorological and maritime authorities.`;
  }
  if (/travel|commute|road|drive|பயண|பயணிக்க|ప్రయాణ|यात्रा|सफर|પ્રવાસ|ਯਾਤਰਾ|سفر|ভ্রমণ/.test(q)) {
    return `Travel weather for ${location} tomorrow: ${getCondition(daily.weather_code[1]).text.toLowerCase()}, ${displayTemperature(daily.temperature_2m_min[1])}–${displayTemperature(daily.temperature_2m_max[1])}°${state.units === "fahrenheit" ? "F" : "C"}, ${tomorrowRain}% rain chance, current wind ${Math.round(current.wind_speed_10m)} km/h. This forecast cannot check roads, closures or traffic. Verify official travel and safety information before departure.`;
  }
  if (/rain|umbrella|बारिश|बरसात|மழை|వర్షం|పाऊस|પડશે|વરસાદ|بارش|ਮੀਂਹ/.test(q)) {
    const outlook = rain >= 50 ? (state.language === "hi" ? "ज़्यादा" : state.language === "bn" ? "বেশি" : state.language === "ta" ? "அதிகம்" : state.language === "te" ? "ఎక్కువ" : state.language === "mr" ? "जास्त" : state.language === "kn" ? "ಹೆಚ್ಚು" : state.language === "ml" ? "കൂടുതൽ" : state.language === "gu" ? "વધુ" : state.language === "pa" ? "ਵੱਧ" : state.language === "ur" ? "زیادہ" : "likely") : (state.language === "hi" ? "कम" : state.language === "bn" ? "কম" : state.language === "ta" ? "குறைவு" : state.language === "te" ? "తక్కువ" : state.language === "mr" ? "कमी" : state.language === "kn" ? "ಕಡಿಮೆ" : state.language === "ml" ? "കുറവ്" : state.language === "gu" ? "ઓછી" : state.language === "pa" ? "ਘੱਟ" : state.language === "ur" ? "کم" : "unlikely");
    const umbrella = state.language === "hi" ? "बाहर जाते समय छाता रखें।" : state.language === "bn" ? "বাইরে গেলে ছাতা নিন।" : state.language === "ta" ? "வெளியே செல்லும்போது குடை எடுத்துச் செல்லுங்கள்." : state.language === "te" ? "బయటకు వెళ్తే గొడుగు తీసుకెళ్లండి." : state.language === "mr" ? "बाहेर जाताना छत्री ठेवा." : state.language === "kn" ? "ಹೊರಗೆ ಹೋಗುವಾಗ ಛತ್ರಿ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ." : state.language === "ml" ? "പുറത്തുപോകുമ്പോൾ കുട കരുതുക." : state.language === "gu" ? "બહાર જાઓ ત્યારે છત્રી રાખો." : state.language === "pa" ? "ਬਾਹਰ ਜਾਣ ਵੇਲੇ ਛਤਰੀ ਲੈ ਜਾਓ।" : state.language === "ur" ? "باہر جاتے وقت چھتری ساتھ رکھیں۔" : "Consider carrying an umbrella.";
    return chatReply("rain", { location, outlook, chance: rain, advice: rain >= 50 ? umbrella : "", temp, condition: condition.text.toLowerCase(), tomorrowRain });
  }
  if (/wear|dress|clothes|outfit|पहन|அணிய|ధరించ|घालावे|પહેર|پہنوں/.test(q)) {
    const outfit = current.temperature_2m >= 33 ? "Choose light, breathable clothing, drink water, and limit time in direct sun." :
      current.temperature_2m >= 24 ? "Light, breathable clothes should be comfortable. Keep a compact umbrella handy if you’ll be out." :
        current.temperature_2m >= 15 ? "A light layer should be comfortable; consider an umbrella if showers develop." :
          "Wear a warm layer, especially in the morning and evening.";
    return `${chatReply("wear", { location, temp, condition: condition.text.toLowerCase(), advice: outfit })}`;
  }
  if (/alert|warning|danger|safe|सुरक्षा|எச்சரிக்கை|హెచ్చరిక/.test(q)) {
    const severe = current.weather_code >= 95 || current.wind_speed_10m >= 50 || rain >= 80;
    return severe ? `The forecast indicates conditions that may need extra caution in ${location}: ${condition.text.toLowerCase()}, ${Math.round(current.wind_speed_10m)} km/h wind and ${rain}% rain chance. This is not an official warning. Check your local meteorological department or emergency authority for verified alerts and instructions.` :
      `No severe-weather signal appears in this forecast for ${location} right now. This is not an official safety all-clear. Check local authorities for current warnings, especially before travel.`;
  }
  return `${weatherContext} ${chatReply("fallback")}`;
}

async function answerClimateQuestion(question) {
  const requestedYear = question.match(/\b(?:19|20)\d{2}\b/);
  const targetYear = requestedYear ? Number(requestedYear[0]) : new Date().getFullYear() - 1;
  const response = await fetch(`${ARCHIVE_API}?${new URLSearchParams({
    latitude: state.location.latitude, longitude: state.location.longitude, start_date: `${targetYear}-01-01`,
    end_date: `${targetYear}-12-31`, daily: "temperature_2m_mean,precipitation_sum",
    timezone: state.location.timezone || "auto", temperature_unit: "celsius", precipitation_unit: "mm"
  })}`);
  if (!response.ok) throw new Error(`Historical weather service returned ${response.status}`);
  const history = await response.json();
  const temperatures = history.daily?.temperature_2m_mean?.filter(Number.isFinite) || [];
  const rainfall = history.daily?.precipitation_sum?.filter(Number.isFinite) || [];
  if (!temperatures.length || !rainfall.length) throw new Error("Historical weather service returned incomplete data");
  const average = temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length;
  const totalRain = rainfall.reduce((sum, value) => sum + value, 0);
  return `For ${state.location.name} in ${targetYear}, Open-Meteo's historical dataset reports a mean daily temperature of ${average.toFixed(1)}°C and about ${Math.round(totalRain)} mm of total precipitation. This describes that year only; comparing long-term climate trends requires a multi-decade analysis and shouldn't be inferred from one year.`;
}

function setActiveTab(tab) {
  if (!$(`tab-${tab}`)) return;
  state.currentTab = tab;
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${tab}`));
  document.querySelectorAll("[data-tab-target]").forEach((button) => button.classList.toggle("active", button.dataset.tabTarget === tab));
  const headings = {
    home: t("overview"), gpt: "WeatherGPT",
    map: navigationLabels[state.language]?.map || "Map",
    alerts: navigationLabels[state.language]?.alerts || "Alerts",
    climate: navigationLabels[state.language]?.climate || "Climate",
    profile: navigationLabels[state.language]?.profile || "Profile"
  };
  setText("page-context", headings[tab]);
  if (tab === "map") activateMapTab();
  if (tab === "alerts" && state.weather) renderAdvisory(state.weather.current, state.weather.daily);
  if (tab === "climate" && !$("climate-chart").children.length) loadClimateHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let mapResizeObserver = null;

// Leaflet measures its container when it is created, so the map tab has to be laid out
// before the map is created — otherwise it renders at 0×0 and stays blank. Two animation
// frames wait for the panel to become visible, and a ResizeObserver keeps the map correct
// afterwards (rotation, resizes, desktop sidebar changes).
function activateMapTab() {
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    initializeMap();
    if (!state.map) return;
    state.map.invalidateSize();
    scheduleWeatherMapUpdate();
  }));
}

function watchMapContainer() {
  if (!("ResizeObserver" in window) || mapResizeObserver || !$("weather-map")) return;
  mapResizeObserver = new ResizeObserver(() => {
    if (state.currentTab === "map") state.map?.invalidateSize();
  });
  mapResizeObserver.observe($("weather-map"));
}

function installBaseMapTiles(provider) {
  if (!state.map || !window.L) return;
  const options = provider === "osm"
    ? {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
    : {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Powered by <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> — Tiles &copy; Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
    };
  const layer = window.L.tileLayer(options.url, { maxZoom: 19, attribution: options.attribution, subdomains: options.subdomains || "abc" });
  state.mapBaseLayer = layer;
  state.mapTileProvider = provider;
  state.mapTileErrors = 0;
  layer.on("tileerror", () => {
    if (state.mapBaseLayer !== layer) return;
    state.mapTileErrors += 1;
    if (state.mapTileErrors < 3) return;
    if (!state.mapFallbackUsed) {
      state.mapFallbackUsed = true;
      const fallback = provider === "esri" ? "osm" : "esri";
      setText("map-status", `Map tiles from ${provider === "esri" ? "Esri" : "OpenStreetMap"} are blocked; trying an alternate map source…`);
      state.map.removeLayer(layer);
      installBaseMapTiles(fallback);
    } else {
      setText("map-status", "Both base-map sources are unavailable. Check your connection or browser content-blocking settings; the weather-data layer can still load when online.");
    }
  });
  layer.addTo(state.map);
}

function initializeMap() {
  if (state.map) return;
  if (!window.L) {
    console.error("Leaflet could not be loaded from vendor/leaflet/leaflet.js.");
    setText("map-status", "The map library did not load, so the map cannot start. Reload the page; if it stays blank, reinstall or update the app.");
    setText("map-source", "Map library missing");
    return;
  }
  state.map = window.L.map("weather-map", { zoomControl: true, scrollWheelZoom: false }).setView([state.location.latitude, state.location.longitude], 7);
  state.mapFallbackUsed = false;
  installBaseMapTiles("esri");
  watchMapContainer();
  state.mapMarker = window.L.circleMarker([state.location.latitude, state.location.longitude], {
    radius: 8, color: "#fff", weight: 3, fillColor: "#3c9663", fillOpacity: 1
  }).addTo(state.map).bindPopup(`${safeText(state.location.name)} · WeatherGPT location`);
  state.map.on("moveend", scheduleWeatherMapUpdate);
}

async function toggleRadarLayer(enabled) {
  initializeMap();
  if (!state.map) return;
  if (!enabled) {
    if (state.radarLayer) state.map.removeLayer(state.radarLayer);
    state.radarLayer = null;
    $("map-radar-toggle").setAttribute("aria-pressed", "false");
    $("map-radar-toggle").innerHTML = "☂ <span>Show rain radar</span>";
    setText("map-source", "Open-Meteo · model");
    scheduleWeatherMapUpdate();
    return;
  }
  try {
    if (!state.radarFrames) {
      const response = await fetch(RADAR_API);
      if (!response.ok) throw new Error(`RainViewer service returned ${response.status}`);
      state.radarFrames = await response.json();
    }
    const frames = [...(state.radarFrames.radar?.past || []), ...(state.radarFrames.radar?.nowcast || [])];
    const frame = [...frames].reverse().find((item) => item.path);
    if (!frame) throw new Error("RainViewer did not provide a radar frame");
    if (state.radarLayer) state.map.removeLayer(state.radarLayer);
    state.radarLayer = window.L.tileLayer(`${state.radarFrames.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
      opacity: 0.7, maxZoom: 12, tileSize: 256, attribution: "&copy; RainViewer"
    }).addTo(state.map);
    const frameTime = new Date(frame.time * 1000).toLocaleTimeString(languageLocales[state.language] || "en-IN", { timeZone: state.location.timezone || "UTC", hour: "numeric", minute: "2-digit" });
    $("map-radar-toggle").setAttribute("aria-pressed", "true");
    $("map-radar-toggle").innerHTML = "☂ <span>Hide rain radar</span>";
    setText("map-status", `Observed rain radar · ${frameTime} local · modelled ${mapLayerDefinitions[state.mapWeatherLayer].label} below`);
    setText("map-source", "RainViewer + Open-Meteo");
  } catch (error) {
    console.error("Unable to load rainfall radar:", error);
    showToast("Live radar is temporarily unavailable.");
    $("map-radar-toggle").setAttribute("aria-pressed", "false");
    $("map-radar-toggle").innerHTML = "☂ <span>Show rain radar</span>";
  }
}

function updateMapLocation() {
  setText("map-location", state.location.name);
  if (state.map && state.mapMarker) {
    state.map.setView([state.location.latitude, state.location.longitude], Math.max(state.map.getZoom(), 7));
    state.mapMarker.setLatLng([state.location.latitude, state.location.longitude]);
    state.mapMarker.setPopupContent(`${safeText(state.location.name)} · WeatherGPT location`);
    scheduleWeatherMapUpdate();
  }
}

const mapLayerDefinitions = {
  temperature: { label: "Temperature", unit: "°C", field: "temperature_2m", colors: [-5, 5, 15, 25, 32, 40] },
  condition: { label: "Weather condition", unit: "", field: "weather_code" },
  precipitation: { label: "Rainfall", unit: "mm/h", field: "precipitation", colors: [0, 0.1, 1, 3, 8, 15] },
  wind: { label: "Wind speed", unit: "km/h", field: "wind_speed_10m", colors: [5, 15, 25, 40, 60, 90] },
  humidity: { label: "Humidity", unit: "%", field: "relative_humidity_2m", colors: [25, 40, 55, 70, 85, 100] },
  cloud: { label: "Cloud cover", unit: "%", field: "cloud_cover", colors: [10, 25, 40, 60, 80, 100] },
  pressure: { label: "Pressure", unit: "hPa", field: "pressure_msl", colors: [980, 995, 1005, 1015, 1025, 1040] },
  visibility: { label: "Visibility", unit: "km", field: "visibility", colors: [1, 3, 5, 10, 20, 40] },
  uv: { label: "UV index", unit: "", field: "uv_index", colors: [1, 3, 6, 8, 11, 15] },
  aqi: { label: "Air quality · US AQI", unit: "AQI", field: "us_aqi", colors: [0, 50, 100, 150, 200, 300] }
};

function scheduleWeatherMapUpdate() {
  if (!state.map || state.currentTab !== "map" || $("map-radar-toggle")?.getAttribute("aria-pressed") === "true") return;
  clearTimeout(state.mapUpdateTimeout);
  state.mapUpdateTimeout = window.setTimeout(loadWeatherMapGrid, 700);
}

function mapValueColor(value, thresholds) {
  const colors = ["#3184a6", "#55a984", "#d2bd59", "#e49342", "#d45a48"];
  let index = 0;
  for (let i = 1; i < thresholds.length - 1; i += 1) {
    if (value >= thresholds[i]) index = i;
  }
  return colors[index];
}

function formatMapValue(value, layer) {
  if (layer === "condition") return getCondition(value).text;
  const definition = mapLayerDefinitions[layer];
  const digits = layer === "temperature" || layer === "precipitation" ? 1 : 0;
  return `${Number(value).toFixed(digits)}${definition.unit ? ` ${definition.unit}` : ""}`;
}

function clearWeatherMapMarkers() {
  state.mapWeatherMarkers.forEach((marker) => state.map?.removeLayer(marker));
  state.mapWeatherMarkers = [];
}

function renderWeatherMapGrid(weatherPoints, airPoints = null) {
  if (!state.map || !weatherPoints?.length) return;
  const layer = state.mapWeatherLayer;
  const definition = mapLayerDefinitions[layer];
  clearWeatherMapMarkers();
  weatherPoints.forEach((point, index) => {
    const value = layer === "aqi" ? airPoints?.[index]?.current?.us_aqi : point.current?.[definition.field];
    if (!Number.isFinite(Number(value))) return;
    const condition = layer === "condition" ? getCondition(Number(value)) : null;
    const marker = condition
      ? window.L.marker([point.latitude, point.longitude], {
        icon: window.L.divIcon({ className: "weather-condition-marker", html: `<span>${condition.icon}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] })
      })
      : window.L.circleMarker([point.latitude, point.longitude], {
        radius: 19, color: "#ffffff", weight: 1.5, fillColor: mapValueColor(Number(value), definition.colors), fillOpacity: 0.72
      });
    marker.bindTooltip(formatMapValue(Number(value), layer), { permanent: true, direction: "center", className: "weather-value-tooltip" });
    marker.bindPopup(`${definition.label}: ${formatMapValue(Number(value), layer)}<br>Forecast grid point · Open-Meteo`);
    marker.addTo(state.map);
    state.mapWeatherMarkers.push(marker);
  });
  const time = weatherPoints[0]?.current?.time;
  const localTime = time ? new Date(time).toLocaleString(languageLocales[state.language] || "en-IN", { timeZone: state.location.timezone || "UTC", hour: "numeric", minute: "2-digit" }) : "time unavailable";
  const radarVisible = $("map-radar-toggle").getAttribute("aria-pressed") === "true";
  setText("map-status", `${definition.label} at nearby forecast grid points · ${localTime} local · ${state.location.name}${radarVisible ? " · observed radar overlay" : ""}`);
  setText("map-source", radarVisible ? "RainViewer + Open-Meteo" : layer === "aqi" ? "Open-Meteo · AQI model" : "Open-Meteo · forecast model");
}

async function loadWeatherMapGrid() {
  if (!state.map || state.currentTab !== "map") return;
  const requestId = ++state.mapRequestId;
  const bounds = state.map.getBounds();
  const latitude = [];
  const longitude = [];
  const rows = 4;
  const columns = 4;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      latitude.push((bounds.getNorth() - bounds.getSouth()) * (row + 0.5) / rows + bounds.getSouth());
      longitude.push((bounds.getEast() - bounds.getWest()) * (column + 0.5) / columns + bounds.getWest());
    }
  }
  setText("map-status", `Loading ${mapLayerDefinitions[state.mapWeatherLayer].label} grid for this map view…`);
  try {
    const weatherParams = new URLSearchParams({
      latitude: latitude.join(","), longitude: longitude.join(","), timezone: "auto", forecast_days: "1",
      wind_speed_unit: "kmh", precipitation_unit: "mm",
      current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,pressure_msl,cloud_cover,visibility,uv_index"
    });
    const weatherResponse = await fetch(`${API}?${weatherParams}`);
    if (!weatherResponse.ok) throw new Error(`Weather grid service returned ${weatherResponse.status}`);
    const weatherData = await weatherResponse.json();
    const weatherPoints = Array.isArray(weatherData) ? weatherData : [weatherData];
    if (weatherPoints.length !== latitude.length || weatherPoints.some((point) => !point.current)) throw new Error("Weather grid returned incomplete map data.");
    let airPoints = null;
    if (state.mapWeatherLayer === "aqi") {
      const airParams = new URLSearchParams({
        latitude: latitude.join(","), longitude: longitude.join(","), timezone: "auto", current: "us_aqi"
      });
      const airResponse = await fetch(`${AIR_API}?${airParams}`);
      if (!airResponse.ok) throw new Error(`Air-quality grid service returned ${airResponse.status}`);
      const airData = await airResponse.json();
      airPoints = Array.isArray(airData) ? airData : [airData];
      if (airPoints.length !== latitude.length) throw new Error("Air-quality grid returned incomplete map data.");
    }
    if (requestId !== state.mapRequestId || state.currentTab !== "map") return;
    renderWeatherMapGrid(weatherPoints, airPoints);
  } catch (error) {
    if (requestId !== state.mapRequestId) return;
    console.error("Unable to load the weather map grid:", error);
    setText("map-status", `${mapLayerDefinitions[state.mapWeatherLayer].label} map data unavailable. Check your connection and retry.`);
    showToast("Could not load weather data for the map.");
  }
}

async function loadClimateHistory() {
  const button = $("load-climate");
  const years = Number($("climate-years").value);
  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - years + 1;
  button.disabled = true;
  button.textContent = "Loading observations…";
  setText("climate-summary", `Requesting ${startYear}–${endYear} daily climate observations for ${state.location.name}…`);
  try {
    const params = new URLSearchParams({
      latitude: state.location.latitude, longitude: state.location.longitude,
      start_date: `${startYear}-01-01`, end_date: `${endYear}-12-31`,
      daily: "temperature_2m_mean,precipitation_sum", timezone: state.location.timezone || "auto",
      temperature_unit: "celsius", precipitation_unit: "mm"
    });
    const response = await fetch(`${ARCHIVE_API}?${params}`);
    if (!response.ok) throw new Error(`Historical weather service returned ${response.status}`);
    const result = await response.json();
    if (!result.daily?.time?.length) throw new Error("Historical weather service returned no observations");
    const annual = new Map();
    result.daily.time.forEach((date, index) => {
      const year = Number(date.slice(0, 4));
      const entry = annual.get(year) || { temperatureSum: 0, temperatureDays: 0, precipitation: 0, rainDays: 0 };
      const temperature = result.daily.temperature_2m_mean[index];
      const precipitation = result.daily.precipitation_sum[index];
      if (Number.isFinite(temperature)) { entry.temperatureSum += temperature; entry.temperatureDays += 1; }
      if (Number.isFinite(precipitation)) { entry.precipitation += precipitation; entry.rainDays += 1; }
      annual.set(year, entry);
    });
    const values = Array.from(annual, ([year, entry]) => ({
      year,
      temperature: entry.temperatureDays ? entry.temperatureSum / entry.temperatureDays : null,
      precipitation: entry.rainDays ? entry.precipitation : null
    })).filter((row) => Number.isFinite(row.temperature) && Number.isFinite(row.precipitation));
    if (values.length < 2) throw new Error("Not enough complete historical years to create trend charts");
    drawClimateChart($("climate-chart"), values.map((row) => row.temperature), values.map((row) => row.year), false);
    drawClimateChart($("rain-chart"), values.map((row) => row.precipitation), values.map((row) => row.year), true);
    $("climate-summary").replaceChildren();
    const icon = document.createElement("span");
    icon.className = "climate-icon";
    icon.textContent = "⌁";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${state.location.name} · historical observations, ${startYear}–${endYear}`;
    const average = values.reduce((sum, row) => sum + row.temperature, 0) / values.length;
    const body = document.createElement("p");
    body.textContent = `${values.length} years of ERA5-derived daily data · average annual mean temperature ${average.toFixed(1)}°C · Source: Open-Meteo Historical Weather API. These observations are not a forecast or an official IMD climate record.`;
    copy.append(title, body);
    $("climate-summary").append(icon, copy);
    setText("climate-source", `Historical · ${values.length} years · °C`);
  } catch (error) {
    console.error("Unable to load climate history:", error);
    setText("climate-summary", error instanceof Error ? error.message : "Historical data could not be loaded.");
    showToast("Historical observations could not be loaded.");
  } finally {
    button.disabled = false;
    button.textContent = "Load climate history";
  }
}

function drawClimateChart(chart, values, labels, bars) {
  const width = 600, height = 190, plotLeft = 35, plotRight = 580, plotTop = 19, plotBottom = 151;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const pad = Math.max((maximum - minimum) * 0.12, 1);
  const low = bars ? 0 : minimum - pad;
  const high = maximum + pad;
  const x = (index) => plotLeft + (values.length < 2 ? 0 : index * (plotRight - plotLeft) / (values.length - 1));
  const y = (value) => plotTop + (high - value) / (high - low || 1) * (plotBottom - plotTop);
  const grids = [0, 0.5, 1].map((step) => {
    const position = plotTop + step * (plotBottom - plotTop);
    return `<line class="chart-grid" x1="${plotLeft}" y1="${position}" x2="${plotRight}" y2="${position}"/>`;
  }).join("");
  const barsMarkup = bars ? values.map((value, index) => {
    const barWidth = Math.max(3, Math.min(18, (plotRight - plotLeft) / values.length * 0.56));
    return `<rect class="rain-bar" x="${x(index) - barWidth / 2}" y="${y(value)}" width="${barWidth}" height="${Math.max(1, plotBottom - y(value))}"><title>${labels[index]}: ${Math.round(value)} mm</title></rect>`;
  }).join("") : "";
  const lineMarkup = !bars ? `<path class="chart-area" d="M ${x(0)} ${plotBottom} ${values.map((value, index) => `L ${x(index)} ${y(value)}`).join(" ")} L ${x(values.length - 1)} ${plotBottom} Z"/><polyline class="chart-line" points="${values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}"/>${values.map((value, index) => `<circle class="chart-point" cx="${x(index)}" cy="${y(value)}" r="3"><title>${labels[index]}: ${value.toFixed(1)}°C</title></circle>`).join("")}` : "";
  const labelStep = values.length <= 6 ? 1 : Math.ceil(values.length / 6);
  const labelsMarkup = labels.map((label, index) => index % labelStep === 0 || index === labels.length - 1 ? `<text class="chart-label" x="${x(index)}" y="172">${label}</text>` : "").join("");
  chart.innerHTML = `${grids}${barsMarkup}${lineMarkup}${labelsMarkup}`;
}

function updateAgriculturePanel(current, daily) {
  const rain = daily.precipitation_probability_max?.[0] ?? 0;
  const hourly = state.weather?.hourly;
  const maxWind = Math.max(...(hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m]));
  const expectedRain = daily.precipitation_sum?.[0] ?? 0;
  const rainMessage = rain >= 50 || expectedRain >= 5 ? `Rain is possible today (${rain}% chance; about ${expectedRain.toFixed(1)} mm forecast). Check soil moisture before irrigation and avoid working on waterlogged fields.` : `Rain chance today: ${rain}% (${expectedRain.toFixed(1)} mm forecast). Irrigation still depends on soil moisture, crop stage and local field conditions.`;
  const sprayMessage = rain >= 40 || maxWind >= 15 ? `Rain or forecast winds up to ${Math.round(maxWind)} km/h could affect spraying. Check the product label and local agricultural advice; do not spray in unsafe conditions.` : `Forecast wind is up to ${Math.round(maxWind)} km/h with a ${rain}% rain chance. Verify a suitable rain-free window, field conditions and the product label before any spray operation.`;
  const headline = state.role === "farmer" ? "Field forecast" : "Farm weather summary";
  const root = document.createElement("div");
  root.innerHTML = `<span>🌾</span><div><strong>${headline} · ${safeText(state.location.name)}</strong><p>${safeText(rainMessage)} ${safeText(sprayMessage)} General forecast planning only—not a crop-specific prescription.</p></div>`;
  const card = $("agriculture-summary");
  if (card) { card.replaceChildren(...root.childNodes); card.hidden = false; }
  const planner = $("farmer-planner");
  if (planner) {
    planner.hidden = false;
    renderFieldAdvice(current, daily);
  }
}

function renderFieldAdvice(current = state.weather?.current, daily = state.weather?.daily) {
  if (!current || !daily) return;
  const rainChance = daily.precipitation_probability_max?.[0] ?? 0;
  const rainAmount = daily.precipitation_sum?.[0] ?? 0;
  const next24Wind = state.weather?.hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m];
  const maxWind = Math.max(...next24Wind);
  const maxTemperature = daily.temperature_2m_max?.[0] ?? current.temperature_2m;
  const rainAdvice = rainChance >= 50 || rainAmount >= 5
    ? `Rain is possible today (${rainChance}% chance; ${rainAmount.toFixed(1)} mm forecast). Check soil moisture before irrigation; delay field work on saturated ground.`
    : `Rain chance is ${rainChance}% (${rainAmount.toFixed(1)} mm forecast). Base irrigation on field soil moisture and crop stage, not this forecast alone.`;
  const sprayAdvice = rainChance >= 40 || maxWind >= 15
    ? `Forecast rain or winds up to ${Math.round(maxWind)} km/h may make spraying unsuitable. Check label restrictions and consult a local extension adviser.`
    : `Forecast wind is up to ${Math.round(maxWind)} km/h. Verify a rain-free window and the product label locally before spraying.`;
  const stageAdvice = state.fieldStage === "harvest"
    ? rainAmount >= 2 ? " Rain may affect harvesting or crop drying; protect harvested produce from moisture." : " Confirm the crop and ground are dry enough before harvest or storage."
    : state.fieldStage === "sowing" || state.fieldStage === "land-preparation"
      ? " Check seedbed moisture and drainage locally before field preparation or sowing."
      : state.fieldStage === "flowering"
        ? " Avoid treating a general weather forecast as a crop-stage stress threshold; ask your local KVK about crop-specific protection."
        : " Check crop stage, drainage and soil moisture in the field before changing operations.";
  const heatAdvice = maxTemperature >= 35 ? ` Forecast high is ${Math.round(maxTemperature)}°C. Plan strenuous outdoor field work for cooler hours, take water breaks and use shade.` : "";
  const cropLabels = { general: "general crops", rice: "rice / paddy", millet: "millets", cotton: "cotton", pulses: "pulses", vegetables: "vegetables", other: "selected crop" };
  const stageLabels = { "land-preparation": "land preparation", sowing: "sowing / planting", growing: "growing", flowering: "flowering", harvest: "harvest / drying" };
  setText("field-advice", `${cropLabels[state.fieldCrop] || cropLabels.general} · ${stageLabels[state.fieldStage] || stageLabels["land-preparation"]}. ${rainAdvice}${sprayAdvice}${stageAdvice}${heatAdvice}`);
}

function updateCommunityGuidance(current, daily) {
  const month = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: state.location.timezone || "UTC" }).format(new Date(current.time)));
  const rainChance = daily.precipitation_probability_max?.[0] ?? 0;
  const rainAmount = daily.precipitation_sum?.[0] ?? 0;
  const high = daily.temperature_2m_max?.[0] ?? current.temperature_2m;
  const wind = current.wind_speed_10m ?? 0;
  const code = current.weather_code ?? 0;
  const parts = [];
  if (rainChance >= 60 || rainAmount >= 20 || code >= 95) parts.push("Rain or thunderstorms appear in the forecast. Keep essential medicines, drinking water, a torch and charged phone ready; avoid flooded roads, drains and electrical equipment in wet areas.");
  if (high >= 35) parts.push("Hot conditions are forecast. Drink safe water, seek shade and check on older adults, children and people working outdoors.");
  if (high <= 10) parts.push("Cold conditions are forecast. Keep warm and dry, especially children, older adults and people without adequate shelter.");
  if (wind >= 40) parts.push("Strong winds are forecast. Stay clear of trees, unstable structures and loose outdoor objects; follow local authority instructions.");
  if (!parts.length) parts.push("No major rain, heat or wind signal appears in this local forecast. Keep routine drinking water and medicines accessible and continue checking official local updates.");
  const country = state.location.country.toLocaleLowerCase();
  const seasonal = country.includes("india")
    ? month >= 6 && month <= 9 ? "India monsoon season: keep drains clear where safe, store documents and medicines above expected water levels, and never walk or drive through floodwater."
      : month >= 10 && month <= 12 ? "India post-monsoon season: watch official cyclone and heavy-rain updates, secure loose items, and identify the evacuation route provided by local authorities."
        : month >= 3 && month <= 5 ? "India pre-monsoon / hot season: schedule outdoor work in cooler hours, drink safe water, and take heat breaks in shade."
          : "India cooler season: keep warm clothing and essential medicines ready and continue following location-specific official advisories."
    : "Seasonal conditions vary by region. Use the local forecast and follow preparedness instructions issued by your local authority.";
  setText("seasonal-guidance", `${parts.join(" ")} ${seasonal}`);
  setText("seasonal-guidance-source", `Local forecast for ${state.location.name} · Open-Meteo · ${new Date(current.time).toLocaleString(languageLocales[state.language] || "en-IN", { timeZone: state.location.timezone || "UTC" })}. General preparedness only, not an official warning or shelter listing.`);
  setText("relief-farm-copy", `Field planner for ${state.location.name}: rain chance ${rainChance}%, expected precipitation ${rainAmount.toFixed(1)} mm, forecast high ${Math.round(high)}°C and current wind ${Math.round(wind)} km/h. Select a crop stage on Home; follow your local KVK or agriculture extension officer for crop-specific action.`);
}

async function loadMarineWeather() {
  const output = $("mode-insight");
  output.classList.add("loading");
  setText("mode-insight-title", "Loading nearest coastal marine forecast…");
  try {
    const response = await fetch(`${MARINE_API}?${new URLSearchParams({
      latitude: state.location.latitude, longitude: state.location.longitude, timezone: state.location.timezone || "auto",
      forecast_days: "3", wind_speed_unit: "kmh", current: "wave_height,wave_direction,wave_period,sea_surface_temperature"
    })}`);
    if (!response.ok) throw new Error(`Marine forecast service returned ${response.status}`);
    const data = await response.json();
    if (!data.current || !Number.isFinite(data.current.wave_height)) throw new Error("No marine grid cell is available near this location");
    state.marine = data.current;
    output.classList.remove("loading");
    $("mode-insight-title").textContent = `Nearest marine grid · ${state.location.name}`;
    $("mode-insight-copy").textContent = `Waves ${data.current.wave_height.toFixed(1)} m · direction ${Math.round(data.current.wave_direction)}° · period ${Math.round(data.current.wave_period)} s · sea ${Number(data.current.sea_surface_temperature).toFixed(1)}°C. Open-Meteo marine model, ${data.current.time}. This is model guidance, not an official coastal warning.`;
  } catch (error) {
    state.marine = null;
    output.classList.remove("loading");
    console.warn("Marine forecast is unavailable for this location:", error);
    $("mode-insight-title").textContent = "No marine grid is available nearby";
    $("mode-insight-copy").textContent = "Marine forecasts are limited to coastal/ocean grid cells. For sea-state and coastal safety, check local official maritime or meteorological warnings before departure.";
  }
}

function createNativeNotification(title, body, notificationKey) {
  if (!state.notificationsEnabled) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const key = `wg-sent-${notificationKey}-${state.location.latitude.toFixed(2)}-${stamp}`;
  if (localStorage.getItem(key)) return;
  const notificationIds = { rain: 43001, storm: 43002, wind: 43003, heat: 43004, cold: 43005 };
  const schedule = async () => {
    try {
      const native = window.Capacitor?.Plugins?.LocalNotifications;
      if (native) {
        const permission = await native.requestPermissions();
        if (permission.display !== "granted") return;
        await native.schedule({ notifications: [{ id: notificationIds[notificationKey] || 43009, title, body, schedule: { at: new Date(Date.now() + 1000) } }] });
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "icon.svg" });
      } else return;
      localStorage.setItem(key, "sent");
    } catch (error) { console.error("Unable to schedule weather notification:", error); }
  };
  schedule();
}

function checkNotificationRules(current, daily) {
  if (!state.notificationsEnabled) return;
  if (state.notifications.rain && (daily.precipitation_probability_max?.[0] ?? 0) >= 60) {
    createNativeNotification("Rain in the forecast", `${state.location.name}: ${daily.precipitation_probability_max[0]}% chance of rain today. Forecast guidance only; not an official warning.`, "rain");
  }
  if (state.notifications.storm && (current.weather_code ?? 0) >= 95) {
    createNativeNotification("Thunderstorm conditions forecast", `${state.location.name}: the forecast indicates a thunderstorm. Follow official local alerts and safety instructions.`, "storm");
  }
  const maximumWind = Math.max(...(state.weather?.hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m || 0]));
  if (state.notifications.wind && maximumWind >= 50) {
    createNativeNotification("Strong winds in the forecast", `${state.location.name}: forecast winds reach about ${Math.round(maximumWind)} km/h. Check official local advisories.`, "wind");
  }
  const forecastHigh = daily.temperature_2m_max?.[0] ?? current.temperature_2m;
  if (state.notifications.heat && forecastHigh >= 40) {
    createNativeNotification("Extreme heat in the forecast", `${state.location.name}: forecast high ${Math.round(forecastHigh)}°C. Stay hydrated and follow local official guidance.`, "heat");
  }
  const forecastLow = daily.temperature_2m_min?.[0] ?? current.temperature_2m;
  if (state.notifications.cold && forecastLow <= 5) {
    createNativeNotification("Cold weather in the forecast", `${state.location.name}: forecast low ${Math.round(forecastLow)}°C. Check on people who may need extra warmth.`, "cold");
  }
}

function renderSavedLocations() {
  const list = $("saved-locations-list");
  if (!list) return;
  list.replaceChildren();
  state.savedLocations.forEach((rawLocation, index) => {
    const location = normalizeLocation(rawLocation);
    const row = document.createElement("div");
    row.className = "saved-location-row";
    const info = document.createElement("div");
    info.className = "saved-location-info";
    const name = document.createElement("strong");
    name.textContent = location.name;
    const details = document.createElement("small");
    details.textContent = [location.country, formatLocationCoordinates(location)].filter(Boolean).join(" · ");
    const precision = document.createElement("small");
    precision.className = "saved-location-precision";
    precision.textContent = locationPrecisionLabel(location);
    info.append(name, details, precision);

    const actions = document.createElement("div");
    actions.className = "saved-location-actions";
    const select = document.createElement("button");
    select.type = "button";
    select.className = "saved-location-open";
    select.textContent = "Open";
    select.addEventListener("click", async () => {
      state.location = normalizeLocation(location);
      saveSignedInProfile();
      await loadWeather();
      setActiveTab("home");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "saved-location-remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${location.name}`);
    remove.addEventListener("click", () => {
      state.savedLocations.splice(index, 1);
      storeValue("wg-locations", state.savedLocations);
      renderSavedLocations();
      updateOfflineCapabilityStatus();
    });
    actions.append(select, remove);
    row.append(info, actions);
    list.append(row);
  });
  if (!state.savedLocations.length) {
    const empty = document.createElement("p");
    empty.className = "saved-empty";
    empty.textContent = "No saved locations yet. Search for a place and tap “Save this place”.";
    list.append(empty);
  }
}

function saveCurrentLocation() {
  const location = normalizeLocation(state.location);
  const saved = state.savedLocations.some((place) => Math.abs(Number(place.latitude) - location.latitude) < 0.00001 && Math.abs(Number(place.longitude) - location.longitude) < 0.00001);
  if (saved) { showToast(`${location.name} is already saved.`); return; }
  state.savedLocations.push({ ...location });
  storeValue("wg-locations", state.savedLocations);
  renderSavedLocations();
  updateOfflineCapabilityStatus();
  saveSignedInProfile();
  showToast(`${location.name} saved with coordinates ${formatLocationCoordinates(location)}.`);
}

function explainLocationError(error) {
  const message = String(error?.message || "");
  const code = Number(error?.code);
  if (code === 1 || /denied|permission/i.test(message)) {
    return "Location permission is blocked. Allow precise location for WeatherGPT in your browser or device settings, then try again.";
  }
  if (code === 2 || /position unavailable|location unavailable|provider.*unavailable/i.test(message)) {
    return "Your device could not get a GPS fix. Turn on Location/GPS, move near a window or outdoors, and try again; you can also search for a place.";
  }
  if (code === 3 || /timed? ?out|timeout/i.test(message)) {
    return "Getting a GPS fix took too long. Keep Location/GPS on and retry, or search for a place instead.";
  }
  if (/secure origin|insecure|https/i.test(message)) {
    return "Precise location needs a secure HTTPS connection (or the native WeatherGPT app). Open the secure app URL and try again.";
  }
  return message || "Your location could not be retrieved. Check location permission and GPS, then try again.";
}

async function useCurrentLocation() {
  const buttons = [$("use-my-location"), $("home-use-location")].filter(Boolean);
  const originalLabels = buttons.map((button) => button.textContent);
  buttons.forEach((button) => { button.disabled = true; button.textContent = "Finding your location…"; });
  try {
    const locationService = window.WeatherGPTLocation?.geolocation || window.Capacitor?.Plugins?.Geolocation;
    const native = window.WeatherGPTLocation?.isNative === true || Boolean(window.Capacitor?.isNativePlatform?.());
    if (!native && !window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      throw new Error("Precise location is available only over HTTPS in a browser.");
    }
    if (!locationService?.getCurrentPosition && !navigator.geolocation) {
      throw new Error("This device does not provide a location service.");
    }
    if (native && locationService?.checkPermissions) {
      let permissions = await locationService.checkPermissions();
      if (permissions.location !== "granted" && permissions.coarseLocation !== "granted") {
        if (typeof locationService.requestPermissions !== "function") throw new Error("Location permission is not granted.");
        permissions = await locationService.requestPermissions();
      }
      if (permissions.location !== "granted" && permissions.coarseLocation !== "granted") {
        throw new Error("Location permission was denied.");
      }
    }
    const options = { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 };
    const position = locationService?.getCurrentPosition
      ? await locationService.getCurrentPosition(options)
      : await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
    if (!Number.isFinite(Number(position?.coords?.latitude)) || !Number.isFinite(Number(position?.coords?.longitude))) {
      throw new Error("The location service returned invalid coordinates.");
    }
    state.locationAccuracy = Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : null;
    state.location = normalizeLocation({
      name: "Current location",
      country: "GPS",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timezone: "auto",
      source: "gps",
      accuracy: position.coords.accuracy
    });
    renderCurrentLocationDetails();
    saveSignedInProfile();
    await loadWeather();
    setActiveTab("home");
    return true;
  } catch (error) {
    console.error("Unable to determine device location:", error);
    const message = explainLocationError(error);
    setText("location-accuracy", message);
    if (state.currentTab === "home") setText("current-location-source", message);
    showToast(message);
    return false;
  } finally {
    buttons.forEach((button, index) => { button.disabled = false; button.textContent = originalLabels[index]; });
  }
}

async function enableNotifications() {
  try {
    const native = window.Capacitor?.Plugins?.LocalNotifications;
    const result = native ? await native.requestPermissions() :
      "Notification" in window ? await Notification.requestPermission() : "denied";
    const granted = typeof result === "string" ? result === "granted" : result.display === "granted";
    if (!granted) {
      showToast("Notifications are disabled. Allow notifications in your device settings.");
      return;
    }
    state.notificationsEnabled = true;
    storeValue("wg-notifications-enabled", true);
    showToast("Local weather notifications enabled on this device.");
    if (state.weather && !state.weatherStale && (typeof navigator === "undefined" || navigator.onLine !== false)) checkNotificationRules(state.weather.current, state.weather.daily);
  } catch (error) {
    console.error("Unable to request notification permission:", error);
    showToast("Notification permission could not be requested.");
  }
}

const emailPreferenceIds = {
  rain: "email-rain-alert",
  storm: "email-storm-alert",
  wind: "email-wind-alert",
  heat: "email-heat-alert",
  cold: "email-cold-alert"
};

function selectedEmailCategories() {
  return Object.fromEntries(Object.entries(emailPreferenceIds).map(([category, id]) => [category, $(id).checked]));
}

function showEmailStatus(message, isError = false) {
  const element = $("email-alert-status");
  element.textContent = message;
  element.classList.toggle("error", isError);
}

async function handleEmailAuthState(user) {
  const requestId = ++state.emailPreferenceRequestId;
  const previousUid = state.emailUser?.uid;
  if (user?.uid !== previousUid) {
    state.conversationId = createConversationId();
    state.conversationMessages = [];
    storeValue("wg-conversation-id", state.conversationId);
    storeValue("wg-conversation-messages", []);
    $("chat-messages").replaceChildren();
  }
  state.emailUser = user;
  const configured = window.WeatherGPTFirebase?.configured === true;
  const isGuest = user?.isAnonymous === true;
  const isGoogleUser = user?.providerData.some((provider) => provider.providerId === "google.com") === true;
  $("google-sign-in").disabled = !configured || Boolean(user);
  $("google-sign-in").hidden = Boolean(user);
  $("google-sign-out").hidden = !isGoogleUser;
  $("email-account-address").textContent = user?.email || "";
  $("guest-sign-in").disabled = !configured || Boolean(user);
  $("guest-sign-in").hidden = Boolean(user);
  $("email-register").disabled = !configured || Boolean(user && !isGuest);
  $("email-register").textContent = isGuest ? "Upgrade guest account & verify email" : "Create account & verify email";
  $("email-sign-in").disabled = !configured || Boolean(user && !isGuest);
  $("email-reset").disabled = !configured;
  $("account-sign-out").hidden = !user;
  $("account-delete").hidden = !user || isGuest;
  $("email-verify-resend").hidden = !user || isGuest || user.emailVerified;
  $("email-verify-refresh").hidden = !user || isGuest || user.emailVerified;
  $("email-alert-controls").hidden = !user?.emailVerified || !isGoogleUser;
  $("account-name").value = user?.displayName || "";
  $("account-email").value = user?.email || "";
  $("account-heading").textContent = isGuest
    ? "Guest account"
    : user
      ? user.emailVerified
        ? `Signed in as ${user.displayName || user.email}`
        : "Verify your email to enable cloud sync"
      : "Sign in or continue as guest";
  setText("account-status", !configured
    ? "Firebase account services are not configured yet."
    : isGuest
      ? "Guest account active. Profile and chats sync to this device's private Firebase account. Upgrade with email/password to keep your data across devices; the AI gateway requires a verified email account."
      : user
        ? user.emailVerified
          ? "Your account is verified. Profile, chat sync and AI access are available."
          : "Check your inbox for a verification link before using cloud sync and the AI gateway."
        : "Sign in to sync your profile and conversations, or continue as a guest.");
  if (!user) {
    state.emailPreferences = null;
    state.emailLocation = null;
    Object.values(emailPreferenceIds).forEach((id) => { $(id).checked = false; });
    $("email-alert-consent").checked = false;
    setText("email-account-status", configured ? "Not signed in. Google sign-in is required to enable email alerts." : "Firebase project setup required before Google sign-in can be used.");
    showEmailStatus(configured ? "Email alerts are off until you sign in and opt in." : "Email notifications are not configured yet.");
    state.conversations = [];
    await loadConversationList();
    await loadAiModels();
    return;
  }
  if (!isGuest && !user.emailVerified) {
    state.emailPreferences = null;
    setText("email-account-status", "Verify your email before enabling email alerts.");
    state.conversations = [];
    await loadConversationList();
    await loadAiModels();
    return;
  }
  setText("email-account-status", isGuest
    ? "Guest account connected. Sign in with Google to enable email alerts."
    : isGoogleUser
      ? "Google account connected · verified email"
      : "Verified account connected. Google sign-in is required for forecast email alerts.");
  setText("email-alert-location", `${state.location.name} · ${state.location.latitude.toFixed(3)}, ${state.location.longitude.toFixed(3)}`);
  try {
    if (isGoogleUser) {
      const preferences = await window.WeatherGPTFirebase.loadEmailPreferences();
      if (requestId !== state.emailPreferenceRequestId || state.emailUser?.uid !== user.uid) return;
      state.emailPreferences = preferences;
      Object.entries(emailPreferenceIds).forEach(([category, id]) => {
        $(id).checked = preferences?.categories?.[category] === true;
      });
      $("email-alert-consent").checked = preferences?.enabled === true;
      if (preferences?.enabled) {
        const previous = preferences.location;
        state.emailLocation = previous ? { latitude: previous.latitude, longitude: previous.longitude } : null;
        showEmailStatus("Email alerts are enabled for this verified account. Forecast guidance is not an official warning.");
      } else {
        state.emailLocation = null;
        showEmailStatus("Choose alert types, tick the consent box, then save to enable emails.");
      }
      updateEmailLocationIfSubscribed();
    }
    const profile = await window.WeatherGPTFirebase.loadProfile();
    if (requestId !== state.emailPreferenceRequestId || state.emailUser?.uid !== user.uid) return;
    if (profile) {
      $("account-name").value = profile.displayName || user.displayName || "";
      state.loadingProfile = true;
      if (profile.preferredLanguage && translations[profile.preferredLanguage]) setLanguage(profile.preferredLanguage);
      if (profile.temperatureUnit === "fahrenheit" || profile.temperatureUnit === "celsius") setTemperatureUnit(profile.temperatureUnit);
      if (profile.defaultLocation && Number.isFinite(profile.defaultLocation.latitude) && Number.isFinite(profile.defaultLocation.longitude)) {
        const samePlace = Math.abs(state.location.latitude - profile.defaultLocation.latitude) < 0.00001 && Math.abs(state.location.longitude - profile.defaultLocation.longitude) < 0.00001;
        state.location = normalizeLocation({
          ...profile.defaultLocation,
          country: samePlace ? state.location.country : profile.defaultLocation.country || "",
          source: samePlace ? state.location.source : "profile",
          ...(samePlace && Number.isFinite(Number(state.location.accuracy)) ? { accuracy: state.location.accuracy } : {})
        });
        storeValue("wg-current-location", state.location);
      }
      state.voiceResponses = profile.voiceResponses === true;
      $("voice-responses").checked = state.voiceResponses;
      state.loadingProfile = false;
      await loadWeather();
    }
    await Promise.all([loadConversationList(), loadAiModels()]);
  } catch (error) {
    if (requestId !== state.emailPreferenceRequestId) return;
    console.error("Unable to load Firebase email preferences:", error);
    showEmailStatus(error instanceof Error ? `Could not load email settings: ${error.message}` : "Could not load email settings.", true);
  }
}

function authErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "An account already uses this email. Try signing in or resetting its password.",
    "auth/credential-already-in-use": "This email already has an account. Sign out of guest mode and sign in to that account; guest data is not merged automatically.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Authentication settings.",
    "auth/too-many-requests": "Too many attempts. Wait a while and try again.",
    "auth/network-request-failed": "The account service could not connect. Check your network.",
    "auth/requires-recent-login": "For security, sign in again before deleting your account.",
    "auth/user-not-found": "No account could be signed in with those credentials.",
    "auth/wrong-password": "The email or password is incorrect."
  };
  return messages[error?.code] || "The account request could not be completed. Check your details and try again.";
}

async function registerEmailAccount() {
  const firebase = window.WeatherGPTFirebase;
  const email = $("account-email").value.trim();
  const password = $("account-password").value;
  const upgradingGuest = state.emailUser?.isAnonymous === true;
  if (!email || password.length < 8) {
    setText("account-status", "Enter a valid email and a password with at least 8 characters.");
    return;
  }
  $("email-register").disabled = true;
  try {
    await firebase.registerWithEmail(email, password, $("account-name").value);
    setText("account-status", upgradingGuest
      ? "Guest account upgraded. Your cloud data stays with this account. Verify your email to resume cloud sync and use the AI gateway."
      : "Account created. Check your inbox for the verification link before using cloud sync.");
  } catch (error) {
    console.error("Email account registration failed:", error);
    setText("account-status", authErrorMessage(error));
  } finally {
    $("email-register").disabled = Boolean(state.emailUser && !state.emailUser.isAnonymous);
  }
}

async function signInEmailAccount() {
  const firebase = window.WeatherGPTFirebase;
  if (state.emailUser?.isAnonymous && !window.confirm("Signing in to an existing account switches away from this guest account. Its cloud data will not be merged. Continue?")) return;
  $("email-sign-in").disabled = true;
  try {
    await firebase.signInWithEmail($("account-email").value.trim(), $("account-password").value);
    setText("account-status", "Signed in. Verify your email to enable cloud sync and the AI gateway.");
  } catch (error) {
    console.error("Email sign-in failed:", error);
    setText("account-status", authErrorMessage(error));
  } finally {
    $("email-sign-in").disabled = Boolean(state.emailUser && !state.emailUser.isAnonymous);
  }
}

async function continueAsGuest() {
  const button = $("guest-sign-in");
  button.disabled = true;
  setText("account-status", "Creating a private guest account…");
  try {
    await window.WeatherGPTFirebase.continueAsGuest();
  } catch (error) {
    console.error("Guest account creation failed:", error);
    setText("account-status", authErrorMessage(error));
    button.disabled = !window.WeatherGPTFirebase?.configured;
  }
}

async function signOutCurrentAccount() {
  if (!state.emailUser) return;
  if (state.emailUser.isAnonymous && !window.confirm("Signing out makes this temporary guest account and its cloud data inaccessible. Create an email account first to keep your data. Continue?")) return;
  if (state.emailUser.providerData.some((provider) => provider.providerId === "google.com")) {
    await signOutFromEmailAlerts();
    return;
  }
  const button = $("account-sign-out");
  button.disabled = true;
  try {
    await window.WeatherGPTFirebase.signOut();
  } catch (error) {
    console.error("Account sign-out failed:", error);
    setText("account-status", error instanceof Error ? `Sign-out failed: ${error.message}` : "Sign-out failed.");
  } finally {
    button.disabled = false;
  }
}

async function resetEmailPassword() {
  const email = $("account-email").value.trim();
  if (!email) {
    setText("account-status", "Enter the email address for the password-reset request.");
    return;
  }
  $("email-reset").disabled = true;
  try {
    await window.WeatherGPTFirebase.sendPasswordReset(email);
    setText("account-status", "If an account can receive password-reset email, instructions will arrive shortly.");
  } catch (error) {
    console.error("Password reset request failed:", error);
    setText("account-status", "The reset request could not be completed. Check the email and try again later.");
  } finally {
    $("email-reset").disabled = false;
  }
}

async function deleteCurrentAccount() {
  if (!state.emailUser || !window.confirm("Permanently delete your Firebase account, profile and saved conversations? This cannot be undone.")) return;
  try {
    await window.WeatherGPTFirebase.deleteAccount($("account-password").value);
    setText("account-status", "Your account and cloud data were deleted.");
    $("account-password").value = "";
    for (const key of ["wg-local-conversations", "wg-conversation-messages", "wg-conversation-id", "wg-locations"]) {
      localStorage.removeItem(key);
    }
    state.savedLocations = [];
    state.conversations = [];
    state.conversationMessages = [];
    $("chat-messages").replaceChildren();
    renderSavedLocations();
  } catch (error) {
    console.error("Account deletion failed:", error);
    setText("account-status", authErrorMessage(error));
  }
}

async function refreshEmailVerification() {
  try {
    await window.WeatherGPTFirebase.refreshAuthUser();
    await handleEmailAuthState(window.WeatherGPTFirebase.getSignedInUser());
  } catch (error) {
    console.error("Email verification refresh failed:", error);
    setText("account-status", "Could not refresh account status. Check your connection and try again.");
  }
}

async function resendEmailVerification() {
  try {
    await window.WeatherGPTFirebase.resendVerificationEmail();
    setText("account-status", "A verification link has been sent. Check your inbox and spam folder.");
  } catch (error) {
    console.error("Verification email could not be resent:", error);
    setText("account-status", authErrorMessage(error));
  }
}

async function initializeFirebaseEmail() {
  const firebase = window.WeatherGPTFirebase;
  if (!firebase) {
    $("google-sign-in").disabled = true;
    $("guest-sign-in").disabled = true;
    $("email-register").disabled = true;
    $("email-sign-in").disabled = true;
    $("email-reset").disabled = true;
    setText("email-account-status", "Firebase sign-in is unavailable in this build.");
    return;
  }
  if (!firebase.configured) {
    $("google-sign-in").disabled = true;
    $("guest-sign-in").disabled = true;
    $("email-register").disabled = true;
    $("email-sign-in").disabled = true;
    $("email-reset").disabled = true;
    setText("email-account-status", "Firebase project setup required before Google sign-in can be used.");
    showEmailStatus("Add your Firebase web app configuration, enable Google Authentication, and add Android SHA-1 fingerprints.");
    await loadConversationList();
    await loadAiModels();
    return;
  }
  $("google-sign-in").disabled = true;
  $("guest-sign-in").disabled = false;
  $("email-register").disabled = Boolean(state.emailUser && !state.emailUser.isAnonymous);
  $("email-sign-in").disabled = Boolean(state.emailUser && !state.emailUser.isAnonymous);
  $("email-reset").disabled = false;
  setText("email-account-status", "Connecting to Firebase Authentication…");
  try {
    await firebase.initialize(handleEmailAuthState);
    $("google-sign-in").disabled = Boolean(state.emailUser);
  } catch (error) {
    console.error("Firebase Authentication initialization failed:", error);
    $("google-sign-in").disabled = true;
    $("guest-sign-in").disabled = true;
    $("email-register").disabled = true;
    $("email-sign-in").disabled = true;
    $("email-reset").disabled = true;
    setText("email-account-status", error instanceof Error ? `Firebase setup error: ${error.message}` : "Firebase setup failed.");
    showEmailStatus("Google sign-in could not be initialized. Check the Firebase project configuration and Android setup.", true);
  }
}

async function saveEmailAlertPreferences() {
  const user = state.emailUser;
  const button = $("save-email-alerts");
  if (!user || !user.emailVerified) {
    showEmailStatus("Sign in with a verified Google account before saving email alerts.", true);
    return;
  }
  if (!state.weather) {
    showEmailStatus("Wait for the forecast for your selected location to load before saving email preferences.", true);
    return;
  }
  const categories = selectedEmailCategories();
  const consent = $("email-alert-consent").checked;
  if (consent && !Object.values(categories).some(Boolean)) {
    showEmailStatus("Select at least one available email alert type or leave email consent off.", true);
    return;
  }
  button.disabled = true;
  button.textContent = "Saving email preferences…";
  try {
    const result = await window.WeatherGPTFirebase.saveEmailPreferences({ consent, categories, location: state.location });
    state.emailPreferences = { enabled: result.enabled, categories, location: { ...state.location } };
    state.emailLocation = result.enabled ? { latitude: state.location.latitude, longitude: state.location.longitude } : null;
    showEmailStatus(result.enabled
      ? `Forecast email alerts enabled for ${result.email}. You can disable them here at any time.`
      : "Email alerts are off. Your preferences were saved.");
  } catch (error) {
    console.error("Unable to save Firebase email preferences:", error);
    showEmailStatus(error instanceof Error ? `Could not save email preferences: ${error.message}` : "Could not save email preferences.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Save email alert preferences";
  }
}

function updateEmailLocationIfSubscribed() {
  const user = state.emailUser;
  const previous = state.emailLocation;
  if (!user?.emailVerified || !state.emailPreferences?.enabled || !state.weather || state.emailLocationUpdatePending) return;
  if (previous?.latitude === state.location.latitude && previous?.longitude === state.location.longitude) return;
  state.emailLocationUpdatePending = true;
  setText("email-alert-location", `${state.location.name} · ${state.location.latitude.toFixed(3)}, ${state.location.longitude.toFixed(3)}`);
  window.WeatherGPTFirebase.saveEmailPreferences({
    consent: true,
    categories: state.emailPreferences.categories,
    location: state.location
  }).then(() => {
    state.emailPreferences = { ...state.emailPreferences, location: { ...state.location } };
    state.emailLocation = { latitude: state.location.latitude, longitude: state.location.longitude };
    showEmailStatus(`Saved forecast email location: ${state.location.name}.`);
  }).catch((error) => {
    console.error("Unable to update the subscribed forecast location:", error);
    showEmailStatus(error instanceof Error ? `Email location was not updated: ${error.message}` : "Email location was not updated.", true);
  }).finally(() => {
    state.emailLocationUpdatePending = false;
  });
}

async function signOutFromEmailAlerts() {
  const user = state.emailUser;
  if (!user) return;
  const button = $("google-sign-out");
  button.disabled = true;
  try {
    if (state.emailPreferences?.enabled) {
      await window.WeatherGPTFirebase.saveEmailPreferences({
        consent: false,
        categories: selectedEmailCategories(),
        location: state.location
      });
    }
    await window.WeatherGPTFirebase.signOut();
  } catch (error) {
    console.error("Unable to safely sign out of Google email alerts:", error);
    showEmailStatus(error instanceof Error ? `Sign-out failed: ${error.message}` : "Sign-out failed.", true);
  } finally {
    button.disabled = false;
  }
}

function setTemperatureUnit(unit) {
  state.units = unit === "fahrenheit" ? "fahrenheit" : "celsius";
  storeValue("wg-units", state.units);
  if (state.weather) renderWeather(state.weather);
  saveSignedInProfile();
}

function setWeatherRole(role) {
  state.role = role;
  storeValue("wg-role", role);
  if (state.weather) updateAgriculturePanel(state.weather.current, state.weather.daily);
  setMode(state.role === "farmer" ? "farm" : state.role === "fisher" ? "marine" : "general");
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  const summary = state.weather?.current;
  if (mode === "farm" && summary) {
    const rain = state.weather.daily.precipitation_probability_max?.[0] ?? 0;
    $("mode-insight-title").textContent = `Farm weather · ${state.location.name}`;
    $("mode-insight-copy").textContent = rain >= 50 ? `${rain}% chance of rain today. Check soil moisture before irrigation; postpone spraying if conditions are wet or windy. Always follow the product label and your local agricultural extension advice.` : `Rain chance today is ${rain}%. Check soil moisture, crop stage and local advice before irrigation; verify spray conditions and product labels. This is not professional agronomic advice.`;
  } else if (mode === "aviation" && summary) {
    $("mode-insight-title").textContent = `Surface conditions · ${state.location.name}`;
    $("mode-insight-copy").textContent = `Visibility ${Number(summary.visibility / 1000).toFixed(1)} km · wind ${Math.round(summary.wind_speed_10m)} km/h · pressure ${Math.round(summary.pressure_msl)} hPa. METAR/TAF, NOTAMs and official aviation warnings are not connected.`;
  } else if (mode === "marine") {
    loadMarineWeather();
  } else if (summary) {
    $("mode-insight-title").textContent = `Live conditions · ${state.location.name}`;
    $("mode-insight-copy").textContent = `${displayTemperature(summary.temperature_2m)}°${state.units === "fahrenheit" ? "F" : "C"}, ${getCondition(summary.weather_code).text}; rain chance ${state.weather.daily.precipitation_probability_max?.[0] ?? 0}%. Forecast guidance, not an official warning.`;
  }
}

async function compareSavedLocations() {
  const locations = state.savedLocations.slice(0, 3);
  const output = $("locations-compare");
  output.replaceChildren();
  if (locations.length < 2) {
    output.textContent = "Save at least two locations to compare their current weather.";
    return;
  }
  const button = $("compare-saved-locations");
  button.disabled = true;
  button.textContent = "Loading comparisons…";
  try {
    const results = await Promise.all(locations.map(async (place) => {
      const params = new URLSearchParams({
        latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || "auto",
        current: "temperature_2m,weather_code", daily: "precipitation_probability_max", forecast_days: "1"
      });
      const response = await fetch(`${API}?${params}`);
      if (!response.ok) throw new Error(`Weather service returned ${response.status} for ${place.name}`);
      const data = await response.json();
      if (!data.current || !data.daily) throw new Error(`Incomplete comparison weather for ${place.name}`);
      return { place, temperature: displayTemperature(data.current.temperature_2m), condition: getCondition(data.current.weather_code).text, rain: data.daily.precipitation_probability_max?.[0] ?? 0 };
    }));
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const card = document.createElement("article");
      card.className = "comparison-card";
      const city = document.createElement("strong");
      city.textContent = result.place.name;
      const country = document.createElement("small");
      country.textContent = result.place.country;
      const temperature = document.createElement("span");
      temperature.className = "comparison-temperature";
      temperature.textContent = `${result.temperature}°${state.units === "fahrenheit" ? "F" : "C"}`;
      const conditions = document.createElement("p");
      conditions.textContent = `${result.condition} · ${result.rain}% rain chance`;
      const source = document.createElement("small");
      source.textContent = "Live model forecast · Open-Meteo";
      card.append(city, country, temperature, conditions, source);
      fragment.append(card);
    });
    output.append(fragment);
  } catch (error) {
    console.error("Weather comparison failed:", error);
    output.textContent = error instanceof Error ? error.message : "Weather comparison is unavailable.";
    showToast("Could not compare the saved locations.");
  } finally {
    button.disabled = false;
    button.textContent = "Compare saved places";
  }
}

/* ---------- Home: extra vitals, briefing, activity planner ---------- */

function renderExtraVitals(data) {
  const core = window.WeatherGPTAgentCore;
  if (!core) return;
  const current = data.current;
  setText("dew-point", core.isNum(current.dew_point_2m) ? core.fmtTemp(current.dew_point_2m, state.units) : "--");
  setText("wind-gust", core.isNum(current.wind_gusts_10m) ? `${Math.round(current.wind_gusts_10m)} km/h` : "-- km/h");
  setText("cloud-cover", core.isNum(current.cloud_cover) ? `${Math.round(current.cloud_cover)}%` : "--%");
  const rain = core.rainNext24(data);
  setText("rain-24h", core.isNum(rain.totalMm) ? `${rain.totalMm} mm` : "-- mm");
  setText("comfort-level", core.comfortLabel(current.apparent_temperature, current.dew_point_2m));
  const burn = current.is_day === 0 ? null : core.uvBurnMinutes(current.uv_index);
  setText("uv-burn", current.is_day === 0 ? "Night · none" : burn ? `~${burn} min` : "Low risk");
}

function applyNowcast(data) {
  const core = window.WeatherGPTAgentCore;
  const nowcast = core?.nowcast(data);
  if (!nowcast || nowcast.state === "dry") return;
  const element = $("rain-countdown");
  element.textContent = `${nowcast.text} · 15-minute model nowcast, not radar. ${element.textContent}`;
}

function renderBriefing() {
  const core = window.WeatherGPTAgentCore;
  const grid = $("briefing-grid");
  if (!core || !state.weather || !grid) return;
  const items = core.buildBriefing(state.weather, state.air, { units: state.units });
  state.briefing = items;
  grid.replaceChildren(...items.map((item) => {
    const card = document.createElement("article");
    card.className = `briefing-item tone-${item.tone}`;
    const icon = document.createElement("span");
    icon.className = "briefing-icon";
    icon.textContent = item.icon;
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = item.text;
    copy.append(title, text);
    card.append(icon, copy);
    return card;
  }));
}

async function shareBriefing() {
  if (!state.briefing?.length) { showToast("The briefing is still loading."); return; }
  const text = `WeatherGPT · ${state.location.name}\n${state.briefing.map((item) => `${item.icon} ${item.title}: ${item.text}`).join("\n")}\n\nForecast guidance from Open-Meteo — not an official warning.`;
  try {
    if (navigator.share) { await navigator.share({ title: `Weather briefing · ${state.location.name}`, text }); return; }
    await navigator.clipboard.writeText(text);
    showToast("Briefing copied to the clipboard.");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("Sharing is not available here. Long-press the briefing to copy it.");
  }
}

function refreshActivityDays() {
  const select = $("activity-day");
  const days = state.weather?.daily?.time;
  if (!days?.length) return;
  const previous = select.value || "0";
  select.replaceChildren(...days.slice(0, 7).map((date, index) => new Option(index === 0 ? "Today" : index === 1 ? "Tomorrow" : `${window.WeatherGPTAgentCore.weekdayOf(date)}`, String(index))));
  select.value = [...select.options].some((option) => option.value === previous) ? previous : "0";
}

function renderActivityPlanner() {
  const core = window.WeatherGPTAgentCore;
  if (!core || !state.weather) return;
  refreshActivityDays();
  const id = $("activity-select").value;
  const profile = core.ACTIVITIES[id];
  const dayOffset = Number($("activity-day").value) || 0;
  const rating = core.rateActivity(state.weather, id, { dayOffset, aqi: state.air?.us_aqi ?? null });
  const summary = $("activity-summary");
  const bars = $("activity-bars");
  if (!rating || !profile) {
    summary.textContent = "No forecast hours are left for this day. Pick tomorrow.";
    bars.replaceChildren();
    return;
  }
  const hours = core.relevantHours(id, rating.hours);
  const tone = rating.best.score >= 65 ? "good" : rating.best.score >= 45 ? "fair" : "poor";
  const badge = document.createElement("span");
  badge.className = `activity-score tone-${tone}`;
  badge.textContent = String(rating.best.score);
  const copy = document.createElement("div");
  const headline = document.createElement("strong");
  headline.textContent = `${profile.icon} ${rating.verdict} for ${profile.label.toLowerCase()} · ${core.hourLabel(rating.best.start)}–${core.hourLabel(rating.best.end)}`;
  const detail = document.createElement("p");
  const worst = hours.reduce((low, hour) => (hour.score < low.score ? hour : low), hours[0]);
  detail.textContent = `${dayOffset === 0 ? "Right now" : "First hour"}: ${dayOffset === 0 ? rating.scoreNow : hours[0].score}/100. ${worst.score < 45 ? `Least suitable around ${core.hourLabel(worst.time)} (${worst.score}/100).` : "No poor hours in this window."}${state.air?.us_aqi > 100 && dayOffset === 0 ? ` Air quality (AQI ${Math.round(state.air.us_aqi)}) lowers outdoor scores.` : ""}`;
  copy.append(headline, detail);
  summary.replaceChildren(badge, copy);
  bars.replaceChildren(...hours.map((hour) => {
    const bar = document.createElement("div");
    const isBest = hour.time >= rating.best.start && hour.time < rating.best.end;
    bar.className = `activity-bar ${hour.score >= 65 ? "good" : hour.score >= 45 ? "fair" : "poor"}${isBest ? " best" : ""}`;
    bar.title = `${core.hourLabel(hour.time)} · ${hour.score}/100 · ${core.fmtTemp(hour.temperature, state.units)} · ${hour.rainProbability ?? 0}% rain`;
    const fill = document.createElement("i");
    fill.style.height = `${Math.max(6, hour.score)}%`;
    const label = document.createElement("span");
    const hourNumber = Number(hour.time.slice(11, 13));
    label.textContent = hourNumber % 3 === 0 ? core.hourLabel(hour.time).replace(":00", "").replace(" ", "").toLowerCase().replace("am", "a").replace("pm", "p") : "";
    bar.append(fill, label);
    return bar;
  }));
}

/* ---------- Agent chat: rich text, tool trace, progress ---------- */

function getLocalAgent() {
  if (!state.localAgent && window.WeatherGPTLocalAgent && window.WeatherGPTAgentCore) {
    state.localAgent = window.WeatherGPTLocalAgent.createLocalAgent({ fetchImpl: (...args) => window.fetch(...args) });
  }
  return state.localAgent;
}

function appendInline(parent, text) {
  for (const part of String(text).split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      parent.append(strong);
    } else parent.append(document.createTextNode(part));
  }
}

function renderRichText(container, text) {
  let list = null;
  let code = null;
  for (const line of String(text).replace(/\r/g, "").split("\n")) {
    if (line.trim().startsWith("```")) {
      if (code) { container.append(code); code = null; } else { code = document.createElement("pre"); code.className = "chat-code"; }
      list = null;
      continue;
    }
    if (code) { code.textContent += `${code.textContent ? "\n" : ""}${line}`; continue; }
    const bullet = /^\s*[•\-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!list) { list = document.createElement("ul"); container.append(list); }
      const item = document.createElement("li");
      appendInline(item, bullet[1]);
      list.append(item);
      continue;
    }
    list = null;
    if (!line.trim()) continue;
    const paragraph = document.createElement("p");
    appendInline(paragraph, line);
    container.append(paragraph);
  }
  if (code) container.append(code);
}

function plainSpeechText(text) {
  const lines = [];
  let inCode = false;
  for (const line of String(text).split(/\r?\n/)) {
    if (line.trim().startsWith("```")) { inCode = !inCode; continue; }
    if (!inCode) lines.push(line.replace(/\*\*/g, "").replace(/^\s*[•\-*]\s+/, ""));
  }
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

function renderStepList(list, steps) {
  list.replaceChildren();
  for (const step of steps) {
    const item = document.createElement("li");
    item.className = `agent-step ${step.status}`;
    const icon = document.createElement("span");
    icon.className = "step-icon";
    icon.textContent = step.status === "error" ? "✕" : step.status === "running" ? "◌" : "✓";
    const body = document.createElement("span");
    body.className = "step-body";
    const label = document.createElement("strong");
    label.textContent = step.label || step.tool;
    body.append(label);
    if (step.args) body.append(document.createTextNode(` · ${step.args}`));
    if (step.summary) {
      const summary = document.createElement("small");
      summary.textContent = `${step.summary}${step.ms ? ` · ${step.ms} ms` : ""}`;
      body.append(summary);
    }
    item.append(icon, body);
    list.append(item);
  }
}

function buildTrace(steps, sourceLabel) {
  const toolSteps = (steps || []).filter((step) => step.tool !== "plan");
  if (!toolSteps.length) return null;
  const calls = toolSteps.filter((step) => step.tool !== "compute").length;
  const total = toolSteps.reduce((sum, step) => sum + (step.ms || 0), 0);
  const details = document.createElement("details");
  details.className = "agent-trace";
  const summary = document.createElement("summary");
  summary.textContent = `🛠 ${calls} tool ${calls === 1 ? "call" : "calls"}${total ? ` · ${(total / 1000).toFixed(1)} s` : ""}${sourceLabel ? ` · ${sourceLabel}` : ""} — show steps`;
  const list = document.createElement("ol");
  list.className = "agent-steps";
  renderStepList(list, steps);
  details.append(summary, list);
  return details;
}

function createAgentProgress(title) {
  const element = document.createElement("div");
  element.className = "chat-message assistant agent-progress";
  const heading = document.createElement("div");
  heading.className = "progress-title";
  const dots = document.createElement("span");
  dots.className = "typing-dots";
  dots.innerHTML = "<i></i><i></i><i></i>";
  const label = document.createElement("span");
  label.textContent = title;
  heading.append(dots, label);
  const list = document.createElement("ol");
  list.className = "agent-steps";
  element.append(heading, list);
  $("chat-messages").append(element);
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return {
    setTitle(text) { label.textContent = text; },
    update(steps) { renderStepList(list, steps); element.scrollIntoView({ block: "nearest" }); },
    remove() { element.remove(); }
  };
}

function switchToLocation(place) {
  state.location = normalizeLocation({ name: place.name, country: place.country || "", latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || "auto", source: "geocoded" });
  state.locationAccuracy = null;
  saveSignedInProfile();
  showToast(`Location set to ${place.name}.`);
  return loadWeather();
}

const assistantTabGuidance = {
  home: "Home shows current conditions, the hourly outlook, saved-place weather and the activity planner.",
  gpt: "The chat can answer weather questions, compare places and help with app controls.",
  map: "Map shows modelled weather by layer and optional observed rain radar when connected.",
  alerts: "Alerts shows forecast-based guidance and links to official sources; it is not an official warning feed.",
  climate: "Climate opens historical temperature and rainfall charts; history is not a forecast.",
  profile: "Profile contains language, units, account, saved places, notification and voice accessibility settings."
};

function recognizeAppAssistantCommand(question) {
  const q = String(question || "").trim().toLocaleLowerCase().replace(/[?.!,;:]+$/g, "");
  if (!q) return null;
  if (/^(?:help|what can you do|how do i use (?:this|the) app|help me use (?:this|the) app|how do i use voice|help with (?:this|the) app)$/i.test(q) || /^(?:मदद|सहायता|உதவி|సహాయం|সাহায্য)$/.test(q)) return { type: "help" };

  const tabCommand = /^(?:please\s+)?(?:open|show|go to|take me to|navigate to|switch to|launch)(?:\s+me)?\s+(.+)$/i.exec(q);
  if (tabCommand) {
    const target = tabCommand[1].replace(/^(?:my|the|this)\s+/, "");
    const tab = /\b(?:home|dashboard)\b/.test(target) ? "home"
      : /\b(?:assistant|chat|conversation|weathergpt|copilot)\b/.test(target) ? "gpt"
        : /\b(?:map|radar)\b/.test(target) ? "map"
          : /\b(?:alert|warning|advisory)\b/.test(target) ? "alerts"
            : /\b(?:climate|history|historical)\b/.test(target) ? "climate"
              : /\b(?:profile|settings|account|saved place|voice|notification)\b/.test(target) ? "profile" : null;
    if (tab) return { type: "navigate", tab };
  }
  if (/^(?:stop|pause|cancel)\s+(?:speaking|reading|voice|audio)$/.test(q)) return { type: "stop-speech" };
  if (/\b(?:turn off|disable|stop)\b.*\b(?:read answers aloud|voice responses|spoken replies)\b/.test(q)) return { type: "voice-off" };
  if (/\b(?:turn on|enable|start)\b.*\b(?:read answers aloud|voice responses|spoken replies)\b/.test(q) || /^(?:read answers aloud|speak your replies)$/.test(q)) return { type: "voice-on" };
  if (/\b(?:use|find|get|set|show|detect)\b.*\b(?:my|current|precise)\b.*\b(?:location|gps|coordinates)\b/.test(q) || /^(?:use gps|use my location)$/.test(q)) return { type: "gps" };
  if (/\b(?:save|add)\b.*\b(?:this place|current place|current location|my location)\b/.test(q) || /^(?:save this place|save current location)$/.test(q)) return { type: "save-place" };
  if (/\b(?:refresh|update|reload)\b.*\b(?:weather|forecast|conditions)\b/.test(q)) return { type: "refresh-weather" };
  if (/\b(?:how do i|how can i|where can i|where do i)\b.*\b(?:save|add)\b.*\b(?:place|location)\b/.test(q)) return { type: "help-save-place" };
  return null;
}

async function runAppAssistantCommand(command) {
  if (command.type === "help") {
    return {
      text: "I’m WeatherGPT, your in-app weather assistant. I can summarize your forecast, compare places, open app sections, refresh weather, save the selected place, request GPS when you ask, and read replies aloud. Saved settings, chats and the last forecast snapshot remain on this device offline; live weather, online AI, maps and place search need internet.",
      followUps: ["Plan my day", "Open profile settings", "Use my current location"]
    };
  }
  if (command.type === "navigate") {
    setActiveTab(command.tab);
    return { text: `Opening ${command.tab === "gpt" ? "the assistant" : command.tab}. ${assistantTabGuidance[command.tab]}` };
  }
  if (command.type === "help-save-place") {
    setActiveTab("profile");
    return { text: "I opened Profile → Saved places. Search for a city, district, village or coordinates, choose a result, then tap “Save this place”. If you want this device’s exact GPS point, use “Use my current location” and allow permission first." };
  }
  if (command.type === "gps") {
    const succeeded = await useCurrentLocation();
    return { text: succeeded
      ? `GPS location selected at ${formatLocationCoordinates(state.location)}. Device-reported accuracy: ${Number.isFinite(Number(state.location.accuracy)) ? `±${Math.round(state.location.accuracy)} m` : "not reported"}. The forecast is still model-grid data.`
      : "I couldn’t confirm a new GPS fix. Check location permission, or search for a place instead." };
  }
  if (command.type === "save-place") {
    const before = state.savedLocations.length;
    saveCurrentLocation();
    return { text: state.savedLocations.length > before
      ? `${state.location.name} is saved on this device at ${formatLocationCoordinates(state.location)}.`
      : `${state.location.name} is already in your saved places.` };
  }
  if (command.type === "refresh-weather") {
    await loadWeather();
    return { text: state.weather && !state.weatherStale
      ? `Weather refreshed for ${state.location.name}. ${$("data-updated").textContent}.`
      : state.weather
        ? `I couldn’t reach the live weather service, so I’m showing the last saved forecast for ${state.location.name}, updated ${formatAge(state.weatherUpdatedAt)}.`
        : "I couldn’t load a forecast. Connect to the internet and try again." };
  }
  if (command.type === "voice-on" || command.type === "voice-off") {
    state.voiceResponses = command.type === "voice-on";
    $("voice-responses").checked = state.voiceResponses;
    storeValue("wg-voice-responses", state.voiceResponses);
    saveSignedInProfile();
    return { text: state.voiceResponses ? "Read answers aloud is on. I’ll speak future replies using your selected device voice." : "Read answers aloud is off. You can still tap the speaker beside any answer to hear it." };
  }
  if (command.type === "stop-speech") {
    try {
      if (window.WeatherGPTSpeech?.isNative) await window.WeatherGPTSpeech.textToSpeech.stop();
      else if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch (error) { console.warn("Unable to stop assistant speech:", error); }
    return { text: "Speech stopped.", silent: true };
  }
  return null;
}

function askAgent(question) {
  setActiveTab("gpt");
  return sendQuestion(question);
}

function locationAliasSearch(text) {
  return locationAliases.find((entry) => entry.aliases.includes(text))?.search || null;
}

async function runLocalAgent(question, progress) {
  const agent = getLocalAgent();
  if (!agent || (state.language !== "en" && !/^[\x00-\x7F]+$/.test(question))) return null;
  return agent.run(question, {
    location: state.location, units: state.units, language: "en", mode: state.mode, crop: state.fieldCrop,
    cache: { weather: state.weather, air: state.air }, alias: locationAliasSearch,
    savedNames: state.savedLocations.map((place) => place.name)
  }, { onStep: (step, steps) => progress.update(steps) });
}

async function sendQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  const appCommand = recognizeAppAssistantCommand(cleanQuestion);
  const inputType = state.voiceQuestionPending ? "voice" : "text";
  addMessage(cleanQuestion, "user");
  const priorMessages = state.conversationMessages.slice(-10).map(({ role, content }) => ({ role, content: content.slice(0, 1900) }));
  await persistConversationMessage({ role: "user", content: cleanQuestion, inputType });
  state.voiceQuestionPending = false;
  $("chat-input").value = "";
  $("chat-input").disabled = true;
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const gatewayReady = Boolean(online && state.emailUser?.emailVerified && state.aiProviders.length && state.weather);
  const progress = createAgentProgress(appCommand ? "WeatherGPT is helping with the app…" : gatewayReady ? "AI agent is planning and calling live weather tools…" : "WeatherGPT is planning…");
  try {
    let reply;
    let replyMetadata = {};
    let extras = {};
    let gatewayFailed = false;
    if (appCommand) {
      const commandResult = await runAppAssistantCommand(appCommand);
      reply = commandResult?.text || "I couldn’t complete that app action.";
      extras = { followUps: commandResult?.followUps || [], silent: commandResult?.silent === true };
      replyMetadata = { provider: "local", model: "weathergpt-app-copilot" };
    } else if (gatewayReady) {
      const payload = {
        question: cleanQuestion, location: state.location, language: state.language, history: priorMessages,
        provider: "auto", model: "auto"
      };
      try {
        let result;
        try {
          result = await window.WeatherGPTFirebase.chatWithWeatherGPT({ ...payload, agent: true, units: state.units, mode: state.mode });
        } catch (error) {
          // A gateway deployed before the agent upgrade rejects the new fields; retry in classic mode.
          if (/unsupported fields/i.test(error?.message || "")) result = await window.WeatherGPTFirebase.chatWithWeatherGPT(payload);
          else throw error;
        }
        reply = result.answer;
        setText("assistant-mode-label", "AI READY");
        const steps = Array.isArray(result.agent?.steps) ? result.agent.steps : [];
        replyMetadata = { provider: String(result.provider).slice(0, 40), model: String(result.model).slice(0, 80) };
        extras = { steps, sourceLabel: `${result.provider} · ${result.model}` };
      } catch (error) {
        console.error("AI gateway request failed:", error);
        setText("assistant-mode-label", "LOCAL MODE");
        gatewayFailed = true;
      }
    }
    if (!reply) {
      try {
        progress.setTitle(state.weather && (state.weatherStale || !online)
          ? "WeatherGPT is answering from your saved forecast…"
          : "WeatherGPT is checking live weather…");
        const local = await runLocalAgent(cleanQuestion, progress);
        if (local?.handled) {
          const source = state.weather && (state.weatherStale || !online) ? "your saved forecast snapshot" : "live Open-Meteo tools";
          const fallbackNote = gatewayFailed ? `The AI service is temporarily unavailable, so the built-in agent answered from ${source}.\n\n` : "";
          const offlineNote = state.weather && (state.weatherStale || !online)
            ? `\n\nUsing a cached forecast updated ${formatAge(state.weatherUpdatedAt)} ago; reconnect to verify current conditions.` : "";
          reply = `${fallbackNote}${local.text}${offlineNote}`;
          replyMetadata = { provider: "local", model: local.steps?.some((step) => step.tool === "get_weather") && state.weatherStale ? "offline-weather-agent" : "local-agent" };
          extras = { steps: local.steps, sourceLabel: state.weatherStale || !online ? "saved forecast" : "built-in agent", followUps: local.followUps, switchTo: local.switchTo };
        }
      } catch (error) {
        console.error("Local agent failed:", error);
      }
    }
    if (!reply) {
      const alias = locationAliases.find((entry) => entry.aliases.some((name) => cleanQuestion.toLowerCase().includes(name)));
      const locationMatch = cleanQuestion.match(/\b(?:in|for|at|near)\s+([a-zA-Z][a-zA-Z .'-]{1,45}?)(?:\s+(?:today|tomorrow|this week|next week|this weekend|on the weekend))?[?.!,;:]*$/i);
      const matchedPlace = alias?.search || (locationMatch && !/^(?:today|tomorrow|week|forecast|rain|weather|climate)\b/i.test(locationMatch[1].trim()) ? locationMatch[1].trim() : null);
      if (!online && matchedPlace) {
        const selectedForecast = state.weather
          ? `The saved forecast is for ${state.location.name}, updated ${formatAge(state.weatherUpdatedAt)} ago.`
          : `There is no saved forecast for ${state.location.name}.`;
        reply = `I can’t look up ${matchedPlace} while offline, so I won’t substitute another place’s weather. ${selectedForecast} Reconnect to search and compare locations.`;
        replyMetadata = { provider: "local", model: "offline-app-help" };
        extras = { followUps: ["Will it rain today?", "Open saved places", "Refresh weather"] };
      } else {
        if (alias) await findLocation(alias.search);
        else if (matchedPlace) await findLocation(matchedPlace);
        const localReply = answerQuestion(cleanQuestion);
        replyMetadata = { provider: "local", model: "forecast-rules" };
        if (localReply === null) {
          const climateQuestion = /climate|histor|trend|last month|last year|previous year|\b(?:19|20)\d{2}\b|जलवायु|ऐतिहासिक|காலநிலை|આબોહવા|જલવાયુ/.test(cleanQuestion.toLowerCase());
          if (climateQuestion && !online) {
            reply = "Historical climate data needs an internet connection. I can still answer basic questions from the saved forecast snapshot on this device.";
          } else if (climateQuestion && /last year|previous year|last month|\b(?:19|20)\d{2}\b/.test(cleanQuestion.toLowerCase())) {
            reply = await answerClimateQuestion(cleanQuestion);
          } else if (climateQuestion) {
            setActiveTab("climate");
            await loadClimateHistory();
            reply = `I opened the historical climate charts for ${state.location.name}. They use Open-Meteo's historical archive; observations are not forecasts or an official climatological record.`;
          } else {
            reply = gatewayFailed
              ? "The online AI service is unavailable. I’m in WeatherGPT’s built-in mode, which is strongest at forecasts, weather guidance, and app help."
              : "I’m in WeatherGPT’s built-in weather-assistant mode, so I can’t answer that broader question reliably here. I can help with your forecast, weather planning, or app controls.";
            if (!online) reply += " Online AI and live place searches need an internet connection.";
            else if (state.aiProviders.length && !state.emailUser?.emailVerified) reply += " Sign in with a verified account to use the configured online AI assistant.";
          }
        } else {
          const localDisclaimer = gatewayFailed ? "The AI service is temporarily unavailable. Local forecast guidance: " : "";
          const offlineNote = state.weather && (state.weatherStale || !online)
            ? `\n\nUsing cached forecast data updated ${formatAge(state.weatherUpdatedAt)} ago; reconnect to verify current conditions.` : "";
          reply = `${localDisclaimer}${localReply}${offlineNote}`;
        }
        extras = { followUps: ["Plan my day", "Will it rain today?", "Best time to run tomorrow?"] };
      }
    }
    progress.remove();
    addMessage(reply, "assistant", false, extras);
    await persistConversationMessage({ role: "assistant", content: reply, ...replyMetadata });
  } catch (error) {
    progress.remove();
    console.error("Unable to answer weather question:", error);
    const fallback = state.weather
      ? "I couldn't complete that answer. Your live forecast remains available on the Home screen; please try again."
      : "Live weather data is temporarily unavailable. Please try again when a current forecast is available.";
    addMessage(fallback, "assistant", true);
    await persistConversationMessage({ role: "assistant", content: fallback, provider: "system", model: "error" });
  } finally {
    $("chat-input").disabled = false;
    $("chat-input").focus();
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(state.toastTimeout);
  state.toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3200);
}

async function promptForLocation() {
  $("location-search-results").replaceChildren();
  $("location-search-input").value = "";
  $("location-dialog").showModal();
  window.setTimeout(() => $("location-search-input").focus(), 50);
}

async function searchLocations(query) {
  const params = new URLSearchParams({ name: query, count: "8", language: state.language, format: "json" });
  try {
    const coordinates = query.match(/^\s*(?:lat(?:itude)?\s*[:=]\s*)?(-?\d+(?:\.\d+)?)\s*°?\s*([NS])?\s*[,;]\s*(?:lon(?:gitude)?\s*[:=]\s*)?(-?\d+(?:\.\d+)?)\s*°?\s*([EW])?\s*$/i);
    if (coordinates) {
      let latitude = Number(coordinates[1]);
      let longitude = Number(coordinates[3]);
      if (coordinates[2]) latitude = Math.abs(latitude) * (coordinates[2].toUpperCase() === "S" ? -1 : 1);
      if (coordinates[4]) longitude = Math.abs(longitude) * (coordinates[4].toUpperCase() === "W" ? -1 : 1);
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("Latitude must be between −90 and 90 and longitude between −180 and 180.");
      renderLocationResults([{ name: "Selected coordinates", country: "Manual coordinates", latitude, longitude, timezone: "auto", source: "coordinates" }]);
      return;
    }
    const response = await fetch(`${GEO_API}?${params}`);
    if (!response.ok) throw new Error(`Location service returned ${response.status}`);
    const data = await response.json();
    renderLocationResults(data.results || []);
  } catch (error) {
    console.error("Location search failed:", error);
    $("location-search-results").textContent = navigator.onLine === false
      ? "You’re offline. Connect to search for a new place, or open one of your saved locations."
      : `Location search failed: ${error instanceof Error ? error.message : "the service did not respond"}. Check your connection and try again.`;
  }
}

function setupVoice() {
  const native = window.Capacitor?.Plugins?.SpeechRecognition;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const buttons = [$("voice-button"), $("home-voice-button")].filter(Boolean);
  $("home-voice-button").addEventListener("click", () => {
    setActiveTab("gpt");
    startVoiceInput();
  });
  if (!native && !SpeechRecognition) {
    $("voice-button").addEventListener("click", () => showToast("Voice input is not supported on this device. Try typing your question."));
    setText("voice-status", "Voice input is not available on this device. You can type a weather question, and use Read answers aloud in Profile if supported.");
    return;
  }
  if (SpeechRecognition) {
    state.browserRecognition = new SpeechRecognition();
    state.browserRecognition.interimResults = false;
    state.browserRecognition.onstart = () => {
      buttons.forEach((button) => button.classList.add("listening"));
      setText("voice-status", `Listening in ${languageLocales[state.language] || "English"}… Speak your weather question now.`);
    };
    state.browserRecognition.onend = () => {
      buttons.forEach((button) => button.classList.remove("listening"));
      if (state.browserRecognition) $("voice-button").setAttribute("aria-pressed", "false");
    };
    state.browserRecognition.onerror = (event) => {
      buttons.forEach((button) => button.classList.remove("listening"));
      setText("voice-status", "Voice input stopped. Check microphone permission or network availability, then try again.");
      showToast(event.error === "not-allowed" ? "Microphone access was denied. Allow microphone access to use voice input." : "Voice input ended. Please try again.");
    };
    state.browserRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      state.voiceQuestionPending = true;
      setText("voice-status", `Heard: “${transcript}” · Getting the local forecast…`);
      sendQuestion(transcript);
    };
  }
  $("voice-button").addEventListener("click", startVoiceInput);
}

async function startVoiceInput() {
  const native = window.Capacitor?.Plugins?.SpeechRecognition;
  const button = $("voice-button");
  const language = `${languageLocales[state.language] || "en-IN"}`;
  try {
    if (native) {
      const availability = await native.available();
      if (!availability.available) throw new Error("Speech recognition is unavailable on this device.");
      const permissions = await native.checkPermissions();
      if (permissions.speechRecognition !== "granted") {
        const requested = await native.requestPermissions();
        if (requested.speechRecognition !== "granted") throw new Error("Microphone or speech recognition permission was denied.");
      }
      [button, $("home-voice-button")].filter(Boolean).forEach((item) => item.classList.add("listening"));
      button?.setAttribute("aria-pressed", "true");
      setText("voice-status", `Listening in ${language}… Speak your weather question now.`);
      const result = await native.start({ language, maxResults: 1, popup: true, partialResults: false, prompt: "Ask WeatherGPT" });
      [button, $("home-voice-button")].filter(Boolean).forEach((item) => item.classList.remove("listening"));
      button?.setAttribute("aria-pressed", "false");
      const transcript = result.matches?.[0]?.trim();
      if (transcript) {
        state.voiceQuestionPending = true;
        setText("voice-status", `Heard: “${transcript}” · Getting the local forecast…`);
        await sendQuestion(transcript);
      } else {
        setText("voice-status", "No speech was recognized. Try again in a quieter place or type your question.");
        showToast("No speech was recognized. Try again.");
      }
      return;
    }
    if (state.browserRecognition) {
      state.browserRecognition.lang = language;
      button?.setAttribute("aria-pressed", "true");
      state.browserRecognition.start();
    }
  } catch (error) {
    [button, $("home-voice-button")].filter(Boolean).forEach((item) => item.classList.remove("listening"));
    button?.setAttribute("aria-pressed", "false");
    console.error("Voice input could not start:", error);
    setText("voice-status", error instanceof Error ? error.message : "Voice input could not start.");
    showToast(error instanceof Error ? error.message : "Voice input could not start.");
  }
}

const weatherGPTTourSteps = [
  {
    icon: "🌦",
    title: "Your local forecast",
    copy: "Home shows current conditions, hourly and daily forecasts, air quality, and when the forecast was last refreshed. Tap “Use precise location” and allow location access when asked; coordinates and device-reported accuracy appear under the selected place."
  },
  {
    icon: "🧭",
    title: "Plan your day",
    copy: "Use the briefing and activity planner to compare weather windows for walks, travel, field work, and more. These are forecast-based suggestions, not safety guarantees."
  },
  {
    icon: "💬",
    title: "Talk with WeatherGPT",
    copy: "Ask a weather question in chat, type or use the microphone, or ask WeatherGPT to open an app section or explain a setting. Online AI answers need a configured service and eligible sign-in."
  },
  {
    icon: "🗺",
    title: "Explore the map and alerts",
    copy: "The map displays nearby model-grid values and optional rain-radar imagery. Alerts are WeatherGPT guidance, not official government warnings; follow local authorities for emergencies."
  },
  {
    icon: "⚙",
    title: "Make WeatherGPT yours",
    copy: "Profile contains saved places, units, voice language and installed device voices, notifications, and offline controls. On Android, use “Install device voice data” to add the selected built-in voice (including Tamil) in your device speech engine. Your latest forecast is cached on this device; live maps, GPS lookup, place search, and online AI need connectivity."
  }
];
let weatherGPTTourIndex = 0;

function renderWeatherGPTTourStep() {
  const step = weatherGPTTourSteps[weatherGPTTourIndex];
  const progress = $("tour-progress");
  setText("tour-step-count", `Step ${weatherGPTTourIndex + 1} of ${weatherGPTTourSteps.length}`);
  setText("tour-step-icon", step.icon);
  setText("tour-step-title", step.title);
  setText("tour-step-copy", step.copy);
  if (progress) {
    progress.max = weatherGPTTourSteps.length;
    progress.value = weatherGPTTourIndex + 1;
  }
  $("tour-back").disabled = weatherGPTTourIndex === 0;
  $("tour-next").textContent = weatherGPTTourIndex === weatherGPTTourSteps.length - 1 ? "Finish" : "Next";
}

function finishWeatherGPTTour() {
  storeValue("wg-tour-complete", true);
  const dialog = $("tour-dialog");
  if (dialog?.open) dialog.close();
}

function openWeatherGPTTour() {
  const dialog = $("tour-dialog");
  if (!dialog || dialog.open) return;
  weatherGPTTourIndex = 0;
  renderWeatherGPTTourStep();
  try {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  } catch (error) {
    console.warn("The WeatherGPT tour could not open as a modal:", error);
    dialog.setAttribute("open", "");
  }
}

function setupWeatherGPTTour() {
  $("start-tour").addEventListener("click", openWeatherGPTTour);
  $("tour-close").addEventListener("click", finishWeatherGPTTour);
  $("tour-skip").addEventListener("click", finishWeatherGPTTour);
  $("tour-back").addEventListener("click", () => {
    if (weatherGPTTourIndex > 0) weatherGPTTourIndex -= 1;
    renderWeatherGPTTourStep();
  });
  $("tour-next").addEventListener("click", () => {
    if (weatherGPTTourIndex === weatherGPTTourSteps.length - 1) {
      finishWeatherGPTTour();
      return;
    }
    weatherGPTTourIndex += 1;
    renderWeatherGPTTourStep();
  });
  $("tour-dialog").addEventListener("cancel", () => storeValue("wg-tour-complete", true));
  $("tour-dialog").addEventListener("close", () => storeValue("wg-tour-complete", true));
  if (readStorage("wg-tour-complete", false) !== true) window.setTimeout(openWeatherGPTTour, 700);
}

function startWeatherMonitoring() {
  const refreshIfDue = () => {
    if (document.visibilityState === "hidden" || navigator.onLine === false) return;
    if (Date.now() - state.lastWeatherAttemptAt >= 15 * 60 * 1000) void loadWeather();
  };
  window.addEventListener("online", () => {
    state.weatherStale = Boolean(state.weather);
    updateWeatherFreshness();
    if (!state.weather || state.weatherStale || Date.now() - state.lastWeatherAttemptAt >= 2 * 60 * 1000) void loadWeather();
  });
  window.addEventListener("offline", () => {
    if (state.weather) state.weatherStale = true;
    updateWeatherFreshness();
  });
  document.addEventListener("visibilitychange", () => {
    updateWeatherFreshness();
    if (document.visibilityState === "visible") refreshIfDue();
  });
  state.weatherMonitorTimer = window.setInterval(refreshIfDue, 60_000);
  state.freshnessTimer = window.setInterval(updateWeatherFreshness, 60_000);
}

function initialize() {
  if (!Array.isArray(state.savedLocations)) state.savedLocations = [];
  state.savedLocations = state.savedLocations
    .filter((location) => location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude)) && location.latitude !== "" && location.longitude !== "")
    .map((location) => normalizeLocation(location));
  state.location = normalizeLocation(state.location);
  if (state.voiceLanguage !== "auto" && !Object.hasOwn(translations, state.voiceLanguage)) state.voiceLanguage = "auto";
  if (!state.notifications || typeof state.notifications !== "object") state.notifications = { rain: false, storm: false, wind: false, heat: false, cold: false };
  if (!Object.hasOwn(mapLayerDefinitions, state.mapWeatherLayer)) state.mapWeatherLayer = "temperature";
  if (!["general", "rice", "millet", "cotton", "pulses", "vegetables", "other"].includes(state.fieldCrop)) state.fieldCrop = "general";
  if (!["land-preparation", "sowing", "growing", "flowering", "harvest"].includes(state.fieldStage)) state.fieldStage = "land-preparation";
  $("profile-role").value = state.role;
  $("profile-language").value = state.language;
  $("unit-select").value = state.units;
  $("field-crop").value = state.fieldCrop;
  $("field-stage").value = state.fieldStage;
  $("weather-layer-select").value = state.mapWeatherLayer;
  for (const category of ["rain", "storm", "wind", "heat", "cold"]) {
    $(`${category}-notifications`).checked = Boolean(state.notifications[category]);
  }
  $("voice-responses").checked = Boolean(state.voiceResponses);
  $("voice-language").value = state.voiceLanguage;
  $("voice-rate").value = String(Math.min(1.3, Math.max(0.7, Number(state.voiceRate) || 1)));
  $("voice-volume").value = String(Math.min(1, Math.max(0, Number(state.voiceVolume) || 0)));
  setLanguage(state.language);
  $("today-date").textContent = new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
  $("chat-form").addEventListener("submit", (event) => { event.preventDefault(); sendQuestion($("chat-input").value); });
  $("suggestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (button) sendQuestion(button.dataset.question);
  });
  $("language-select").addEventListener("change", (event) => setLanguage(event.target.value));
  $("profile-language").addEventListener("change", (event) => setLanguage(event.target.value));
  $("profile-role").addEventListener("change", (event) => setWeatherRole(event.target.value));
  $("unit-select").addEventListener("change", (event) => setTemperatureUnit(event.target.value));
  $("account-name").addEventListener("change", saveSignedInProfile);
  $("email-register").addEventListener("click", registerEmailAccount);
  $("email-sign-in").addEventListener("click", signInEmailAccount);
  $("email-reset").addEventListener("click", resetEmailPassword);
  $("guest-sign-in").addEventListener("click", continueAsGuest);
  $("email-verify-resend").addEventListener("click", resendEmailVerification);
  $("email-verify-refresh").addEventListener("click", refreshEmailVerification);
  $("account-sign-out").addEventListener("click", signOutCurrentAccount);
  $("account-delete").addEventListener("click", deleteCurrentAccount);
  $("chat-history-search").addEventListener("input", () => renderConversationList());
  $("voice-language").addEventListener("change", (event) => {
    state.voiceLanguage = translations[event.target.value] || event.target.value === "auto" ? event.target.value : "auto";
    state.voiceName = "auto";
    storeValue("wg-voice-language", state.voiceLanguage);
    storeValue("wg-voice-name", state.voiceName);
    refreshAvailableVoices();
  });
  $("voice-select").addEventListener("change", (event) => {
    state.voiceName = event.target.value;
    storeValue("wg-voice-name", state.voiceName);
  });
  $("voice-test").addEventListener("click", () => speakAnswer(getVoiceTestText()));
  $("voice-install").addEventListener("click", installDeviceVoiceData);
  $("voice-rate").addEventListener("input", (event) => {
    state.voiceRate = Number(event.target.value);
    storeValue("wg-voice-rate", state.voiceRate);
  });
  $("voice-volume").addEventListener("input", (event) => {
    state.voiceVolume = Number(event.target.value);
    storeValue("wg-voice-volume", state.voiceVolume);
  });
  $("field-crop").addEventListener("change", (event) => {
    state.fieldCrop = event.target.value;
    storeValue("wg-field-crop", state.fieldCrop);
    renderFieldAdvice();
  });
  $("field-stage").addEventListener("change", (event) => {
    state.fieldStage = event.target.value;
    storeValue("wg-field-stage", state.fieldStage);
    renderFieldAdvice();
  });
  $("open-field-planner").addEventListener("click", () => {
    setActiveTab("home");
    window.setTimeout(() => $("farmer-planner").scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  });
  $("activity-select").value = Object.hasOwn(window.WeatherGPTAgentCore?.ACTIVITIES || {}, state.activity) ? state.activity : "walking";
  $("activity-select").addEventListener("change", (event) => {
    state.activity = event.target.value;
    storeValue("wg-activity", state.activity);
    renderActivityPlanner();
  });
  $("activity-day").addEventListener("change", renderActivityPlanner);
  $("activity-ask").addEventListener("click", () => {
    const label = $("activity-select").selectedOptions[0]?.textContent.replace(/^\S+\s/, "").toLowerCase() || "go outside";
    const day = Number($("activity-day").value) || 0;
    const when = day === 0 ? "today" : day === 1 ? "tomorrow" : `on ${$("activity-day").selectedOptions[0].textContent}`;
    askAgent(`Best time for ${label} ${when}?`);
  });
  $("briefing-ask").addEventListener("click", () => askAgent("Plan my day"));
  $("briefing-share").addEventListener("click", shareBriefing);
  $("add-location").addEventListener("click", promptForLocation);
  $("edit-location").addEventListener("click", promptForLocation);
  $("saved-place").addEventListener("click", () => setActiveTab("profile"));
  $("profile-add-location").addEventListener("click", promptForLocation);
  $("save-current-location").addEventListener("click", saveCurrentLocation);
  $("compare-saved-locations").addEventListener("click", compareSavedLocations);
  $("use-my-location").addEventListener("click", () => useCurrentLocation());
  $("home-use-location").addEventListener("click", () => useCurrentLocation());
  $("clear-offline-cache").addEventListener("click", clearOfflineWeatherCache);
  $("enable-notifications").addEventListener("click", enableNotifications);
  $("voice-responses").addEventListener("change", (event) => {
    state.voiceResponses = event.target.checked;
    storeValue("wg-voice-responses", state.voiceResponses);
    saveSignedInProfile();
  });
  $("speech-stop").addEventListener("click", async () => {
    try {
      if (window.WeatherGPTSpeech?.isNative) await window.WeatherGPTSpeech.textToSpeech.stop();
      else if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setText("voice-device-status", "Speech stopped.");
    } catch (error) {
      console.error("Unable to stop text-to-speech:", error);
      showToast("Unable to stop speech. Please try again.");
    }
  });
  for (const category of ["rain", "storm", "wind", "heat", "cold"]) {
    $(`${category}-notifications`).addEventListener("change", (event) => {
      state.notifications[category] = event.target.checked;
      storeValue("wg-notifications", state.notifications);
      if (event.target.checked) showToast("Choose Enable on-device notifications to allow weather alerts on this device.");
    });
  }
  $("google-sign-in").addEventListener("click", async () => {
    if (state.emailUser?.isAnonymous && !window.confirm("Signing in with Google switches away from this guest account. Its cloud data will not be merged. Continue?")) return;
    const button = $("google-sign-in");
    button.disabled = true;
    setText("email-account-status", "Opening Google sign-in…");
    try {
      await window.WeatherGPTFirebase.signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setText("email-account-status", error instanceof Error ? `Google sign-in failed: ${error.message}` : "Google sign-in failed.");
      showEmailStatus("Sign-in was not completed. Check Google provider settings, Firebase config and Android SHA-1 fingerprints.", true);
    } finally {
      button.disabled = !window.WeatherGPTFirebase?.configured || Boolean(state.emailUser);
    }
  });
  $("google-sign-out").addEventListener("click", signOutFromEmailAlerts);
  $("save-email-alerts").addEventListener("click", saveEmailAlertPreferences);
  $("location-search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = $("location-search-input").value.trim();
    if (query.length >= 2) searchLocations(query);
  });
  $("close-location-search").addEventListener("click", () => $("location-dialog").close());
  $("location-dialog").addEventListener("click", (event) => {
    if (event.target === $("location-dialog")) $("location-dialog").close();
  });
  $("map-recenter").addEventListener("click", () => {
    if (state.map) state.map.setView([state.location.latitude, state.location.longitude], 9);
    else setActiveTab("map");
  });
  $("weather-layer-select").addEventListener("change", (event) => {
    state.mapWeatherLayer = event.target.value;
    clearWeatherMapMarkers();
    if (state.currentTab === "map") loadWeatherMapGrid();
  });
  $("map-radar-toggle").addEventListener("click", () => {
    const enabled = $("map-radar-toggle").getAttribute("aria-pressed") !== "true";
    toggleRadarLayer(enabled);
  });
  document.querySelectorAll("[data-tab-target]").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget)));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("forecast-range").addEventListener("click", () => {
    state.forecastDays = state.forecastDays > 7 ? 7 : 15;
    setText("forecast-heading", `${state.forecastDays}-day forecast`);
    $("forecast-range").textContent = state.forecastDays > 7 ? "View 7 days ↗" : "View 15 days ↗";
    if (state.weather) renderForecast(state.weather.daily);
  });
  $("new-chat").addEventListener("click", () => {
    state.conversationId = createConversationId();
    state.conversationMessages = [];
    storeValue("wg-conversation-id", state.conversationId);
    storeValue("wg-conversation-messages", []);
    $("chat-messages").replaceChildren();
    $("chat-input").focus();
  });
  if (Array.isArray(state.conversationMessages)) {
    state.conversationMessages.forEach((message) => {
      if (["user", "assistant"].includes(message.role) && typeof message.content === "string") addMessage(message.content, message.role, false, { silent: true });
    });
  } else {
    state.conversationMessages = [];
  }
  if (!state.conversationId) {
    state.conversationId = createConversationId();
    storeValue("wg-conversation-id", state.conversationId);
  }
  persistLocalConversation();
  $("forecast-detail")?.addEventListener("click", () => $("forecast").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("load-climate").addEventListener("click", loadClimateHistory);
  $("notification-button").addEventListener("click", () => setActiveTab("alerts"));
  $("current-date").textContent = new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  renderSavedLocations();
  renderCurrentLocationDetails();
  updateOfflineCapabilityStatus();
  setWeatherRole(state.role);
  setupVoice();
  setupWeatherGPTTour();
  void refreshAvailableVoices();
  window.speechSynthesis?.addEventListener?.("voiceschanged", refreshAvailableVoices);
  window.addEventListener("focus", refreshAvailableVoices);
  setText("account-status", window.WeatherGPTFirebase?.configured
    ? "Checking this device for a securely persisted Firebase sign-in session…"
    : "Firebase account services are not configured yet. Local weather and offline features are still available.");
  initializeFirebaseEmail();
  void loadWeather();
  startWeatherMonitoring();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || window.Capacitor)) {
    navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("Offline weather-app caching is unavailable:", error));
  }
}

initialize();
