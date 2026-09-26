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
  location: { ...DEFAULT_LOCATION }, weather: null, air: null, marine: null,
  weatherRequestId: 0, auxiliaryRequestId: 0, language: readStorage("wg-language", "en"),
  units: readStorage("wg-units", "celsius"), role: readStorage("wg-role", "general"),
  savedLocations: readStorage("wg-locations", []), notifications: readStorage("wg-notifications", { rain: false, heat: false }),
  notificationsEnabled: readStorage("wg-notifications-enabled", false),
  voiceResponses: readStorage("wg-voice-responses", false),
  mode: "general", currentTab: "home", forecastDays: 7, map: null, mapMarker: null, radarLayer: null,
  radarFrames: null, radarLoaded: false, toastTimeout: null
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
  if (state.weather) renderWeather(state.weather);
  $("language-select").value = state.language;
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
  setText("data-updated", `Open-Meteo · ${formatShortTime(new Date(current.time))}`);
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
  renderAdvisory(current, daily);
  updateMapLocation();
  updateAgriculturePanel(current, daily);
  checkNotificationRules(current, daily);
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
    return;
  }
  state.air = air;
  const index = Math.round(air.us_aqi);
  const category = index <= 50 ? "Good" : index <= 100 ? "Moderate" : index <= 150 ? "Sensitive groups" : index <= 200 ? "Unhealthy" : index <= 300 ? "Very unhealthy" : "Hazardous";
  setText("air-quality", `${category} · ${index}`);
  setText("pm25", Number.isFinite(air.pm2_5) ? `${Math.round(air.pm2_5)} µg/m³` : "-- µg/m³");
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
  const requestId = ++state.weatherRequestId;
  const location = state.location;
  state.weather = null;
  setText("current-city", location.name);
  setText("current-region", location.country);
  setText("saved-city", location.name);
  setText("saved-region", location.country);
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
  try {
    const params = new URLSearchParams({
      latitude: location.latitude, longitude: location.longitude, timezone: location.timezone || "auto",
      forecast_days: "16", temperature_unit: "celsius", wind_speed_unit: "kmh", precipitation_unit: "mm",
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,visibility,uv_index",
      hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,uv_index,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum"
    });
    const response = await fetch(`${API}?${params}`);
    if (requestId !== state.weatherRequestId) return;
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const data = await response.json();
    if (requestId !== state.weatherRequestId) return;
    if (!data.current || !data.daily?.time?.length) throw new Error("Weather service returned incomplete forecast data");
    try { storeValue("wg-current-location", location); } catch (error) { console.error("Unable to save current location:", error); }
    renderWeather(data);
    loadAirQuality(location, requestId);
  } catch (error) {
    if (requestId !== state.weatherRequestId) return;
    console.error("Unable to load weather:", error);
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
    setText("advisory-title", "Forecast unavailable");
    setText("advisory-description", "Could not reach the weather service. Check your connection and try again.");
    showToast("Weather data could not be loaded. Please check your connection.");
  }
}

