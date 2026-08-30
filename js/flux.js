const DEFAULT_STATE = {
  profile: {
    name: 'Arjun Kumar',
    email: 'arjun.kumar@gmail.com',
    city: 'Mumbai, India',
    role: 'Freelance Developer',
    stabilityScore: 72,
  },
  snapshot: {
    monthIndex: 2,
    monthLabel: 'March 2026',
    monthShort: 'Mar',
    year: 2026,
    today: 18,
  },
  income: 48200,
  incomeTarget: 67000,
  spending: 31400,
  spendingTarget: 38000,
  daysInMonth: 31,
  daysPassed: 18,
  baselineNeed: 11000,
  incomeHistory: [42000, 58000, 31000, 46000, 49000, 44000, 43000, 48200],
  spendHistory: [30000, 38000, 26000, 34000, 32000, 28000, 29000, 31400],
  vault: 12100,
  vaultGoal: 30000,
  vaultHistory: [2100, 3800, 5200, 6900, 9400, 12100],
  vaultRules: {
    highIncome: true,
    surplus: true,
    goalBooster: true,
    nightSave: false,
  },
  notifications: {
    daily: true,
    spending: true,
    peakDay: true,
    weekly: false,
    breakRemind: true,
  },
  security: {
    biometric: true,
    twoFactor: true,
  },
  breakDays: 7,
  breakDailyExp: 1200,
  breakStartDays: 3,
  useVault: true,
  categories: [
    { id: 'housing', icon: 'home', label: 'Rent & housing', spent: 12000, limit: 12000, tone: 'acc' },
    { id: 'food', icon: 'utensils', label: 'Food & dining', spent: 6200, limit: 8000, tone: 'red' },
    { id: 'tools', icon: 'briefcase', label: 'Subscriptions & tools', spent: 4100, limit: 4000, tone: 'amb' },
    { id: 'transport', icon: 'car', label: 'Transport', spent: 3800, limit: 5000, tone: 'teal' },
    { id: 'health', icon: 'pulse', label: 'Health & medical', spent: 2100, limit: 3000, tone: 'indigo' },
    { id: 'entertainment', icon: 'sparkles', label: 'Entertainment', spent: 3200, limit: 4000, tone: 't2' },
  ],
  heatmapDays: [
    { day: 1, level: 1, amount: 1200, probability: 32, predicted: false },
    { day: 2, level: 3, amount: 4800, probability: 71, predicted: false },
    { day: 3, level: 4, amount: 7200, probability: 82, predicted: false },
    { day: 4, level: 2, amount: 2800, probability: 54, predicted: false },
    { day: 5, level: 5, amount: 11500, probability: 91, predicted: false },
    { day: 6, level: 4, amount: 8400, probability: 85, predicted: false },
    { day: 7, level: 0, amount: 400, probability: 12, predicted: false },
    { day: 8, level: 0, amount: 200, probability: 8, predicted: false },
    { day: 9, level: 2, amount: 3100, probability: 58, predicted: false },
    { day: 10, level: 3, amount: 5200, probability: 74, predicted: false },
    { day: 11, level: 4, amount: 8500, probability: 88, predicted: false },
    { day: 12, level: 3, amount: 4900, probability: 72, predicted: false },
    { day: 13, level: 5, amount: 12000, probability: 93, predicted: false },
    { day: 14, level: 0, amount: 0, probability: 5, predicted: false },
    { day: 15, level: 0, amount: 0, probability: 7, predicted: false },
    { day: 16, level: 2, amount: 2800, probability: 55, predicted: false },
    { day: 17, level: 3, amount: 5400, probability: 70, predicted: false },
    { day: 18, level: 3, amount: 4800, probability: 68, predicted: false },
    { day: 19, level: 5, amount: 12500, probability: 89, predicted: true },
    { day: 20, level: 4, amount: 9000, probability: 84, predicted: true },
    { day: 21, level: 0, amount: 300, probability: 9, predicted: true },
    { day: 22, level: 0, amount: 100, probability: 4, predicted: true },
    { day: 23, level: 1, amount: 1800, probability: 38, predicted: true },
    { day: 24, level: 2, amount: 3200, probability: 61, predicted: true },
    { day: 25, level: 2, amount: 2900, probability: 56, predicted: true },
    { day: 26, level: 1, amount: 1400, probability: 32, predicted: true },
    { day: 27, level: 1, amount: 1200, probability: 28, predicted: true },
    { day: 28, level: 0, amount: 500, probability: 14, predicted: true },
    { day: 29, level: 0, amount: 200, probability: 6, predicted: true },
    { day: 30, level: 1, amount: 2100, probability: 42, predicted: true },
    { day: 31, level: 2, amount: 3500, probability: 62, predicted: true },
  ],
  weeklyForecast: [
    { label: 'W1', actual: 19200, predicted: 18000 },
    { label: 'W2', actual: 28600, predicted: 24800 },
    { label: 'W3', actual: 0, predicted: 11300 },
    { label: 'W4', actual: 0, predicted: 6900 },
  ],
  dailySpend: [2400, 1800, 3200, 1200, 2800, 900, 2100, 3500, 1600, 2200, 1900, 2700, 2100, 1400, 900, 1200, 1600, 1300],
  transactions: [
    { id: 'tx-1', label: 'Freelance UI project', date: '2026-03-13', category: 'Income', amount: 18000, flow: 'in', tone: 'bg' },
    { id: 'tx-2', label: 'Groceries & household', date: '2026-03-11', category: 'Food', amount: 3400, flow: 'out', tone: 'br' },
    { id: 'tx-3', label: 'Design consultation', date: '2026-03-10', category: 'Income', amount: 8500, flow: 'in', tone: 'bg' },
    { id: 'tx-4', label: 'Electricity bill', date: '2026-03-09', category: 'Utilities', amount: 1850, flow: 'out', tone: 'ba' },
    { id: 'tx-5', label: 'Auto-save to vault', date: '2026-03-08', category: 'Vault', amount: 2100, flow: 'vault', tone: 'bt' },
  ],
  vaultTransactions: [
    { id: 'vt-1', label: 'Auto-save · High income day', date: '2026-03-13', type: 'Auto', amount: 2400, flow: 'in', tone: 'bg' },
    { id: 'vt-2', label: 'Manual deposit', date: '2026-03-10', type: 'Manual', amount: 3000, flow: 'in', tone: 'bl' },
    { id: 'vt-3', label: 'Break fund withdrawal', date: '2026-03-05', type: 'Withdraw', amount: 4500, flow: 'out', tone: 'ba' },
    { id: 'vt-4', label: 'Monthly surplus save', date: '2026-03-01', type: 'Auto', amount: 4100, flow: 'in', tone: 'bg' },
    { id: 'vt-5', label: 'Interest credited', date: '2026-03-01', type: 'Interest', amount: 42, flow: 'in', tone: 'bt' },
    { id: 'vt-6', label: 'Auto-save · High income', date: '2026-02-28', type: 'Auto', amount: 1800, flow: 'in', tone: 'bg' },
  ],
};

const STORAGE_KEY = 'flux-state-v2';
const THEME_KEY = 'flux-theme';
const LANGUAGE_KEY = 'flux-language';
const TOUR_KEY = 'flux-tour-dismissed-v1';
const CHART_FONT = "500 9px Inter, sans-serif";
const CHART_LABEL_FONT = "600 9px Inter, sans-serif";
const LANGUAGE_CONFIG = {
  en: { locale: 'en-IN', lang: 'en' },
  hi: { locale: 'hi-IN', lang: 'hi' },
};
const I18N = {
  en: {
    common: {
      themeSwitcher: 'Theme switcher',
      languageSwitcher: 'Language switcher',
      tour: 'Tour',
      today: 'Today',
      dynamic: 'Dynamic',
      live: 'Live',
      desktop: 'Desktop',
      export: 'Export',
      add: 'Add',
      run: 'Run',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      resetStats: 'Reset stats',
      desktopSettings: 'Desktop settings',
      signOut: 'Sign out',
      useVaultIfNeeded: 'Use vault if needed',
      score: 'Score',
    },
    theme: {
      dark: 'Dark',
      light: 'Light',
      paper: 'Paper',
    },
    nav: {
      dashboard: 'Dashboard',
      spending: 'Spending',
      forecast: 'Income Forecast',
      break: 'Break Planner',
      vault: 'Safety Vault',
      profile: 'Profile & Settings',
      home: 'Home',
      spend: 'Spend',
      forecastShort: 'Forecast',
      breakShort: 'Break',
      vaultShort: 'Vault',
      overviewSection: 'Overview',
      predictionSection: 'Predictions',
      savingsSection: 'Savings',
      accountSection: 'Account',
      mobile: 'Mobile UI',
    },
    zone: {
      safe: 'Safe zone',
      moderate: 'Moderate zone',
      risk: 'Risk zone',
    },
    unit: {
      months: 'months',
      monthShort: 'mo',
      days: 'days',
      day: 'day',
    },
    tour: {
      current: 'Current',
      tip: 'Tip: start on <strong>Dashboard</strong>, log changes in <strong>Spending</strong>, check opportunity timing in <strong>Income Forecast</strong>, then use <strong>Break Planner</strong> only after the forecast looks light.',
      pages: {
        dashboard: {
          title: 'Dashboard',
          copy: 'Your control center. It compresses income, spending, runway, vault health, and recent activity into one fast scan.',
        },
        expense: {
          title: 'Spending',
          copy: 'Track pace, category pressure, and your safe daily limit so overspending is obvious before it becomes a problem.',
        },
        heatmap: {
          title: 'Income Forecast',
          copy: 'Shows the best work windows, quieter periods, and a weekly comparison of actual versus predicted earnings.',
        },
        break: {
          title: 'Break Planner',
          copy: 'Models time off using lost income, break costs, and optional vault support so you can test rest scenarios safely.',
        },
        vault: {
          title: 'Safety Vault',
          copy: 'Focuses on buffer growth, auto-save rules, and how many days of protection your reserve currently buys.',
        },
        profile: {
          title: 'Profile & Settings',
          copy: 'Holds goals, notifications, security settings, and appearance controls that shape the rest of the app.',
        },
        mobile: {
          title: 'Mobile UI',
          copy: 'A phone-style surface for checking cash flow, pacing, forecasts, break plans, vault health, and key settings on the go.',
        },
      },
    },
    index: {
      openDemo: 'Open Demo',
      eyebrow: 'Meet Flux',
      heroTitle: 'Financial stability for the <em>independent</em> workforce.',
      heroBody: 'Freelancers, creators, and gig workers face a problem traditional finance apps ignore: irregular income. Flux predicts your earnings, protects your runway, and builds a safety buffer so you can focus on your work instead of second-guessing your cash flow.',
      heroDemo: 'View Live Demo',
      heroBreak: 'Test the Break Planner',
      heroMobile: 'Open Mobile UI',
      runwayLabel: 'Average user runway',
      runwayCopy: 'Flux users know how long they can stay safe, when to push harder, and when they can actually rest.',
      runwayValueLong: '2.6 months',
      runwayValueShort: '2.6 mo',
      statForecast: 'Income forecast confidence',
      statVault: 'Average vault buffer built',
      statSheets: 'Spreadsheets required',
      previewTitle: 'Instant dashboard read',
      previewSubtitle: 'Core numbers at a glance.',
      income: 'Income',
      spending: 'Spending',
      runway: 'Runway',
      whyTitle: 'Why it feels easier',
      whyTheme: 'Theme support',
      whyThemeValue: 'Dark, Light, Paper',
      whyBreak: 'Break planning',
      whyBreakValue: 'Interactive scenario model',
      whyAssistant: 'Assistant inputs',
      whyAssistantValue: 'Understands preset prompts',
      whyCharts: 'Charts',
      whyChartsValue: 'Clearer bar-first comparisons',
      problemEyebrow: 'The Problem',
      problemHeading: 'Traditional finance apps are built for salaries. You do not have one.',
      problem1Title: 'Blind budgeting',
      problem1Body: 'Standard apps tell you what you spent yesterday. They cannot tell you if the next seven days are strong enough to carry the month.',
      problem2Title: 'Feast and famine',
      problem2Body: 'When your income swings between high-output weeks and quiet ones, static monthly budgeting becomes exhausting very quickly.',
      problem3Title: 'Guilt-driven burnout',
      problem3Body: 'Without a clear safety picture, even a short break can feel irresponsible. That uncertainty keeps people working past the point of clarity.',
      solutionEyebrow: 'The Solution',
      solutionHeading: 'A system designed to absorb volatility.',
      feature1Title: 'Income Forecasting',
      feature1Body: 'Flux anticipates high-earning days, low-pressure windows, and likely swings before they turn into surprises.',
      feature2Title: 'The Safety Vault',
      feature2Body: 'Automated rules stash away surplus cash on your strongest days so slow weeks feel manageable instead of threatening.',
      feature3Title: 'Break Planner',
      feature3Body: 'Model the exact cost of time off, compare start windows, and see whether the break is actually safe before you commit.',
      ctaEyebrow: 'Get started',
      ctaHeading: 'Your runway starts now.',
      ctaBody: 'No spreadsheets. No salary required. Just a clear picture of where you stand and what to do next.',
      ctaButton: 'Open dashboard',
      footerCopy: '© 2026 Flux. Built for the independent workforce.',
      footerDemo: 'Demo',
      footerSettings: 'Settings',
    },
    mobile: {
      title: 'Flux Mobile',
      tabsLabel: 'Mobile sections',
      overview: 'Home',
      spending: 'Spend',
      forecast: 'Forecast',
      break: 'Break',
      vault: 'Vault',
      profile: 'Profile',
      income: 'Income',
      spendingLabel: 'Spending',
      runway: 'Runway',
      vaultLabel: 'Vault',
      cashFlow: 'Cash flow',
      lastMonths: 'Last 5 months',
      recentActivity: 'Recent activity',
      zone: 'Zone',
      remaining: 'Remaining',
      dailyTarget: 'Daily target',
      spendRatio: 'Spend ratio',
      dailySpending: 'Daily spending',
      categories: 'Categories',
      projected: 'Projected',
      range: 'Range',
      nextPeak: 'Next peak',
      bestBreak: 'Best break',
      next14: 'Next 14 days',
      weeklyTrack: 'Weekly track',
      breakPlanner: 'Break planner',
      duration: 'Duration',
      dailySpend: 'Daily spend',
      start: 'Start',
      projection: 'Projection',
      result: 'Result',
      balance: 'Balance',
      progress: 'Progress',
      coverage: 'Coverage',
      vaultTrend: 'Vault trend',
      recentVaultActivity: 'Recent vault activity',
      incomeTarget: 'Income target',
      spendTarget: 'Spend target',
      vaultGoal: 'Vault goal',
      runwayFloor: 'Runway floor',
      tour: 'Tour',
    },
  },
  hi: {
    common: {
      themeSwitcher: 'थीम बदलें',
      languageSwitcher: 'भाषा बदलें',
      tour: 'टूर',
      today: 'आज',
      dynamic: 'लाइव',
      live: 'लाइव',
      desktop: 'डेस्कटॉप',
      export: 'एक्सपोर्ट',
      add: 'जोड़ें',
      run: 'चलाएं',
      deposit: 'जमा करें',
      withdraw: 'निकालें',
      resetStats: 'स्टैट्स रीसेट करें',
      desktopSettings: 'डेस्कटॉप सेटिंग्स',
      signOut: 'साइन आउट',
      useVaultIfNeeded: 'ज़रूरत पड़े तो वॉल्ट इस्तेमाल करें',
      score: 'स्कोर',
    },
    theme: {
      dark: 'डार्क',
      light: 'लाइट',
      paper: 'पेपर',
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      spending: 'खर्च',
      forecast: 'आय पूर्वानुमान',
      break: 'ब्रेक प्लानर',
      vault: 'सेफ्टी वॉल्ट',
      profile: 'प्रोफाइल और सेटिंग्स',
      home: 'होम',
      spend: 'खर्च',
      forecastShort: 'पूर्वानुमान',
      breakShort: 'ब्रेक',
      vaultShort: 'वॉल्ट',
      overviewSection: 'ओवरव्यू',
      predictionSection: 'पूर्वानुमान',
      savingsSection: 'बचत',
      accountSection: 'अकाउंट',
      mobile: 'मोबाइल UI',
    },
    zone: {
      safe: 'सुरक्षित ज़ोन',
      moderate: 'मध्यम ज़ोन',
      risk: 'जोखिम ज़ोन',
    },
    unit: {
      months: 'महीने',
      monthShort: 'माह',
      days: 'दिन',
      day: 'दिन',
    },
    tour: {
      current: 'मौजूदा',
      tip: 'सुझाव: पहले <strong>डैशबोर्ड</strong> से शुरू करें, फिर <strong>खर्च</strong> में बदलाव देखें, <strong>आय पूर्वानुमान</strong> में सही समय समझें, और उसके बाद ही <strong>ब्रेक प्लानर</strong> का इस्तेमाल करें।',
      pages: {
        dashboard: {
          title: 'डैशबोर्ड',
          copy: 'आपका कंट्रोल सेंटर। यह आय, खर्च, रनवे, वॉल्ट हेल्थ और हाल की गतिविधि को एक तेज़ स्कैन में समेट देता है।',
        },
        expense: {
          title: 'खर्च',
          copy: 'रफ्तार, कैटेगरी प्रेशर और सुरक्षित दैनिक सीमा ट्रैक करें ताकि ओवरस्पेंडिंग पहले ही दिख जाए।',
        },
        heatmap: {
          title: 'आय पूर्वानुमान',
          copy: 'बेहतर काम वाले दिन, शांत समय और वास्तविक बनाम अनुमानित कमाई की साप्ताहिक तुलना दिखाता है।',
        },
        break: {
          title: 'ब्रेक प्लानर',
          copy: 'खोई हुई आय, ब्रेक लागत और वॉल्ट सपोर्ट के साथ समय-ऑफ मॉडल करता है ताकि आप सुरक्षित रूप से ब्रेक परख सकें।',
        },
        vault: {
          title: 'सेफ्टी वॉल्ट',
          copy: 'बफर ग्रोथ, ऑटो-सेव नियम और आपकी रिज़र्व कितने दिनों की सुरक्षा देती है, इस पर फोकस करता है।',
        },
        profile: {
          title: 'प्रोफाइल और सेटिंग्स',
          copy: 'यहीं लक्ष्य, नोटिफिकेशन, सुरक्षा सेटिंग्स और अपीयरेंस कंट्रोल रखे गए हैं।',
        },
        mobile: {
          title: 'मोबाइल UI',
          copy: 'चलते-फिरते कैश फ्लो, खर्च की रफ्तार, पूर्वानुमान, ब्रेक प्लान और वॉल्ट हेल्थ देखने के लिए फोन-स्टाइल सतह।',
        },
      },
    },
    index: {
      openDemo: 'डेमो खोलें',
      eyebrow: 'Flux से मिलिए',
      heroTitle: '<em>स्वतंत्र</em> काम करने वालों के लिए वित्तीय स्थिरता।',
      heroBody: 'फ्रीलांसर, क्रिएटर और गिग वर्कर एक ऐसी समस्या झेलते हैं जिसे पारंपरिक फाइनेंस ऐप नज़रअंदाज़ करते हैं: अनियमित आय। Flux आपकी कमाई का अनुमान लगाता है, रनवे सुरक्षित रखता है और सेफ्टी बफर बनाता है ताकि आप कैश फ्लो पर शक करने के बजाय अपने काम पर ध्यान दे सकें।',
      heroDemo: 'लाइव डेमो देखें',
      heroBreak: 'ब्रेक प्लानर आज़माएं',
      heroMobile: 'मोबाइल UI खोलें',
      runwayLabel: 'औसत यूज़र रनवे',
      runwayCopy: 'Flux यूज़र्स जानते हैं कि वे कितने समय तक सुरक्षित हैं, कब ज़्यादा काम करना है और कब सच में आराम किया जा सकता है।',
      runwayValueLong: '2.6 महीने',
      runwayValueShort: '2.6 माह',
      statForecast: 'आय पूर्वानुमान भरोसा',
      statVault: 'औसत वॉल्ट बफर',
      statSheets: 'स्प्रेडशीट की ज़रूरत',
      previewTitle: 'तुरंत डैशबोर्ड झलक',
      previewSubtitle: 'मुख्य नंबर एक नज़र में।',
      income: 'आय',
      spending: 'खर्च',
      runway: 'रनवे',
      whyTitle: 'यह आसान क्यों लगता है',
      whyTheme: 'थीम सपोर्ट',
      whyThemeValue: 'डार्क, लाइट, पेपर',
      whyBreak: 'ब्रेक प्लानिंग',
      whyBreakValue: 'इंटरैक्टिव सीनारियो मॉडल',
      whyAssistant: 'असिस्टेंट इनपुट',
      whyAssistantValue: 'प्रीसेट प्रॉम्प्ट समझता है',
      whyCharts: 'चार्ट्स',
      whyChartsValue: 'ज्यादा साफ़ तुलना',
      problemEyebrow: 'समस्या',
      problemHeading: 'पारंपरिक फाइनेंस ऐप्स सैलरी वालों के लिए बने हैं। आपके पास सैलरी नहीं है।',
      problem1Title: 'अंधा बजट',
      problem1Body: 'सामान्य ऐप आपको बताते हैं कि आपने कल क्या खर्च किया। वे यह नहीं बता पाते कि अगले सात दिन पूरे महीने को संभाल पाएंगे या नहीं।',
      problem2Title: 'कभी बहुत, कभी कम',
      problem2Body: 'जब आपकी आय तेज़ हफ्तों और शांत दिनों में बदलती रहती है, तो स्थिर मासिक बजट जल्दी ही थका देने वाला हो जाता है।',
      problem3Title: 'गिल्ट से भरा बर्नआउट',
      problem3Body: 'साफ़ सेफ्टी पिक्चर न होने पर छोटा ब्रेक भी गैरजिम्मेदार लगता है। यही अनिश्चितता लोगों को जरूरत से ज़्यादा काम कराती रहती है।',
      solutionEyebrow: 'समाधान',
      solutionHeading: 'ऐसा सिस्टम जो अस्थिरता को संभालने के लिए बनाया गया हो।',
      feature1Title: 'आय पूर्वानुमान',
      feature1Body: 'Flux हाई-अर्निंग दिन, लो-प्रेशर विंडो और संभावित उतार-चढ़ाव पहले से देख लेता है।',
      feature2Title: 'सेफ्टी वॉल्ट',
      feature2Body: 'ऑटोमेटेड नियम अच्छे दिनों की अतिरिक्त कमाई बचाकर धीमे हफ्तों को संभालने लायक बनाते हैं।',
      feature3Title: 'ब्रेक प्लानर',
      feature3Body: 'समय-ऑफ की वास्तविक लागत मॉडल करें, शुरुआती विंडो की तुलना करें और पहले से देखें कि ब्रेक कितना सुरक्षित है।',
      ctaEyebrow: 'शुरू करें',
      ctaHeading: 'आपका रनवे अभी से शुरू होता है।',
      ctaBody: 'न स्प्रेडशीट, न सैलरी की ज़रूरत। बस आपकी स्थिति और अगले कदम की साफ़ तस्वीर।',
      ctaButton: 'डैशबोर्ड खोलें',
      footerCopy: '© 2026 Flux. स्वतंत्र कार्यबल के लिए बनाया गया।',
      footerDemo: 'डेमो',
      footerSettings: 'सेटिंग्स',
    },
    mobile: {
      title: 'Flux Mobile',
      tabsLabel: 'मोबाइल सेक्शन',
      overview: 'होम',
      spending: 'खर्च',
      forecast: 'पूर्वानुमान',
      break: 'ब्रेक',
      vault: 'वॉल्ट',
      profile: 'प्रोफाइल',
      income: 'आय',
      spendingLabel: 'खर्च',
      runway: 'रनवे',
      vaultLabel: 'वॉल्ट',
      cashFlow: 'कैश फ्लो',
      lastMonths: 'पिछले 5 महीने',
      recentActivity: 'हाल की गतिविधि',
      zone: 'ज़ोन',
      remaining: 'बाकी',
      dailyTarget: 'दैनिक लक्ष्य',
      spendRatio: 'खर्च अनुपात',
      dailySpending: 'दैनिक खर्च',
      categories: 'कैटेगरी',
      projected: 'अनुमानित',
      range: 'रेंज',
      nextPeak: 'अगला पीक',
      bestBreak: 'सबसे अच्छा ब्रेक',
      next14: 'अगले 14 दिन',
      weeklyTrack: 'साप्ताहिक ट्रैक',
      breakPlanner: 'ब्रेक प्लानर',
      duration: 'अवधि',
      dailySpend: 'दैनिक खर्च',
      start: 'शुरुआत',
      projection: 'प्रोजेक्शन',
      result: 'नतीजा',
      balance: 'बैलेंस',
      progress: 'प्रगति',
      coverage: 'कवरेज',
      vaultTrend: 'वॉल्ट ट्रेंड',
      recentVaultActivity: 'हाल की वॉल्ट गतिविधि',
      incomeTarget: 'आय लक्ष्य',
      spendTarget: 'खर्च लक्ष्य',
      vaultGoal: 'वॉल्ट लक्ष्य',
      runwayFloor: 'न्यूनतम रनवे',
      tour: 'टूर',
    },
  },
};

