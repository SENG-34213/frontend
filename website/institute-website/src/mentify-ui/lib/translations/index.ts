import { Language } from '../../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.resources': 'Learning Resources',
    'nav.marketplace': 'Marketplace',
    'nav.features': 'Features',
    'nav.about': 'About',
    'nav.teachers': 'Teachers',
    'nav.contact': 'Contact',
    'nav.faq': 'FAQ',
    'nav.portals': 'Portal Login',
    'nav.apply': 'Apply Now',
    'nav.admissions': 'Admissions',
    'nav.cart': 'Cart',

    // Hero
    'hero.badge': 'TiT Online Education · Alaveddy, Jaffna',
    'hero.headline': 'Empowering Academic Excellence Through Modern Online Learning',
    'hero.subheadline':
      'Headquartered in Alaveddy, Jaffna, TiT connects students and dedicated educators across Sri Lanka with live interactive classes, comprehensive study materials, past paper discussions, and personal academic guidance.',
    'hero.cta.courses': 'Explore Academic Programs',
    'hero.cta.resources': 'Explore Platform Features',
    'hero.stat.courses': 'Complete Curriculum',
    'hero.stat.materials': '500+ Videos & Notes',
    'hero.stat.teachers': 'Verified Tutors',
    'hero.stat.curriculum': 'Jaffna & Islandwide',

    // Features Highlights
    'features.title': 'Modern Learning for Every Student',
    'features.subtitle':
      'Designed for academic success with personal study assistance, structured evaluations, and clear progress tracking.',
    'features.ai.title': 'AI-Assisted Learning & Study Coach',
    'features.ai.desc':
      'Instant academic explanations, past paper step-by-step guidance, and personalized revision schedules aligned with the local syllabus.',
    'features.materials.title': 'Curated Educational Marketplace',
    'features.materials.desc':
      'Verified model papers, marking schemes, summaries, and revision notes reviewed by veteran educators.',
    'features.lms.title': 'Interactive Academic Courses',
    'features.lms.desc':
      'Live interactive video lessons, attendance recording, structured quizzes, and term examination papers.',
    'features.progress.title': 'Real-Time Progress & Analytics',
    'features.progress.desc':
      'Comprehensive performance dashboards for students and parents tracking topic mastery and assignment submissions.',

    // Marketplace
    'market.title': 'Educational Materials Marketplace',
    'market.subtitle':
      'Access high-quality past papers, revision notes, question banks, and tutorials created by top teachers.',
    'market.search.placeholder': 'Search materials by title, subject, or keyword...',
    'market.filter.grade': 'Filter by Grade',
    'market.filter.subject': 'Filter by Subject',
    'market.filter.category': 'Category',
    'market.filter.pricing': 'Pricing',
    'market.filter.all': 'All Categories',
    'market.free': 'Free',
    'market.paid': 'Paid',
    'market.download': 'Download',
    'market.buyNow': 'Get Material',
    'market.addToCart': 'Add to Cart',
    'market.pages': 'pages',
    'market.details': 'View Details',
    'market.related': 'Related Learning Materials',
    'market.empty': 'No learning materials found matching your filters.',

    // Courses
    'courses.title': 'Academic Course Catalogue',
    'courses.subtitle':
      'Structured academic programs designed to prepare students for school terms, O/L, and A/L examinations.',
    'courses.search.placeholder': 'Search courses by subject, grade, or educator...',
    'courses.viewDetails': 'View Course Details',
    'courses.enquire': 'Enquire / Apply',
    'courses.syllabus': 'Curriculum Syllabus',
    'courses.outcomes': 'What You Will Master',
    'courses.schedule': 'Class Schedule',
    'courses.format': 'Learning Format',
    'courses.duration': 'Duration',
    'courses.fee': 'Course Tuition',
    'courses.empty': 'No courses found matching your criteria.',

    // Admissions
    'admissions.title': 'Student Admissions & Pre-Registration',
    'admissions.subtitle':
      'Submit your pre-registration to join upcoming academic batches or reserve a seat for the academic term.',
    'admissions.step1': 'Student Information',
    'admissions.step2': 'Parent / Guardian',
    'admissions.step3': 'Academic Preferences',
    'admissions.submit': 'Submit Admission Application',
    'admissions.success': 'Pre-registration submitted successfully!',
    'admissions.successDesc':
      'Our academic admissions counselor will review your application and reach out via WhatsApp/Phone within 1 business day.',

    // Portals
    'portals.title': 'Institutional Portals',
    'portals.subtitle': 'Secure access for authenticated students, teachers, and administrators.',
    'portals.student.title': 'Student Portal',
    'portals.student.desc':
      'Access your enrolled courses, live classroom links, digital notes, homework assignments, and progress reports.',
    'portals.teacher.title': 'Teacher Portal',
    'portals.teacher.desc':
      'Manage teaching activities, live classrooms, assignment evaluation, student attendance, and grade submissions.',
    'portals.admin.title': 'Admin Portal',
    'portals.admin.desc':
      'Central institutional administration, curriculum management, teacher allocations, fee oversight, and system settings.',
    'portals.loginBtn': 'Launch Portal',

    // Common
    'common.learnMore': 'Learn More',
    'common.getStarted': 'Get Started',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.loading': 'Loading content...',
    'common.error': 'An unexpected error occurred. Please try again.',
    'common.retry': 'Retry',
    'common.currency': 'LKR',
  },
  ta: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.courses': 'பாடநெறிகள்',
    'nav.resources': 'கற்றல் வளங்கள்',
    'nav.marketplace': 'வளச் சந்தை',
    'nav.features': 'அம்சங்கள்',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.teachers': 'ஆசிரியர்கள்',
    'nav.contact': 'தொடர்பு',
    'nav.faq': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    'nav.portals': 'நுழைவாயில் பிரவேசம்',
    'nav.apply': 'விண்ணப்பிக்க',
    'nav.admissions': 'சேர்க்கை',
    'nav.cart': 'கூடை',

    // Hero
    'hero.badge': 'TiT Online Education · அளவெட்டி, யாழ்ப்பாணம்',
    'hero.headline': 'நவீன கற்றல் மூலம் கல்விச் சிறப்பை மேம்படுத்துதல்',
    'hero.subheadline':
      'யாழ்ப்பாணம் அளவெட்டியை தலைமையகமாகக் கொண்டு, இலங்கை முழுவதுமுள்ள மாணவர்களுக்கும் ஆசிரியர்களுக்கும் நேரலை Zoom வகுப்புகள், விரிவான பாடக் குறிப்புகள், மாதிரி வினாத்தாள்கள் மற்றும் தனிப்பட்ட வழிகாட்டலை இணைக்கும் முழுமையான கல்வித் தளம்.',
    'hero.cta.courses': 'கல்வித் திட்டங்களை ஆராய்க',
    'hero.cta.resources': 'நேரலை அம்சங்களை சோதிக்க',
    'hero.stat.courses': 'முழுமையான பாடத்திட்டம்',
    'hero.stat.materials': '500+ வீடியோ & குறிப்புகள்',
    'hero.stat.teachers': 'சிறந்த ஆசிரியர்கள்',
    'hero.stat.curriculum': 'யாழ்ப்பாணம் & நாடளாவிய ரீதியில்',

    // Features Highlights
    'features.title': 'அறிவுசார் கற்றல் கட்டமைப்பு',
    'features.subtitle':
      'செயற்கை நுண்ணறிவு வழிகாட்டுதல், மதிப்பீடுகள் மற்றும் தெளிவான அடைவுப் பதிவுகளுடன் கல்வி சிறப்பிற்காக வடிவமைக்கப்பட்டது.',
    'features.ai.title': 'AI-ஆதரவு கற்றல் வழிகாட்டி',
    'features.ai.desc':
      'கடந்தகால வினாத்தாள்களுக்கான உடனடி விளக்கம் மற்றும் தனிப்பயனாக்கப்பட்ட மீள்பார்வை அட்டவணை.',
    'features.materials.title': 'சரிபார்க்கப்பட்ட கற்றல் சந்தை',
    'features.materials.desc':
      'மாதிரி வினாத்தாள்கள், புள்ளித்திட்டங்கள், சுருக்க குறிப்புகள் மற்றும் வழிகாட்டிகள்.',
    'features.lms.title': 'நேரலை வகுப்புகள்',
    'features.lms.desc': 'ஊடாடும் பாடநெறிகள், வருகைப் பதிவு, வினாடி வினாக்கள் மற்றும் பரீட்சைகள்.',
    'features.progress.title': 'முன்னேற்றக் கண்காணிப்பு',
    'features.progress.desc': 'மாணவர்கள் மற்றும் பெற்றோருக்கான தொடர்ச்சியான அடைவு பகுப்பாய்வு பலகை.',

    // Marketplace
    'market.title': 'கல்வி வளங்கள் சந்தை',
    'market.subtitle': 'சிறந்த ஆசிரியர்களால் தயாரிக்கப்பட்ட வினாத்தாள்கள், குறிப்புகள் மற்றும் வழிகாட்டிகள்.',
    'market.search.placeholder': 'வளங்களை தேடவும்...',
    'market.filter.grade': 'தரம் வாரியாக',
    'market.filter.subject': 'பாடம் வாரியாக',
    'market.filter.category': 'பிரிவு',
    'market.filter.pricing': 'விலை',
    'market.filter.all': 'அனைத்து பிரிவுகளும்',
    'market.free': 'இலவசம்',
    'market.paid': 'கட்டணம்',
    'market.download': 'பதிவிறக்கு',
    'market.buyNow': 'பெறுக',
    'market.addToCart': 'கூடையில் சேர்க்க',
    'market.pages': 'பக்கங்கள்',
    'market.details': 'விவரங்களை காண்க',
    'market.related': 'தொடர்புடைய கற்றல் வளங்கள்',
    'market.empty': 'பொருத்தமான கற்றல் வளங்கள் கிடைக்கவில்லை.',

    // Courses
    'courses.title': 'கல்விப் பாடநெறி விபரம்',
    'courses.subtitle': 'பாடசாலைத் தவணை, சாதாரண தரம் மற்றும் உயர்தர பரீட்சைகளுக்கான சிறப்புப் பயிற்சி.',
    'courses.search.placeholder': 'பாடநெறிகளைத் தேடுக...',
    'courses.viewDetails': 'விவரங்களை காண்க',
    'courses.enquire': 'விண்ணப்பிக்க / வினவ',
    'courses.syllabus': 'பாடத்திட்டம்',
    'courses.outcomes': 'நீங்கள் கற்றுக்கொள்வது',
    'courses.schedule': 'நேர அட்டவணை',
    'courses.format': 'கற்றல் முறை',
    'courses.duration': 'கால அளவு',
    'courses.fee': 'கட்டணம்',
    'courses.empty': 'பாடநெறிகள் எதுவும் கிடைக்கவில்லை.',

    // Admissions
    'admissions.title': 'மாணவர் சேர்க்கை & முன்-பதிவு',
    'admissions.subtitle': 'எதிர்வரும் கல்வி தவணைகளுக்கான ஆசனங்களை உறுதிப்படுத்த முன்கூட்டியே பதிவு செய்யுங்கள்.',
    'admissions.step1': 'மாணவர் தகவல்கள்',
    'admissions.step2': 'பெற்றோர் / பாதுகாவலர்',
    'admissions.step3': 'கல்வி விருப்பங்கள்',
    'admissions.submit': 'விண்ணப்பத்தை சமர்ப்பிக்க',
    'admissions.success': 'முன்பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    'admissions.successDesc': 'எமது சேர்க்கைக் குழு விரைவில் உங்களைத் தொடர்பு கொள்ளும்.',

    // Portals
    'portals.title': 'நிறுவன நுழைவாயில்கள்',
    'portals.subtitle': 'மாணவர்கள், ஆசிரியர்கள் மற்றும் நிர்வாகிகளுக்கான பாதுகாப்பான பிரவேசம்.',
    'portals.student.title': 'மாணவர் நுழைவாயில்',
    'portals.student.desc': 'பாடங்கள், நேரலை வகுப்புகள், குறிப்புகள் மற்றும் முன்னேற்ற அறிக்கைகள்.',
    'portals.teacher.title': 'ஆசிரியர் நுழைவாயில்',
    'portals.teacher.desc': 'வகுப்பு மேலாண்மை, பணிக் குறிப்புகள் மற்றும் வருகைப்பதிவு.',
    'portals.admin.title': 'நிர்வாக நுழைவாயில்',
    'portals.admin.desc': 'நிறுவன கட்டமைப்பு, கட்டணங்கள் மற்றும் ஆசிரியர் மேலாண்மை.',
    'portals.loginBtn': 'நுழையவும்',

    // Common
    'common.learnMore': 'மேலும் அறிக',
    'common.getStarted': 'தொடங்குங்கள்',
    'common.close': 'மூடு',
    'common.back': 'பின்செல்க',
    'common.loading': 'ஏற்றப்படுகிறது...',
    'common.error': 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    'common.retry': 'மீண்டும் முயற்சி',
    'common.currency': 'LKR',
  },
  si: {
    // Nav
    'nav.home': 'මුල් පිටුව',
    'nav.courses': 'පාඨමාලා',
    'nav.resources': 'ඉගෙනුම් සම්පත්',
    'nav.marketplace': 'සම්පත් වෙළඳපොළ',
    'nav.features': 'විශේෂාංග',
    'nav.about': 'අප ගැන',
    'nav.teachers': 'ගුරුවරුන්',
    'nav.contact': 'සම්බන්ධ වන්න',
    'nav.faq': 'නිතර අසන ප්‍රශ්න',
    'nav.portals': 'පද්ධති පිවිසුම',
    'nav.apply': 'ලියාපදිංචි වන්න',
    'nav.admissions': 'ඇතුළත් වීම්',
    'nav.cart': 'කරත්තය',

    // Hero
    'hero.badge': 'TiT Education නිල ඉගෙනුම් වේදිකාව',
    'hero.headline': 'නූතන මාර්ගගත ඉගෙනුම තුළින් විශිෂ්ට අධ්‍යාපනික අනාගතයක්',
    'hero.subheadline':
      'යාපනය අලවෙඩ්ඩි මූලස්ථානය කරගනිමින්, සිසුන්ට සහ දක්ෂ ගුරුවරුන්ට සජීවී Zoom පන්ති, සවිස්තර අධ්‍යයන සටහන්, පසුගිය ප්‍රශ්න පත්‍ර සහ පෞද්ගලික අධ්‍යයන මඟපෙන්වීම් සපයන පුළුල් අධ්‍යාපන වේදිකාව.',
    'hero.cta.courses': 'අධ්‍යයන වැඩසටහන් ගවේෂණය කරන්න',
    'hero.cta.resources': 'සජීවී විශේෂාංග අත්හදා බලන්න',
    'hero.stat.courses': 'සවිස්තර විෂය නිර්දේශ',
    'hero.stat.materials': 'ප්‍රශ්න පත්‍ර සහ සටහන්',
    'hero.stat.teachers': 'ප්‍රවීණ ගුරුවරුන්',
    'hero.stat.curriculum': 'මුළු දිවයිනටම',

    // Features Highlights
    'features.title': 'බුද්ධිමත් අධ්‍යාපන පද්ධතිය',
    'features.subtitle':
      'AI තාක්ෂණය, ව්‍යුහගත ඇගයීම් සහ විනිවිදභාවයෙන් යුතු ප්‍රගති අධීක්ෂණය සමඟින් විශිෂ්ටත්වය කරා.',
    'features.ai.title': 'AI ආධාරක ඉගෙනුම් සහායක',
    'features.ai.desc':
      'පසුගිය විභාග ප්‍රශ්න සඳහා පියවරෙන් පියවර පැහැදිලි කිරීම් සහ පුද්ගලාරෝපිත පුනරීක්ෂණ සැලසුම්.',
    'features.materials.title': 'තහවුරු කළ ඉගෙනුම් සම්පත්',
    'features.materials.desc':
      'ප්‍රවීණ ගුරුවරුන් විසින් සකස් කළ ආදර්ශ ප්‍රශ්න පත්‍ර, ලකුණු දීමේ පටිපාටි සහ කෙටි සටහන්.',
    'features.lms.title': 'සජීවී අන්තර්ක්‍රියාකාරී පන්ති',
    'features.lms.desc': 'සජීවී වීඩියෝ දේශන, පැමිණීම සටහන් කිරීම, ප්‍රශ්නාවලි සහ වාර විභාග.',
    'features.progress.title': 'තත්‍ය කාලීන ප්‍රගති වාර්තා',
    'features.progress.desc': 'ශිෂ්‍යයන් සහ දෙමාපියන් සඳහා විෂය ප්‍රවීණතාවය පෙන්වන ඩෑෂ්බෝඩ්.',

    // Marketplace
    'market.title': 'අධ්‍යාපනික සම්පත් වෙළඳපොළ',
    'market.subtitle': 'විශිෂ්ට ගුරුවරුන්ගේ පසුගිය විභාග ප්‍රශ්න පත්‍ර, කෙටි සටහන් සහ අත්පොත්.',
    'market.search.placeholder': 'සම්පත් සොයන්න...',
    'market.filter.grade': 'ශ්‍රේණිය අනුව',
    'market.filter.subject': 'විෂය අනුව',
    'market.filter.category': 'කාණ්ඩය',
    'market.filter.pricing': 'මිල',
    'market.filter.all': 'සියලු කාණ්ඩ',
    'market.free': 'නොමිලේ',
    'market.paid': 'ගෙවීම් සහිත',
    'market.download': 'බාගත කරන්න',
    'market.buyNow': 'ලබාගන්න',
    'market.addToCart': 'කරත්තයට එක් කරන්න',
    'market.pages': 'පිටු',
    'market.details': 'විස්තර බලන්න',
    'market.related': 'අදාළ ඉගෙනුම් සම්පත්',
    'market.empty': 'ගැලපෙන ඉගෙනුම් සම්පත් හමු නොවීය.',

    // Courses
    'courses.title': 'අධ්‍යයන පාඨමාලා නාමාවලිය',
    'courses.subtitle': 'පාසල් වාර විභාග, සාමාන්‍ය පෙළ සහ උසස් පෙළ විභාග ඉලක්ක කරගත් පාඨමාලා.',
    'courses.search.placeholder': 'පාඨමාලා සොයන්න...',
    'courses.viewDetails': 'විස්තර බලන්න',
    'courses.enquire': 'අයදුම් කරන්න',
    'courses.syllabus': 'විෂය නිර්දේශය',
    'courses.outcomes': 'ඔබ ඉගෙන ගන්නා දේ',
    'courses.schedule': 'කාලසටහන',
    'courses.format': 'ඉගෙනුම් ක්‍රමය',
    'courses.duration': 'කාලසීමාව',
    'courses.fee': 'පාඨමාලා ගාස්තුව',
    'courses.empty': 'පාඨමාලා හමු නොවීය.',

    // Admissions
    'admissions.title': 'ශිෂ්‍ය ඇතුළත් වීම් සහ පූර්ව ලියාපදිංචිය',
    'admissions.subtitle': 'ඉදිරි අධ්‍යයන වාර සඳහා ඔබේ ආසනය වෙන්කර ගැනීමට අයදුම්පත යොමු කරන්න.',
    'admissions.step1': 'ශිෂ්‍ය තොරතුරු',
    'admissions.step2': 'දෙමාපිය / භාරකරු',
    'admissions.step3': 'අධ්‍යයන තේරීම්',
    'admissions.submit': 'අයදුම්පත ඉදිරිපත් කරන්න',
    'admissions.success': 'පූර්ව ලියාපදිංචිය සාර්ථකයි!',
    'admissions.successDesc': 'අපගේ අධ්‍යයන උපදේශක කණ්ඩායම කඩිනමින් ඔබව අමතනු ඇත.',

    // Portals
    'portals.title': 'ආයතනික පද්ධති පිවිසුම්',
    'portals.subtitle': 'ශිෂ්‍යයන්, ගුරුවරුන් සහ පරිපාලකයන් සඳහා ආරක්ෂිත පිවිසුම්.',
    'portals.student.title': 'ශිෂ්‍ය පිවිසුම',
    'portals.student.desc': 'පාඨමාලා, සජීවී පන්ති සබැඳි, ඩිජිටල් සටහන් සහ පැවරුම්.',
    'portals.teacher.title': 'ගුරු පිවිසුම',
    'portals.teacher.desc': 'ඉගැන්වීම් කළමනාකරණය, ඇගයීම් සහ ශිෂ්‍ය පැමිණීම.',
    'portals.admin.title': 'පරිපාලක පිවිසුම',
    'portals.admin.desc': 'ආයතනික පරිපාලනය, ගාස්තු සහ පද්ධති සැකසුම්.',
    'portals.loginBtn': 'පිවිසෙන්න',

    // Common
    'common.learnMore': 'වැඩිදුර විස්තර',
    'common.getStarted': 'ආරම්භ කරන්න',
    'common.close': 'වසන්න',
    'common.back': 'ආපසු',
    'common.loading': 'පූරණය වෙමින්...',
    'common.error': 'දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
    'common.retry': 'නැවත උත්සාහ කරන්න',
    'common.currency': 'LKR',
  },
};

export function getTranslation(lang: Language, key: string): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}