async function loadAirQuality(location = state.location, weatherRequestId = state.weatherRequestId) {
  const params = new URLSearchParams({
    latitude: location.latitude, longitude: location.longitude, timezone: location.timezone || "auto",
    current: "us_aqi,european_aqi,pm10,pm2_5,uv_index"
  });
  try {
    const response = await fetch(`${AIR_API}?${params}`);
    if (!response.ok) throw new Error(`Air-quality service returned ${response.status}`);
    const data = await response.json();
    if (weatherRequestId !== state.weatherRequestId) return;
    renderAirQuality(data);
  } catch (error) {
    if (weatherRequestId !== state.weatherRequestId) return;
    console.warn("Air-quality data is unavailable:", error);
    renderAirQuality(null);
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
      state.location = { name: result.name, country: result.country || result.admin1 || "", latitude: result.latitude, longitude: result.longitude, timezone: result.timezone || "auto" };
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
  state.location = { name: found.name, country: found.country || found.admin1 || "", latitude: found.latitude, longitude: found.longitude, timezone: found.timezone || "auto" };
  await loadWeather();
}

function addMessage(text, role, isError = false) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}${isError ? " error" : ""}`;
  message.textContent = text;
  $("chat-messages").append(message);
  message.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (role === "assistant" && state.voiceResponses) speakAnswer(text);
}

function speakAnswer(text) {
  if (!("speechSynthesis" in window)) {
    showToast("Text-to-speech is not available on this device.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageLocales[state.language] || "en-IN";
  window.speechSynthesis.speak(utterance);
}

function answerQuestion(question) {
  const data = state.weather;
  if (!data) return "I can’t access the latest forecast yet. Please try again when weather data is available.";
  const q = question.toLocaleLowerCase();
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
  if (/\b(help|what can you|capabilit|what do you)\b/.test(q) || /मदद|எப்படி|సహాయం/.test(q)) {
    return `I can help with current conditions, rain chances, what to wear, the 7-day outlook, and recent climate context. Try asking “Will it rain today?” or “weather in Mumbai”.`;
  }
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
  if (tab === "map") {
    window.setTimeout(() => {
      initializeMap();
      state.map?.invalidateSize();
    }, 40);
  }
  if (tab === "alerts" && state.weather) renderAdvisory(state.weather.current, state.weather.daily);
  if (tab === "climate" && !$("climate-chart").children.length) loadClimateHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeMap() {
  if (state.map) return;
  if (!window.L) {
    console.error("Leaflet could not be loaded.");
    $("map-legend").textContent = "The map library could not be loaded. Check your connection.";
    return;
  }
  state.map = window.L.map("weather-map", { zoomControl: true, scrollWheelZoom: false }).setView([state.location.latitude, state.location.longitude], 7);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(state.map);
  state.mapMarker = window.L.circleMarker([state.location.latitude, state.location.longitude], {
    radius: 8, color: "#fff", weight: 3, fillColor: "#3c9663", fillOpacity: 1
  }).addTo(state.map).bindPopup(`${safeText(state.location.name)} · WeatherGPT location`);
}

async function toggleRadarLayer(enabled) {
  initializeMap();
  if (!state.map) return;
  if (!enabled) {
    if (state.radarLayer) state.map.removeLayer(state.radarLayer);
    state.radarLayer = null;
    setText("map-legend", `Map centered on ${state.location.name} · OpenStreetMap`);
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
    $("map-legend").replaceChildren();
    const dot = document.createElement("span");
    dot.className = "legend-dot radar-legend-dot";
    const text = document.createElement("span");
    text.textContent = `Rain radar · ${frameTime} local · `;
    const provider = document.createElement("strong");
    provider.textContent = "RainViewer";
    text.append(provider);
    $("map-legend").append(dot, text);
  } catch (error) {
    console.error("Unable to load rainfall radar:", error);
    showToast("Live radar is temporarily unavailable.");
    document.querySelector('[data-map-layer="radar"]').classList.remove("active");
    document.querySelector('[data-map-layer="base"]').classList.add("active");
  }
}

function updateMapLocation() {
  setText("map-location", state.location.name);
  if (state.map && state.mapMarker) {
    state.map.setView([state.location.latitude, state.location.longitude], Math.max(state.map.getZoom(), 7));
    state.mapMarker.setLatLng([state.location.latitude, state.location.longitude]);
    state.mapMarker.setPopupContent(`${safeText(state.location.name)} · WeatherGPT location`);
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
  const maxWind = Math.max(...(state.weather?.hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m]));
  const rainMessage = rain >= 50 ? `Rain is likely today (${rain}%). Defer irrigation if your local field already has adequate soil moisture.` : `Rain chance today: ${rain}%. Irrigation timing still depends on crop stage, soil moisture and local field conditions.`;
  const sprayMessage = rain >= 40 || maxWind >= 15 ? "Rain or wind could affect spray operations. Check your product label, current field conditions and a local agricultural adviser before spraying." : "The forecast has a relatively calm, lower-rain window today. Confirm wind, rain-free hours and the product label locally before any spray operation.";
  const headline = state.role === "farmer" ? "Field forecast" : "Farm weather summary";
  const root = document.createElement("div");
  root.innerHTML = `<span>🌾</span><div><strong>${headline} · ${safeText(state.location.name)}</strong><p>${safeText(rainMessage)} ${safeText(sprayMessage)} Weather guidance is not a substitute for professional agricultural advice.</p></div>`;
  const card = $("agriculture-summary");
  if (card) { card.replaceChildren(...root.childNodes); card.hidden = false; }
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
  const schedule = async () => {
    try {
      const native = window.Capacitor?.Plugins?.LocalNotifications;
      if (native) {
        const permission = await native.requestPermissions();
        if (permission.display !== "granted") return;
        await native.schedule({ notifications: [{ id: notificationKey === "rain" ? 43001 : 43002, title, body, schedule: { at: new Date(Date.now() + 1000) } }] });
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
    createNativeNotification("Rain in the forecast", `${state.location.name}: ${daily.precipitation_probability_max[0]}% chance of rain today. Forecast guidance only.`, "rain");
  }
  if (state.notifications.heat && current.temperature_2m >= 35) {
    createNativeNotification("Hot weather forecast", `${state.location.name}: ${Math.round(current.temperature_2m)}°C. Stay hydrated and check local official guidance.`, "heat");
  }
}

function renderSavedLocations() {
  const list = $("saved-locations-list");
  if (!list) return;
  list.replaceChildren();
  state.savedLocations.forEach((location, index) => {
    const row = document.createElement("div");
    row.className = "saved-location-row";
    const name = document.createElement("strong");
    name.textContent = location.name;
    const details = document.createElement("span");
    details.textContent = location.country || "";
    const select = document.createElement("button");
    select.type = "button";
    select.textContent = "Open";
    select.addEventListener("click", async () => {
      state.location = { ...location };
      await loadWeather();
      setActiveTab("home");
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${location.name}`);
    remove.addEventListener("click", () => {
      state.savedLocations.splice(index, 1);
      storeValue("wg-locations", state.savedLocations);
      renderSavedLocations();
    });
    row.append(name, details, select, remove);
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
  const saved = state.savedLocations.some((location) => Math.abs(location.latitude - state.location.latitude) < 0.001 && Math.abs(location.longitude - state.location.longitude) < 0.001);
  if (saved) { showToast(`${state.location.name} is already saved.`); return; }
  state.savedLocations.push({ ...state.location });
  storeValue("wg-locations", state.savedLocations);
  renderSavedLocations();
  showToast(`${state.location.name} saved to your locations.`);
}