const PAGE_TOUR = {
  'dashboard.html': {
    titleKey: 'tour.pages.dashboard.title',
    copyKey: 'tour.pages.dashboard.copy',
  },
  'expense.html': {
    titleKey: 'tour.pages.expense.title',
    copyKey: 'tour.pages.expense.copy',
  },
  'heatmap.html': {
    titleKey: 'tour.pages.heatmap.title',
    copyKey: 'tour.pages.heatmap.copy',
  },
  'break.html': {
    titleKey: 'tour.pages.break.title',
    copyKey: 'tour.pages.break.copy',
  },
  'vault.html': {
    titleKey: 'tour.pages.vault.title',
    copyKey: 'tour.pages.vault.copy',
  },
  'profile.html': {
    titleKey: 'tour.pages.profile.title',
    copyKey: 'tour.pages.profile.copy',
  },
  'mobile.html': {
    titleKey: 'tour.pages.mobile.title',
    copyKey: 'tour.pages.mobile.copy',
  },
};

const EXTRA_I18N = {
  en: {
    table: {
      description: 'Description',
      date: 'Date',
      category: 'Category',
      amount: 'Amount',
      limit: 'Limit',
      usage: 'Usage',
      status: 'Status',
      type: 'Type',
    },
    weekday: {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun',
    },
    category: {
      housing: 'Rent & housing',
      food: 'Food & dining',
      tools: 'Subscriptions & tools',
      transport: 'Transport',
      health: 'Health & medical',
      entertainment: 'Entertainment',
    },
    index: {
      documentTitle: 'Flux - Financial stability for irregular income',
    },
    mobile: {
      documentTitle: 'Flux Mobile',
    },
    dashboard: {
      documentTitle: 'Flux - Dashboard',
      exportCsv: 'Export CSV',
      greeting: 'Good morning, {name}',
      period: 'Financial overview · {month} · {days} days in',
      monthlyIncome: 'Monthly Income',
      incomeDelta: 'Up 12% vs February',
      monthlySpending: 'Monthly Spending',
      spendingDelta: 'Up 4% vs February',
      financialRunway: 'Financial Runway',
      runwayDelta: 'Up +0.3 vs last month',
      runwayFloor: 'Minimum safe floor: 2.0 months',
      safetyVault: 'Safety Vault',
      vaultStatus: 'Auto-saving is running normally',
      target: '{target} target',
      reached: '{pct}% reached',
      cashPicture: 'Monthly cash picture',
      cashPictureSub: 'Income and spending by month',
      avgIncome: 'Avg income',
      avgSpend: 'Avg spend',
      bestMonth: 'Best month',
      avgSaved: 'Avg saved',
      thisWeek: 'This week',
      liveWindow: 'Live operating window',
      predictedIncome: 'Predicted income',
      todayOutlook: "Today's outlook",
      nextPeakDay: 'Next peak day',
      safeDailySpend: 'Safe daily spend',
      autoSavedToday: 'Auto-saved today',
      aiInsights: 'AI Insights',
      peakDay: 'Peak day',
      peakDayBody: 'Keep your next peak day clear for higher-value work.',
      spendingNudge: 'Spending nudge',
      spendingNudgeBody: 'Check category pressure before adding new discretionary spend.',
      vaultOnTrack: 'Vault on track',
      recentTransactions: 'Recent transactions',
      lastEntries: 'Last 5 entries',
      allTransactions: 'All transactions →',
      spendingMixTitle: '{month} spending mix',
      spendingMixSub: 'By category · {total} total',
      quickAccess: 'Quick access',
      quickSpendingBody: 'Daily pacing and category pressure',
      quickForecastBody: 'Peak-day calendar and weekly plan',
      quickBreakBody: 'Runway-safe rest windows',
      quickVaultBody: 'Buffer growth and coverage',
      zoneStatus: '{zone} · {pct}% of income',
      runwayReserve: '{reserve} liquid reserve across spendable cash and vault',
      vaultInsight: '{vault} in vault. That covers about {days} baseline days.',
      highProbability: 'High probability',
      moderateProbability: 'Moderate probability',
      ofIncome: 'of income',
      chartSummary: '<span><strong>This month:</strong> {income} in and {spending} out.</span><span>8-month view.</span>',
    },
    expense: {
      documentTitle: 'Flux - Spending',
      addExpense: 'Add expense',
      spendingMeter: 'Spending meter',
      spent: 'Spent',
      daysLeft: 'Days left',
      spendingZone: 'Spending zone',
      safeBand: 'Safe <50%',
      moderateBand: 'Moderate 50-70%',
      riskBand: 'Risk >70%',
      financialRatios: 'Financial ratios',
      expenseRatio: 'Expense ratio',
      savingsRate: 'Savings rate',
      vaultContribution: 'Vault contribution',
      targetRatio: 'Target ratio',
      recommendedAction: 'Recommended action',
      recommendedActionBody: 'Review category pressure and log anything still missing.',
      categoryBreakdown: 'Category breakdown',
      dailyPace: 'Daily pace',
      period: '{month} · {daysIn} days in · {daysLeft} days remaining',
      spendingSub: '{spent} spent of {income} income',
      zoneDesc: 'You are in the {zone} at {pct}%',
      insight: 'Spend no more than <strong>{daily}/day</strong> to finish the month in the {zone} zone with {days} days remaining.',
      categorySub: '{month} spending vs monthly limits',
      statusAtLimit: 'At limit',
      statusNearLimit: 'Near limit',
      statusOnTrack: 'On track',
      paceSummary: '<span><strong>Pace:</strong> {daily}/day.</span><span>{days} days above pace.</span>',
      paceLine: 'Pace line',
      onPace: 'On pace',
      over: 'Over',
    },
    forecast: {
      documentTitle: 'Flux - Income Forecast',
      predictedMonthTotal: 'Predicted month total',
      highIncomeDays: 'High-income days',
      incomeRange: 'Income range (90% CI)',
      confidenceBand: 'model confidence band',
      volatilityIndex: 'Volatility index',
      dailyOpportunityMap: 'Daily opportunity map',
      none: 'None',
      peak: 'Peak',
      peakDays: 'Peak days',
      goodDays: 'Good days',
      slowDays: 'Slow days',
      restDays: 'Rest days',
      incomeTiers: 'Income tiers',
      peakMeta: '₹8,000+ · 80-95% probability',
      goodMeta: '₹4,000-₹8,000 · 55-80% probability',
      slowMeta: '₹1,500-₹4,000 · 30-55% probability',
      restMeta: 'Under ₹1,500 · under 30% probability',
      forecastSignals: 'Forecast signals',
      idealBreakWindow: 'Ideal break window',
      slowPeriod: 'Slow period',
      actualVsPlanned: 'Actual vs planned income',
      actualVsPlannedSub: 'Actual vs planned by week',
      actual: 'Actual',
      predicted: 'Predicted',
      period: '30-day earning model · {month} · {today} is today',
      pace: 'Above the {income} current pace',
      ofDaysInMonth: 'of {days} days in {month}',
      calendarTitle: '{month} earning probability calendar',
      volatilityHigh: 'High',
      volatilityModerate: 'Moderate',
      volatilityLow: 'Low',
      volatilityNote: '~±{volatility}% month-to-month swing',
      thisMonthCount: '{count} this month',
      probability: 'Probability: {value}%',
      todayTag: 'Today',
      forecastTag: 'Forecast',
      projectedSummary: '<span><strong>Projected total:</strong> {total}.</span><span>Current track vs plan.</span>',
    },
    breakPlanner: {
      documentTitle: 'Flux - Break Planner',
      pageSub: 'Model the cost of time off before you commit',
      aiPowered: 'AI-powered',
      currentRunway: 'Current financial runway',
      afterBreak: 'After break',
      change: 'Change',
      bannerHint: 'Pick a start date, click any low-pressure day in the calendar, and rerun the scenario if you want a locked result card.',
      configure: 'Configure your break',
      configureSub: 'Every change updates the runway numbers above and the projection below',
      oneDay: '1 day',
      sevenDays: '7 days',
      twentyOneDays: '21 days',
      dailySpendDuringBreak: 'Daily spend during break',
      startDate: 'Start date',
      drawFromVault: 'Draw from Safety Vault',
      drawFromVaultSub: 'Use vault only if daily cash runs short',
      runSimulation: 'Run simulation',
      simulationResults: 'Simulation results',
      plan: 'Plan',
      planHint: 'Move the sliders or tap a day in the calendar, then run the simulation to pin the current break scenario.',
      recommendedWindows: 'Recommended windows',
      lowPressureDates: 'Low-pressure dates',
      tapDayHint: 'Tap a day to move the break start date instantly',
      cashAndVaultProjection: 'Cash and vault projection',
      availableCash: 'Available cash',
      vaultBalance: 'Vault balance',
      accessibleReserve: 'Using {reserve} of accessible reserve for planning.',
      chartSub: 'Break impact over {days} days',
      totalHit: '<span><strong>Total hit:</strong> {cost}.</span><span>{verdict}.</span>',
      verdictSafe: 'Safe to take',
      verdictSafeNote: 'Reserve stays comfortably above your safety floor. This window is genuinely rest-friendly.',
      verdictCareful: 'Proceed carefully',
      verdictCarefulNote: 'You can take the break, but your buffer tightens. Keep the break lean or shift to a lower-income window.',
      verdictRisk: 'High financial risk',
      verdictRiskNote: 'This plan pulls too much from your reserve. Shorten the break or wait for a softer forecast window.',
      windowModelled: 'Window modelled: {days}',
      lostIncome: 'Lost income',
      breakExpenses: 'Break expenses',
      runwayAfter: 'Runway after',
      vaultCovers: 'Vault covers',
      off: 'Off',
    },
    vault: {
      documentTitle: 'Flux - Safety Vault',
      pageSub: 'Your automated financial safety net',
      currentBalance: 'Current vault balance',
      progressToGoal: 'Progress to {goal} goal',
      goalProgress: 'Target progress - {pct} reached',
      statistics: 'Vault statistics',
      totalDeposited: 'Total deposited',
      totalWithdrawn: 'Total withdrawn',
      interestEarned: 'Interest earned',
      autoSavedThisMonth: 'Auto-saved this month',
      nextAutoSave: 'Next auto-save',
      financialRunway: 'Financial runway',
      autoSaveRules: 'Auto-save rules',
      activeCount: '{count} active',
      ruleHighIncome: 'High income days',
      ruleHighIncomeMeta: '20% when daily income exceeds ₹8,000',
      ruleSurplus: 'Monthly surplus',
      ruleSurplusMeta: '50% of income above ₹40,000/month',
      ruleGoalBooster: 'Goal booster',
      ruleGoalBoosterMeta: '₹500 every week until vault reaches ₹30,000',
      ruleNightSave: 'Night-time save',
      ruleNightSaveMeta: '₹200 automatically every evening',
      milestones: 'Milestones',
      firstDeposit: 'First deposit',
      firstDepositMeta: '₹500 saved',
      oneWeekBuffer: 'One-week buffer',
      oneWeekBufferMeta: '₹7,000 saved',
      oneMonthBuffer: 'One-month buffer',
      currentProgress: 'Current progress',
      threeMonthFund: 'Three-month fund',
      threeMonthFundMeta: 'Longer emergency reserve',
      growth: 'Vault growth',
      growthSub: 'October 2025 through March 2026',
      onTrack: 'On track',
      transactions: 'Vault transactions',
      recentActivity: 'Most recent activity',
      projectionInsight: 'At the current auto-save pace of <strong>{pace}/month</strong>, you will reach the <strong>{goal} buffer goal</strong> in about <strong>{months} months</strong>.',
      coversApproximately: 'Covers approximately {days} baseline days at your current reserve requirement.',
      inDays: '{amount} in {days} days',
      goal: '{goal} goal',
      done: 'Done',
      locked: 'Locked',
    },
    profile: {
      documentTitle: 'Flux - Profile',
      pageSub: 'Account, goals, appearance, and security',
      editProfile: 'Edit profile',
      complete: 'Complete',
      irregularIncome: 'Irregular income',
      stabilityScore: 'Stability score',
      goodStanding: 'Good standing',
      financialGoals: 'Financial goals',
      monthlyIncomeTarget: 'Monthly income target',
      monthlyIncomeTargetDesc: 'Your earning goal per month',
      monthlyExpenseCeiling: 'Monthly expense ceiling',
      monthlyExpenseCeilingDesc: 'Maximum you aim to spend',
      vaultTarget: 'Safety Vault target',
      vaultTargetDesc: 'Emergency fund goal',
      minimumRunway: 'Minimum runway',
      minimumRunwayDesc: 'Alert threshold in months',
      edit: 'Edit',
      incomeProfile: 'Income profile',
      workType: 'Work type',
      workTypeDesc: 'Freelance setup',
      freelancer: 'Freelancer',
      paymentFrequency: 'Payment frequency',
      paymentFrequencyDesc: 'Income cadence',
      irregular: 'Irregular',
      appearance: 'Appearance',
      appearanceDesc: 'Choose your workspace theme.',
      notifications: 'Notifications',
      dailySummary: 'Daily summary',
      dailySummaryDesc: 'Morning overview of your finances',
      spendingAlerts: 'Spending alerts',
      spendingAlertsDesc: 'When you approach your expense limit',
      highIncomeAlerts: 'High-income day alerts',
      highIncomeAlertsDesc: '24 hours before predicted peaks',
      weeklyDigest: 'Weekly digest',
      weeklyDigestDesc: 'Sunday summary',
      breakReminders: 'Break reminders',
      breakRemindersDesc: 'Suggest rest on low-income windows',
      security: 'Security',
      biometricLock: 'Biometric lock',
      twoFactor: 'Two-factor authentication',
      exportAllData: 'Export all data',
      resetAppStats: 'Reset app stats',
      resetAppStatsDesc: 'Restore the demo numbers and charts',
      reset: 'Reset',
      deleteAccount: 'Delete account',
      deleteAccountDesc: 'Reset local Flux data',
      delete: 'Delete',
      achievements: 'Achievements',
      firstStep: 'First Step',
      firstStepDesc: 'Made first vault deposit',
      streakMaster: 'Streak Master',
      streakMasterDesc: '30 consecutive income days',
      smartBreak: 'Smart Break',
      smartBreakDesc: 'Break Planner used 3+ times',
      vaultMaster: 'Vault Master',
      vaultMasterDesc: 'Save ₹50,000 total',
      zeroOverspend: 'Zero Overspend',
      zeroOverspendDesc: '3 months under expense ceiling',
      earned: 'Earned',
      meta: '{email} · {city} · 6 months on Flux',
    },
  },
  hi: {
    table: {
      description: 'विवरण',
      date: 'तारीख',
      category: 'कैटेगरी',
      amount: 'राशि',
      limit: 'सीमा',
      usage: 'उपयोग',
      status: 'स्थिति',
      type: 'प्रकार',
    },
    weekday: {
      mon: 'सोम',
      tue: 'मंगल',
      wed: 'बुध',
      thu: 'गुरु',
      fri: 'शुक्र',
      sat: 'शनि',
      sun: 'रवि',
    },
    category: {
      housing: 'किराया और घर',
      food: 'खाना और डाइनिंग',
      tools: 'सब्सक्रिप्शन और टूल्स',
      transport: 'यातायात',
      health: 'स्वास्थ्य और मेडिकल',
      entertainment: 'मनोरंजन',
    },
    index: {
      documentTitle: 'Flux - अनियमित आय के लिए वित्तीय स्थिरता',
    },
    mobile: {
      documentTitle: 'Flux Mobile',
    },
    dashboard: {
      documentTitle: 'Flux - डैशबोर्ड',
      exportCsv: 'CSV एक्सपोर्ट',
      greeting: 'सुप्रभात, {name}',
      period: 'वित्तीय ओवरव्यू · {month} · {days} दिन पूरे',
      monthlyIncome: 'मासिक आय',
      incomeDelta: 'फ़रवरी के मुकाबले 12% ऊपर',
      monthlySpending: 'मासिक खर्च',
      spendingDelta: 'फ़रवरी के मुकाबले 4% ऊपर',
      financialRunway: 'वित्तीय रनवे',
      runwayDelta: 'पिछले महीने से +0.3 ऊपर',
      runwayFloor: 'न्यूनतम सुरक्षित स्तर: 2.0 महीने',
      safetyVault: 'सेफ्टी वॉल्ट',
      vaultStatus: 'ऑटो-सेव सामान्य रूप से चल रहा है',
      target: '{target} लक्ष्य',
      reached: '{pct}% पूरा',
      cashPicture: 'मासिक कैश पिक्चर',
      cashPictureSub: 'महीने के हिसाब से आय और खर्च',
      avgIncome: 'औसत आय',
      avgSpend: 'औसत खर्च',
      bestMonth: 'सबसे अच्छा महीना',
      avgSaved: 'औसत बचत',
      thisWeek: 'इस हफ्ते',
      liveWindow: 'लाइव ऑपरेटिंग विंडो',
      predictedIncome: 'अनुमानित आय',
      todayOutlook: 'आज का आउटलुक',
      nextPeakDay: 'अगला पीक दिन',
      safeDailySpend: 'सुरक्षित दैनिक खर्च',
      autoSavedToday: 'आज ऑटो-सेव',
      aiInsights: 'AI इनसाइट्स',
      peakDay: 'पीक दिन',
      peakDayBody: 'अगले पीक दिन को अधिक मूल्य वाले काम के लिए खाली रखें।',
      spendingNudge: 'खर्च संकेत',
      spendingNudgeBody: 'नया विवेकाधीन खर्च जोड़ने से पहले कैटेगरी प्रेशर देखें।',
      vaultOnTrack: 'वॉल्ट सही ट्रैक पर',
      recentTransactions: 'हाल के ट्रांजैक्शन',
      lastEntries: 'पिछली 5 एंट्रियां',
      allTransactions: 'सभी ट्रांजैक्शन →',
      spendingMixTitle: '{month} खर्च मिश्रण',
      spendingMixSub: 'कैटेगरी के अनुसार · कुल {total}',
      quickAccess: 'त्वरित पहुंच',
      quickSpendingBody: 'दैनिक रफ्तार और कैटेगरी प्रेशर',
      quickForecastBody: 'पीक-डे कैलेंडर और साप्ताहिक प्लान',
      quickBreakBody: 'रनवे-सुरक्षित आराम विंडो',
      quickVaultBody: 'बफर ग्रोथ और कवरेज',
      zoneStatus: '{zone} · आय का {pct}%',
      runwayReserve: '{reserve} लिक्विड रिज़र्व कैश और वॉल्ट में उपलब्ध है।',
      vaultInsight: 'वॉल्ट में {vault} है। यह लगभग {days} बेसलाइन दिनों को कवर करता है।',
      highProbability: 'उच्च संभावना',
      moderateProbability: 'मध्यम संभावना',
      ofIncome: 'आय का',
      chartSummary: '<span><strong>इस महीने:</strong> {income} आया और {spending} खर्च हुआ।</span><span>8 महीने का दृश्य।</span>',
    },
    expense: {
      documentTitle: 'Flux - खर्च',
      addExpense: 'खर्च जोड़ें',
      spendingMeter: 'खर्च मीटर',
      spent: 'खर्च',
      daysLeft: 'बचे दिन',
      spendingZone: 'खर्च ज़ोन',
      safeBand: 'सुरक्षित <50%',
      moderateBand: 'मध्यम 50-70%',
      riskBand: 'जोखिम >70%',
      financialRatios: 'वित्तीय अनुपात',
      expenseRatio: 'खर्च अनुपात',
      savingsRate: 'बचत दर',
      vaultContribution: 'वॉल्ट योगदान',
      targetRatio: 'लक्ष्य अनुपात',
      recommendedAction: 'सुझाया गया कदम',
      recommendedActionBody: 'कैटेगरी प्रेशर देखें और जो कुछ बाकी है उसे लॉग करें।',
      categoryBreakdown: 'कैटेगरी ब्रेकडाउन',
      dailyPace: 'दैनिक रफ्तार',
      period: '{month} · {daysIn} दिन पूरे · {daysLeft} दिन बाकी',
      spendingSub: '{income} आय में से {spent} खर्च',
      zoneDesc: 'आप {pct}% पर {zone} में हैं',
      insight: 'महीना {zone} ज़ोन में खत्म करने के लिए अगले {days} दिनों तक <strong>{daily}/दिन</strong> से ज़्यादा खर्च न करें।',
      categorySub: '{month} खर्च बनाम मासिक सीमा',
      statusAtLimit: 'सीमा पर',
      statusNearLimit: 'सीमा के पास',
      statusOnTrack: 'सही ट्रैक पर',
      paceSummary: '<span><strong>रफ्तार:</strong> {daily}/दिन।</span><span>{days} दिन रफ्तार से ऊपर रहे।</span>',
      paceLine: 'रफ्तार रेखा',
      onPace: 'रफ्तार में',
      over: 'ऊपर',
    },
    forecast: {
      documentTitle: 'Flux - आय पूर्वानुमान',
      predictedMonthTotal: 'अनुमानित मासिक कुल',
      highIncomeDays: 'उच्च-आय दिन',
      incomeRange: 'आय रेंज (90% CI)',
      confidenceBand: 'मॉडल कॉन्फिडेंस बैंड',
      volatilityIndex: 'वोलैटिलिटी इंडेक्स',
      dailyOpportunityMap: 'दैनिक अवसर मानचित्र',
      none: 'नहीं',
      peak: 'पीक',
      peakDays: 'पीक दिन',
      goodDays: 'अच्छे दिन',
      slowDays: 'धीमे दिन',
      restDays: 'आराम के दिन',
      incomeTiers: 'आय स्तर',
      peakMeta: '₹8,000+ · 80-95% संभावना',
      goodMeta: '₹4,000-₹8,000 · 55-80% संभावना',
      slowMeta: '₹1,500-₹4,000 · 30-55% संभावना',
      restMeta: '₹1,500 से कम · 30% से कम संभावना',
      forecastSignals: 'पूर्वानुमान संकेत',
      idealBreakWindow: 'आदर्श ब्रेक विंडो',
      slowPeriod: 'धीमा समय',
      actualVsPlanned: 'वास्तविक बनाम नियोजित आय',
      actualVsPlannedSub: 'सप्ताह के हिसाब से तुलना',
      actual: 'वास्तविक',
      predicted: 'अनुमानित',
      period: '30-दिन आय मॉडल · {month} · आज {today} है',
      pace: 'मौजूदा {income} रफ्तार से ऊपर',
      ofDaysInMonth: '{month} के {days} दिनों में से',
      calendarTitle: '{month} कमाई संभावना कैलेंडर',
      volatilityHigh: 'उच्च',
      volatilityModerate: 'मध्यम',
      volatilityLow: 'कम',
      volatilityNote: '~±{volatility}% महीना-दर-महीना उतार-चढ़ाव',
      thisMonthCount: 'इस महीने {count}',
      probability: 'संभावना: {value}%',
      todayTag: 'आज',
      forecastTag: 'पूर्वानुमान',
      projectedSummary: '<span><strong>अनुमानित कुल:</strong> {total}.</span><span>मौजूदा ट्रैक बनाम प्लान।</span>',
    },
    breakPlanner: {
      documentTitle: 'Flux - ब्रेक प्लानर',
      pageSub: 'कमिट करने से पहले समय-ऑफ की लागत मॉडल करें',
      aiPowered: 'AI-चालित',
      currentRunway: 'मौजूदा वित्तीय रनवे',
      afterBreak: 'ब्रेक के बाद',
      change: 'बदलाव',
      bannerHint: 'शुरुआती तारीख चुनें, कैलेंडर में लो-प्रेशर दिन पर टैप करें और लॉक्ड रिजल्ट कार्ड चाहिए तो सिमुलेशन फिर चलाएं।',
      configure: 'अपना ब्रेक सेट करें',
      configureSub: 'हर बदलाव ऊपर के रनवे नंबर और नीचे के प्रोजेक्शन को अपडेट करता है',
      oneDay: '1 दिन',
      sevenDays: '7 दिन',
      twentyOneDays: '21 दिन',
      dailySpendDuringBreak: 'ब्रेक के दौरान दैनिक खर्च',
      startDate: 'शुरुआती तारीख',
      drawFromVault: 'सेफ्टी वॉल्ट से लें',
      drawFromVaultSub: 'दैनिक कैश कम पड़े तो ही वॉल्ट इस्तेमाल करें',
      runSimulation: 'सिमुलेशन चलाएं',
      simulationResults: 'सिमुलेशन परिणाम',
      plan: 'प्लान',
      planHint: 'स्लाइडर बदलें या कैलेंडर में दिन चुनें, फिर मौजूदा ब्रेक परिदृश्य को पिन करने के लिए सिमुलेशन चलाएं।',
      recommendedWindows: 'सुझाई गई विंडो',
      lowPressureDates: 'लो-प्रेशर तारीखें',
      tapDayHint: 'ब्रेक की शुरुआत तुरंत बदलने के लिए दिन पर टैप करें',
      cashAndVaultProjection: 'कैश और वॉल्ट प्रोजेक्शन',
      availableCash: 'उपलब्ध कैश',
      vaultBalance: 'वॉल्ट बैलेंस',
      accessibleReserve: 'प्लानिंग के लिए {reserve} उपलब्ध रिज़र्व इस्तेमाल हो रहा है।',
      chartSub: '{days} दिनों के ब्रेक का प्रभाव',
      totalHit: '<span><strong>कुल असर:</strong> {cost}.</span><span>{verdict}.</span>',
      verdictSafe: 'ब्रेक लेना सुरक्षित है',
      verdictSafeNote: 'रिज़र्व आपके सेफ्टी फ़्लोर से आराम से ऊपर रहता है। यह विंडो वास्तव में आराम के अनुकूल है।',
      verdictCareful: 'सावधानी से आगे बढ़ें',
      verdictCarefulNote: 'आप ब्रेक ले सकते हैं, लेकिन बफर कड़ा हो जाता है। ब्रेक हल्का रखें या कम-आय विंडो चुनें।',
      verdictRisk: 'उच्च वित्तीय जोखिम',
      verdictRiskNote: 'यह प्लान रिज़र्व से बहुत ज्यादा निकालता है। ब्रेक छोटा करें या बेहतर विंडो का इंतज़ार करें।',
      windowModelled: 'मॉडल की गई विंडो: {days}',
      lostIncome: 'खोई हुई आय',
      breakExpenses: 'ब्रेक खर्च',
      runwayAfter: 'बाद का रनवे',
      vaultCovers: 'वॉल्ट कवरेज',
      off: 'बंद',
    },
    vault: {
      documentTitle: 'Flux - सेफ्टी वॉल्ट',
      pageSub: 'आपका ऑटोमेटेड वित्तीय सुरक्षा जाल',
      currentBalance: 'मौजूदा वॉल्ट बैलेंस',
      progressToGoal: '{goal} लक्ष्य तक प्रगति',
      goalProgress: 'लक्ष्य प्रगति - {pct} पूरा',
      statistics: 'वॉल्ट आँकड़े',
      totalDeposited: 'कुल जमा',
      totalWithdrawn: 'कुल निकासी',
      interestEarned: 'ब्याज आय',
      autoSavedThisMonth: 'इस महीने ऑटो-सेव',
      nextAutoSave: 'अगला ऑटो-सेव',
      financialRunway: 'वित्तीय रनवे',
      autoSaveRules: 'ऑटो-सेव नियम',
      activeCount: '{count} सक्रिय',
      ruleHighIncome: 'उच्च आय वाले दिन',
      ruleHighIncomeMeta: 'दैनिक आय ₹8,000 से ऊपर होने पर 20%',
      ruleSurplus: 'मासिक सरप्लस',
      ruleSurplusMeta: '₹40,000/माह से ऊपर की आय का 50%',
      ruleGoalBooster: 'लक्ष्य बूस्टर',
      ruleGoalBoosterMeta: 'वॉल्ट ₹30,000 तक पहुँचने तक हर सप्ताह ₹500',
      ruleNightSave: 'रात का सेव',
      ruleNightSaveMeta: 'हर शाम अपने आप ₹200',
      milestones: 'माइलस्टोन',
      firstDeposit: 'पहली जमा',
      firstDepositMeta: '₹500 बचाए',
      oneWeekBuffer: 'एक हफ्ते का बफर',
      oneWeekBufferMeta: '₹7,000 बचाए',
      oneMonthBuffer: 'एक महीने का बफर',
      currentProgress: 'मौजूदा प्रगति',
      threeMonthFund: 'तीन महीने का फंड',
      threeMonthFundMeta: 'लंबा इमरजेंसी रिज़र्व',
      growth: 'वॉल्ट ग्रोथ',
      growthSub: 'अक्टूबर 2025 से मार्च 2026 तक',
      onTrack: 'सही ट्रैक पर',
      transactions: 'वॉल्ट ट्रांजैक्शन',
      recentActivity: 'हाल की गतिविधि',
      projectionInsight: 'मौजूदा <strong>{pace}/माह</strong> ऑटो-सेव रफ्तार पर आप लगभग <strong>{months} महीने</strong> में <strong>{goal} बफर लक्ष्य</strong> तक पहुँच जाएंगे।',
      coversApproximately: 'यह आपकी मौजूदा रिज़र्व जरूरत पर लगभग {days} बेसलाइन दिनों को कवर करता है।',
      inDays: '{days} दिनों में {amount}',
      goal: '{goal} लक्ष्य',
      done: 'पूरा',
      locked: 'लॉक्ड',
    },
    profile: {
      documentTitle: 'Flux - प्रोफाइल',
      pageSub: 'अकाउंट, लक्ष्य, अपीयरेंस और सुरक्षा',
      editProfile: 'प्रोफाइल एडिट करें',
      complete: 'पूरा',
      irregularIncome: 'अनियमित आय',
      stabilityScore: 'स्थिरता स्कोर',
      goodStanding: 'अच्छी स्थिति',
      financialGoals: 'वित्तीय लक्ष्य',
      monthlyIncomeTarget: 'मासिक आय लक्ष्य',
      monthlyIncomeTargetDesc: 'हर महीने आपकी कमाई का लक्ष्य',
      monthlyExpenseCeiling: 'मासिक खर्च सीमा',
      monthlyExpenseCeilingDesc: 'जितना आप अधिकतम खर्च करना चाहते हैं',
      vaultTarget: 'सेफ्टी वॉल्ट लक्ष्य',
      vaultTargetDesc: 'इमरजेंसी फंड लक्ष्य',
      minimumRunway: 'न्यूनतम रनवे',
      minimumRunwayDesc: 'महीनों में अलर्ट सीमा',
      edit: 'एडिट',
      incomeProfile: 'आय प्रोफाइल',
      workType: 'काम का प्रकार',
      workTypeDesc: 'फ्रीलांस सेटअप',
      freelancer: 'फ्रीलांसर',
      paymentFrequency: 'पेमेंट फ़्रीक्वेंसी',
      paymentFrequencyDesc: 'आय की रफ्तार',
      irregular: 'अनियमित',
      appearance: 'अपीयरेंस',
      appearanceDesc: 'अपना वर्कस्पेस थीम चुनें।',
      notifications: 'नोटिफिकेशन',
      dailySummary: 'दैनिक सारांश',
      dailySummaryDesc: 'सुबह आपकी वित्तीय स्थिति का ओवरव्यू',
      spendingAlerts: 'खर्च अलर्ट',
      spendingAlertsDesc: 'जब आप खर्च सीमा के करीब पहुँचें',
      highIncomeAlerts: 'उच्च-आय दिन अलर्ट',
      highIncomeAlertsDesc: 'अनुमानित पीक से 24 घंटे पहले',
      weeklyDigest: 'साप्ताहिक डाइजेस्ट',
      weeklyDigestDesc: 'रविवार का सारांश',
      breakReminders: 'ब्रेक रिमाइंडर',
      breakRemindersDesc: 'कम-आय विंडो में आराम सुझाएं',
      security: 'सुरक्षा',
      biometricLock: 'बायोमेट्रिक लॉक',
      twoFactor: 'टू-फैक्टर ऑथेंटिकेशन',
      exportAllData: 'सारा डेटा एक्सपोर्ट करें',
      resetAppStats: 'ऐप स्टैट्स रीसेट करें',
      resetAppStatsDesc: 'डेमो नंबर और चार्ट वापस लाएं',
      reset: 'रीसेट',
      deleteAccount: 'अकाउंट डिलीट करें',
      deleteAccountDesc: 'लोकल Flux डेटा रीसेट करें',
      delete: 'डिलीट',
      achievements: 'अचीवमेंट्स',
      firstStep: 'पहला कदम',
      firstStepDesc: 'पहली वॉल्ट जमा की',
      streakMaster: 'स्ट्रीक मास्टर',
      streakMasterDesc: 'लगातार 30 आय वाले दिन',
      smartBreak: 'स्मार्ट ब्रेक',
      smartBreakDesc: 'ब्रेक प्लानर 3+ बार इस्तेमाल किया',
      vaultMaster: 'वॉल्ट मास्टर',
      vaultMasterDesc: 'कुल ₹50,000 बचाएं',
      zeroOverspend: 'ज़ीरो ओवरस्पेंड',
      zeroOverspendDesc: '3 महीने खर्च सीमा के भीतर',
      earned: 'कमाया',
      meta: '{email} · {city} · Flux पर 6 महीने',
    },
  },
};

