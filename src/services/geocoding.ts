// Comprehensive Geocoding & Transit Coordinates Service for Karnataka & South India

export interface LocationSuggestion {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  category: 'airport' | 'railway' | 'hub' | 'city' | 'tourist' | 'general';
}

// Curated verified coordinates database
export const VERIFIED_LOCATIONS: Record<string, { lat: number; lng: number; category: LocationSuggestion['category']; displayName: string }> = {
  // --- BENGALURU AIRPORT & TRANSIT HUBS ---
  'kempegowda international airport': { lat: 13.1986, lng: 77.7066, category: 'airport', displayName: 'Kempegowda International Airport (BLR), Terminal 1 & 2' },
  'blr airport': { lat: 13.1986, lng: 77.7066, category: 'airport', displayName: 'Kempegowda International Airport (BLR), Devanahalli' },
  'bangalore airport': { lat: 13.1986, lng: 77.7066, category: 'airport', displayName: 'Kempegowda International Airport (BLR)' },
  'majestic': { lat: 12.9767, lng: 77.5713, category: 'railway', displayName: 'KSR Bengaluru City Railway Station / Majestic Bus Stand' },
  'ksr bengaluru': { lat: 12.9767, lng: 77.5713, category: 'railway', displayName: 'KSR Bengaluru Central Railway Station, Majestic' },
  'yeshwanthpur': { lat: 13.0238, lng: 77.5503, category: 'railway', displayName: 'Yeshwanthpur Junction Railway Station, Bengaluru' },
  'cantonment': { lat: 12.9936, lng: 77.5985, category: 'railway', displayName: 'Bengaluru Cantonment Railway Station, Vasanth Nagar' },
  'smvt bengaluru': { lat: 13.0039, lng: 77.6528, category: 'railway', displayName: 'Sir M. Visvesvaraya Terminal (SMVT), Baiyappanahalli' },
  'shantinagar': { lat: 12.9556, lng: 77.5947, category: 'hub', displayName: 'Shanthinagar KSRTC Bus Stand, Bengaluru' },

  // --- BENGALURU TECH HUBS & NEIGHBORHOODS ---
  'indiranagar': { lat: 12.9784, lng: 77.6408, category: 'hub', displayName: 'Indiranagar 100ft / 12th Main Road, Bengaluru' },
  'koramangala': { lat: 12.9352, lng: 77.6245, category: 'hub', displayName: 'Koramangala (Sony World Junction / Forum Mall), Bengaluru' },
  'electronic city': { lat: 12.8452, lng: 77.6602, category: 'hub', displayName: 'Electronic City Phase 1 & 2 (Infosys / Wipro Campus), Bengaluru' },
  'whitefield': { lat: 12.9698, lng: 77.7499, category: 'hub', displayName: 'Whitefield ITPL & Prestige Shantiniketan, Bengaluru' },
  'hsr layout': { lat: 12.9121, lng: 77.6446, category: 'hub', displayName: 'HSR Layout (Sector 1 - 7), Bengaluru' },
  'btm layout': { lat: 12.9166, lng: 77.6101, category: 'hub', displayName: 'BTM Layout (Udupi Garden Junction), Bengaluru' },
  'jayanagar': { lat: 12.9308, lng: 77.5838, category: 'hub', displayName: 'Jayanagar 4th Block Complex, Bengaluru' },
  'jp nagar': { lat: 12.9063, lng: 77.5857, category: 'hub', displayName: 'JP Nagar (Phase 1 to 7), Bengaluru' },
  'banashankari': { lat: 12.9152, lng: 77.5736, category: 'hub', displayName: 'Banashankari BDA Complex / Bus Stand, Bengaluru' },
  'bellandur': { lat: 12.9260, lng: 77.6762, category: 'hub', displayName: 'Bellandur EcoSpace / Outer Ring Road, Bengaluru' },
  'marathahalli': { lat: 12.9591, lng: 77.6974, category: 'hub', displayName: 'Marathahalli Bridge & Multiplex, Bengaluru' },
  'sarjapur': { lat: 12.8601, lng: 77.7865, category: 'hub', displayName: 'Sarjapur Road / Wipro SEZ, Bengaluru' },
  'hebbal': { lat: 13.0358, lng: 77.5970, category: 'hub', displayName: 'Hebbal Flyover / Manyata Tech Park, Bengaluru' },
  'manyata tech park': { lat: 13.0475, lng: 77.6198, category: 'hub', displayName: 'Manyata Embassy Business Park, Nagavara, Bengaluru' },
  'yelahanka': { lat: 13.1007, lng: 77.5963, category: 'hub', displayName: 'Yelahanka New Town / Air Force Base, Bengaluru' },
  'mg road': { lat: 12.9756, lng: 77.6066, category: 'hub', displayName: 'MG Road / Brigade Road / Church Street, Bengaluru' },
  'commercial street': { lat: 12.9822, lng: 77.6083, category: 'hub', displayName: 'Commercial Street / Tasker Town, Bengaluru' },
  'malleshwaram': { lat: 13.0031, lng: 77.5643, category: 'hub', displayName: 'Malleshwaram 8th Cross / Sampige Road, Bengaluru' },
  'rajajinagar': { lat: 12.9982, lng: 77.5530, category: 'hub', displayName: 'Rajajinagar 1st Block / Orion Mall, Bengaluru' },
  'kengeri': { lat: 12.9081, lng: 77.4851, category: 'hub', displayName: 'Kengeri Satellite Town / Metro Terminal, Bengaluru' },
  'vijayanagar': { lat: 12.9719, lng: 77.5305, category: 'hub', displayName: 'Vijayanagar Metro Station / BDA Complex, Bengaluru' },
  'basavanagudi': { lat: 12.9421, lng: 77.5753, category: 'hub', displayName: 'Basavanagudi Bull Temple / Gandhi Bazaar, Bengaluru' },
  'bannerghatta road': { lat: 12.8906, lng: 77.5978, category: 'hub', displayName: 'Bannerghatta National Park / IIMB Road, Bengaluru' },
  'kanakapura road': { lat: 12.8711, lng: 77.5456, category: 'hub', displayName: 'Kanakapura Road / Art of Living Ashram, Bengaluru' },
  'devanahalli': { lat: 13.2483, lng: 77.7126, category: 'hub', displayName: 'Devanahalli Fort / Aerospace SEZ, Bengaluru Rural' },
  'hoskote': { lat: 13.0708, lng: 77.7981, category: 'hub', displayName: 'Hoskote Industrial Area, Bengaluru Rural' },
  'bidadi': { lat: 12.7963, lng: 77.3857, category: 'hub', displayName: 'Bidadi Toyota Industrial Hub / Wonderla, Ramanagara' },
  'nelamangala': { lat: 13.0988, lng: 77.3918, category: 'hub', displayName: 'Nelamangala Highway Toll Plaza, NH 48' },

  // --- KARNATAKA CITIES & TOURIST DESTINATIONS ---
  'mysore': { lat: 12.2958, lng: 76.6394, category: 'city', displayName: 'Mysore Palace / Mysuru City Centre, Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, category: 'city', displayName: 'Mysuru City, Karnataka' },
  'nanjangud': { lat: 12.1194, lng: 76.6806, category: 'tourist', displayName: 'Nanjangud Sri Srikanteshwara Temple, Karnataka' },
  'srirangapatna': { lat: 12.4238, lng: 76.6953, category: 'tourist', displayName: 'Srirangapatna Ranganathaswamy Temple, Mandya' },
  'mandya': { lat: 12.5242, lng: 76.8958, category: 'city', displayName: 'Mandya Sugar City, Karnataka' },
  'channapatna': { lat: 12.6518, lng: 77.2089, category: 'city', displayName: 'Channapatna Toy City, Ramanagara' },
  'ramanagara': { lat: 12.7209, lng: 77.2799, category: 'city', displayName: 'Ramanagara Silk Town / Sholay Hills, Karnataka' },
  'coorg': { lat: 12.4244, lng: 75.7382, category: 'tourist', displayName: 'Coorg (Madikeri), Kodagu, Karnataka' },
  'madikeri': { lat: 12.4244, lng: 75.7382, category: 'tourist', displayName: 'Madikeri Fort & Raja Seat, Coorg' },
  'kushalnagar': { lat: 12.4556, lng: 75.9603, category: 'tourist', displayName: 'Kushalnagar Golden Temple (Tibetan Camp), Coorg' },
  'talakaveri': { lat: 12.3871, lng: 75.4912, category: 'tourist', displayName: 'Talakaveri Holy River Origin, Brahmagiri Hills, Coorg' },
  'nagarhole': { lat: 11.9961, lng: 76.1362, category: 'tourist', displayName: 'Nagarhole Tiger Reserve & Safari, Karnataka' },
  'bandipur': { lat: 11.6664, lng: 76.6331, category: 'tourist', displayName: 'Bandipur National Park Safari Office, Gundlupet' },
  'kabini': { lat: 11.9261, lng: 76.2711, category: 'tourist', displayName: 'Kabini River Safari / Jungle Lodges, Karapura' },
  'chikmagalur': { lat: 13.3161, lng: 75.7720, category: 'tourist', displayName: 'Chikmagalur Coffee Country, Karnataka' },
  'mullayanagiri': { lat: 13.3917, lng: 75.7214, category: 'tourist', displayName: 'Mullayanagiri Peak (Highest Point in Karnataka)' },
  'kemmangundi': { lat: 13.5492, lng: 75.7584, category: 'tourist', displayName: 'Kemmangundi Hill Station, Chikmagalur' },
  'kudremukh': { lat: 13.2144, lng: 75.2536, category: 'tourist', displayName: 'Kudremukh National Park & Trek Base, Chikkamagaluru' },
  'horanadu': { lat: 13.2750, lng: 75.3400, category: 'tourist', displayName: 'Horanadu Sri Annapoorneshwari Temple, Karnataka' },
  'sringeri': { lat: 13.4194, lng: 75.2575, category: 'tourist', displayName: 'Sringeri Sharada Peetham, Chikkamagaluru' },
  'hassan': { lat: 13.0033, lng: 76.1004, category: 'city', displayName: 'Hassan City, Karnataka' },
  'sakleshpur': { lat: 12.9442, lng: 75.7865, category: 'tourist', displayName: 'Sakleshpur Green Ghats & Coffee Estates, Hassan' },
  'belur': { lat: 13.1622, lng: 75.8643, category: 'tourist', displayName: 'Belur Chennakeshava Temple (Hoysala Architecture), Hassan' },
  'halebidu': { lat: 13.2167, lng: 75.9917, category: 'tourist', displayName: 'Halebidu Hoysaleswara Temple, Hassan' },
  'shravanabelagola': { lat: 12.8583, lng: 76.4833, category: 'tourist', displayName: 'Shravanabelagola Gommateshwara Statue, Hassan' },
  'mangalore': { lat: 12.9141, lng: 74.8560, category: 'city', displayName: 'Mangaluru City & Panambur Port, Dakshina Kannada' },
  'mangaluru': { lat: 12.9141, lng: 74.8560, category: 'city', displayName: 'Mangaluru Coastal City, Karnataka' },
  'mangalore airport': { lat: 12.9613, lng: 74.8901, category: 'airport', displayName: 'Mangalore International Airport (IXE), Bajpe' },
  'udupi': { lat: 13.3409, lng: 74.7421, category: 'city', displayName: 'Udupi Sri Krishna Temple & Malpe Beach, Karnataka' },
  'malpe': { lat: 13.3567, lng: 74.7042, category: 'tourist', displayName: 'Malpe Beach & St. Mary\'s Island, Udupi' },
  'manipal': { lat: 13.3525, lng: 74.7928, category: 'city', displayName: 'Manipal University Campus, Udupi' },
  'kollur': { lat: 13.8650, lng: 74.8142, category: 'tourist', displayName: 'Kollur Mookambika Temple, Udupi District' },
  'murudeshwar': { lat: 14.0944, lng: 74.4897, category: 'tourist', displayName: 'Murudeshwar Shiva Temple & Beach, Uttara Kannada' },
  'gokarna': { lat: 14.5479, lng: 74.3188, category: 'tourist', displayName: 'Gokarna Mahabaleshwar Temple & Om Beach, Karnataka' },
  'dandeli': { lat: 15.2361, lng: 74.6228, category: 'tourist', displayName: 'Dandeli River Rafting & Wildlife Jungle Sanctuary' },
  'jog falls': { lat: 14.2294, lng: 74.8122, category: 'tourist', displayName: 'Jog Falls (Gersoppa), Sagara, Shivamogga' },
  'shivamogga': { lat: 13.9299, lng: 75.5681, category: 'city', displayName: 'Shivamogga (Shimoga) City, Karnataka' },
  'shimoga': { lat: 13.9299, lng: 75.5681, category: 'city', displayName: 'Shimoga Railway Station & Town, Karnataka' },
  'davanagere': { lat: 14.4644, lng: 75.9218, category: 'city', displayName: 'Davanagere Benne Dosa Capital, Karnataka' },
  'hubli': { lat: 15.3647, lng: 75.1240, category: 'city', displayName: 'Hubballi (Hubli) Central Junction, Karnataka' },
  'hubballi': { lat: 15.3647, lng: 75.1240, category: 'city', displayName: 'Hubballi City & Railway Junction, Karnataka' },
  'dharwad': { lat: 15.4589, lng: 75.0078, category: 'city', displayName: 'Dharwad University Town, Karnataka' },
  'belgaum': { lat: 15.8497, lng: 74.4977, category: 'city', displayName: 'Belagavi (Belgaum) City & Fort, Karnataka' },
  'belagavi': { lat: 15.8497, lng: 74.4977, category: 'city', displayName: 'Belagavi City, Karnataka' },
  'hampi': { lat: 15.3350, lng: 76.4600, category: 'tourist', displayName: 'Hampi UNESCO World Heritage Ruins, Vijayanagara' },
  'hospet': { lat: 15.2758, lng: 76.3908, category: 'city', displayName: 'Hosapete (Hospet) Junction, Vijayanagara' },
  'ballari': { lat: 15.1394, lng: 76.9214, category: 'city', displayName: 'Ballari (Bellary) Fort City, Karnataka' },
  'tumkur': { lat: 13.3379, lng: 77.1173, category: 'city', displayName: 'Tumakuru (Tumkur) Smart City, Karnataka' },
  'tumakuru': { lat: 13.3379, lng: 77.1173, category: 'city', displayName: 'Tumakuru Smart City, Karnataka' },
  'kolar': { lat: 13.1367, lng: 78.1292, category: 'city', displayName: 'Kolar Gold Fields & Someshwara Temple, Karnataka' },
  'chikkaballapur': { lat: 13.4325, lng: 77.7275, category: 'city', displayName: 'Chikkaballapur District Headquarters, Karnataka' },
  'nandi hills': { lat: 13.3702, lng: 77.6835, category: 'tourist', displayName: 'Nandi Hills (Sunrise Viewpoint / Tipu Sultan Drop)' },
  'dharmasthala': { lat: 12.9567, lng: 75.3800, category: 'tourist', displayName: 'Dharmasthala Sri Manjunatha Swamy Temple, Karnataka' },
  'kukke subrahmanya': { lat: 12.6644, lng: 75.6178, category: 'tourist', displayName: 'Kukke Subrahmanya Temple, Dakshina Kannada' },

  // --- POPULAR OUTSTATION INTERSTATE DESTINATIONS ---
  'tirupati': { lat: 13.6288, lng: 79.4192, category: 'tourist', displayName: 'Tirupati Sri Venkateswara Balaji Temple, Andhra Pradesh' },
  'tirumala': { lat: 13.6833, lng: 79.3500, category: 'tourist', displayName: 'Tirumala Hills Temple Complex, Andhra Pradesh' },
  'ooty': { lat: 11.4102, lng: 76.6950, category: 'tourist', displayName: 'Ooty (Udhagamandalam) Hill Station, Nilgiris, Tamil Nadu' },
  'coonoor': { lat: 11.3530, lng: 76.7959, category: 'tourist', displayName: 'Coonoor Tea Estates & Sim\'s Park, Nilgiris, Tamil Nadu' },
  'kodaikanal': { lat: 10.2381, lng: 77.4892, category: 'tourist', displayName: 'Kodaikanal Lake & Princess of Hill Stations, Tamil Nadu' },
  'chennai': { lat: 13.0827, lng: 80.2707, category: 'city', displayName: 'Chennai Central / Marina Beach, Tamil Nadu' },
  'vellore': { lat: 12.9165, lng: 79.1325, category: 'city', displayName: 'Vellore Golden Temple (Sripuram) & Fort, Tamil Nadu' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, category: 'tourist', displayName: 'Puducherry (Pondicherry) French Quarter & Promenade' },
  'puducherry': { lat: 11.9416, lng: 79.8083, category: 'tourist', displayName: 'Puducherry Promenade & White Town' },
  'wayanad': { lat: 11.6854, lng: 76.1320, category: 'tourist', displayName: 'Wayanad (Kalpetta / Vythiri / Banasura), Kerala' },
  'munnar': { lat: 10.0889, lng: 77.0595, category: 'tourist', displayName: 'Munnar Tea Gardens & Anamudi, Kerala' },
  'kochi': { lat: 9.9312, lng: 76.2673, category: 'city', displayName: 'Kochi (Cochin) International Airport & Fort Kochi, Kerala' },
  'calicut': { lat: 11.2588, lng: 75.7804, category: 'city', displayName: 'Kozhikode (Calicut) Beach & Town, Kerala' },
  'goa': { lat: 15.2993, lng: 74.1240, category: 'tourist', displayName: 'Goa (Panaji, Calangute, Baga & South Goa Beaches)' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, category: 'city', displayName: 'Hyderabad (HITEC City / Rajiv Gandhi International Airport)' },
};

// In-memory cache for online geocoded results
const geocodeCache = new Map<string, LocationSuggestion[]>();

// Kannada Place Names & Landmark Translations
export const KANNADA_TRANSLATIONS: Record<string, string> = {
  // Hubs & Airports
  'kempegowda international airport': 'ಕೆಂಪೇಗೌಡ ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಮಾನ ನಿಲ್ದಾಣ (BLR)',
  'blr airport': 'ಕೆಂಪೇಗೌಡ ವಿಮಾನ ನಿಲ್ದಾಣ (BLR)',
  'bangalore airport': 'ಕೆಂಪೇಗೌಡ ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಮಾನ ನಿಲ್ದಾಣ',
  'airport': 'ವಿಮಾನ ನಿಲ್ದಾಣ',
  'majestic': 'ಮೆಜೆಸ್ಟಿಕ್ / ಕೆ.ಎಸ್.ಆರ್ ಬೆಂಗಳೂರು',
  'ksr bengaluru': 'ಕೆ.ಎಸ್.ಆರ್ ಬೆಂಗಳೂರು ರೈಲ್ವೆ ನಿಲ್ದಾಣ',
  'yeshwanthpur': 'ಯಶವಂತಪುರ ರೈಲ್ವೆ ನಿಲ್ದಾಣ',
  'cantonment': 'ಬೆಂಗಳೂರು ಕಂಟೋನ್ಮೆಂಟ್',
  'smvt': 'ಎಸ್.ಎಂ.ವಿ.ಟಿ ಟರ್ಮಿನಲ್',
  'shantinagar': 'ಶಾಂತಿನಗರ ಬಸ್ ನಿಲ್ದಾಣ',

  // Bengaluru Localities
  'indiranagar': 'ಇಂದಿರಾನಗರ',
  'koramangala': 'ಕೋರಮಂಗಲ',
  'electronic city': 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ',
  'whitefield': 'ವೈಟ್‌ಫೀಲ್ಡ್',
  'hsr layout': 'ಎಚ್.ಎಸ್.ಆರ್ ಬಡಾವಣೆ',
  'btm layout': 'ಬಿ.ಟಿ.ಎಂ ಬಡಾವಣೆ',
  'jayanagar': 'ಜಯನಗರ',
  'jp nagar': 'ಜೆ.ಪಿ ನಗರ',
  'banashankari': 'ಬನಶಂಕರಿ',
  'bellandur': 'ಬೆಳ್ಳಂದೂರು',
  'marathahalli': 'ಮಾರತ್‌ಹಳ್ಳಿ',
  'sarjapur': 'ಸರ್ಜಾಪುರ',
  'hebbal': 'ಹೆಬ್ಬಾಳ',
  'manyata tech park': 'ಮಾನ್ಯತಾ ಟೆಕ್ ಪಾರ್ಕ್',
  'manyata': 'ಮಾನ್ಯತಾ ಟೆಕ್ ಪಾರ್ಕ್',
  'yelahanka': 'ಯಲಹಂಕ',
  'mg road': 'ಎಂ.ಜಿ ರಸ್ತೆ',
  'commercial street': 'ಕಮರ್ಷಿಯಲ್ ಸ್ಟ್ರೀಟ್',
  'malleshwaram': 'ಮಲ್ಲೇಶ್ವರಂ',
  'rajajinagar': 'ರಾಜಾಜಿನಗರ',
  'kengeri': 'ಕೆಂಗೇರಿ',
  'vijayanagar': 'ವಿಜಯನಗರ',
  'basavanagudi': 'ಬಸವನಗುಡಿ',
  'bannerghatta': 'ಬನ್ನೇರುಘಟ್ಟ',
  'kanakapura': 'ಕನಕಪುರ',
  'devanahalli': 'ದೇವನಹಳ್ಳಿ',
  'hoskote': 'ಹೊಸಕೋಟೆ',
  'bidadi': 'ಬಿದದಿ',
  'nelamangala': 'ನೆಲಮಂಗಲ',

  // Karnataka Cities & Tour Spots
  'bengaluru': 'ಬೆಂಗಳೂರು',
  'bangalore': 'ಬೆಂಗಳೂರು',
  'mysore': 'ಮೈಸೂರು',
  'mysuru': 'ಮೈಸೂರು ಅರಮನೆ ನಗರಿ',
  'nanjangud': 'ನಂಜನಗೂಡು ಶ್ರೀಕಂಠೇಶ್ವರ',
  'srirangapatna': 'ಶ್ರೀರಂಗಪಟ್ಟಣ',
  'mandya': 'ಮಂಡ್ಯ ಸಕ್ಕರೆ ನಾಡು',
  'channapatna': 'ಚನ್ನಪಟ್ಟಣ ಗೊಂಬೆ ನಗರಿ',
  'ramanagara': 'ರಾಮನಗರ',
  'coorg': 'ಕೊಡಗು (ಮಡಿಕೇರಿ)',
  'madikeri': 'ಮಡಿಕೇರಿ ಕೋಟೆ',
  'kushalnagar': 'ಕುಶಾಲನಗರ ಗೋಲ್ಡನ್ ಟೆಂಪಲ್',
  'talakaveri': 'ತಲಕಾವೇರಿ ಪವಿತ್ರ ತೀರ್ಥ',
  'nagarhole': 'ನಾಗರಹೊಳೆ ಅಭಯಾರಣ್ಯ',
  'bandipur': 'ಬಂಡೀಪುರ ಸಫಾರಿ',
  'kabini': 'ಕಬಿನಿ ನದಿ ಸಫಾರಿ',
  'chikmagalur': 'ಚಿಕ್ಕಮಗಳೂರು ಕಾಫಿ ನಾಡು',
  'mullayanagiri': 'ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ',
  'kemmangundi': 'ಕೆಮ್ಮಣ್ಣುಗುಂಡಿ ಗಿರಿಧಾಮ',
  'kudremukh': 'ಕುದುರೆಮುಖ',
  'horanadu': 'ಹೊರನಾಡು ಅನ್ನಪೂರ್ಣೇಶ್ವರಿ',
  'sringeri': 'ಶೃಂಗೇರಿ ಶಾರದಾ ಪೀಠ',
  'hassan': 'ಹಾಸನ',
  'sakleshpur': 'ಸಕಲೇಶಪುರ',
  'belur': 'ಬೇಲೂರು ಚನ್ನಕೇಶವ',
  'halebidu': 'ಹಳೇಬೀಡು ಹೊಯ್ಸಳೇಶ್ವರ',
  'shravanabelagola': 'ಶ್ರವಣಬೆಳಗೊಳ ಗೊಮ್ಮಟೇಶ್ವರ',
  'mangalore': 'ಮಂಗಳೂರು ಕರಾವಳಿ',
  'mangaluru': 'ಮಂಗಳೂರು',
  'udupi': 'ಉಡುಪಿ ಶ್ರೀ ಕೃಷ್ಣ ಮಠ',
  'malpe': 'ಮಲ್ಪೆ ಬೀಚ್',
  'manipal': 'ಮಣಿಪಾಲ',
  'kollur': 'ಕೊಲ್ಲೂರು ಮೂಕಾಂಬಿಕಾ',
  'murudeshwar': 'ಮುರುಡೇಶ್ವರ ಶಿವನ ದೇವಸ್ಥಾನ',
  'gokarna': 'ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ',
  'dandeli': 'ದಾಂಡೇಲಿ ರಾಫ್ಟಿಂಗ್',
  'jog falls': 'ಜೋಗ ಜಲಪಾತ',
  'shivamogga': 'ಶಿವಮೊಗ್ಗ',
  'shimoga': 'ಶಿವಮೊಗ್ಗ',
  'davanagere': 'ದಾವಣಗೆರೆ',
  'hubli': 'ಹುಬ್ಬಳ್ಳಿ',
  'hubballi': 'ಹುಬ್ಬಳ್ಳಿ ಜಂಕ್ಷನ್',
  'dharwad': 'ಧಾರವಾಡ ಪೇಡಾ ನಗರಿ',
  'belgaum': 'ಬೆಳಗಾವಿ',
  'belagavi': 'ಬೆಳಗಾವಿ',
  'hampi': 'ಹಂಪಿ ವಿಶ್ವ ಪರಂಪರೆ ತಾಣ',
  'hospet': 'ಹೊಸಪೇಟೆ',
  'ballari': 'ಬಳ್ಳಾರಿ',
  'tumkur': 'ತುಮಕೂರು',
  'tumakuru': 'ತುಮಕೂರು',
  'kolar': 'ಕೋಲಾರ ಚಿನ್ನದ ನಾಡು',
  'chikkaballapur': 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ',
  'nandi hills': 'ನಂದಿ ಬೆಟ್ಟ ಗಿರಿಧಾಮ',
  'dharmasthala': 'ಶ್ರೀ ಕ್ಷೇತ್ರ ಧರ್ಮಸ್ಥಳ',
  'kukke': 'ಕುಕ್ಕೆ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ',
  'tirupati': 'ತಿರುಪತಿ ಬಾಲಾಜಿ ದೇವಸ್ಥಾನ',
  'tirumala': 'ತಿರುಮಲ ಬೆಟ್ಟ',
  'ooty': 'ಊಟಿ ಗಿರಿಧಾಮ',
  'coonoor': 'ಕೂನೂರು ಚಹಾ ತೋಟ',
  'kodaikanal': 'ಕೊಡೈಕೆನಾಲ್',
  'chennai': 'ಚೆನ್ನೈ',
  'vellore': 'ವೇಲೂರು ಗೋಲ್ಡನ್ ಟೆಂಪಲ್',
  'pondicherry': 'ಪುದುಚೇರಿ',
  'puducherry': 'ಪುದುಚೇರಿ',
  'wayanad': 'ವಯನಾಡ್',
  'munnar': 'ಮುನ್ನಾರ್ ಗಿರಿಧಾಮ',
  'kochi': 'ಕೊಚ್ಚಿ',
  'calicut': 'ಕೋಝಿಕ್ಕೋಡ್',
  'goa': 'ಗೋವಾ ಬೀಚ್',
  'hyderabad': 'ಹೈದರಾಬಾದ್',
};

/**
 * Translate any location string to Kannada
 */
export function translateToKannada(placeName: string): string {
  if (!placeName) return '';
  const lower = placeName.toLowerCase().trim();
  for (const [enKey, knVal] of Object.entries(KANNADA_TRANSLATIONS)) {
    if (lower.includes(enKey)) {
      return knVal;
    }
  }
  return placeName;
}

/**
 * Resolve coordinates for any user-provided string (English or Kannada)
 */
export function resolveCoordinates(
  locationStr: string,
  fallback: [number, number] = [12.9716, 77.5946]
): [number, number] {
  if (!locationStr || !locationStr.trim()) return fallback;
  const lower = locationStr.toLowerCase().trim();

  // 0. If user typed in Kannada, check against Kannada dictionary
  for (const [enKey, knVal] of Object.entries(KANNADA_TRANSLATIONS)) {
    if (lower.includes(knVal) || knVal.includes(lower)) {
      const match = VERIFIED_LOCATIONS[enKey];
      if (match) return [match.lat, match.lng];
    }
  }

  // 1. Direct or partial match in verified database
  for (const [key, data] of Object.entries(VERIFIED_LOCATIONS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return [data.lat, data.lng];
    }
  }

  // 2. Check if coordinates were directly serialized like "(12.934, 77.621)"
  const coordMatch = locationStr.match(/\(?([0-9]+\.[0-9]+),\s*([0-9]+\.[0-9]+)\)?/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat > 0 && lng > 0) {
      return [lat, lng];
    }
  }

  return fallback;
}