async function useCurrentLocation() {
  const button = $("use-my-location");
  button.disabled = true;
  button.textContent = "Finding your location…";
  try {
    const native = window.Capacitor?.Plugins?.Geolocation;
    const position = native
      ? await native.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 })
      : await new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("Location is not available in this browser.")); return; }
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      });
    state.location = {
      name: "Near me",
      country: "Current GPS location",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timezone: "auto"
    };
    await loadWeather();
    setActiveTab("home");
  } catch (error) {
    console.error("Unable to determine device location:", error);
    const message = error instanceof Error && /denied|permission/i.test(error.message)
      ? "Location access was denied. Allow location permission in Android settings or search for a place."
      : error instanceof Error ? error.message : "Could not retrieve your location.";
    showToast(message);
  } finally {
    button.disabled = false;
    button.textContent = "◎ Use my current location";
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
    if (state.weather) checkNotificationRules(state.weather.current, state.weather.daily);
  } catch (error) {
    console.error("Unable to request notification permission:", error);
    showToast("Notification permission could not be requested.");
  }
}

function setTemperatureUnit(unit) {
  state.units = unit === "fahrenheit" ? "fahrenheit" : "celsius";
  storeValue("wg-units", state.units);
  if (state.weather) renderWeather(state.weather);
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

async function sendQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addMessage(cleanQuestion, "user");
  $("chat-input").value = "";
  $("chat-input").disabled = true;
  try {
    const alias = locationAliases.find((entry) => entry.aliases.some((name) => cleanQuestion.includes(name)));
    const locationMatch = cleanQuestion.match(/\b(?:in|for|at|near)\s+([a-zA-Z][a-zA-Z .'-]{1,45}?)(?:\s+(?:today|tomorrow|this week|next week|this weekend|on the weekend))?[?.!,;:]*$/i);
    if (alias) await findLocation(alias.search);
    else if (locationMatch && !/^(?:today|tomorrow|week|forecast|rain|weather|climate)\b/i.test(locationMatch[1].trim())) await findLocation(locationMatch[1].trim());
    const reply = answerQuestion(cleanQuestion);
    if (reply === null) {
      if (/last year|previous year|last month|\b(?:19|20)\d{2}\b/.test(cleanQuestion.toLowerCase())) {
        addMessage(await answerClimateQuestion(cleanQuestion), "assistant");
      } else {
        setActiveTab("climate");
        await loadClimateHistory();
        addMessage(`I opened the historical climate charts for ${state.location.name}. They use Open-Meteo's historical archive; observations are not forecasts or an official climatological record.`, "assistant");
      }
    } else addMessage(reply, "assistant");
  } catch (error) {
    console.error("Unable to answer weather question:", error);
    addMessage(error instanceof Error ? error.message : "I couldn't retrieve that information. Please try again.", "assistant", true);
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
    const coordinates = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (coordinates) {
      const latitude = Number(coordinates[1]);
      const longitude = Number(coordinates[2]);
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error("Latitude must be between −90 and 90 and longitude between −180 and 180.");
      renderLocationResults([{ name: "Selected coordinates", country: `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`, latitude, longitude, timezone: "auto" }]);
      return;
    }
    const response = await fetch(`${GEO_API}?${params}`);
    if (!response.ok) throw new Error(`Location service returned ${response.status}`);
    const data = await response.json();
    renderLocationResults(data.results || []);
  } catch (error) {
    console.error("Location search failed:", error);
    $("location-search-results").textContent = "Location search could not connect. Check your internet connection and try again.";
  }
}

function setupVoice() {
  const native = window.Capacitor?.Plugins?.SpeechRecognition;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const buttons = [$("voice-button"), $("home-voice-button")].filter(Boolean);
  if (!native && !SpeechRecognition) {
    buttons.forEach((button) => button.addEventListener("click", () => showToast("Voice input is not supported on this device. Try the text chat.")));
    return;
  }
  if (SpeechRecognition) {
    state.browserRecognition = new SpeechRecognition();
    state.browserRecognition.interimResults = false;
    state.browserRecognition.onstart = () => buttons.forEach((button) => button.classList.add("listening"));
    state.browserRecognition.onend = () => buttons.forEach((button) => button.classList.remove("listening"));
    state.browserRecognition.onerror = (event) => {
      buttons.forEach((button) => button.classList.remove("listening"));
      showToast(event.error === "not-allowed" ? "Microphone access was denied. Allow microphone access to use voice input." : "Voice input ended. Please try again.");
    };
    state.browserRecognition.onresult = (event) => sendQuestion(event.results[0][0].transcript);
  }
  buttons.forEach((button) => button.addEventListener("click", startVoiceInput));
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
      button?.classList.add("listening");
      const result = await native.start({ language, maxResults: 1, popup: true, partialResults: false, prompt: "Ask WeatherGPT" });
      button?.classList.remove("listening");
      const transcript = result.matches?.[0]?.trim();
      if (transcript) await sendQuestion(transcript);
      else showToast("No speech was recognized. Try again.");
      return;
    }
    if (state.browserRecognition) {
      state.browserRecognition.lang = language;
      state.browserRecognition.start();
    }
  } catch (error) {
    button?.classList.remove("listening");
    console.error("Voice input could not start:", error);
    showToast(error instanceof Error ? error.message : "Voice input could not start.");
  }
}

function initialize() {
  if (!Array.isArray(state.savedLocations)) state.savedLocations = [];
  if (!state.location || !Number.isFinite(Number(state.location.latitude)) || !Number.isFinite(Number(state.location.longitude))) state.location = { ...DEFAULT_LOCATION };
  if (!state.notifications || typeof state.notifications !== "object") state.notifications = { rain: false, heat: false };
  $("profile-role").value = state.role;
  $("profile-language").value = state.language;
  $("unit-select").value = state.units;
  $("rain-notifications").checked = Boolean(state.notifications.rain);
  $("heat-notifications").checked = Boolean(state.notifications.heat);
  $("voice-responses").checked = Boolean(state.voiceResponses);
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
  $("add-location").addEventListener("click", promptForLocation);
  $("edit-location").addEventListener("click", promptForLocation);
  $("saved-place").addEventListener("click", () => setActiveTab("profile"));
  $("profile-add-location").addEventListener("click", promptForLocation);
  $("save-current-location").addEventListener("click", saveCurrentLocation);
  $("compare-saved-locations").addEventListener("click", compareSavedLocations);
  $("use-my-location").addEventListener("click", useCurrentLocation);
  $("enable-notifications").addEventListener("click", enableNotifications);
  $("voice-responses").addEventListener("change", (event) => {
    state.voiceResponses = event.target.checked;
    storeValue("wg-voice-responses", state.voiceResponses);
  });
  $("rain-notifications").addEventListener("change", (event) => {
    state.notifications.rain = event.target.checked;
    storeValue("wg-notifications", state.notifications);
    if (event.target.checked) showToast("Choose Enable notifications to allow alerts on this device.");
  });
  $("heat-notifications").addEventListener("change", (event) => {
    state.notifications.heat = event.target.checked;
    storeValue("wg-notifications", state.notifications);
    if (event.target.checked) showToast("Choose Enable notifications to allow alerts on this device.");
  });
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
  document.querySelectorAll("[data-map-layer]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-map-layer]").forEach((layer) => layer.classList.toggle("active", layer === button));
    toggleRadarLayer(button.dataset.mapLayer === "radar");
  }));
  document.querySelectorAll("[data-tab-target]").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget)));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("forecast-range").addEventListener("click", () => {
    state.forecastDays = state.forecastDays > 7 ? 7 : 15;
    setText("forecast-heading", `${state.forecastDays}-day forecast`);
    $("forecast-range").textContent = state.forecastDays > 7 ? "View 7 days ↗" : "View 15 days ↗";
    if (state.weather) renderForecast(state.weather.daily);
  });
  $("new-chat").addEventListener("click", () => {
    $("chat-messages").replaceChildren();
    $("chat-input").focus();
  });
  $("forecast-detail")?.addEventListener("click", () => $("forecast").scrollIntoView({ behavior: "smooth", block: "start" }));
  $("load-climate").addEventListener("click", loadClimateHistory);
  $("notification-button").addEventListener("click", () => setActiveTab("alerts"));
  $("current-date").textContent = new Intl.DateTimeFormat(languageLocales[state.language] || "en-IN", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  renderSavedLocations();
  setWeatherRole(state.role);
  setupVoice();
  loadWeather();
  window.setInterval(loadWeather, 15 * 60 * 1000);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || window.Capacitor)) {
    navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("Offline weather-app caching is unavailable:", error));
  }
}

initialize();