const CATEGORY_LABEL_KEYS = {
  housing: 'category.housing',
  food: 'category.food',
  tools: 'category.tools',
  transport: 'category.transport',
  health: 'category.health',
  entertainment: 'category.entertainment',
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(target, source) {
  const output = Array.isArray(target) ? [...target] : { ...target };
  if (!source || typeof source !== 'object') return output;
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];
    if (Array.isArray(sourceValue)) output[key] = clone(sourceValue);
    else if (sourceValue && typeof sourceValue === 'object' && targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) output[key] = deepMerge(targetValue, sourceValue);
    else output[key] = sourceValue;
  });
  return output;
}

Object.keys(EXTRA_I18N).forEach((language) => {
  I18N[language] = deepMerge(I18N[language], EXTRA_I18N[language]);
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? deepMerge(clone(DEFAULT_STATE), JSON.parse(raw)) : clone(DEFAULT_STATE);
  } catch (_) {
    return clone(DEFAULT_STATE);
  }
}

const STATE = loadState();
const _subs = {};
let _chatOpen = false;
let _modalConfig = null;
let _mobileTab = 'overview';

function resolveI18nValue(dictionary, key) {
  return key.split('.').reduce((value, segment) => (value && typeof value === 'object' ? value[segment] : undefined), dictionary);
}

function getLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return LANGUAGE_CONFIG[stored] ? stored : 'en';
}

function getLocale(language = getLanguage()) {
  return LANGUAGE_CONFIG[language]?.locale || LANGUAGE_CONFIG.en.locale;
}

function t(key, vars = {}, language = getLanguage()) {
  const text = resolveI18nValue(I18N[language], key) ?? resolveI18nValue(I18N.en, key) ?? key;
  if (typeof text !== 'string') return key;
  return text.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ''));
}

function categoryLabel(category) {
  return t(CATEGORY_LABEL_KEYS[category?.id] || '', {}, getLanguage()) || category?.label || '';
}

function breakVerdictCopy(state) {
  if (state.runwayAfterBreak < 1.5) {
    return {
      text: t('breakPlanner.verdictRisk'),
      note: t('breakPlanner.verdictRiskNote'),
    };
  }
  if (state.runwayAfterBreak < 2.2) {
    return {
      text: t('breakPlanner.verdictCareful'),
      note: t('breakPlanner.verdictCarefulNote'),
    };
  }
  return {
    text: t('breakPlanner.verdictSafe'),
    note: t('breakPlanner.verdictSafeNote'),
  };
}

function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.setAttribute('title', t(node.dataset.i18nTitle));
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
  });
}

function syncLanguageButtons(root = document) {
  const language = getLanguage();
  root.querySelectorAll('[data-language-btn]').forEach((button) => {
    button.classList.toggle('active', button.dataset.languageBtn === language);
  });
}

function initLanguage() {
  document.documentElement.lang = LANGUAGE_CONFIG[getLanguage()].lang;
  applyTranslations();
  syncLanguageButtons();
}

function formatDurationDays(value) {
  return `${value} ${value === 1 && getLanguage() === 'en' ? t('unit.day') : t('unit.days')}`;
}

function formatRunway(value, short = false) {
  return `${value} ${short ? t('unit.monthShort') : t('unit.months')}`;
}

function formatRelativeDays(offset) {
  if (offset === 0) return t('common.today');
  if (getLanguage() === 'hi') return `${offset} दिन बाद`;
  return `In ${offset} day${offset === 1 ? '' : 's'}`;
}