/**
 * Instant local search through verified spots
 */
export function searchLocalLocations(query: string): LocationSuggestion[] {
  if (!query || query.trim().length < 2) {
    // Return top popular default recommendations
    return [
      { id: 'blr-airport', name: 'Kempegowda International Airport (BLR)', displayName: 'Kempegowda International Airport (BLR), Bengaluru', lat: 13.1986, lng: 77.7066, category: 'airport' },
      { id: 'ksr-majestic', name: 'Majestic Railway Station / Bus Stand', displayName: 'Majestic Railway Station / Bus Stand, Bengaluru', lat: 12.9767, lng: 77.5713, category: 'railway' },
      { id: 'indiranagar', name: 'Indiranagar 100ft Road', displayName: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, category: 'hub' },
      { id: 'koramangala', name: 'Koramangala Sony World', displayName: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, category: 'hub' },
      { id: 'whitefield', name: 'Whitefield ITPL', displayName: 'Whitefield ITPL, Bengaluru', lat: 12.9698, lng: 77.7499, category: 'hub' },
      { id: 'electronic-city', name: 'Electronic City Phase 1', displayName: 'Electronic City Phase 1, Bengaluru', lat: 12.8452, lng: 77.6602, category: 'hub' },
      { id: 'mysuru', name: 'Mysuru Palace, Mysuru', displayName: 'Mysore Palace, Mysuru, Karnataka', lat: 12.2958, lng: 76.6394, category: 'city' },
      { id: 'coorg', name: 'Madikeri / Coorg', displayName: 'Madikeri / Coorg, Karnataka', lat: 12.4244, lng: 75.7382, category: 'tourist' },
      { id: 'ooty', name: 'Ooty Botanical Gardens', displayName: 'Ooty Botanical Gardens, Nilgiris, Tamil Nadu', lat: 11.4102, lng: 76.6950, category: 'tourist' },
      { id: 'tirupati', name: 'Tirupati Sri Balaji Temple', displayName: 'Tirupati Sri Balaji Temple, Andhra Pradesh', lat: 13.6288, lng: 79.4192, category: 'tourist' },
    ];
  }

  const q = query.toLowerCase().trim();
  const results: LocationSuggestion[] = [];

  for (const [key, data] of Object.entries(VERIFIED_LOCATIONS)) {
    if (key.includes(q) || data.displayName.toLowerCase().includes(q)) {
      results.push({
        id: `loc-${key}`,
        name: key.toUpperCase(),
        displayName: data.displayName,
        lat: data.lat,
        lng: data.lng,
        category: data.category,
      });
    }
  }

  return results.slice(0, 8);
}

