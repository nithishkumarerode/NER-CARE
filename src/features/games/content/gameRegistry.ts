import { GameDefinition } from '../engine/types';

export const GAME_DEFINITIONS: GameDefinition[] = [
  // 1. My Village, My Memory
  {
    id: 'memory_village',
    title: {
      en: 'My Village, My Memory',
      hi: 'मेरा गाँव, मेरी यादें',
      as: 'মোৰ গাঁও, মোৰ স্মৃতি',
      bn: 'আমার গ্রাম, আমার স্মৃতি',
      lus: 'Ka Khua, Ka Hriatna',
    },
    category: 'memory',
    icon: '🏡',
    duration: '4 min',
    description: {
      en: 'Observe a familiar village scene, then recall landmark locations.',
      hi: 'गाँव के परिचित दृश्य को ध्यान से देखें और फिर स्थानों को याद करें।',
      as: 'পৰিচিত গাঁৱৰ দৃশ্যটো মন দি চাওক, তাৰ পিছত বস্তুবোৰ ক’ত আছিল মনত পেলাওক।',
      bn: 'পরিচিত গ্রামের দৃশ্যটি মন দিয়ে দেখুন এবং অবস্থানগুলি মনে রাখুন।',
      lus: 'Khaw thil thleng leh hmun pawimawh te hriatreng tum rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Visual & Spatial Memory',
      hi: 'दृश्य और स्थानिक स्मृति',
      as: 'দৃশ্য আৰু স্থান সম্বন্ধীয় স্মৃতি',
      bn: 'স্থান ও দৃষ্টি সম্বন্ধীয় স্মৃতি',
      lus: 'Hmuh leh Hmun Hriatna',
    },
  },

  // 2. Complete My Morning
  {
    id: 'morning_routine',
    title: {
      en: 'Complete My Morning',
      hi: 'मेरी सुबह की दिनचर्या',
      as: 'মোৰ ৰাতিপুৱাৰ নিয়ম',
      bn: 'আমার সকালের রুটিন',
      lus: 'Zing Thiltih Kimchang',
    },
    category: 'routine',
    icon: '🌅',
    duration: '3 min',
    description: {
      en: 'Arrange healthy daily morning activities in their natural sequential order.',
      hi: 'सुबह की स्वस्थ गतिविधियों को उनके सही क्रम में व्यवस्थित करें।',
      as: 'ৰাতিপুৱাৰ দৈনন্দিন কামবোৰ সঠিক ক্ৰমত সজাওক।',
      bn: 'সকালের প্রয়োজনীয় কাজগুলি সঠিক ধারাবাহিকতায় সাজান।',
      lus: 'Zing kara kan thiltih ṭhinte a indawtin rem rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Sequential Planning & Daily Routine',
      hi: 'क्रमबद्ध योजना और दिनचर्या',
      as: 'ক্ৰমিক পৰিকল্পনা আৰু দৈনন্দিন কাৰ্য্য',
      bn: 'ধারাবাহিক পরিকল্পনা ও দিনলিপি',
      lus: 'Inremkhawm leh Nitin Nun',
    },
  },

  // 3. Who Did What?
  {
    id: 'who_did_what',
    title: {
      en: 'Who Did What?',
      hi: 'किसने क्या किया?',
      as: 'কোনে কি কৰিলে?',
      bn: 'কে কী করল?',
      lus: 'Tunge Engnge Ti?',
    },
    category: 'attention',
    icon: '🧑‍🤝‍🧑',
    duration: '4 min',
    description: {
      en: 'Remember which friend or neighbor went to the market, temple, or clinic.',
      hi: 'याद रखें कि कौन सा मित्र बाज़ार, मंदिर या औषधालय गया था।',
      as: 'মনত পেলাওক কোন বন্ধু বজাৰলৈ, মন্দিৰলৈ বা ক্লিনিকলৈ গৈছিল।',
      bn: 'মনে রাখুন কোন বন্ধু বাজারে, মন্দিরে বা চিকিৎসালয়ে গিয়েছিলেন।',
      lus: 'Tuin nge thil lei, biakin pan leh damdawi in kal hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Associative Memory & People Recognition',
      hi: 'साहचर्य स्मृति और लोगों की पहचान',
      as: 'সংযোগাত্মক স্মৃতি আৰু ব্যক্তি চিনাক্তকৰণ',
      bn: 'ব্যক্তি ও কাজের সম্পর্ক স্মৃতি',
      lus: 'Mihring leh Thiltih Hriatpawlh',
    },
  },

  // 4. Memory House
  {
    id: 'memory_house',
    title: {
      en: 'Memory House',
      hi: 'यादों का घर',
      as: 'স্মৃতিৰ ঘৰখনি',
      bn: 'স্মৃতির বাড়ি',
      lus: 'Hriatrengna In',
    },
    category: 'spatial',
    icon: '🏠',
    duration: '4 min',
    description: {
      en: 'Explore virtual rooms and recall where medicine, clock, or radio were placed.',
      hi: 'कमरों का भ्रमण करें और याद रखें कि दवा, घड़ी या रेडियो कहाँ रखे थे।',
      as: 'ঘৰৰ কোঠাবোৰ চাওক আৰু দৰব, ঘড়ী বা ৰেডিঅ’ ক’ত আছিল মনত পেলাওক।',
      bn: 'ঘরের মধ্যে ঔষধ, ঘড়ি বা রেডিও কোথায় রাখা ছিল মনে রাখুন।',
      lus: 'In chhung pindan hrang hranga bungrua awmna hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Domestic Spatial Orientation',
      hi: 'घरेलू स्थानिक अभिविन्यास',
      as: 'ঘৰুৱা স্থান আৰু দিশ জ্ঞান',
      bn: 'পারিবারিক স্থানিক স্মৃতি',
      lus: 'In Chhung Hmun Hriatna',
    },
  },

  // 5. Pack for the Journey
  {
    id: 'pack_journey',
    title: {
      en: 'Pack for the Journey',
      hi: 'यात्रा की तैयारी',
      as: 'যাত্ৰাৰ প্ৰস্তুতি',
      bn: 'যাত্রার প্রস্তুতি',
      lus: 'Zinna Thilpack',
    },
    category: 'memory',
    icon: '🎒',
    duration: '3 min',
    description: {
      en: 'Memorize travel essentials like umbrella, warm clothes, and medicines.',
      hi: 'यात्रा की आवश्यक वस्तुओं जैसे छाता, गर्म कपड़े और दवाइयों को याद रखें।',
      as: 'যাত্ৰাৰ প্ৰয়োজনীয় সামগ্ৰী যেনে ছাতি, কাপোৰ আৰু দৰব মনত ৰাখক।',
      bn: 'ভ্রমণের প্রয়োজনীয় জিনিস যেমন ছাতা, পোশাক ও ওষুধ মনে রাখুন।',
      lus: 'Zinna atana thil pawimawh ken tur te hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Category Recall & Preparedness',
      hi: 'वस्तु स्मरण और तत्परता',
      as: 'সামগ্ৰী তালিকা সোঁৱৰণ',
      bn: 'তালিকাভিত্তিক স্মৃতিকৌশল',
      lus: 'Thil Hriatpuina',
    },
  },

  // 6. Bus Route Memory
  {
    id: 'bus_route',
    title: {
      en: 'Bus Route Memory',
      hi: 'बस मार्ग स्मृति',
      as: 'বাছ যাত্ৰাৰ পথ',
      bn: 'বাস রুটের স্মৃতি',
      lus: 'Bus Kawng Hriatrengna',
    },
    category: 'spatial',
    icon: '🚌',
    duration: '4 min',
    description: {
      en: 'Follow the stops from Home through Market, Hospital, and Railway Station.',
      hi: 'घर से बाज़ार, अस्पताल और स्टेशन तक के बस स्टॉप को याद रखें।',
      as: 'ঘৰৰ পৰা বজাৰ, চিকিৎসালয় আৰু ষ্টেচনলৈ বাছৰ ষ্টপবোৰ মনত ৰাখক।',
      bn: 'বাড়ি থেকে বাজার, হাসপাতাল ও রেল স্টেশনের স্টপগুলি মনে রাখুন।',
      lus: 'Bus dinna hmun hrang hrang indawt dan hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Topographical Sequence & Navigation',
      hi: 'मार्ग अनुक्रम और दिशा ज्ञान',
      as: 'পথৰ ক্ৰম আৰু ভ্ৰমণ স্মৃতি',
      bn: 'পথক্রম ও দিকনির্ণয়',
      lus: 'Kawngkal Indawt Hriatna',
    },
  },

  // 7. Grandma/Grandpa Story Recall
  {
    id: 'story_recall',
    title: {
      en: 'Grandma/Grandpa Story Recall',
      hi: 'दादी-नानी की कहानी',
      as: 'আইতা-ককাৰ সাধু',
      bn: 'ঠাকুরমার গল্প মনে রাখা',
      lus: 'Pi leh Pu Thawnthu',
    },
    category: 'auditory',
    icon: '🗣️',
    duration: '5 min',
    description: {
      en: 'Listen to a short warm folk story and answer cheerful questions about it.',
      hi: 'एक छोटी मधुर कहानी सुनें और उसके बारे में सरल प्रश्नों के उत्तर दें।',
      as: 'এটা মিঠা চুটি সাধু শুনক আৰু তাৰ বিষয়ে সহজ প্ৰশ্নৰ উত্তৰ দিয়ক।',
      bn: 'একটি ছোট মিষ্টি গল্প শুনুন এবং সেই গল্পের সহজ প্রশ্নের উত্তর দিন।',
      lus: 'Thawnthu tawi ngaithla la, a chhanna pe rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Narrative & Verbal Comprehension',
      hi: 'कथा और मौखिक समझ',
      as: 'মৌখিক আৰু বৰ্ণনামূলক স্মৃতি',
      bn: 'শ্রবণ ও কাহিনী স্মৃতি',
      lus: 'Thawnthu Hriatthiamna',
    },
  },

  // 8. Sound Memory
  {
    id: 'sound_memory',
    title: {
      en: 'Sound Memory',
      hi: 'ध्वनि स्मृति',
      as: 'শব্দৰ স্মৃতি',
      bn: 'শব্দ স্মৃতি',
      lus: 'Ri Hriatrengna',
    },
    category: 'auditory',
    icon: '🔔',
    duration: '3 min',
    description: {
      en: 'Listen to temple bells, birds, train whistles and recreate the chime order.',
      hi: 'घंटी, पक्षी और रेल की सीटी की ध्वनियों को सुनें और सही क्रम बताएं।',
      as: 'মন্দিৰৰ ঘণ্টা, চৰাইৰ মাত আৰু ৰে’লৰ হুইচেল শুনি ক্ৰমটো মনত পেলাওক।',
      bn: 'ঘণ্টা, পাখির ডাক ও ট্রেনের শব্দ শুনে সঠিক ক্রমটি চিহ্নিত করুন।',
      lus: 'Darkhing, sava hram leh thil ri hrang hrang indawt dan hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Auditory Sequencing & Tone Discrimination',
      hi: 'श्रवण अनुक्रम और ध्वनि पहचान',
      as: 'শ্ৰৱণ ক্ৰম আৰু স্বৰ চিনাক্তকৰণ',
      bn: 'শ্রুতিগত অনুক্রম ও শব্দজ্ঞান',
      lus: 'Ri Hriathran Theihna',
    },
  },

  // 9. Memory Chain
  {
    id: 'memory_chain',
    title: {
      en: 'Memory Chain',
      hi: 'स्मृति श्रृंखला',
      as: 'স্মৃতিৰ শিকলি',
      bn: 'স্মৃতির শৃঙ্খল',
      lus: 'Hriatna Inthlunzawm',
    },
    category: 'memory',
    icon: '🧩',
    duration: '4 min',
    description: {
      en: 'A growing chain of familiar items! Recall each newly added link.',
      hi: 'वस्तुओं की बढ़ती श्रृंखला! प्रत्येक नई जुड़ी वस्तु को याद रखें।',
      as: 'ক্ৰমে বাঢ়ি যোৱা সামগ্ৰীৰ তালিকা! প্ৰতিটো নতুন বস্তু ক্ৰমত মনত ৰাখক।',
      bn: 'ক্রমবর্ধমান জিনিসের তালিকা! নতুন যুক্ত হওয়া প্রতিটি জিনিস মনে রাখুন।',
      lus: 'Thil pung zel chu a indawtin hrechhuak rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Working Memory Span & Progressive Recall',
      hi: 'कार्यशील स्मृति विस्तार',
      as: 'কাৰ্য্যকৰী স্মৃতি আৰু বৃদ্ধি পোৱা সোঁৱৰণ',
      bn: 'কার্যনির্বাহী স্মৃতিশক্তি',
      lus: 'Hriatrengna Thazam Tihhmasawn',
    },
  },

  // 10. Smart Market
  {
    id: 'smart_market',
    title: {
      en: 'Smart Market',
      hi: 'स्मार्ट बाज़ार',
      as: 'স্মাৰ্ট বজাৰ',
      bn: 'স্মার্ট বাজার',
      lus: 'Dawr Hriatna',
    },
    category: 'routine',
    icon: '🛍️',
    duration: '4 min',
    description: {
      en: 'Review a bazaar grocery list, then identify which items you need to buy.',
      hi: 'बाज़ार की खरीदारी सूची देखें और पहचानें कि क्या खरीदना था।',
      as: 'বজাৰৰ ফৰ্দখন চাওক আৰু ক্ৰয় কৰিবলগীয়া সামগ্ৰীসমূহ বাছি উলিয়াওক।',
      bn: 'বাজারের তালিকাটি দেখে প্রয়োজনীয় জিনিসগুলি শনাক্ত করুন।',
      lus: 'Bazar thil lei tur te hria la, thlang chhuak rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Functional Grocery Recall & Attention',
      hi: 'व्यावहारिक खरीदारी स्मरण',
      as: 'বজাৰৰ কাৰ্য্যকৰী স্মৃতি আৰু মনোযোগ',
      bn: 'ব্যবহারিক জীবনযাপনের স্মৃতি',
      lus: 'Nitin Mamawh Hriatna',
    },
  },

  // 11. Then & Now
  {
    id: 'then_and_now',
    title: {
      en: 'Then & Now',
      hi: 'तब और अब',
      as: 'তেতিয়া আৰু এতিয়া',
      bn: 'তখন ও এখন',
      lus: 'Hmanlai leh Tunlai',
    },
    category: 'attention',
    icon: '📸',
    duration: '3 min',
    description: {
      en: 'Spot what changed between two quiet household snapshots.',
      hi: 'घर के दो दृश्यों के बीच क्या बदलाव हुआ है, उसे पहचानें।',
      as: 'দুখন ঘৰুৱা ছবিৰ মাজত কি সলনি হ’ল লক্ষ্য কৰি উলিয়াওক।',
      bn: 'দুটি পারিবারিক ছবির মধ্যে কী পরিবর্তন হয়েছে তা চিহ্নিত করুন।',
      lus: 'Thlalak pahnih inkara thil inthlak danglam hrechhuak rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Visual Comparison & Change Detection',
      hi: 'दृश्य तुलना और परिवर्तन पहचान',
      as: 'দৃশ্য তুলনা আৰু পৰিৱৰ্তন ধৰা পেলোৱা',
      bn: 'দৃষ্টিগত তুলনা ও পরিবর্তন নির্ণয়',
      lus: 'Thil Danglam Hriatna',
    },
  },

  // 12. Family Memory Tree
  {
    id: 'family_tree',
    title: {
      en: 'Family Memory Tree',
      hi: 'पारिवारिक स्नेह वृक्ष',
      as: 'পৰিয়ালৰ স্মৃতি বৃক্ষ',
      bn: 'পারিবারিক স্মৃতিতরু',
      lus: 'Chhungkua Hriatrengna',
    },
    category: 'reasoning',
    icon: '👨‍👩‍👧',
    duration: '4 min',
    description: {
      en: 'Connect relations, names, and beloved hobbies across generations.',
      hi: 'पीढ़ियों के बीच रिश्तों, नामों और प्रिय शौकों को जोड़ें।',
      as: 'পৰিয়ালৰ সদস্যসকলৰ নাম, সম্বন্ধ আৰু প্ৰিয় চখসমূহ মনত পেলাওক।',
      bn: 'পরিবারের প্রিয়জনদের নাম, সম্পর্ক এবং পছন্দের শখ মনে রাখুন।',
      lus: 'Chhungkaw inlaichinna leh an thil ngainat te hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Social Cognition & Relational Reasoning',
      hi: 'सामाजिक संज्ञान और तार्किक संबंध',
      as: 'সামাজিক বোধ আৰু পাৰিবাৰিক সম্পৰ্ক',
      bn: 'পারিবারিক সম্পর্কীয় যুক্তি',
      lus: 'Chhungkua leh Inlaichinna',
    },
  },

  // 13. Memory Lock
  {
    id: 'memory_lock',
    title: {
      en: 'Memory Lock',
      hi: 'स्मृति ताला',
      as: 'স্মৃতিৰ তলা',
      bn: 'স্মৃতির চাবি',
      lus: 'Hriatna Tala',
    },
    category: 'memory',
    icon: '🔐',
    duration: '3 min',
    description: {
      en: 'Recall friendly symbol combinations to open the peaceful treasure chest.',
      hi: 'प्यारे प्रतीकों के क्रम को याद करके ज्ञान का संदूक खोलें।',
      as: 'মৰমলগা প্ৰতীকৰ ক্ৰম মনত পেলাই আনন্দৰ পেৰাটো খোলক।',
      bn: 'সহজ চিহ্নের ক্রম মনে রেখে স্মৃতির সিন্ধুকটি খুলুন।',
      lus: 'Entirna lem te indawt dan hriain tala hawng rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Symbolic Pattern Retention',
      hi: 'प्रतीकात्मक पैटर्न स्मरण',
      as: 'প্ৰতীকী আৰ্হি মনত ৰখা',
      bn: 'প্রতীক বিন্যাস স্মৃতি',
      lus: 'Lem Hriatreng Theihna',
    },
  },

  // 14. Guide Me Home
  {
    id: 'guide_home',
    title: {
      en: 'Guide Me Home',
      hi: 'घर की राह',
      as: 'ঘৰলৈ যোৱা বাট',
      bn: 'বাড়ির পথপ্রদর্শক',
      lus: 'In Panna Kawng',
    },
    category: 'spatial',
    icon: '🧭',
    duration: '4 min',
    description: {
      en: 'Help your village elder navigate past the tea stall and pond safely home.',
      hi: 'चाय की दुकान और तालाब के रास्ते से सुरक्षित घर पहुँचने में मदद करें।',
      as: 'চাহৰ দোকান আৰু পুখুৰীৰ কাষেৰে সুকলমে ঘৰলৈ বাট দেখুৱাওক।',
      bn: 'চায়ের দোকান ও পুকুর পেরিয়ে নিরাপদে ঘরে পৌঁছাতে সাহায্য করুন।',
      lus: 'In thleng tura kawng dik tak zawh rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Spatial Wayfinding & Mental Mapping',
      hi: 'स्थानिक दिशा-खोज और मानसिक मानचित्रण',
      as: 'স্থানিক পথ নিৰ্ণয় আৰু মনৰ মানচিত্ৰ',
      bn: 'পথনির্দেশ ও স্থানজ্ঞান',
      lus: 'Hmun Hriatna leh Kawngkal',
    },
  },

  // 15. What Changed in My Room?
  {
    id: 'room_changes',
    title: {
      en: 'What Changed in My Room?',
      hi: 'मेरे कमरे में क्या बदला?',
      as: 'মোৰ কোঠাত কি সলনি হ’ল?',
      bn: 'আমার ঘরে কী বদলাল?',
      lus: 'Ka Pindan Inthlak Danglam',
    },
    category: 'attention',
    icon: '🛋️',
    duration: '4 min',
    description: {
      en: 'Notice the clock, rocking chair, or flower pot moved in the room.',
      hi: 'पहचानें कि कमरे में घड़ी, आरामकुर्सी या फूलदान में क्या बदला है।',
      as: 'কোঠাটোত ঘড়ী, আৰাম চকী বা ফুলদানিৰ কি সালসলনি ঘটিল লক্ষ্য কৰক।',
      bn: 'ঘরের ঘড়ি, আরামকেদারা বা ফুলের টবের কী পরিবর্তন হয়েছে বুঝুন।',
      lus: 'Pindan chhunga sana, ṭhutthleng emaw pangpar inthlak hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Object Relational Memory',
      hi: 'वस्तु संबंध स्मृति',
      as: 'বস্তু আৰু অৱস্থানৰ স্মৃতি',
      bn: 'বস্তু স্থানিক স্মৃতি',
      lus: 'Bungraw Awmna Hriatna',
    },
  },

  // 16. Complete the Familiar Tune
  {
    id: 'familiar_tune',
    title: {
      en: 'Complete the Familiar Tune',
      hi: 'मधुर धुन पूरी करें',
      as: 'মধুৰ সুৰটি পূৰণ কৰক',
      bn: 'পরিচিত সুর সম্পূর্ণ করুন',
      lus: 'Rimawi Hriatlawm Zawmna',
    },
    category: 'auditory',
    icon: '🎵',
    duration: '3 min',
    description: {
      en: 'Listen to a soothing melodic bell sequence and tap the missing final chime.',
      hi: 'एक सुखद मधुर धुन सुनें और छूटे हुए अंतिम सुर को पहचानें।',
      as: 'এটা শান্ত সুৰীয়া ঘণ্টাৰ ধ্বনি শুনক আৰু শেষৰ সুৰটো বাছি উলিয়াওক।',
      bn: 'একটি মিষ্টি সুর শুনে তার শেষ স্বরটি মিলিয়ে নিন।',
      lus: 'Rimawi zai tawi ngaithla la, a tawpna thlang rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Musical Memory & Pitch Expectancy',
      hi: 'संगीतमय स्मृति और सुर बोध',
      as: 'সংগীতৰ স্মৃতি আৰু সুৰৰ অনুভৱ',
      bn: 'সঙ্গীত স্মৃতি ও সুর অনুধাবন',
      lus: 'Rimawi Thluk Hriatna',
    },
  },

  // 17. Yesterday–Today–Tomorrow
  {
    id: 'yesterday_today_tomorrow',
    title: {
      en: 'Yesterday–Today–Tomorrow',
      hi: 'कल, आज और कल',
      as: 'যোৱাকালী, আজি আৰু কাইলৈ',
      bn: 'গতকাল, আজ ও আগামীকাল',
      lus: 'Nimin, Vawiin, Naktuk',
    },
    category: 'routine',
    icon: '📅',
    duration: '4 min',
    description: {
      en: 'Organize personal medical appointments, walks, and family calls across days.',
      hi: 'दवा, सैर और परिजनों से बातचीत को सही दिन और समय पर याद रखें।',
      as: 'চিকিৎসকৰ সময়, খোজ কঢ়া আৰু পৰিয়ালৰ ফোনৰ সময় ক্ৰমত মনত পেলাওক।',
      bn: 'ওষুধ খাওয়া, হাঁটা ও পরিবারের খোঁজ নেওয়ার দিনক্ষণ মনে রাখুন।',
      lus: 'Damdawi ei hun, inleng neih leh thiltih tur ni hriatna.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Temporal Orientation & Prospective Memory',
      hi: 'कालिक अभिविन्यास और भावी स्मृति',
      as: 'সময় জ্ঞান আৰু ভৱিষ্যত পৰিকল্পনা স্মৃতি',
      bn: 'কালিক বোধ ও পূর্বাভাস স্মৃতি',
      lus: 'Hun leh Ni Hriatchianna',
    },
  },

  // 18. Season Memory
  {
    id: 'season_memory',
    title: {
      en: 'Season Memory',
      hi: 'ऋतुओं की यादें',
      as: 'ঋতুৰ সুবাস',
      bn: 'ঋতুর স্মৃতি',
      lus: 'Sik leh Sa Hriatrengna',
    },
    category: 'routine',
    icon: '🧑‍🌾',
    duration: '4 min',
    description: {
      en: 'Recall the natural rhythms of spring blossoms, monsoon rains, and harvest feasts.',
      hi: 'वसंत, सावन की फुहारों और सुनहरी फसल के उत्सवों के क्रम को याद करें।',
      as: 'বসন্তৰ ফুল, বাৰিষাৰ বৰষুণ আৰু আঘোণৰ ধান চপোৱাৰ ক্ৰম মনত পেলাওক।',
      bn: 'বসন্ত, বর্ষা ও নবান্নের উৎসবের প্রাকৃতিক পরম্পরা মনে রাখুন।',
      lus: 'Fur leh Ṭhal hun, buh seng leh kut hun te hria rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Seasonal Cycles & Nature Awareness',
      hi: 'मौसमी चक्र और प्राकृतिक तालमेल',
      as: 'ঋতুচক্ৰ আৰু প্ৰকৃতিৰ ছন্দ স্মৃতি',
      bn: 'প্রকৃতির পর্যায়বৃত্তিক স্মৃতি',
      lus: 'Nungcha leh Sik Hriatna',
    },
  },

  // 19. Memory Map
  {
    id: 'memory_map',
    title: {
      en: 'Memory Map',
      hi: 'दिशा और नक्शा',
      as: 'স্মৃতিৰ মানচিত্ৰ',
      bn: 'স্মৃতির মানচিত্র',
      lus: 'Hmun Lem Hriatna',
    },
    category: 'spatial',
    icon: '🗺️',
    duration: '4 min',
    description: {
      en: 'Study the neighborhood map and identify what stands North or next to the school.',
      hi: 'इलाके के नक्शे को देखें और बताएं कि स्कूल के पास या उत्तर में क्या था।',
      as: 'চুবুৰিৰ মানচিত্ৰখন চাই বিদ্যালয়ৰ উত্তৰে বা ওচৰত কি আছিল কওক।',
      bn: 'পাড়ার মানচিত্র দেখে বলুন বিদ্যালয়ের উত্তর বা পাশে কী ছিল।',
      lus: 'Veng chhung hmun pawimawh awmna hria la, chhang rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Cardinal Directions & Spatial Recall',
      hi: 'दिशा-बोध और स्थानिक स्मृति',
      as: 'দিশ নিৰ্ণয় আৰু স্থানিক স্মৃতি',
      bn: 'দিকনির্ণয় ও স্থানিক ধারণা',
      lus: 'Hmun leh Avel Hriatna',
    },
  },

  // 20. Memory Detective
  {
    id: 'memory_detective',
    title: {
      en: 'Memory Detective',
      hi: 'स्मृति जासूस',
      as: 'স্মৃতিৰ অনুসন্ধানকাৰী',
      bn: 'স্মৃতি গোয়েন্দা',
      lus: 'Hriatna Chhuichhuaktu',
    },
    category: 'reasoning',
    icon: '🔍',
    duration: '5 min',
    description: {
      en: 'Read a short real-life event and uncover the connected facts and details.',
      hi: 'एक सच्ची छोटी घटना को समझें और उससे जुड़े तथ्यों का पता लगाएं।',
      as: 'এটা চুটি ঘটনা মন দি পঢ়ি তাৰ লগত জড়িত কথাবোৰ বিশ্লেষণ কৰক।',
      bn: 'একটি ছোট ঘটনা পড়ে তার সাথে যুক্ত তথ্যগুলি আবিষ্কার করুন।',
      lus: 'Chanchin tawi chhiar la, a chhunga thil thleng chhui rawh.',
    },
    totalLevels: 6,
    skillFocus: {
      en: 'Multi-Fact Deduction & Working Logic',
      hi: 'बहु-तथ्य निष्कर्ष और व्यावहारिक तर्क',
      as: 'বহু-তথ্য বিশ্লেষণ আৰু ব্যৱহাৰিক যুক্তি',
      bn: 'বহুমাত্রিক যুক্তি ও বিশ্লেষণ',
      lus: 'Thil Chhuichhuah Thiamna',
    },
  },
];