function setLanguage(language) {
  if (!LANGUAGE_CONFIG[language]) return;
  localStorage.setItem(LANGUAGE_KEY, language);
  document.documentElement.lang = LANGUAGE_CONFIG[language].lang;
  applyTranslations();
  syncLanguageButtons();
  renderNav();
  const topbar = document.getElementById('topbar');
  if (topbar?.dataset.label) renderTopbar(topbar.dataset.label);
  emit('*');
}

function getLiveSnapshot() {
  const now = new Date();
  return {
    monthIndex: now.getMonth(),
    monthLabel: now.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' }),
    monthShort: now.toLocaleDateString(getLocale(), { month: 'short' }),
    year: now.getFullYear(),
    today: now.getDate(),
    daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  };
}

function syncLiveCalendarData() {
  const live = getLiveSnapshot();
  STATE.snapshot = {
    monthIndex: live.monthIndex,
    monthLabel: live.monthLabel,
    monthShort: live.monthShort,
    year: live.year,
    today: live.today,
  };
  STATE.daysPassed = live.today;
  STATE.daysInMonth = live.daysInMonth;
  return live;
}

function getActiveHeatmapDays() {
  const live = syncLiveCalendarData();
  return Array.from({ length: live.daysInMonth }, (_, index) => {
    const base = clone(STATE.heatmapDays[index % STATE.heatmapDays.length]);
    const day = index + 1;
    return {
      ...base,
      day,
      predicted: day > live.today,
    };
  });
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

function subscribe(keys, fn) {
  [].concat(keys).forEach((key) => {
    if (!_subs[key]) _subs[key] = [];
    _subs[key].push(fn);
  });
}

function emit(keys) {
  const snapshot = deriveState();
  const called = new Set();
  ['*', ...[].concat(keys)].forEach((key) => {
    (_subs[key] || []).forEach((fn) => {
      if (!called.has(fn)) {
        called.add(fn);
        fn(snapshot);
      }
    });
  });
}

function commit(key, value) {
  STATE[key] = value;
  persistState();
  emit(key);
}

function patchState(updates) {
  Object.assign(STATE, updates);
  persistState();
  emit(Object.keys(updates));
}

function resetStats() {
  const preserved = {
    profile: clone(STATE.profile),
    notifications: clone(STATE.notifications),
    security: clone(STATE.security),
    incomeTarget: STATE.incomeTarget,
    spendingTarget: STATE.spendingTarget,
    vaultGoal: STATE.vaultGoal,
    baselineNeed: STATE.baselineNeed,
    vaultRules: clone(STATE.vaultRules),
  };
  Object.keys(STATE).forEach((key) => { delete STATE[key]; });
  Object.assign(STATE, clone(DEFAULT_STATE), preserved);
  persistState();
  renderNav();
  emit('*');
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function curPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function toDate(day, monthOffset = 0) {
  const live = syncLiveCalendarData();
  return new Date(live.year, live.monthIndex + monthOffset, day);
}

function formatDateLabel(dateInput, opts = {}) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = [];
  if (opts.weekday) parts.push(date.toLocaleDateString(getLocale(), { weekday: 'short' }));
  parts.push(date.toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' }));
  return parts.join(' ');
}

function formatDateRange(startInput, endInput, opts = {}) {
  const start = startInput instanceof Date ? startInput : new Date(startInput);
  const end = endInput instanceof Date ? endInput : new Date(endInput);
  if (start.toDateString() === end.toDateString()) return formatDateLabel(start, opts);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const prefix = opts.weekday ? `${start.toLocaleDateString(getLocale(), { weekday: 'short' })} ` : `${start.toLocaleDateString(getLocale(), { month: 'short' })} `;
    return `${prefix}${start.getDate()}–${end.getDate()}`;
  }
  return `${formatDateLabel(start, opts)}–${formatDateLabel(end)}`;
}

function currentDateISO() {
  const live = syncLiveCalendarData();
  return `${live.year}-${String(live.monthIndex + 1).padStart(2, '0')}-${String(live.today).padStart(2, '0')}`;
}

function heatmapLeadOffset() {
  const live = syncLiveCalendarData();
  return (new Date(live.year, live.monthIndex, 1).getDay() + 6) % 7;
}

function historyMonthLabels(count) {
  const live = syncLiveCalendarData();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(live.year, live.monthIndex - (count - 1) + index, 1);
    return date.toLocaleDateString(getLocale(), { month: 'short' });
  });
}

// Keep currency grouping aligned with the currently selected locale.
function formatCurrency(value, options = {}) {
  const amount = Math.round(Math.abs(value));
  const compact = options.compact && amount >= 1000;
  const label = compact ? `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1).replace('.0', '')}k` : `₹${amount.toLocaleString(getLocale())}`;
  if (value < 0) return `-${label}`;
  if (options.sign === 'positive' && value > 0) return `+${label}`;
  return label;
}

function getHeatmapDay(day) {
  return getActiveHeatmapDays().find((entry) => entry.day === day);
}

function projectedDay(offset, startBase = STATE.breakStartDays) {
  const live = syncLiveCalendarData();
  const rawIndex = live.today + startBase + offset;
  const monthOffset = Math.max(0, Math.floor((rawIndex - 1) / live.daysInMonth));
  const day = ((rawIndex - 1) % live.daysInMonth) + 1;
  const base = getHeatmapDay(day) || { level: 1, amount: 1800, probability: 38, predicted: true };
  const taper = monthOffset ? Math.max(0.76, 1 - monthOffset * 0.08) : 1;
  return { ...base, day, monthOffset, amount: Math.round(base.amount * taper), date: toDate(day, monthOffset) };
}

function deriveState() {
  const live = syncLiveCalendarData();
  const heatmapDays = getActiveHeatmapDays();
  const categoryTotal = sum(STATE.categories.map((category) => category.spent));
  const remaining = Math.max(0, STATE.income - STATE.spending);
  const reserve = STATE.vault + remaining;
  const runway = +(reserve / STATE.baselineNeed).toFixed(1);
  const spendRatio = STATE.income ? STATE.spending / STATE.income : 0;
  const spendPct = Math.round(spendRatio * 100);
  const daysLeft = Math.max(0, live.daysInMonth - live.today);
  const dailyTarget = daysLeft ? Math.max(0, Math.round(remaining / daysLeft)) : 0;
  const zone = spendRatio < 0.5 ? 'safe' : spendRatio < 0.7 ? 'moderate' : 'risk';
  const zoneLabel = t(`zone.${zone}`);
  const zoneColor = zone === 'safe' ? 'var(--grn)' : zone === 'moderate' ? 'var(--amb)' : 'var(--red)';
  const zoneBadge = zone === 'safe' ? 'bg' : zone === 'moderate' ? 'ba' : 'br';
  const categoryShare = STATE.categories.map((category) => ({
    ...category,
    share: categoryTotal ? Math.round((category.spent / categoryTotal) * 100) : 0,
    usage: category.limit ? Math.round((category.spent / category.limit) * 100) : 0,
  }));
  const futureHeatmap = heatmapDays.filter((entry) => entry.day > live.today);
  const nextPeakDay = futureHeatmap.slice().sort((a, b) => b.amount - a.amount)[0] || heatmapDays[heatmapDays.length - 1];
  const predictedMonthTotal = sum(STATE.weeklyForecast.map((week) => Math.max(week.actual, week.predicted)));
  const forecastRange = { low: predictedMonthTotal - 8000, high: predictedMonthTotal + 8000 };
  const highIncomeDays = heatmapDays.filter((entry) => entry.level >= 4).length;
  const slowDays = heatmapDays.filter((entry) => entry.level === 1 || entry.level === 2).length;
  const restDays = heatmapDays.filter((entry) => entry.level === 0).length;
  const volatility = Math.round(((Math.max(...STATE.incomeHistory) - Math.min(...STATE.incomeHistory)) / Math.max(1, sum(STATE.incomeHistory) / STATE.incomeHistory.length)) * 100);
  const breakWindowDays = Array.from({ length: STATE.breakDays }, (_, index) => projectedDay(index));
  const breakLostIncome = Math.round(sum(breakWindowDays.map((day) => day.amount * 0.33)));
  const breakCost = Math.round(STATE.breakDays * STATE.breakDailyExp);
  const breakTotalCost = breakLostIncome + breakCost;
  const liquidReserve = remaining + (STATE.useVault ? STATE.vault : 0);
  const runwayAfterBreak = +(Math.max(0, liquidReserve - breakTotalCost) / STATE.baselineNeed).toFixed(1);
  const vaultAfterBreak = STATE.useVault ? Math.max(0, STATE.vault - Math.max(0, breakTotalCost - remaining)) : STATE.vault;
  const vaultCovers = Math.floor(STATE.vault / Math.max(1, STATE.breakDailyExp + STATE.baselineNeed / 30));
  let breakVerdict = { text: 'Safe to take', color: 'var(--grn)', note: 'Reserve stays comfortably above your safety floor. This window is genuinely rest-friendly.' };
  if (runwayAfterBreak < 2.2) breakVerdict = { text: 'Proceed carefully', color: 'var(--amb)', note: 'You can take the break, but your buffer tightens. Keep the break lean or shift to a lower-income window.' };
  if (runwayAfterBreak < 1.5) breakVerdict = { text: 'High financial risk', color: 'var(--red)', note: 'This plan pulls too much from your reserve. Shorten the break or wait for a softer forecast window.' };
  let bestWindow = { startOffset: 0, score: Number.POSITIVE_INFINITY };
  for (let startOffset = 0; startOffset < Math.min(14, daysLeft); startOffset += 1) {
    const days = Array.from({ length: Math.min(3, STATE.breakDays) }, (_, index) => {
      const rawIndex = live.today + startOffset + index;
      const day = ((rawIndex - 1) % live.daysInMonth) + 1;
      return heatmapDays.find((entry) => entry.day === day) || { amount: 1800 };
    });
    const score = sum(days.map((entry) => entry.amount));
    if (score < bestWindow.score) bestWindow = { startOffset, score };
  }
  const bestStartDate = projectedDay(bestWindow.startOffset, 0).date;
  const bestEndDate = projectedDay(bestWindow.startOffset + Math.max(0, Math.min(3, STATE.breakDays) - 1), 0).date;
  const todayDate = toDate(live.today);
  const slowStartDate = projectedDay(7, 0).date;
  const slowEndDate = projectedDay(13, 0).date;
  const averages = {
    income: Math.round(sum(STATE.incomeHistory) / STATE.incomeHistory.length),
    spend: Math.round(sum(STATE.spendHistory) / STATE.spendHistory.length),
  };
  const averageSaved = averages.income - averages.spend;
  return {
    ...clone(STATE),
    snapshot: {
      monthIndex: live.monthIndex,
      monthLabel: live.monthLabel,
      monthShort: live.monthShort,
      year: live.year,
      today: live.today,
    },
    daysInMonth: live.daysInMonth,
    daysPassed: live.today,
    remaining,
    reserve,
    runway,
    spendRatio,
    spendPct,
    daysLeft,
    dailyTarget,
    zone,
    zoneLabel,
    zoneColor,
    zoneBadge,
    categoryTotal,
    categoryShare,
    heatmapDays,
    nextPeakDay,
    predictedMonthTotal,
    forecastRange,
    highIncomeDays,
    slowDays,
    restDays,
    volatility,
    breakWindowDays,
    breakLostIncome,
    breakCost,
    breakTotalCost,
    runwayAfterBreak,
    vaultAfterBreak,
    vaultCovers,
    breakVerdict,
    bestBreakWindow: formatDateRange(bestStartDate, bestEndDate),
    currentDateLabel: formatDateLabel(todayDate),
    slowPeriodLabel: formatDateRange(slowStartDate, slowEndDate),
    heatmapLeadOffset: heatmapLeadOffset(),
    activeVaultRules: Object.entries(STATE.vaultRules).filter(([, enabled]) => enabled).map(([key]) => key),
    averages,
    averageSaved,
    savingsRate: STATE.income ? Math.round((remaining / STATE.income) * 100) : 0,
    vaultProgress: Math.round((STATE.vault / STATE.vaultGoal) * 100),
    daysCovered: Math.floor(STATE.vault / (STATE.baselineNeed / 30)),
    spendLimitPerDay: Math.round(STATE.spendingTarget / Math.max(1, live.daysInMonth)),
    overLimitCategories: categoryShare.filter((category) => category.usage >= 100),
    nearLimitCategories: categoryShare.filter((category) => category.usage >= 75 && category.usage < 100),
    profileInitials: initials(STATE.profile.name),
  };
}

const ICONS = {
  grid: '<rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/>',
  gauge: '<path d="M3 11.5a5 5 0 0 1 10 0"/><path d="M8 8l2.75-2.75"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
  forecast: '<path d="M2.5 12.5h11"/><path d="M4 10l2.4-3 2.3 1.9L12 4.5"/><path d="M10.4 4.5H12V6.1"/>',
  calendar: '<rect x="2.5" y="3.5" width="11" height="10" rx="1.6"/><path d="M5 2v3M11 2v3M2.5 7h11"/>',
  vault: '<rect x="2.5" y="3" width="11" height="10" rx="2"/><circle cx="8" cy="8" r="2.1"/><path d="M8 6.2v3.6M6.2 8h3.6"/>',
  user: '<circle cx="8" cy="5.2" r="2.5"/><path d="M3 13c0-2.6 2.3-4.6 5-4.6s5 2 5 4.6"/>',
  chat: '<path d="M3 4.5h10v6H7l-3.5 2V4.5Z"/><path d="M5.2 7h.01M8 7h.01M10.8 7h.01" stroke-linecap="round"/>',
  close: '<path d="M4 4l8 8M12 4l-8 8"/>',
  'chevron-right': '<path d="M6 3.5 10 8 6 12.5"/>',
  moon: '<path d="M10.7 2.8A5.3 5.3 0 1 0 13.2 10 4.7 4.7 0 0 1 10.7 2.8Z"/>',
  sun: '<circle cx="8" cy="8" r="2.6"/><path d="M8 1.8v1.7M8 12.5v1.7M3.6 3.6l1.2 1.2M11.2 11.2l1.2 1.2M1.8 8h1.7M12.5 8h1.7M3.6 12.4l1.2-1.2M11.2 4.8l1.2-1.2"/>',
  paper: '<path d="M4 2.5h6l2 2v9H4z"/><path d="M10 2.5v2h2"/><path d="M5.5 7.2h5M5.5 9.1h5M5.5 11h3.8"/>',
  home: '<path d="M2.8 7.4 8 3l5.2 4.4"/><path d="M4.5 6.8v6h7v-6"/>',
  utensils: '<path d="M4 2.5v5M6 2.5v5M4 5h2M10.5 2.5c1.2 1.5 1.2 3.7 0 5.2M10.5 7.7v5.8"/>',
  briefcase: '<rect x="2.5" y="4.5" width="11" height="8" rx="1.6"/><path d="M6 4.5V3.4h4v1.1M2.5 8h11"/>',
  car: '<path d="M3 9.5h10l-1-3H4l-1 3Z"/><circle cx="5.3" cy="10.8" r="1.1"/><circle cx="10.7" cy="10.8" r="1.1"/>',
  pulse: '<path d="M2.5 8h2.2l1.4-2.7 2.1 5.4 1.7-3.2h3.6"/>',
  sparkles: '<path d="M8 2.2 9.1 5 12 6.1 9.1 7.2 8 10 6.9 7.2 4 6.1 6.9 5 8 2.2Z"/><path d="M12.3 10.5 12.7 11.5 13.7 11.9 12.7 12.3 12.3 13.3 11.9 12.3 10.9 11.9 11.9 11.5 12.3 10.5Z"/><path d="M3.7 10.7 4.1 11.8 5.2 12.2 4.1 12.6 3.7 13.7 3.3 12.6 2.2 12.2 3.3 11.8 3.7 10.7Z"/>',
  bell: '<path d="M5 6.4A3 3 0 0 1 11 6.4v1.7c0 .8.3 1.6.9 2.2l.4.4H3.7l.4-.4c.6-.6.9-1.4.9-2.2V6.4Z"/><path d="M6.5 12a1.5 1.5 0 0 0 3 0"/>',
  shield: '<path d="M8 2.4 12 4v3.6c0 2.3-1.3 4.3-4 6-2.7-1.7-4-3.7-4-6V4l4-1.6Z"/>',
  target: '<circle cx="8" cy="8" r="4.5"/><circle cx="8" cy="8" r="2"/><path d="M8 1.8v1.7M8 12.5v1.7M1.8 8h1.7M12.5 8h1.7"/>',
  log: '<path d="M4 3.5h8M4 6.5h8M4 9.5h8M4 12.5h5"/>',
  download: '<path d="M8 2.5v7"/><path d="M5.2 7.6 8 10.4l2.8-2.8"/><path d="M3 12.5h10"/>',
  refresh: '<path d="M12 5.2V2.8H9.6"/><path d="M12 2.8A5.2 5.2 0 1 0 13 8"/><path d="M4 10.8v2.4h2.4"/><path d="M4 13.2A5.2 5.2 0 0 0 13 8"/>',
  phone: '<rect x="4.6" y="2.2" width="6.8" height="11.6" rx="1.6"/><path d="M7 4.2h2M7.1 11.8h1.8"/>',
  lock: '<rect x="3.4" y="7" width="9.2" height="6.5" rx="1.4"/><path d="M5.2 7V5.4a2.8 2.8 0 0 1 5.6 0V7"/>',
  logout: '<path d="M6 3.5H4.5A1.5 1.5 0 0 0 3 5v6a1.5 1.5 0 0 0 1.5 1.5H6"/><path d="M9 10.8 12 8 9 5.2"/><path d="M12 8H6.2"/>',
  edit: '<path d="M3.5 11.8 4 9.5l5.7-5.7 2.3 2.3-5.7 5.7-2.3.5Z"/><path d="m8.8 4.7 2.3 2.3"/>',
  trash: '<path d="M3.5 4.5h9"/><path d="M5.2 4.5V3.2h5.6v1.3M5 6.2v5.2M8 6.2v5.2M11 6.2v5.2"/><path d="M4.2 4.5 4.8 13h6.4l.6-8.5"/>',
  plus: '<path d="M8 3.2v9.6M3.2 8h9.6"/>',
  info: '<circle cx="8" cy="8" r="5.6"/><path d="M8 7v3M8 5.2h.01" stroke-linecap="round"/>',
};