/**
 * Live OpenStreetMap Nominatim Geocoding with local cache
 */
export async function searchOnlineLocations(query: string): Promise<LocationSuggestion[]> {
  const localResults = searchLocalLocations(query);
  if (!query || query.trim().length < 3) return localResults;

  const cacheKey = query.trim().toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=1`;
    const resp = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!resp.ok) {
      return localResults;
    }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) {
      return localResults;
    }

    const onlineResults: LocationSuggestion[] = data.map((item: any) => ({
      id: `osm-${item.place_id}`,
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      category: item.type === 'aerodrome' ? 'airport' : item.type === 'station' ? 'railway' : 'general',
    }));

    // Merge: Put local exact matches first, then online discoveries
    const merged = [...localResults];
    for (const onlineItem of onlineResults) {
      if (!merged.some(m => Math.abs(m.lat - onlineItem.lat) < 0.01 && Math.abs(m.lng - onlineItem.lng) < 0.01)) {
        merged.push(onlineItem);
      }
    }

    geocodeCache.set(cacheKey, merged);
    return merged;
  } catch (err) {
    console.warn('Online geocode fallback to local data:', err);
    return localResults;
  }
}

/**
 * Reverse Geocode: Get human-readable address from latitude/longitude
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Check if near any verified hub within 1.5 km
  for (const [, val] of Object.entries(VERIFIED_LOCATIONS)) {
    const d = calculateDistanceBetweenCoords([lat, lng], [val.lat, val.lng]);
    if (d < 1.5) {
      return val.displayName;
    }
  }

  try {
    const endpoint = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    const resp = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.display_name) {
        // Return a compact address string
        const parts = data.display_name.split(',').map((s: string) => s.trim());
        return parts.slice(0, 3).join(', ');
      }
    }
  } catch (err) {
    console.warn('Reverse geocode fetch failed:', err);
  }

  return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

/**
 * Haversine formula distance with highway circuity factor
 */
export function calculateDistanceBetweenCoords(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Road factor: Highways have slight curves (~1.25x), city grids (~1.32x)
  const roadFactor = straightLine > 80 ? 1.25 : 1.32;
  return Math.max(8, Math.round(straightLine * roadFactor));
}

/**
 * Calculate realistic transit driving distance between two address strings
 */
export function calculateTripDistance(pickupStr: string, dropStr: string): number {
  if (!pickupStr || !dropStr) return 35;

  const pLower = pickupStr.toLowerCase();
  const dLower = dropStr.toLowerCase();

  // Airport transfer shortcut
  if (pLower.includes('airport') || dLower.includes('airport')) {
    if (pLower.includes('electronic city') || dLower.includes('electronic city')) return 54;
    if (pLower.includes('whitefield') || dLower.includes('whitefield')) return 40;
    if (pLower.includes('koramangala') || dLower.includes('koramangala')) return 42;
    if (pLower.includes('indiranagar') || dLower.includes('indiranagar')) return 38;
    if (pLower.includes('hebbal') || dLower.includes('hebbal')) return 28;
    if (pLower.includes('yelahanka') || dLower.includes('yelahanka')) return 19;
    return 45;
  }

  // Known outstation routes
  const combined = `${pLower} ${dLower}`;
  if (combined.includes('mysore') || combined.includes('mysuru')) return 145;
  if (combined.includes('coorg') || combined.includes('madikeri')) return 260;
  if (combined.includes('ooty')) return 275;
  if (combined.includes('tirupati')) return 250;
  if (combined.includes('chikmagalur')) return 245;
  if (combined.includes('chennai')) return 340;
  if (combined.includes('pondicherry') || combined.includes('puducherry')) return 310;
  if (combined.includes('wayanad')) return 280;
  if (combined.includes('hampi')) return 340;
  if (combined.includes('mangalore') || combined.includes('mangaluru')) return 350;
  if (combined.includes('udupi')) return 400;
  if (combined.includes('gokarna')) return 485;
  if (combined.includes('dandeli')) return 460;
  if (combined.includes('goa')) return 580;
  if (combined.includes('hyderabad')) return 570;

  // Resolve coordinates and calculate
  const pCoords = resolveCoordinates(pickupStr, [12.9716, 77.5946]);
  const dCoords = resolveCoordinates(dropStr, [13.1986, 77.7066]);

  return calculateDistanceBetweenCoords(pCoords, dCoords);
}