function icon(name, opts = {}) {
  const size = opts.size || 16;
  const label = opts.label ? ` aria-label="${escapeHtml(opts.label)}" role="img"` : ' aria-hidden="true"';
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const content = ICONS[name] || ICONS.info;
  return `<svg${cls}${label} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:${size}px;height:${size}px;">${content}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon, { size: Number(node.dataset.iconSize || 16), label: node.dataset.iconLabel || '' });
    node.classList.add('svg-icon');
  });
}

function _cv(token) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll('[data-theme-btn]').forEach((button) => {
    button.classList.toggle('active', button.dataset.themeBtn === theme);
  });
  setTimeout(() => {
    document.querySelectorAll('[data-chart]').forEach((canvas) => {
      if (typeof canvas._redraw === 'function') canvas._redraw();
    });
  }, 90);
}

function initTheme() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
}

const NAV_ITEMS = [
  { href: 'dashboard.html', labelKey: 'nav.dashboard', sectionKey: 'nav.overviewSection', icon: 'grid' },
  { href: 'expense.html', labelKey: 'nav.spending', sectionKey: '', icon: 'gauge' },
  { href: 'heatmap.html', labelKey: 'nav.forecast', sectionKey: 'nav.predictionSection', icon: 'forecast' },
  { href: 'break.html', labelKey: 'nav.break', sectionKey: '', icon: 'calendar' },
  { href: 'vault.html', labelKey: 'nav.vault', sectionKey: 'nav.savingsSection', icon: 'vault' },
  { href: 'profile.html', labelKey: 'nav.profile', sectionKey: 'nav.accountSection', icon: 'user' },
];

const MOBILE_ITEMS = [
  { href: 'dashboard.html', labelKey: 'nav.home', icon: 'grid' },
  { href: 'expense.html', labelKey: 'nav.spend', icon: 'gauge' },
  { href: 'heatmap.html', labelKey: 'nav.forecastShort', icon: 'forecast' },
  { href: 'break.html', labelKey: 'nav.breakShort', icon: 'calendar' },
  { href: 'vault.html', labelKey: 'nav.vaultShort', icon: 'vault' },
];

const TOPBAR_LABELS = {
  Dashboard: 'nav.dashboard',
  Spending: 'nav.spending',
  'Income Forecast': 'nav.forecast',
  'Break Planner': 'nav.break',
  'Safety Vault': 'nav.vault',
  'Profile & Settings': 'nav.profile',
  'Mobile UI': 'nav.mobile',
};

function renderNav() {
  const sidebar = document.getElementById('sidebar');
  const page = curPage();
  const state = deriveState();
  if (sidebar) {
    let html = '';
    let section = '';
    NAV_ITEMS.forEach((item) => {
      const sectionLabel = item.sectionKey ? t(item.sectionKey) : '';
      if (sectionLabel && sectionLabel !== section) {
        if (section) html += '</div>';
        html += `<div class="sidebar-section"><div class="sidebar-section-label">${sectionLabel}</div>`;
        section = sectionLabel;
      } else if (!sectionLabel && !section) {
        html += '<div class="sidebar-section">';
        section = '__open__';
      }
      html += `<a href="${item.href}" class="nav-item${page === item.href ? ' active' : ''}">${icon(item.icon)}<span>${t(item.labelKey)}</span></a>`;
    });
    if (section) html += '</div>';
    sidebar.innerHTML = `
      <a href="index.html" class="sidebar-logo">
        <div class="logo-mark">fx</div>
        <span class="logo-name">Flux</span>
      </a>
      ${html}
      <div class="sidebar-bottom">
        <a href="profile.html" class="user-widget">
          <div class="user-ava">${state.profileInitials}</div>
          <div class="user-meta">
            <div class="user-name">${escapeHtml(state.profile.name)}</div>
            <div class="user-role">${escapeHtml(state.profile.role)}</div>
          </div>
          <span class="user-chevron">${icon('chevron-right', { size: 12 })}</span>
        </a>
      </div>
    `;
  }
  const mobile = document.getElementById('mobile-nav');
  if (mobile) {
    mobile.innerHTML = MOBILE_ITEMS.map((item) => `
      <a href="${item.href}" class="mob-nav-item${page === item.href ? ' active' : ''}">
        <span class="mob-nav-icon">${icon(item.icon, { size: 16 })}</span>
        ${t(item.labelKey)}
      </a>
    `).join('');
  }
}

function renderLanguageSwitcher() {
  return `
    <div class="language-switcher" aria-label="${escapeHtml(t('common.languageSwitcher'))}">
      <button class="language-btn" data-language-btn="en" type="button" onclick="setLanguage('en')" title="English">EN</button>
      <button class="language-btn" data-language-btn="hi" type="button" onclick="setLanguage('hi')" title="हिन्दी">हिं</button>
    </div>
  `;
}

function renderThemeSwitcher() {
  return `
    <div class="theme-switcher" aria-label="${escapeHtml(t('common.themeSwitcher'))}">
      <button class="theme-btn" data-theme-btn="dark" type="button" onclick="applyTheme('dark')" title="${escapeHtml(t('theme.dark'))}">${icon('moon', { size: 14 })}</button>
      <button class="theme-btn" data-theme-btn="light" type="button" onclick="applyTheme('light')" title="${escapeHtml(t('theme.light'))}">${icon('sun', { size: 14 })}</button>
      <button class="theme-btn" data-theme-btn="paper" type="button" onclick="applyTheme('paper')" title="${escapeHtml(t('theme.paper'))}">${icon('paper', { size: 14 })}</button>
    </div>
  `;
}

function buildTourContent(page = curPage()) {
  return `
    <div class="tour-grid">
      ${Object.entries(PAGE_TOUR).map(([key, item]) => `
        <div class="tour-card">
          <div class="tour-head">
            <span class="table-icon" style="color:${key === page ? 'var(--acc)' : 'var(--t3)'};">${icon(NAV_ITEMS.find((entry) => entry.href === key)?.icon || 'info', { size: 15 })}</span>
            ${escapeHtml(t(item.titleKey))}
            ${key === page ? `<span class="badge bg" style="margin-left:auto;">${escapeHtml(t('tour.current'))}</span>` : ''}
          </div>
          <div class="tour-copy">${escapeHtml(t(item.copyKey))}</div>
        </div>
      `).join('')}
    </div>
    <div class="body-sm" style="color:var(--t3);margin-top:14px;">
      ${t('tour.tip')}
    </div>
  `;
}

function renderTopbar(label) {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.dataset.label = label;
  const resolvedLabel = t(TOPBAR_LABELS[label] || label);
  topbar.innerHTML = `
    <div class="topbar-left">
      <div class="topbar-bc">
        <a href="index.html">Flux</a>
        <span class="bc-sep">/</span>
        <span class="bc-cur">${escapeHtml(resolvedLabel)}</span>
      </div>
    </div>
    <div class="topbar-right">
      ${renderLanguageSwitcher()}
      ${renderThemeSwitcher()}
      <div class="topbar-divider"></div>
      <button class="btn btn-ghost btn-sm" type="button" data-action="tour">${icon('info', { size: 13 })}<span>${escapeHtml(t('common.tour'))}</span></button>
      <button class="icon-btn" type="button" onclick="toggleChat()" title="Flux Assistant">${icon('chat', { size: 15 })}</button>
      <a href="profile.html" class="icon-btn" title="Profile">${icon('user', { size: 15 })}</a>
    </div>
  `;
  const theme = localStorage.getItem(THEME_KEY) || 'dark';
  topbar.querySelectorAll('[data-theme-btn]').forEach((button) => {
    button.classList.toggle('active', button.dataset.themeBtn === theme);
  });
  syncLanguageButtons(topbar);
}

function animCount(element, target, prefix = '', suffix = '', duration = 900) {
  if (!element) return;
  const roundedTarget = Math.round(Number(target) || 0);
  const previous = Number(element.dataset.lastCount);
  if (Number.isFinite(previous) && previous === roundedTarget) {
    element.textContent = `${prefix}${roundedTarget.toLocaleString(getLocale())}${suffix}`;
    return;
  }
  element.dataset.lastCount = String(roundedTarget);
  const start = performance.now();
  const run = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.round(roundedTarget * eased).toLocaleString(getLocale())}${suffix}`;
    if (progress < 1) requestAnimationFrame(run);
    else element.textContent = `${prefix}${roundedTarget.toLocaleString(getLocale())}${suffix}`;
  };
  requestAnimationFrame(run);
}

function initCounts() {
  document.querySelectorAll('[data-count]').forEach((element) => {
    animCount(element, Number(element.dataset.count || 0), element.dataset.prefix || '', element.dataset.suffix || '');
  });
}

function _setupCanvas(id, height) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 400;
  const resolvedHeight = height || 180;
  canvas.width = width * dpr;
  canvas.height = resolvedHeight * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${resolvedHeight}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, resolvedHeight);
  return { canvas, ctx, width, height: resolvedHeight };
}

function drawGrid(ctx, width, height, pad, rows = 4) {
  ctx.strokeStyle = _cv('--cgrid');
  ctx.lineWidth = 0.5;
  for (let index = 0; index <= rows; index += 1) {
    const y = pad.t + ((height - pad.t - pad.b) / rows) * index;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(width - pad.r, y);
    ctx.stroke();
  }
  return _cv('--ctxt');
}

function drawChip(ctx, text, x, y, options = {}) {
  if (!text) return;
  ctx.save();
  ctx.font = CHART_LABEL_FONT;
  const paddingX = 6;
  const height = 18;
  const textWidth = ctx.measureText(text).width;
  const width = textWidth + paddingX * 2;
  let left = x - width / 2;
  if (options.align === 'left') left = x;
  if (options.align === 'right') left = x - width;
  if (options.minX != null) left = Math.max(options.minX, left);
  if (options.maxX != null) left = Math.min(options.maxX - width, left);
  const top = y - height;
  ctx.fillStyle = _cv('--surf');
  ctx.strokeStyle = _cv('--bdr');
  ctx.lineWidth = 1;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 8);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(left, top, width, height);
    ctx.strokeRect(left, top, width, height);
  }
  ctx.fillStyle = options.color || _cv('--t2');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + width / 2, top + height / 2 + 0.5);
  ctx.restore();
}

function ensureChartFrame(id, note = '') {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  let frame = canvas.parentElement;
  if (!frame?.classList.contains('chart-wrap')) {
    frame = document.createElement('div');
    frame.className = 'chart-wrap';
    canvas.parentNode.insertBefore(frame, canvas);
    frame.appendChild(canvas);
  }
  let noteEl = frame.nextElementSibling;
  if (note) {
    if (!noteEl || !noteEl.classList.contains('chart-note')) {
      noteEl = document.createElement('div');
      noteEl.className = 'chart-note';
      frame.insertAdjacentElement('afterend', noteEl);
    }
    noteEl.innerHTML = note;
  } else if (noteEl?.classList.contains('chart-note')) {
    noteEl.remove();
  }
}

function drawArea(id, datasets, labels, options = {}) {
  const result = _setupCanvas(id, options.h || 190);
  if (!result) return;
  const { canvas, ctx, width, height } = result;
  const pad = options.pad || { t: 20, r: 16, b: 32, l: 52 };
  const values = datasets.flatMap((dataset) => dataset.data);
  const max = Math.max(...values, 1) * 1.12;
  const min = Math.min(...values, 0);
  const plotWidth = width - pad.l - pad.r;
  const plotHeight = height - pad.t - pad.b;
  const step = plotWidth / Math.max(labels.length - 1, 1);
  const tx = (index) => pad.l + index * step;
  const ty = (value) => pad.t + plotHeight - ((value - min) / Math.max(1, max - min)) * plotHeight;
  const textColor = drawGrid(ctx, width, height, pad, 4);
  ctx.fillStyle = textColor;
  ctx.font = CHART_FONT;
  ctx.textAlign = 'right';
  for (let index = 0; index <= 4; index += 1) {
    const value = min + ((max - min) / 4) * (4 - index);
    ctx.fillText(formatCurrency(value, { compact: true }), pad.l - 7, pad.t + (plotHeight / 4) * index + 3.5);
  }
  datasets.forEach((dataset) => {
    const stroke = _cv(`--${dataset.color}`) || dataset.color;
    if (dataset.fill) {
      ctx.beginPath();
      ctx.moveTo(tx(0), ty(dataset.data[0]));
      for (let index = 1; index < dataset.data.length; index += 1) {
        const cp = tx(index - 0.5);
        ctx.bezierCurveTo(cp, ty(dataset.data[index - 1]), cp, ty(dataset.data[index]), tx(index), ty(dataset.data[index]));
      }
      ctx.lineTo(tx(dataset.data.length - 1), height - pad.b);
      ctx.lineTo(tx(0), height - pad.b);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, pad.t, 0, height - pad.b);
      gradient.addColorStop(0, `${stroke}36`);
      gradient.addColorStop(1, `${stroke}04`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    ctx.beginPath();
    if (dataset.dash) ctx.setLineDash(dataset.dash);
    ctx.moveTo(tx(0), ty(dataset.data[0]));
    for (let index = 1; index < dataset.data.length; index += 1) {
      const cp = tx(index - 0.5);
      ctx.bezierCurveTo(cp, ty(dataset.data[index - 1]), cp, ty(dataset.data[index]), tx(index), ty(dataset.data[index]));
    }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.setLineDash([]);
    dataset.data.forEach((value, index) => {
      ctx.beginPath();
      ctx.arc(tx(index), ty(value), 3.2, 0, Math.PI * 2);
      ctx.fillStyle = stroke;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx(index), ty(value), 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = _cv('--surf');
      ctx.lineWidth = 1.8;
      ctx.stroke();
    });
  });
  ctx.fillStyle = textColor;
  ctx.font = CHART_FONT;
  ctx.textAlign = 'center';
  const xEvery = options.xEvery || 1;
  labels.forEach((label, index) => {
    if (index % xEvery !== 0 && index !== labels.length - 1) return;
    ctx.fillText(label, tx(index), height - pad.b + 17);
  });
  if (options.labelLast !== false) {
    datasets.forEach((dataset, datasetIndex) => {
      const value = dataset.data[dataset.data.length - 1];
      const stroke = _cv(`--${dataset.color}`) || dataset.color;
      drawChip(
        ctx,
        `${options.datasetLabels?.[datasetIndex] ? `${options.datasetLabels[datasetIndex]} ` : ''}${formatCurrency(value, { compact: true })}`,
        tx(dataset.data.length - 1),
        Math.max(pad.t + 16, ty(value) - 10 - datasetIndex * 20),
        { color: stroke, minX: pad.l, maxX: width - pad.r }
      );
    });
  }
  canvas.dataset.chart = '1';
  canvas._redraw = () => drawArea(id, datasets, labels, options);
}

function drawBars(id, groups, labels, options = {}) {
  const result = _setupCanvas(id, options.h || 180);
  if (!result) return;
  const { canvas, ctx, width, height } = result;
  const pad = options.pad || { t: 16, r: 14, b: 30, l: 48 };
  const values = groups.flatMap((group) => group.data);
  const max = Math.max(...values, 1) * 1.14;
  const plotHeight = height - pad.t - pad.b;
  const plotWidth = width - pad.l - pad.r;
  const groupWidth = plotWidth / labels.length;
  const inner = groupWidth * 0.16;
  const barWidth = (groupWidth - inner * 2) / groups.length;
  const textColor = drawGrid(ctx, width, height, pad, 4);
  ctx.fillStyle = textColor;
  ctx.font = CHART_FONT;
  ctx.textAlign = 'right';
  for (let index = 0; index <= 4; index += 1) {
    const value = (max / 4) * (4 - index);
    ctx.fillText(formatCurrency(value, { compact: true }), pad.l - 5, pad.t + (plotHeight / 4) * index + 3.5);
  }
  labels.forEach((label, groupIndex) => {
    groups.forEach((group, dataIndex) => {
      const color = _cv(`--${group.color}`) || group.color;
      const value = group.data[groupIndex];
      const barHeight = (value / max) * plotHeight;
      const x = pad.l + groupWidth * groupIndex + inner + dataIndex * barWidth;
      const y = pad.t + plotHeight - barHeight;
      const gradient = ctx.createLinearGradient(0, y, 0, height - pad.b);
      gradient.addColorStop(0, `${color}d8`);
      gradient.addColorStop(1, `${color}44`);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barWidth - 2, barHeight, [5, 5, 0, 0]);
      else ctx.rect(x, y, barWidth - 2, barHeight);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
    ctx.fillStyle = textColor;
    ctx.font = CHART_FONT;
    ctx.textAlign = 'center';
    if (groupIndex % (options.xEvery || 1) === 0 || groupIndex === labels.length - 1) {
      ctx.fillText(label, pad.l + groupWidth * groupIndex + groupWidth / 2, height - pad.b + 16);
    }
  });
  if (options.reference) {
    const value = options.reference.value;
    const y = pad.t + plotHeight - (value / max) * plotHeight;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = _cv(`--${options.reference.color}`) || options.reference.color;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(width - pad.r, y);
    ctx.stroke();
    ctx.setLineDash([]);
    if (options.reference.label) {
      drawChip(ctx, options.reference.label, width - pad.r, y - 6, {
        align: 'right',
        color: _cv(`--${options.reference.color}`) || options.reference.color,
        minX: pad.l,
        maxX: width - pad.r,
      });
    }
  }
  if (options.labelStrategy) {
    const labelIndexes = new Set();
    if (options.labelStrategy === 'last') labelIndexes.add(labels.length - 1);
    if (options.labelStrategy === 'last-nonzero') {
      groups.forEach((group) => {
        for (let index = group.data.length - 1; index >= 0; index -= 1) {
          if (group.data[index] > 0) {
            labelIndexes.add(index);
            break;
          }
        }
      });
    }
    if (options.labelStrategy === 'peak-and-last') {
      labelIndexes.add(labels.length - 1);
      groups.forEach((group) => labelIndexes.add(group.data.indexOf(Math.max(...group.data))));
    }
    [...labelIndexes].forEach((groupIndex) => {
      groups.forEach((group, dataIndex) => {
        const value = group.data[groupIndex];
        if (!value) return;
        const color = _cv(`--${group.color}`) || group.color;
        const barHeight = (value / max) * plotHeight;
        const x = pad.l + groupWidth * groupIndex + inner + dataIndex * barWidth;
        const y = pad.t + plotHeight - barHeight;
        drawChip(
          ctx,
          `${options.datasetLabels?.[dataIndex] ? `${options.datasetLabels[dataIndex]} ` : ''}${formatCurrency(value, { compact: true })}`,
          x + (barWidth - 2) / 2,
          Math.max(pad.t + 18, y - 6 - dataIndex * 20),
          { color, minX: pad.l, maxX: width - pad.r }
        );
      });
    });
  }
  canvas.dataset.chart = '1';
  canvas._redraw = () => drawBars(id, groups, labels, options);
}

function drawDonut(id, segments, options = {}) {
  const size = options.size || 160;
  const result = _setupCanvas(id, size);
  if (!result) return;
  const { canvas, ctx, width, height } = result;
  const cx = width / 2;
  const cy = height / 2;
  const radius = size / 2 - 8;
  const innerRadius = radius - (options.thickness || 30);
  const total = Math.max(segments.reduce((acc, segment) => acc + segment.value, 0), 1);
  let start = -Math.PI / 2;
  segments.forEach((segment) => {
    const color = _cv(`--${segment.color}`) || segment.color;
    const sweep = (segment.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + sweep);
    ctx.arc(cx, cy, innerRadius, start + sweep, start, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    start += sweep + 0.014;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius - 2, 0, Math.PI * 2);
  ctx.fillStyle = _cv('--surf');
  ctx.fill();
  if (options.centerLabel) {
    ctx.fillStyle = _cv('--t1');
    ctx.font = `600 ${options.centerSize || 18}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.centerLabel, cx, cy - 7);
    ctx.fillStyle = _cv('--t3');
    ctx.font = "500 10px Inter, sans-serif";
    ctx.fillText(options.centerSub || '', cx, cy + 11);
  }
  canvas.dataset.chart = '1';
  canvas._redraw = () => drawDonut(id, segments, options);
}

function drawSpark(id, data, colorKey, options = {}) {
  const result = _setupCanvas(id, options.h || 40);
  if (!result) return;
  const { canvas, ctx, width, height } = result;
  const color = _cv(`--${colorKey}`) || colorKey;
  const padding = 2;
  const max = Math.max(...data, 1) * 1.08;
  const min = Math.min(...data, 0);
  const plotHeight = height - padding * 2;
  const step = (width - padding * 2) / Math.max(data.length - 1, 1);
  const tx = (index) => padding + index * step;
  const ty = (value) => padding + plotHeight - ((value - min) / Math.max(1, max - min)) * plotHeight;
  ctx.beginPath();
  ctx.moveTo(tx(0), ty(data[0]));
  for (let index = 1; index < data.length; index += 1) {
    const cp = tx(index - 0.5);
    ctx.bezierCurveTo(cp, ty(data[index - 1]), cp, ty(data[index]), tx(index), ty(data[index]));
  }
  ctx.lineTo(tx(data.length - 1), height - padding);
  ctx.lineTo(tx(0), height - padding);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color}44`);
  gradient.addColorStop(1, `${color}04`);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tx(0), ty(data[0]));
  for (let index = 1; index < data.length; index += 1) {
    const cp = tx(index - 0.5);
    ctx.bezierCurveTo(cp, ty(data[index - 1]), cp, ty(data[index]), tx(index), ty(data[index]));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  canvas.dataset.chart = '1';
  canvas._redraw = () => drawSpark(id, data, colorKey, options);
}

function setRing(id, percent, colorKey = 'acc') {
  const svg = document.getElementById(id);
  if (!svg) return;
  const ring = svg.querySelector('.ring-fill');
  if (!ring) return;
  const radius = Number(ring.getAttribute('r'));
  const circumference = 2 * Math.PI * radius;
  ring.setAttribute('stroke-dasharray', circumference);
  ring.setAttribute('stroke-dashoffset', circumference * (1 - Math.min(percent, 100) / 100));
  ring.setAttribute('stroke', _cv(`--${colorKey}`));
}

function initToggles() {
  document.querySelectorAll('.toggle[data-key]').forEach((toggle) => {
    const key = toggle.dataset.key;
    const sub = toggle.dataset.sub;
    const current = sub ? STATE[key]?.[sub] : STATE[key];
    toggle.classList.toggle('on', Boolean(current));
    toggle.addEventListener('click', () => {
      const next = !toggle.classList.contains('on');
      toggle.classList.toggle('on', next);
      if (sub) commit(key, { ...STATE[key], [sub]: next });
      else commit(key, next);
      const row = toggle.closest('.sr,.li,.setting-row');
      const name = row?.querySelector('.sr-name,.li-name')?.textContent?.trim() || 'Setting';
      showToast(`${name} ${next ? 'enabled' : 'disabled'}`, next ? 'success' : 'info');
    });
  });
}

function showToast(message, type = 'info') {
  document.getElementById('_toast')?.remove();
  const colors = { info: 'var(--acc)', success: 'var(--grn)', error: 'var(--red)', warn: 'var(--amb)' };
  const toast = document.createElement('div');
  toast.id = '_toast';
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--surf);border:1px solid var(--bdr);border-left:3px solid ${colors[type] || colors.info};color:var(--t1);font-family:var(--font);font-size:12px;font-weight:500;padding:9px 16px;border-radius:9px;box-shadow:var(--s3);z-index:9999;max-width:min(calc(100vw - 24px), 440px);line-height:1.45;animation:toastIn .18s ease;`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .25s';
    setTimeout(() => toast.remove(), 260);
  }, 2600);
}

function inferCategoryId(note) {
  const value = note.toLowerCase();
  if (/rent|house|home|flat|utility/.test(value)) return 'housing';
  if (/food|dining|grocery|coffee|meal/.test(value)) return 'food';
  if (/tool|software|subscription|saas|domain|hosting/.test(value)) return 'tools';
  if (/cab|taxi|uber|transport|train|fuel/.test(value)) return 'transport';
  if (/doctor|health|medical|medicine/.test(value)) return 'health';
  if (/movie|fun|entertain|game|event/.test(value)) return 'entertainment';
  return 'entertainment';
}

function modalTemplate(config) {
  const fields = config.fields || [];
  return `
    <div class="modal-title">${escapeHtml(config.title)}</div>
    ${config.description ? `<div class="body-sm" style="color:var(--t3);margin-bottom:16px;line-height:1.6;">${config.description}</div>` : ''}
    ${config.content || ''}
    ${fields.map((field) => `
      <div class="form-group">
        <label class="form-label">${escapeHtml(field.label)}</label>
        <input class="form-input" data-modal-field="${field.key}" type="${field.type || 'text'}" placeholder="${escapeHtml(field.placeholder || '')}" value="${escapeHtml(field.value ?? '')}" ${field.min != null ? `min="${field.min}"` : ''} ${field.step != null ? `step="${field.step}"` : ''}/>
      </div>
    `).join('')}
    <div style="display:flex;gap:9px;margin-top:8px;">
      <button class="btn btn-primary btn-full" type="button" id="_modal-confirm">${escapeHtml(config.confirmLabel || 'Save')}</button>
      ${config.hideCancel ? '' : '<button class="btn btn-secondary" type="button" id="_modal-cancel" style="flex-shrink:0;">Cancel</button>'}
    </div>
  `;
}

function getModalConfigs() {
  const state = deriveState();
  return {
    expense: {
      title: 'Add expense',
      description: 'Log an expense and update the dashboard, spending view, and assistant context instantly.',
      confirmLabel: 'Add expense',
      fields: [
        { key: 'amount', label: 'Amount (₹)', type: 'number', min: 1, step: 100, placeholder: '0' },
        { key: 'note', label: 'Category or note', placeholder: 'Food, transport, rent, tools...' },
      ],
      submit(data) {
        const amount = Number(data.amount);
        if (!amount) throw new Error('Please enter a valid amount.');
        const note = data.note?.trim() || 'Manual expense';
        const categoryId = inferCategoryId(note);
        const categories = clone(STATE.categories);
        const category = categories.find((entry) => entry.id === categoryId);
        if (category) category.spent += amount;
        const dailySpend = [...STATE.dailySpend];
        dailySpend[dailySpend.length - 1] = (dailySpend[dailySpend.length - 1] || 0) + amount;
        const transactions = [{ id: `tx-${Date.now()}`, label: note, date: currentDateISO(), category: category?.label || 'Other', amount, flow: 'out', tone: 'br' }, ...STATE.transactions].slice(0, 8);
        patchState({
          spending: STATE.spending + amount,
          categories,
          dailySpend,
          transactions,
          spendHistory: [...STATE.spendHistory.slice(0, -1), STATE.spending + amount],
        });
        showToast(`${formatCurrency(amount)} expense added`, 'success');
      },
    },
    deposit: {
      title: 'Deposit to vault',
      description: 'Add a manual transfer and immediately see the new runway and goal progress.',
      confirmLabel: 'Confirm deposit',
      fields: [
        { key: 'amount', label: 'Amount (₹)', type: 'number', min: 1, step: 100, placeholder: '0' },
        { key: 'note', label: 'Note', placeholder: 'Monthly surplus, bonus, invoice...' },
      ],
      submit(data) {
        const amount = Number(data.amount);
        if (!amount) throw new Error('Please enter a valid amount.');
        const note = data.note?.trim() || 'Manual deposit';
        const vaultTransactions = [{ id: `vt-${Date.now()}`, label: note, date: currentDateISO(), type: 'Manual', amount, flow: 'in', tone: 'bl' }, ...STATE.vaultTransactions].slice(0, 8);
        patchState({
          vault: STATE.vault + amount,
          vaultTransactions,
          vaultHistory: [...STATE.vaultHistory.slice(1), STATE.vault + amount],
        });
        showToast(`${formatCurrency(amount)} moved into vault`, 'success');
      },
    },
    withdraw: {
      title: 'Withdraw from vault',
      description: 'Use your buffer intentionally. The vault and runway update as soon as you confirm.',
      confirmLabel: 'Confirm withdrawal',
      fields: [
        { key: 'amount', label: 'Amount (₹)', type: 'number', min: 1, step: 100, placeholder: '0' },
        { key: 'note', label: 'Reason', placeholder: 'Break fund, emergency, bill...' },
      ],
      submit(data) {
        const amount = Number(data.amount);
        if (!amount) throw new Error('Please enter a valid amount.');
        const nextVault = Math.max(0, STATE.vault - amount);
        const note = data.note?.trim() || 'Vault withdrawal';
        const vaultTransactions = [{ id: `vt-${Date.now()}`, label: note, date: currentDateISO(), type: 'Withdraw', amount, flow: 'out', tone: 'ba' }, ...STATE.vaultTransactions].slice(0, 8);
        patchState({
          vault: nextVault,
          vaultTransactions,
          vaultHistory: [...STATE.vaultHistory.slice(1), nextVault],
        });
        showToast(`${formatCurrency(amount)} withdrawn from vault`, 'warn');
      },
    },
    profile: {
      title: 'Edit profile',
      description: 'These changes update the profile page and shared navigation instantly.',
      confirmLabel: 'Save profile',
      fields: [
        { key: 'name', label: 'Full name', value: STATE.profile.name },
        { key: 'email', label: 'Email', type: 'email', value: STATE.profile.email },
        { key: 'city', label: 'City', value: STATE.profile.city },
        { key: 'role', label: 'Role', value: STATE.profile.role },
      ],
      submit(data) {
        commit('profile', {
          ...STATE.profile,
          name: data.name?.trim() || STATE.profile.name,
          email: data.email?.trim() || STATE.profile.email,
          city: data.city?.trim() || STATE.profile.city,
          role: data.role?.trim() || STATE.profile.role,
        });
        renderNav();
        showToast('Profile updated', 'success');
      },
    },
    incomeTarget: {
      title: 'Update income target',
      confirmLabel: 'Save target',
      fields: [{ key: 'value', label: 'Monthly income target (₹)', type: 'number', min: 1000, step: 500, value: STATE.incomeTarget }],
      submit(data) {
        const value = Number(data.value);
        if (!value) throw new Error('Please enter a valid income target.');
        commit('incomeTarget', value);
        showToast('Income target updated', 'success');
      },
    },
    spendingTarget: {
      title: 'Update expense ceiling',
      confirmLabel: 'Save ceiling',
      fields: [{ key: 'value', label: 'Monthly expense ceiling (₹)', type: 'number', min: 1000, step: 500, value: STATE.spendingTarget }],
      submit(data) {
        const value = Number(data.value);
        if (!value) throw new Error('Please enter a valid expense ceiling.');
        commit('spendingTarget', value);
        showToast('Expense ceiling updated', 'success');
      },
    },
    vaultGoal: {
      title: 'Update vault target',
      confirmLabel: 'Save goal',
      fields: [{ key: 'value', label: 'Vault goal (₹)', type: 'number', min: 5000, step: 1000, value: STATE.vaultGoal }],
      submit(data) {
        const value = Number(data.value);
        if (!value) throw new Error('Please enter a valid vault goal.');
        commit('vaultGoal', value);
        showToast('Vault goal updated', 'success');
      },
    },
    runwayTarget: {
      title: 'Update runway minimum',
      confirmLabel: 'Save minimum',
      fields: [{ key: 'value', label: 'Minimum runway (months)', type: 'number', min: 1, step: 0.1, value: state.runway >= 2 ? 2 : 1.5 }],
      submit(data) {
        const value = Number(data.value);
        if (!value) throw new Error('Please enter a valid runway target.');
        commit('baselineNeed', Math.round(state.reserve / value));
        showToast('Minimum runway target updated', 'success');
      },
    },
    tour: {
      id: 'tour',
      title: 'Flux quick tour',
      description: 'A short map of what each page is for, so the app feels easier to read at a glance.',
      content: buildTourContent(curPage()),
      confirmLabel: 'Close tour',
      hideCancel: true,
      submit() {
        localStorage.setItem(TOUR_KEY, '1');
      },
    },
  };
}

function _injectModal() {
  if (document.getElementById('_modal')) return;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal-overlay" id="_modal"><div class="modal-box" id="_modal-box"></div></div>`);
  document.getElementById('_modal').addEventListener('click', (event) => {
    if (event.target.id === '_modal') closeModal();
  });
}

function openModal(type) {
  _injectModal();
  const config = getModalConfigs()[type];
  const overlay = document.getElementById('_modal');
  const box = document.getElementById('_modal-box');
  if (!config || !overlay || !box) return;
  _modalConfig = config;
  box.innerHTML = modalTemplate(config);
  overlay.classList.add('open');
  box.querySelector('#_modal-confirm')?.addEventListener('click', confirmModal);
  box.querySelector('#_modal-cancel')?.addEventListener('click', closeModal);
  (box.querySelector('[data-modal-field]') || box.querySelector('#_modal-confirm'))?.focus();
}

function closeModal() {
  if (_modalConfig?.id === 'tour') localStorage.setItem(TOUR_KEY, '1');
  _modalConfig = null;
  document.getElementById('_modal')?.classList.remove('open');
}

function confirmModal() {
  if (!_modalConfig) return;
  const payload = {};
  document.querySelectorAll('[data-modal-field]').forEach((field) => {
    payload[field.dataset.modalField] = field.value;
  });
  try {
    _modalConfig.submit(payload);
    closeModal();
  } catch (error) {
    showToast(error.message || 'Please review the form.', 'error');
  }
}

function exportCSV() {
  const rows = [['Date', 'Description', 'Category', 'Amount']];
  const state = deriveState();
  state.transactions.forEach((entry) => {
    rows.push([formatDateLabel(entry.date), entry.label, entry.category, entry.flow === 'in' ? entry.amount : -entry.amount]);
  });
  const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const filename = `flux-${state.snapshot.monthShort.toLowerCase()}-${state.snapshot.year}.csv`;
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename}`, 'success');
}

function renderTransactionRows(entries) {
  return entries.map((entry) => {
    const amount = entry.flow === 'in' ? formatCurrency(entry.amount, { sign: 'positive' }) : entry.flow === 'vault' ? `→ ${formatCurrency(entry.amount)}` : formatCurrency(-entry.amount);
    const color = entry.flow === 'in' ? 'var(--grn)' : entry.flow === 'vault' ? 'var(--teal)' : 'var(--red)';
    return `<tr><td class="td-m">${escapeHtml(entry.label)}</td><td>${formatDateLabel(entry.date)}</td><td><span class="badge ${entry.tone}">${escapeHtml(entry.category)}</span></td><td class="td-n" style="text-align:right;color:${color};">${amount}</td></tr>`;
  }).join('');
}

function renderVaultRows(entries) {
  return entries.map((entry) => {
    const amount = entry.flow === 'in' ? formatCurrency(entry.amount, { sign: 'positive' }) : formatCurrency(-entry.amount);
    const color = entry.flow === 'in' ? 'var(--grn)' : 'var(--red)';
    return `<tr><td class="td-m">${escapeHtml(entry.label)}</td><td>${formatDateLabel(entry.date)}</td><td><span class="badge ${entry.tone}">${escapeHtml(entry.type)}</span></td><td class="td-n" style="text-align:right;color:${color};">${amount}</td></tr>`;
  }).join('');
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setHtml(id, value) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = value;
}

function setWidth(id, percent) {
  const element = document.getElementById(id);
  if (element) element.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function setClass(id, nextClass) {
  const element = document.getElementById(id);
  if (!element) return;
  element.className = element.className.replace(/\b(bg|br|ba|bl|bt|bk)\b/g, '').trim();
  element.classList.add(nextClass);
}

function renderSpendLegend(state) {
  const container = document.getElementById('dash-spend-legend');
  if (!container) return;
  container.innerHTML = state.categoryShare.slice(0, 5).map((category) => `
    <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;">
      <span style="display:flex;align-items:center;gap:6px;color:var(--t2);">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--${category.tone});display:inline-block;"></span>
        ${escapeHtml(categoryLabel(category))}
      </span>
      <span style="font-family:var(--mono);font-weight:600;font-size:11px;">${category.share}%</span>
    </div>
  `).join('');
}

function renderCategoryTable(state) {
  const table = document.getElementById('cat-table');
  if (!table) return;
  table.innerHTML = state.categoryShare.map((category) => {
    const usage = Math.min(category.usage, 100);
    const tone = category.usage >= 100 ? 'var(--red)' : category.usage >= 75 ? 'var(--amb)' : 'var(--grn)';
    const badge = category.usage >= 100 ? 'br' : category.usage >= 75 ? 'ba' : 'bg';
    const label = category.usage >= 100 ? t('expense.statusAtLimit') : category.usage >= 75 ? t('expense.statusNearLimit') : t('expense.statusOnTrack');
    return `<tr><td class="td-m"><span style="display:inline-flex;align-items:center;gap:8px;"><span class="table-icon">${icon(category.icon, { size: 14 })}</span>${escapeHtml(categoryLabel(category))}</span></td><td class="td-n">${formatCurrency(category.spent)}</td><td style="color:var(--t3);font-family:var(--mono);font-size:12px;">${formatCurrency(category.limit)}</td><td><div style="display:flex;align-items:center;gap:9px;"><div class="prog" style="flex:1;margin:0;height:5px;"><div class="pf" style="width:${usage}%;background:${tone};"></div></div><span style="font-size:10.5px;color:var(--t3);width:34px;text-align:right;">${category.usage}%</span></div></td><td><span class="badge ${badge}">${label}</span></td></tr>`;
  }).join('');
}

function renderDashboard(state) {
  const firstName = state.profile.name.split(/\s+/)[0] || state.profile.name;
  setText('dash-greeting', t('dashboard.greeting', { name: firstName }));
  setText('dash-month-badge', `${state.snapshot.monthShort} ${state.snapshot.year}`);
  setText('dash-period', t('dashboard.period', { month: state.snapshot.monthLabel, days: state.daysPassed }));
  animCount(document.getElementById('dash-income-val'), state.income, '₹');
  animCount(document.getElementById('dash-spending-val'), state.spending, '₹');
  animCount(document.getElementById('dash-vault-val'), state.vault, '₹');
  setWidth('dash-income-progress', (state.income / state.incomeTarget) * 100);
  setText('dash-income-target-copy', t('dashboard.target', { target: formatCurrency(state.incomeTarget) }));
  setText('dash-income-target-pct', t('dashboard.reached', { pct: Math.round((state.income / state.incomeTarget) * 100) }));
  setText('dash-zone-text', t('dashboard.zoneStatus', { zone: state.zoneLabel, pct: state.spendPct }));
  const zoneText = document.getElementById('dash-zone-text');
  if (zoneText) zoneText.style.color = state.zoneColor;
  setText('dash-runway-val', formatRunway(state.runway));
  setWidth('dash-runway-bar', (state.runway / 4) * 100);
  setText('dash-runway-sub', t('dashboard.runwayReserve', { reserve: formatCurrency(state.reserve) }));
  setWidth('dash-vault-prog', (state.vault / state.vaultGoal) * 100);
  setText('dash-vault-goal-label', t('vault.goal', { goal: formatCurrency(state.vaultGoal) }));
  setText('dash-vault-pct', t('dashboard.reached', { pct: state.vaultProgress }));
  setText('dash-vault-insight', t('dashboard.vaultInsight', { vault: formatCurrency(state.vault), days: state.daysCovered }));
  setText('dash-week-predicted', `${formatCurrency(state.weeklyForecast[2].predicted)} – ${formatCurrency(state.weeklyForecast[2].predicted + 3600)}`);
  setText('dash-week-outlook', state.nextPeakDay.probability >= 80 ? t('dashboard.highProbability') : t('dashboard.moderateProbability'));
  setText('dash-next-peak', formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true }));
  setText('dash-safe-daily', formatCurrency(state.dailyTarget));
  setText('dash-saved-today', formatCurrency(Math.max(800, state.vaultHistory[state.vaultHistory.length - 1] - state.vaultHistory[state.vaultHistory.length - 2])));
  setText('dash-avg-income', formatCurrency(state.averages.income));
  setText('dash-avg-spend', formatCurrency(state.averages.spend));
  setText('dash-best-month', formatCurrency(Math.max(...state.incomeHistory)));
  setText('dash-avg-saved', formatCurrency(state.averageSaved));
  setText('dash-spending-mix-title', t('dashboard.spendingMixTitle', { month: state.snapshot.monthShort }));
  setText('dash-spending-mix-sub', t('dashboard.spendingMixSub', { total: formatCurrency(state.spending) }));
  setHtml('dash-transactions', renderTransactionRows(state.transactions.slice(0, 5)));
  renderSpendLegend(state);
  ensureChartFrame('main-chart', t('dashboard.chartSummary', { income: formatCurrency(state.income), spending: formatCurrency(state.spending) }));
  drawBars('main-chart', [{ data: state.incomeHistory, color: 'acc' }, { data: state.spendHistory, color: 'red' }], historyMonthLabels(state.incomeHistory.length), { h: 232, pad: { t: 26, r: 16, b: 32, l: 54 }, labelStrategy: 'peak-and-last', datasetLabels: ['In', 'Out'] });
  drawSpark('spark-inc', state.incomeHistory, 'acc', { h: 34 });
  drawSpark('spark-spd', state.spendHistory, 'red', { h: 34 });
  drawSpark('spark-vlt', state.vaultHistory, 'teal', { h: 34 });
  drawDonut('spend-donut', state.categoryShare.map((category) => ({ value: category.spent, color: category.tone })), { size: 120, thickness: 28, centerLabel: `${state.spendPct}%`, centerSub: t('dashboard.ofIncome'), centerSize: 17 });
}

function renderExpense(state) {
  setText('exp-header-period', t('expense.period', { month: state.snapshot.monthLabel, daysIn: state.daysPassed, daysLeft: state.daysLeft }));
  setText('exp-spending-sub', t('expense.spendingSub', { spent: formatCurrency(state.spending), income: formatCurrency(state.income) }));
  setText('exp-pct-text', formatPercent(state.spendPct));
  setText('exp-zone-desc', t('expense.zoneDesc', { zone: state.zoneLabel, pct: state.spendPct }));
  const zoneDesc = document.getElementById('exp-zone-desc');
  if (zoneDesc) zoneDesc.style.color = state.zoneColor;
  setClass('exp-zone-badge', state.zoneBadge);
  setText('exp-zone-badge', state.zoneLabel);
  setText('exp-spent', formatCurrency(state.spending));
  animCount(document.getElementById('exp-remaining'), state.remaining, '₹');
  animCount(document.getElementById('exp-daily-target'), state.dailyTarget, '₹');
  setText('exp-days-left', String(state.daysLeft));
  setText('exp-category-sub', t('expense.categorySub', { month: state.snapshot.monthLabel }));
  setHtml('exp-insight', t('expense.insight', { daily: formatCurrency(state.dailyTarget), zone: t('zone.safe'), days: state.daysLeft }));
  setRing('exp-ring', state.spendPct, state.zone === 'safe' ? 'grn' : state.zone === 'moderate' ? 'amb' : 'red');
  setText('exp-ratio', formatPercent(state.spendPct));
  setText('exp-savings-rate', formatPercent(state.savingsRate));
  setText('exp-vault-contribution', formatPercent(Math.round((state.vault / Math.max(1, state.income)) * 100)));
  setText('exp-target-ratio', `<=${Math.round((state.spendingTarget / Math.max(1, state.incomeTarget)) * 100)}%`);
  renderCategoryTable(state);
  ensureChartFrame('daily-chart', t('expense.paceSummary', { daily: formatCurrency(state.spendLimitPerDay), days: state.dailySpend.filter((value) => value > state.spendLimitPerDay).length }));
  drawBars('daily-chart', [{ data: state.dailySpend.map((value) => (value <= state.spendLimitPerDay ? value : 0)), color: 'grn' }, { data: state.dailySpend.map((value) => (value > state.spendLimitPerDay ? value : 0)), color: 'red' }], state.dailySpend.map((_, index) => String(index + 1)), { h: 212, pad: { t: 24, r: 14, b: 30, l: 48 }, xEvery: Math.ceil(state.dailySpend.length / 7), reference: { value: state.spendLimitPerDay, color: 'acc', label: t('expense.paceLine') }, labelStrategy: 'last', datasetLabels: [t('expense.onPace'), t('expense.over')] });
}

function renderHeatmapGrid(state) {
  const grid = document.getElementById('heat-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="aspect-ratio:1"></div>'.repeat(state.heatmapLeadOffset) + state.heatmapDays.map((entry) => `
    <div class="hcell hcell-${entry.level}${entry.day === state.daysPassed ? ' today' : ''}${entry.predicted ? ' pred' : ''}">
      <div class="htip">
        <div style="font-weight:700;color:var(--t1);margin-bottom:3px;">${formatDateLabel(toDate(entry.day), { weekday: true })}${entry.day === state.daysPassed ? ` · ${t('forecast.todayTag')}` : entry.predicted ? ` · ${t('forecast.forecastTag')}` : ''}</div>
        <div style="font-family:var(--mono);color:var(--acc);font-weight:600;">${formatCurrency(entry.amount)}</div>
        <div style="color:var(--t3);font-size:10.5px;margin-top:2px;">${t('forecast.probability', { value: entry.probability })}</div>
      </div>
    </div>
  `).join('');
}

function renderHeatmap(state) {
  setText('forecast-period', t('forecast.period', { month: state.snapshot.monthLabel, today: state.currentDateLabel }));
  setText('forecast-total', `~${formatCurrency(state.predictedMonthTotal)}`);
  setText('forecast-pace', t('forecast.pace', { income: formatCurrency(state.income) }));
  setText('forecast-peak-days', String(state.highIncomeDays));
  setText('forecast-peak-days-sub', t('forecast.ofDaysInMonth', { days: state.daysInMonth, month: state.snapshot.monthShort }));
  setText('forecast-range', `${formatCurrency(state.forecastRange.low)}–${formatCurrency(state.forecastRange.high)}`);
  setText('forecast-calendar-title', t('forecast.calendarTitle', { month: state.snapshot.monthLabel }));
  setText('forecast-volatility', state.volatility > 45 ? t('forecast.volatilityHigh') : state.volatility > 30 ? t('forecast.volatilityModerate') : t('forecast.volatilityLow'));
  setText('forecast-volatility-note', t('forecast.volatilityNote', { volatility: state.volatility }));
  setText('forecast-tier-peak', t('forecast.thisMonthCount', { count: state.highIncomeDays }));
  setText('forecast-tier-good', t('forecast.thisMonthCount', { count: state.heatmapDays.filter((entry) => entry.level === 3).length }));
  setText('forecast-tier-slow', t('forecast.thisMonthCount', { count: state.slowDays }));
  setText('forecast-tier-rest', t('forecast.thisMonthCount', { count: state.restDays }));
  setText('forecast-peak-stat', String(state.highIncomeDays));
  setText('forecast-good-stat', String(state.heatmapDays.filter((entry) => entry.level === 3).length));
  setText('forecast-slow-stat', String(state.slowDays));
  setText('forecast-rest-stat', String(state.restDays));
  setText('forecast-next-peak', formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true }));
  setText('forecast-break-window', state.bestBreakWindow);
  setText('forecast-slow-period', state.slowPeriodLabel);
  renderHeatmapGrid(state);
  ensureChartFrame('forecast-chart', t('forecast.projectedSummary', { total: formatCurrency(state.predictedMonthTotal) }));
  drawBars('forecast-chart', [{ data: state.weeklyForecast.map((week) => week.actual), color: 'acc' }, { data: state.weeklyForecast.map((week) => week.predicted), color: 'grn' }], state.weeklyForecast.map((week) => week.label), { h: 214, pad: { t: 26, r: 16, b: 32, l: 52 }, labelStrategy: 'last-nonzero', datasetLabels: [t('forecast.actual'), t('forecast.predicted')] });
}

function redrawBreakChart(state) {
  const labels = ['Now', ...state.breakWindowDays.map((_, index) => `D${index + 1}`)];
  const projection = getBreakProjectionSeries(state);
  const verdict = breakVerdictCopy(state);
  ensureChartFrame('proj-chart', t('breakPlanner.totalHit', { cost: formatCurrency(state.breakTotalCost), verdict: verdict.text }));
  drawArea('proj-chart', [{ data: projection.cashSeries, color: 'red', fill: true }, { data: projection.vaultSeries, color: 'acc', fill: false }], labels, { h: 218, pad: { t: 26, r: 16, b: 32, l: 52 }, xEvery: Math.max(1, Math.ceil(labels.length / 6)), datasetLabels: [t('breakPlanner.availableCash'), t('breakPlanner.vaultBalance')] });
}

function getBreakProjectionSeries(state) {
  let remainingCash = state.remaining;
  let vault = state.vault;
  const cashSeries = [remainingCash];
  const vaultSeries = [vault];
  state.breakWindowDays.forEach((day) => {
    const dayCost = Math.round(day.amount * 0.33) + state.breakDailyExp;
    if (STATE.useVault) {
      const cashDraw = Math.min(remainingCash, Math.round(dayCost * 0.55));
      remainingCash = Math.max(0, remainingCash - cashDraw);
      vault = Math.max(0, vault - Math.max(0, dayCost - cashDraw));
    } else {
      remainingCash = Math.max(0, remainingCash - dayCost);
    }
    cashSeries.push(remainingCash);
    vaultSeries.push(vault);
  });
  return { cashSeries, vaultSeries };
}

function renderBreakResult(state) {
  const content = document.getElementById('break-result-content');
  if (!content) return;
  const days = state.breakWindowDays.map((day) => formatDateLabel(day.date)).join(', ');
  const verdict = breakVerdictCopy(state);
  content.dataset.ran = '1';
  content.innerHTML = `
    <div style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin-bottom:5px;color:${state.breakVerdict.color};" id="break-res-verdict">${verdict.text}</div>
    <div style="font-size:12.5px;color:var(--t2);margin-bottom:16px;line-height:1.6;">${verdict.note}</div>
    <div class="body-sm" style="color:var(--t3);margin-bottom:14px;">${t('breakPlanner.windowModelled', { days })}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">
      <div style="padding:12px 14px;background:var(--surf2);border-radius:var(--r);border:1px solid var(--bdr);"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.09em;margin-bottom:3px;">${t('breakPlanner.lostIncome')}</div><div style="font-family:var(--mono);font-size:17px;font-weight:600;color:var(--red);" id="break-res-lost">${formatCurrency(-state.breakLostIncome)}</div></div>
      <div style="padding:12px 14px;background:var(--surf2);border-radius:var(--r);border:1px solid var(--bdr);"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.09em;margin-bottom:3px;">${t('breakPlanner.breakExpenses')}</div><div style="font-family:var(--mono);font-size:17px;font-weight:600;color:var(--amb);" id="break-res-cost">${formatCurrency(state.breakCost)}</div></div>
      <div style="padding:12px 14px;background:var(--surf2);border-radius:var(--r);border:1px solid var(--bdr);"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.09em;margin-bottom:3px;">${t('breakPlanner.runwayAfter')}</div><div style="font-family:var(--mono);font-size:17px;font-weight:600;color:${state.breakVerdict.color};" id="break-res-runway">${formatRunway(state.runwayAfterBreak)}</div></div>
      <div style="padding:12px 14px;background:var(--surf2);border-radius:var(--r);border:1px solid var(--bdr);"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.09em;margin-bottom:3px;">${t('breakPlanner.vaultCovers')}</div><div style="font-family:var(--mono);font-size:17px;font-weight:600;color:var(--teal);" id="break-res-covers">${STATE.useVault ? formatDurationDays(state.vaultCovers) : t('breakPlanner.off')}</div></div>
    </div>
  `;
}

function renderBreak(state) {
  setText('break-current-runway', formatRunway(state.runway));
  setText('break-window-copy', t('breakPlanner.accessibleReserve', { reserve: formatCurrency(state.reserve) }));
  setText('break-runway-after', formatRunway(state.runwayAfterBreak, true));
  const delta = +(state.runwayAfterBreak - state.runway).toFixed(1);
  setText('break-runway-delta', `${delta > 0 ? '+' : ''}${delta} ${t('unit.monthShort')}`);
  const deltaEl = document.getElementById('break-runway-delta');
  if (deltaEl) deltaEl.style.color = delta < 0 ? 'var(--amb)' : 'rgba(255,255,255,.9)';
  const runwayAfter = document.getElementById('break-runway-after');
  if (runwayAfter) runwayAfter.style.color = state.runwayAfterBreak >= 2 ? '#fff' : '#ffcf9a';
  setText('days-val', formatDurationDays(STATE.breakDays));
  setText('exp-val', formatCurrency(STATE.breakDailyExp));
  setText('start-val', formatRelativeDays(STATE.breakStartDays));
  setText('chart-sub', t('breakPlanner.chartSub', { days: STATE.breakDays }));
  setText('break-best-window', state.bestBreakWindow);
  const startSlider = document.getElementById('start-slider');
  if (startSlider) startSlider.max = String(Math.max(0, state.daysLeft));
  const calendar = document.getElementById('cal-grid');
  if (calendar) {
    calendar.innerHTML = state.heatmapDays.map((entry) => {
      const tone = entry.level <= 1 ? 'var(--grnd);color:var(--grn);border:1px solid rgba(45,185,118,.3)' : entry.level >= 4 ? 'var(--redd);color:var(--red);border:1px solid rgba(232,85,85,.3)' : 'var(--ambd);color:var(--amb);border:1px solid rgba(245,156,42,.3)';
      const selected = entry.day >= state.daysPassed + STATE.breakStartDays && entry.day < state.daysPassed + STATE.breakStartDays + Math.min(STATE.breakDays, state.daysLeft) ? 'box-shadow:0 0 0 2px var(--acc);' : '';
      const isPast = entry.day < state.daysPassed;
      const behavior = isPast ? 'opacity:.35;cursor:not-allowed;' : '';
      const action = isPast ? '' : 'data-action="break-day"';
      return `<button type="button" class="break-day" ${action} data-break-start="${Math.max(0, entry.day - state.daysPassed)}" style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;transition:.12s;background:${tone};${selected}${behavior}" title="${formatDateLabel(toDate(entry.day), { weekday: true })}" ${isPast ? 'disabled' : ''}>${entry.day}</button>`;
    }).join('');
  }
  if (document.getElementById('break-result-content')?.dataset.ran === '1') renderBreakResult(state);
  redrawBreakChart(state);
}

function renderVault(state) {
  animCount(document.getElementById('vault-banner-amt'), state.vault, '₹');
  setText('vault-banner-sub', t('vault.coversApproximately', { days: state.daysCovered }));
  setWidth('vault-prog-bar', (state.vault / state.vaultGoal) * 100);
  setText('vault-progress-label', t('vault.progressToGoal', { goal: formatCurrency(state.vaultGoal) }));
  setText('vault-prog-pct', `${state.vaultProgress}%`);
  setText('vault-goal-pct', `${state.vaultProgress}%`);
  setHtml('vault-goal-copy', `${t('vault.goalProgress', { pct: `${state.vaultProgress}%` }).replace(`${state.vaultProgress}%`, `<span id="vault-goal-pct">${state.vaultProgress}%</span>`)}`);
  setText('vault-days-covered', String(state.daysCovered));
  setText('vault-runway', formatRunway(state.runway));
  setText('vault-total-deposited', formatCurrency(sum(state.vaultTransactions.filter((entry) => entry.flow === 'in').map((entry) => entry.amount))));
  setText('vault-total-withdrawn', formatCurrency(sum(state.vaultTransactions.filter((entry) => entry.flow === 'out').map((entry) => entry.amount))));
  setText('vault-interest-earned', formatCurrency(512));
  setText('vault-auto-saved', formatCurrency(3200));
  setText('vault-next-save', t('vault.inDays', { amount: formatCurrency(800), days: 2 }));
  setText('vault-rules-count', t('vault.activeCount', { count: state.activeVaultRules.length }));
  setText('vault-milestone-goal', t('vault.goal', { goal: formatCurrency(state.vaultGoal) }));
  setText('vault-milestone-pct', `${state.vaultProgress}%`);
  const monthsToGoal = Math.max(1, Math.ceil((state.vaultGoal - state.vault) / 3200));
  setHtml('vault-projection-insight', t('vault.projectionInsight', { pace: formatCurrency(3200), goal: formatCurrency(state.vaultGoal), months: monthsToGoal }));
  setHtml('vault-transactions', renderVaultRows(state.vaultTransactions.slice(0, 6)));
  ensureChartFrame('vault-chart', `<span><strong>Balance:</strong> ${formatCurrency(state.vault)}.</span><span>${state.vaultProgress}% of goal.</span>`);
  drawArea('vault-chart', [{ data: state.vaultHistory, color: 'teal', fill: true }], historyMonthLabels(state.vaultHistory.length), { h: 214, pad: { t: 26, r: 16, b: 32, l: 52 }, datasetLabels: ['Vault'] });
}

function renderMobileBreakResult(state) {
  const container = document.getElementById('mobile-break-result');
  if (!container) return;
  const verdict = breakVerdictCopy(state);
  container.innerHTML = `
    <div class="mob-mini-grid">
      <div class="mob-mini-card"><span class="mob-mini-label">${t('breakPlanner.simulationResults')}</span><strong style="color:${state.breakVerdict.color};">${verdict.text}</strong></div>
      <div class="mob-mini-card"><span class="mob-mini-label">${t('breakPlanner.runwayAfter')}</span><strong>${formatRunway(state.runwayAfterBreak, true)}</strong></div>
      <div class="mob-mini-card"><span class="mob-mini-label">${t('breakPlanner.lostIncome')}</span><strong style="color:var(--red);">${formatCurrency(-state.breakLostIncome)}</strong></div>
      <div class="mob-mini-card"><span class="mob-mini-label">${t('breakPlanner.breakExpenses')}</span><strong>${formatCurrency(state.breakCost)}</strong></div>
    </div>
  `;
}

function renderMobileHeatStrip(state) {
  const container = document.getElementById('mob-heat-strip');
  if (!container) return;
  container.innerHTML = state.heatmapDays.slice(state.daysPassed - 1, state.daysPassed + 13).map((entry) => `
    <div class="mob-heat-cell hcell-${entry.level}${entry.predicted ? ' pred' : ''}${entry.day === state.daysPassed ? ' today' : ''}" title="${formatDateLabel(toDate(entry.day), { weekday: true })}">
      <span>${entry.day}</span>
    </div>
  `).join('');
}

function renderMobileTransactions(id, entries, type = 'activity') {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = entries.map((entry) => {
    const amount = entry.flow === 'in' ? formatCurrency(entry.amount, { sign: 'positive' }) : entry.flow === 'vault' ? formatCurrency(entry.amount) : formatCurrency(-entry.amount);
    const color = entry.flow === 'in' ? 'var(--grn)' : entry.flow === 'vault' ? 'var(--teal)' : 'var(--red)';
    const meta = type === 'vault' ? entry.type : entry.category;
    return `
      <div class="mob-row">
        <div class="mob-row-copy">
          <div class="mob-row-title">${escapeHtml(entry.label)}</div>
          <div class="mob-row-meta">${formatDateLabel(entry.date)} · ${escapeHtml(meta)}</div>
        </div>
        <div class="mob-row-value" style="color:${color};">${amount}</div>
      </div>
    `;
  }).join('');
}

function renderMobileCategories(state) {
  const container = document.getElementById('mob-categories');
  if (!container) return;
  container.innerHTML = state.categoryShare.map((category) => `
    <div class="mob-row">
      <div class="mob-row-copy">
        <div class="mob-row-title" style="display:flex;align-items:center;gap:8px;"><span class="table-icon">${icon(category.icon, { size: 14 })}</span>${escapeHtml(categoryLabel(category))}</div>
        <div class="mob-row-meta">${formatCurrency(category.spent)} of ${formatCurrency(category.limit)}</div>
      </div>
      <div class="mob-row-side">
        <strong>${category.usage}%</strong>
        <div class="prog" style="width:84px;height:5px;margin-top:6px;"><div class="pf" style="width:${Math.min(100, category.usage)}%;background:var(--${category.tone});"></div></div>
      </div>
    </div>
  `).join('');
}

function syncMobileTabs() {
  document.querySelectorAll('[data-mobile-tab]').forEach((button) => {
    const active = button.dataset.mobileTab === _mobileTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
    button.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll('[data-mobile-pane]').forEach((pane) => {
    const active = pane.dataset.mobilePane === _mobileTab;
    pane.hidden = !active;
    pane.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
}

function setMobileTab(tab) {
  const availableTabs = Array.from(document.querySelectorAll('[data-mobile-tab]')).map((button) => button.dataset.mobileTab);
  _mobileTab = availableTabs.includes(tab) ? tab : 'overview';
  syncMobileTabs();
  document.querySelector(`[data-mobile-tab="${_mobileTab}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  if (curPage() === 'mobile.html' && document.getElementById('mob-main-chart')) renderMobile(deriveState());
}

function initMobilePage() {
  const tabs = Array.from(document.querySelectorAll('[data-mobile-tab]'));
  const daysSlider = document.getElementById('mob-days-slider');
  const expSlider = document.getElementById('mob-exp-slider');
  const startSlider = document.getElementById('mob-start-slider');
  const vaultToggle = document.getElementById('mob-vault-toggle');
  tabs.forEach((button, index) => {
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      setMobileTab(nextTab.dataset.mobileTab || 'overview');
      nextTab.focus();
    });
  });
  daysSlider?.addEventListener('input', function onInput() { commit('breakDays', Number(this.value)); });
  expSlider?.addEventListener('input', function onInput() { commit('breakDailyExp', Number(this.value)); });
  startSlider?.addEventListener('input', function onInput() { commit('breakStartDays', Number(this.value)); });
  vaultToggle?.addEventListener('click', () => {
    const next = !vaultToggle.classList.contains('on');
    vaultToggle.classList.toggle('on', next);
    commit('useVault', next);
  });
  syncMobileTabs();
}

function renderMobile(state) {
  syncMobileTabs();
  setText('mob-income', formatCurrency(state.income));
  setText('mob-spending', formatCurrency(state.spending));
  setText('mob-runway', formatRunway(state.runway, true));
  setText('mob-vault', formatCurrency(state.vault));
  setText('mob-overview-sub', `${state.snapshot.monthLabel} · ${state.zoneLabel}`);
  if (_mobileTab === 'overview') {
    renderMobileTransactions('mob-transactions', state.transactions.slice(0, 5));
    ensureChartFrame('mob-main-chart', `<span><strong>Cash flow:</strong> ${formatCurrency(state.income)} in / ${formatCurrency(state.spending)} out.</span>`);
    drawBars('mob-main-chart', [{ data: state.incomeHistory.slice(-5), color: 'acc' }, { data: state.spendHistory.slice(-5), color: 'red' }], historyMonthLabels(5), { h: 190, pad: { t: 24, r: 14, b: 28, l: 46 }, labelStrategy: 'last', datasetLabels: ['In', 'Out'] });
  }

  setText('mob-spend-zone', state.zoneLabel);
  setText('mob-spend-remaining', formatCurrency(state.remaining));
  setText('mob-spend-daily', formatCurrency(state.dailyTarget));
  setText('mob-spend-ratio', formatPercent(state.spendPct));
  if (_mobileTab === 'spending') {
    renderMobileCategories(state);
    ensureChartFrame('mob-daily-chart', `<span><strong>Pace:</strong> ${formatCurrency(state.spendLimitPerDay)}/day.</span>`);
    drawBars('mob-daily-chart', [{ data: state.dailySpend.map((value) => (value <= state.spendLimitPerDay ? value : 0)), color: 'grn' }, { data: state.dailySpend.map((value) => (value > state.spendLimitPerDay ? value : 0)), color: 'red' }], state.dailySpend.map((_, index) => String(index + 1)), { h: 190, pad: { t: 24, r: 12, b: 28, l: 44 }, xEvery: Math.ceil(state.dailySpend.length / 6), reference: { value: state.spendLimitPerDay, color: 'acc', label: 'Pace' } });
  }

  setText('mob-forecast-total', formatCurrency(state.predictedMonthTotal));
  setText('mob-forecast-range', `${formatCurrency(state.forecastRange.low)} - ${formatCurrency(state.forecastRange.high)}`);
  setText('mob-forecast-peak', formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true }));
  setText('mob-forecast-break', state.bestBreakWindow);
  if (_mobileTab === 'forecast') {
    renderMobileHeatStrip(state);
    ensureChartFrame('mob-forecast-chart', `<span><strong>Forecast:</strong> ${formatCurrency(state.predictedMonthTotal)} this month.</span>`);
    drawBars('mob-forecast-chart', [{ data: state.weeklyForecast.map((week) => week.actual), color: 'acc' }, { data: state.weeklyForecast.map((week) => week.predicted), color: 'grn' }], state.weeklyForecast.map((week) => week.label), { h: 188, pad: { t: 24, r: 12, b: 28, l: 44 }, labelStrategy: 'last-nonzero', datasetLabels: ['Actual', 'Plan'] });
  }

  setText('mob-break-days', formatDurationDays(STATE.breakDays));
  setText('mob-break-exp', formatCurrency(STATE.breakDailyExp));
  setText('mob-break-start', formatRelativeDays(STATE.breakStartDays));
  setText('mob-break-window', state.bestBreakWindow);
  const daysSlider = document.getElementById('mob-days-slider');
  const expSlider = document.getElementById('mob-exp-slider');
  const startSlider = document.getElementById('mob-start-slider');
  if (daysSlider) daysSlider.value = String(STATE.breakDays);
  if (expSlider) expSlider.value = String(STATE.breakDailyExp);
  if (startSlider) {
    startSlider.max = String(Math.max(0, state.daysLeft));
    startSlider.value = String(Math.min(STATE.breakStartDays, state.daysLeft));
  }
  document.getElementById('mob-vault-toggle')?.classList.toggle('on', STATE.useVault);
  if (_mobileTab === 'break') {
    const projection = getBreakProjectionSeries(state);
    ensureChartFrame('mob-proj-chart', `<span><strong>Total hit:</strong> ${formatCurrency(state.breakTotalCost)}.</span>`);
    drawArea('mob-proj-chart', [{ data: projection.cashSeries, color: 'red', fill: true }, { data: projection.vaultSeries, color: 'acc', fill: false }], ['Now', ...state.breakWindowDays.map((_, index) => `D${index + 1}`)], { h: 192, pad: { t: 24, r: 12, b: 28, l: 46 }, xEvery: Math.max(1, Math.ceil((state.breakWindowDays.length + 1) / 5)), datasetLabels: ['Cash', 'Vault'] });
    renderMobileBreakResult(state);
  }

  setText('mob-vault-balance', formatCurrency(state.vault));
  setText('mob-vault-progress', `${state.vaultProgress}%`);
  setText('mob-vault-days', formatDurationDays(state.daysCovered));
  setText('mob-vault-runway', formatRunway(state.runway, true));
  if (_mobileTab === 'vault') {
    renderMobileTransactions('mob-vault-transactions', state.vaultTransactions.slice(0, 5), 'vault');
    ensureChartFrame('mob-vault-chart', `<span><strong>Vault:</strong> ${formatCurrency(state.vault)}.</span>`);
    drawArea('mob-vault-chart', [{ data: state.vaultHistory, color: 'teal', fill: true }], historyMonthLabels(state.vaultHistory.length), { h: 188, pad: { t: 24, r: 12, b: 28, l: 46 }, datasetLabels: ['Vault'] });
  }

  setText('mob-profile-name', state.profile.name);
  setText('mob-profile-role', state.profile.role);
  setText('mob-profile-meta', `${state.profile.email} · ${state.profile.city}`);
  setText('mob-profile-score', String(state.profile.stabilityScore));
  setText('profile-avatar', state.profileInitials);
  setText('mob-profile-income', formatCurrency(state.incomeTarget));
  setText('mob-profile-spend', formatCurrency(state.spendingTarget));
  setText('mob-profile-vault', formatCurrency(state.vaultGoal));
  setText('mob-profile-runway', formatRunway(state.runway >= 2 ? '2.0' : '1.5', true));
}

function renderProfile(state) {
  setText('profile-avatar', state.profileInitials);
  setText('profile-name', state.profile.name);
  setText('profile-meta', t('profile.meta', { email: state.profile.email, city: state.profile.city }));
  setText('profile-role-badge', state.profile.role);
  setText('profile-score', String(state.profile.stabilityScore));
  setText('goal-income-target', formatCurrency(state.incomeTarget));
  setText('goal-expense-target', formatCurrency(state.spendingTarget));
  setText('goal-vault-target', formatCurrency(state.vaultGoal));
  setText('goal-runway-target', formatRunway(state.runway >= 2 ? '2.0' : '1.5', true));
}

function actionHandlers() {
  return {
    export() { exportCSV(); },
    tour() { openModal('tour'); },
    'mobile-tab'(element) { setMobileTab(element.dataset.mobileTab || 'overview'); },
    'add-expense'() { openModal('expense'); },
    deposit() { openModal('deposit'); },
    withdraw() { openModal('withdraw'); },
    'edit-profile'() { openModal('profile'); },
    'edit-income-target'() { openModal('incomeTarget'); },
    'edit-spending-target'() { openModal('spendingTarget'); },
    'edit-vault-goal'() { openModal('vaultGoal'); },
    'edit-runway-target'() { openModal('runwayTarget'); },
    signout() {
      if (confirm('Sign out of Flux?')) window.location.href = 'index.html';
    },
    'reset-stats'() {
      if (!confirm('Reset financial stats, charts, and logs to the default demo values?')) return;
      resetStats();
      showToast('Stats reset to default demo values', 'success');
    },
    'delete-account'() {
      if (!confirm('Delete the local Flux account data and reset the demo?')) return;
      localStorage.removeItem(STORAGE_KEY);
      showToast('Local account data cleared', 'error');
      setTimeout(() => { window.location.href = 'index.html'; }, 650);
    },
    'break-day'(element) {
      const offset = Number(element.dataset.breakStart || 0);
      commit('breakStartDays', offset);
      const slider = document.getElementById('start-slider');
      if (slider) slider.value = String(offset);
      const mobileSlider = document.getElementById('mob-start-slider');
      if (mobileSlider) mobileSlider.value = String(offset);
    },
    'run-simulation'() {
      const state = deriveState();
      renderBreakResult(state);
      renderMobileBreakResult(state);
      redrawBreakChart(state);
      if (curPage() === 'mobile.html') renderMobile(state);
      showToast('Simulation refreshed', 'success');
    },
    'chat-chip'(element) {
      sendMessage(element.dataset.prompt || element.textContent || '');
    },
  };
}

function initActions() {
  document.addEventListener('click', (event) => {
    const element = event.target.closest('[data-action]');
    if (!element) return;
    const action = actionHandlers()[element.dataset.action];
    if (!action) return;
    if (element.tagName === 'A') event.preventDefault();
    action(element, event);
  });
}

function initBreakControls() {
  const daysSlider = document.getElementById('days-slider');
  const expSlider = document.getElementById('exp-slider');
  const startSlider = document.getElementById('start-slider');
  const vaultToggle = document.getElementById('vault-toggle');
  if (daysSlider) {
    daysSlider.value = String(STATE.breakDays);
    daysSlider.addEventListener('input', function onInput() { commit('breakDays', Number(this.value)); });
  }
  if (expSlider) {
    expSlider.value = String(STATE.breakDailyExp);
    expSlider.addEventListener('input', function onInput() { commit('breakDailyExp', Number(this.value)); });
  }
  if (startSlider) {
    startSlider.max = String(deriveState().daysLeft || 0);
    startSlider.value = String(STATE.breakStartDays);
    startSlider.addEventListener('input', function onInput() { commit('breakStartDays', Number(this.value)); });
  }
  if (vaultToggle) {
    vaultToggle.classList.toggle('on', STATE.useVault);
    vaultToggle.addEventListener('click', () => {
      const next = !vaultToggle.classList.contains('on');
      vaultToggle.classList.toggle('on', next);
      commit('useVault', next);
    });
  }
}

function renderPageBindings() {
  const page = curPage();
  if (page === 'dashboard.html') subscribe('*', renderDashboard);
  if (page === 'expense.html') subscribe('*', renderExpense);
  if (page === 'heatmap.html') subscribe('*', renderHeatmap);
  if (page === 'break.html') subscribe('*', renderBreak);
  if (page === 'vault.html') subscribe('*', renderVault);
  if (page === 'profile.html') subscribe('*', renderProfile);
  if (page === 'mobile.html') subscribe('*', renderMobile);
}

function ctxSummary(page) {
  const state = deriveState();
  const summaries = {
    'dashboard.html': `${state.snapshot.monthLabel}: earned <span class="chip">${formatCurrency(state.income)}</span>, spending is <span class="chip">${formatCurrency(state.spending)}</span>, runway is <span class="chip">${state.runway} months</span>, and the vault holds <span class="chip">${formatCurrency(state.vault)}</span>.`,
    'expense.html': `You have spent <span class="chip">${formatCurrency(state.spending)}</span> of <span class="chip">${formatCurrency(state.income)}</span>. That is <strong>${state.spendPct}%</strong>, which puts you in the <strong>${state.zoneLabel}</strong>.`,
    'heatmap.html': `Predicted month total is <span class="chip">${formatCurrency(state.predictedMonthTotal)}</span>. Next peak is <strong>${formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true })}</strong> with ${state.nextPeakDay.probability}% confidence.`,
    'break.html': `A ${STATE.breakDays}-day break currently costs about <span class="chip">${formatCurrency(state.breakTotalCost)}</span> and leaves you with <span class="chip">${state.runwayAfterBreak} months</span> of runway.`,
    'vault.html': `Vault balance is <span class="chip">${formatCurrency(state.vault)}</span>, which is <span class="chip">${state.vaultProgress}%</span> of the goal and covers about <span class="chip">${state.daysCovered} days</span>.`,
    'profile.html': `Profile is tuned for <strong>${escapeHtml(state.profile.role)}</strong> income patterns. Current score is <span class="chip">${state.profile.stabilityScore}/100</span> with a vault goal of <span class="chip">${formatCurrency(state.vaultGoal)}</span>.`,
    'mobile.html': `Mobile view is synced to <span class="chip">${state.snapshot.monthLabel}</span> with runway at <span class="chip">${state.runway} months</span> and vault at <span class="chip">${formatCurrency(state.vault)}</span>.`,
  };
  return summaries[page] || summaries['dashboard.html'];
}

function chatPresence(page) {
  const state = deriveState();
  const labels = {
    'dashboard.html': `Watching ${state.snapshot.monthLabel}`,
    'expense.html': `Tracking daily pace`,
    'heatmap.html': `Forecast synced to ${state.currentDateLabel}`,
    'break.html': `Planning ${STATE.breakDays}-day break`,
    'vault.html': `Vault synced just now`,
    'profile.html': `Preferences are up to date`,
    'mobile.html': `Mobile model is live`,
  };
  return labels[page] || 'Always current';
}

function setChatStatus(text) {
  const el = document.getElementById('_chat-status');
  if (el) el.textContent = text;
}

function getAssistantReply(input, page) {
  const state = deriveState();
  const text = input.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const rules = [
    { match: /(overview|summary|summarise|snapshot|hello|hi)/, reply: () => ctxSummary(page) },
    { match: /(runway|buffer|survive)/, reply: () => `Runway is <span class="chip">${state.runway} months</span> from a total liquid reserve of <span class="chip">${formatCurrency(state.reserve)}</span>.` },
    { match: /(daily limit|per day|safe daily|budget left)/, reply: () => `To finish the month cleanly, stay under <span class="chip">${formatCurrency(state.dailyTarget)}/day</span> for the remaining ${state.daysLeft} days.` },
    { match: /(overspend|overspending|spending too much|am i safe)/, reply: () => `You are at <strong>${state.spendPct}%</strong> of income, which is the <strong>${state.zoneLabel}</strong>. ${state.overLimitCategories.length ? `Over limit: ${state.overLimitCategories.map((category) => category.label).join(', ')}.` : 'No category is fully blown yet.'}` },
    { match: /(vault|coverage|days of coverage|buffer goal)/, reply: () => `Vault balance is <span class="chip">${formatCurrency(state.vault)}</span>. It covers about <span class="chip">${state.daysCovered} days</span> and sits at <span class="chip">${state.vaultProgress}%</span> of goal.` },
    { match: /(afford|time off|break|rest)/, reply: () => `This ${STATE.breakDays}-day break costs about <span class="chip">${formatCurrency(state.breakTotalCost)}</span>. Runway after the break lands at <span class="chip">${state.runwayAfterBreak} months</span>. Verdict: <strong>${state.breakVerdict.text}</strong>.` },
    { match: /(best break|rest window|ideal break)/, reply: () => `Your lightest near-term break window is <strong>${state.bestBreakWindow}</strong>, where projected earning pressure is lowest.` },
    { match: /(peak|work hardest|best work day|highest income)/, reply: () => `Next peak day is <strong>${formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true })}</strong> with a projected <span class="chip">${formatCurrency(state.nextPeakDay.amount)}</span> opportunity.` },
    { match: /(will i hit target|hit target|income target)/, reply: () => `Projected month total is <span class="chip">${formatCurrency(state.predictedMonthTotal)}</span> against your target of <span class="chip">${formatCurrency(state.incomeTarget)}</span>, so you are ${state.predictedMonthTotal >= state.incomeTarget ? 'on pace' : 'still short'} right now.` },
    { match: /(which categories|category|over limit)/, reply: () => `Top pressure points: <strong>${state.categoryShare.slice().sort((a, b) => b.usage - a.usage).slice(0, 3).map((category) => `${category.label} ${category.usage}%`).join(' · ')}</strong>.` },
    { match: /(rules|which rules are on|auto save)/, reply: () => `Active vault rules: <strong>${state.activeVaultRules.map((rule) => rule.replace(/[A-Z]/g, (char) => ` ${char.toLowerCase()}`)).join(', ')}</strong>.` },
    { match: /(secure|security|biometric|two factor)/, reply: () => `Security is healthy: biometric lock is <strong>${STATE.security.biometric ? 'on' : 'off'}</strong> and two-factor is <strong>${STATE.security.twoFactor ? 'on' : 'off'}</strong>.` },
    { match: /(score|stability)/, reply: () => `Stability score is <span class="chip">${state.profile.stabilityScore}/100</span>. Biggest lift now would come from lowering spending below 60% and pushing the vault closer to goal.` },
    { match: /(alerts|nudge|watch out)/, reply: () => `${state.overLimitCategories.length ? `Watch ${state.overLimitCategories[0].label}` : `Watch daily spending above ${formatCurrency(state.dailyTarget)}`}. Also keep ${formatDateLabel(toDate(state.nextPeakDay.day), { weekday: true })} clear for higher-value work.` },
  ];
  const rule = rules.find((entry) => entry.match.test(text));
  return rule ? rule.reply() : `${ctxSummary(page)}<br><br>Try asking about runway, overspending, vault coverage, peak days, break windows, rules, or stability score.`;
}

function addChatMessage(text, isUser) {
  const messages = document.getElementById('_chat-msgs');
  if (!messages) return;
  const item = document.createElement('div');
  item.className = `chat-msg ${isUser ? 'chat-u' : 'chat-a'}`;
  item.innerHTML = `<div class="chat-bub ${isUser ? 'chat-bub-u' : 'chat-bub-a'}">${text}</div>`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage(text) {
  if (!text?.trim()) return;
  addChatMessage(escapeHtml(text), true);
  const input = document.getElementById('_chat-inp');
  if (input) input.value = '';
  setChatStatus('Reviewing latest activity...');
  const messages = document.getElementById('_chat-msgs');
  const typing = document.createElement('div');
  typing.id = '_typing';
  typing.className = 'chat-msg chat-a';
  typing.innerHTML = '<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  messages?.appendChild(typing);
  if (messages) messages.scrollTop = messages.scrollHeight;
  const wait = 320 + Math.min(900, text.trim().length * 12);
  setTimeout(() => {
    typing.remove();
    addChatMessage(getAssistantReply(text, curPage()), false);
    setChatStatus('Updated just now');
  }, wait);
}

function toggleChat() {
  const panel = document.getElementById('_chat-panel');
  const button = document.getElementById('_chat-fab');
  if (!panel || !button) return;
  _chatOpen = !_chatOpen;
  panel.classList.toggle('open', _chatOpen);
  button.classList.toggle('open', _chatOpen);
  button.innerHTML = _chatOpen ? icon('close', { size: 14 }) : icon('chat', { size: 18 });
  if (_chatOpen && !document.getElementById('_chat-msgs')?.children.length) {
    setChatStatus('Reading your latest numbers...');
    addChatMessage("Here's your current financial picture:", false);
    setTimeout(() => {
      addChatMessage(ctxSummary(curPage()), false);
      setChatStatus(chatPresence(curPage()));
    }, 260);
  } else if (_chatOpen) {
    setChatStatus(chatPresence(curPage()));
  }
}

const CHAT_CHIPS = {
  'dashboard.html': ['Give me an overview', 'What is my runway?', 'Am I on track?', 'Any alerts?'],
  'expense.html': ['Am I overspending?', 'What is my daily limit?', 'Which categories are over?', 'How is my vault?'],
  'heatmap.html': ['When should I work hardest?', 'Best rest window?', 'This week outlook?', 'Will I hit target?'],
  'break.html': ['Can I afford time off?', 'What is my runway?', 'Best break window?', 'How much does vault cover?'],
  'vault.html': ['Days of coverage?', 'When do I hit my goal?', 'What is my runway?', 'Which rules are on?'],
  'profile.html': ['My financial targets?', 'Is my account secure?', 'My stability score?', 'How is my vault?'],
  'mobile.html': ['Give me an overview', 'What is my runway?', 'Am I overspending?', 'Best break window?'],
};

function renderChat() {
  const mount = document.getElementById('chat-fab');
  if (!mount) return;
  const chips = CHAT_CHIPS[curPage()] || CHAT_CHIPS['dashboard.html'];
  mount.innerHTML = `
    <button class="chat-fab-btn" type="button" id="_chat-fab" onclick="toggleChat()" aria-label="Flux Assistant">${icon('chat', { size: 18 })}</button>
    <div class="chat-panel" id="_chat-panel" role="dialog" aria-label="Flux Assistant">
      <div class="chat-h">
        <div class="chat-ava">${icon('chat', { size: 14 })}</div>
        <div class="chat-head-copy"><div class="chat-hn">Flux Assistant</div><div class="chat-hs"><span class="dot dot-live"></span><span id="_chat-status">${chatPresence(curPage())}</span></div></div>
        <button class="icon-btn" type="button" onclick="toggleChat()" style="width:26px;height:26px;">${icon('close', { size: 12 })}</button>
      </div>
      <div class="chat-intro">
        <div class="chat-intro-title">Ask about spending, runway, vault, or break timing.</div>
        <div class="chat-qa">${chips.map((chip) => `<button class="quick-chip" type="button" data-action="chat-chip" data-prompt="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join('')}</div>
      </div>
      <div class="chat-msgs" id="_chat-msgs" role="log"></div>
      <div class="chat-inp-row"><input class="chat-inp" id="_chat-inp" placeholder="Ask about runway, spend, vault, or break timing..." autocomplete="off"/><button class="chat-send" type="button" id="_chat-send">${icon('chevron-right', { size: 13 })}</button></div>
    </div>
  `;
  document.getElementById('_chat-send')?.addEventListener('click', () => sendMessage(document.getElementById('_chat-inp')?.value || ''));
  document.getElementById('_chat-inp')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendMessage(event.target.value);
  });
}

function initResizeRedraw() {
  let frame = null;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      document.querySelectorAll('[data-chart]').forEach((canvas) => {
        if (typeof canvas._redraw === 'function') canvas._redraw();
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initTheme();
  renderNav();
  initCounts();
  hydrateIcons();
  initToggles();
  renderChat();
  _injectModal();
  initActions();
  initResizeRedraw();
  renderPageBindings();
  if (curPage() === 'break.html') initBreakControls();
  if (curPage() === 'mobile.html') initMobilePage();
  emit('*');
  if (curPage() !== 'index.html' && !localStorage.getItem(TOUR_KEY)) {
    setTimeout(() => openModal('tour'), 260);
  }
});

window.addEventListener('focus', () => {
  syncLiveCalendarData();
  emit('*');
});

window.fluxUtils = { drawArea, drawBars, drawDonut, drawSpark, setRing, animCount };
window.setLanguage = setLanguage;
window.applyTheme = applyTheme;
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.exportCSV = exportCSV;
window.STATE = STATE;
window.commit = commit;
window.renderTopbar = renderTopbar;
