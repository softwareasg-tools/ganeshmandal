/**
 * Authentic Seed Dataset for Pune & Mumbai Ganpati Festival
 *
 * Includes:
 * - City metadata with bounding boxes and centers
 * - Top Pune Mandals (including Manache Ganpati & prominent historic mandals)
 * - Top Mumbai Mandals (Lalbaugcha Raja, GSB Seva Mandal, Khetwadi, etc.)
 * - Authorized Temple Camera Feeds with health indicators
 * - Realistic crowd observations, stage intelligence detections, and 24-hour historical metrics
 */

export const SEED_CITIES = [
  {
    id: 'city_pune',
    name: 'Pune',
    slug: 'pune',
    state: 'Maharashtra',
    center_lat: 18.5167,
    center_lng: 73.8562,
    default_zoom: 14,
    bounding_box: [18.4400, 73.7800, 18.6000, 73.9400],
    description: 'The cultural capital of Maharashtra with historic Ganeshotsav traditions initiated by Lokmanya Tilak.',
  },
  {
    id: 'city_mumbai',
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    center_lat: 18.9904,
    center_lng: 72.8369,
    default_zoom: 13,
    bounding_box: [18.8900, 72.7700, 19.2500, 72.9800],
    description: 'The vibrant financial hub renowned for colossal idols, grand thematic pandals, and legendary darshan queues.',
  },
];

export const SEED_MANDALS = [
  {
    "id": "mandal_pune_dagdusheth",
    "city_id": "city_pune",
    "name": "Shreemant Dagdusheth Halwai Ganpati",
    "slug": "dagdusheth-halwai",
    "latitude": 18.5163,
    "longitude": 73.8562,
    "address": "Ganpati Bhavan, 250, Budhwar Peth, Pune, Maharashtra 411002",
    "description": "One of the richest and most revered Ganpati shrines in India, famed for golden ornaments and extravagant replica temple sets.",
    "historical_info": "Founded in 1893 by Halwai sweet merchant Dagdusheth Gadve and his wife Lakshmibai after losing their son to the plague.",
    "timings": "05:00 AM - 11:30 PM (24h during festival peak)",
    "organizer": "Shreemant Dagdusheth Halwai Public Ganpati Trust",
    "official_url": "https://dagdushethganpati.com",
    "image_url": "/images/mandals/dagdusheth_idol.jpg",
    "temple_image_url": "/images/mandals/dagdusheth_mandir.jpg",
    "traffic_road": "Shivaji Road & Budhwar Peth",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Must-Visit",
      "Temple Replica",
      "Gold Ornaments",
      "Historic"
    ],
    "top_roads": [
      {
        "name": "Shivaji Road (Budhwar Peth)",
        "distance": "150m from mandal",
        "distance_meters": 150,
        "color": "red",
        "status": "Heavy Jam • Crawling at 5 km/h",
        "delay": "~45 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Shivaji Road Budhwar Peth Pune"
      },
      {
        "name": "Bajirao Road Approach",
        "distance": "450m from mandal",
        "distance_meters": 450,
        "color": "orange",
        "status": "Moderate Rush • Moving at 14 km/h",
        "delay": "~18 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Bajirao Road Appa Balwant Chowk Pune"
      },
      {
        "name": "Laxmi Road (Corridor to Pandal)",
        "distance": "600m from mandal",
        "distance_meters": 600,
        "color": "red",
        "status": "Heavy Jam • Pedestrian Spillover",
        "delay": "~35 min delay",
        "avg_speed": "7 km/h",
        "maps_query": "Laxmi Road Ganpati Chowk Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_kasba",
    "city_id": "city_pune",
    "name": "Kasba Ganpati (Manache 1st Ganpati)",
    "slug": "kasba-ganpati",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "address": "159, Kasba Peth, Pune, Maharashtra 411011",
    "description": "The supreme Gramdevata (presiding deity) of Pune. Holds first right of immersion (Visarjan) procession.",
    "historical_info": "Commissioned by Rajmata Jijabai Bhosale in 1630 CE after Chhatrapati Shivaji Maharaj vowed to rebuild Pune.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Shree Kasba Ganpati Sarvajanik Ganeshotsav Mandal",
    "official_url": "https://kasbaganpati.org",
    "image_url": "/images/mandals/kasba_idol.jpg",
    "temple_image_url": "/images/mandals/kasba_entrance.jpg",
    "traffic_road": "Kasba Peth Road & Lal Mahal Chowk",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "is_manache": true,
    "tags": [
      "Manache Ganpati",
      "Gramdevata",
      "Historical Heritage",
      "Visarjan 1st"
    ],
    "top_roads": [
      {
        "name": "Kasba Peth Main Road",
        "distance": "100m from mandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Rush • Moving at 12 km/h",
        "delay": "~15 min delay",
        "avg_speed": "12 km/h",
        "maps_query": "Kasba Peth Pune"
      },
      {
        "name": "Lal Mahal Chowk Link",
        "distance": "320m from mandal",
        "distance_meters": 320,
        "color": "orange",
        "status": "Moderate Festival Rush",
        "delay": "~12 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Lal Mahal Chowk Pune"
      },
      {
        "name": "Phadke Haud Road",
        "distance": "550m from mandal",
        "distance_meters": 550,
        "color": "blue",
        "status": "Clear Route • Free Flow",
        "delay": "~5 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Phadke Haud Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_tambdi",
    "city_id": "city_pune",
    "name": "Tambdi Jogeshwari Ganpati (Manache 2nd)",
    "slug": "tambdi-jogeshwari",
    "latitude": 18.5169,
    "longitude": 73.8549,
    "address": "33 A, Budhwar Peth, Pune, Maharashtra 411002",
    "description": "The second honored Ganpati of Pune, established alongside the historic Tambdi Jogeshwari temple.",
    "historical_info": "Consecrated in 1893; the idol is crafted anew every year from traditional clay without chemical plaster.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Tambdi Jogeshwari Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/tambdi_idol.jpg",
    "temple_image_url": "/images/mandals/tambdi_temple.jpg",
    "traffic_road": "Budhwar Peth & Appa Balwant Chowk",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "is_manache": true,
    "tags": [
      "Manache Ganpati",
      "Shadu Clay Idol",
      "Traditional Brass Temple",
      "Visarjan 2nd"
    ],
    "top_roads": [
      {
        "name": "Appa Balwant Chowk Road",
        "distance": "180m from mandal",
        "distance_meters": 180,
        "color": "red",
        "status": "Heavy Jam • Crawling at 6 km/h",
        "delay": "~30 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Appa Balwant Chowk Pune"
      },
      {
        "name": "Budhwar Peth Lane",
        "distance": "220m from mandal",
        "distance_meters": 220,
        "color": "orange",
        "status": "Moderate Congestion",
        "delay": "~14 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Budhwar Peth Pune"
      },
      {
        "name": "Jogeshwari Mandir Approach",
        "distance": "480m from mandal",
        "distance_meters": 480,
        "color": "blue",
        "status": "Clear Arterial Access",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Jogeshwari Lane Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_guruji",
    "city_id": "city_pune",
    "name": "Guruji Talim Ganpati (Manache 3rd)",
    "slug": "guruji-talim",
    "latitude": 18.5152,
    "longitude": 73.8538,
    "address": "Ganpati Chowk, Laxmi Road, Pune, Maharashtra 411030",
    "description": "The third Manache Ganpati, symbol of Hindu-Muslim unity and brotherhood in Pune festival history.",
    "historical_info": "Established in 1887 by wrestling akhada masters Bhiku Shinde and Ustad Nalband even before public Ganeshotsav was formalized.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Guruji Talim Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/guruji_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Laxmi Road & Ganpati Chowk",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "is_manache": true,
    "tags": [
      "Manache Ganpati",
      "Communal Harmony",
      "Wrestling Heritage",
      "Visarjan 3rd"
    ],
    "top_roads": [
      {
        "name": "Laxmi Road (Ganpati Chowk)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "red",
        "status": "Heavy Jam • Festival Core Corridor",
        "delay": "~40 min delay",
        "avg_speed": "4 km/h",
        "maps_query": "Ganpati Chowk Laxmi Road Pune"
      },
      {
        "name": "Kumthekar Road Connecting Lane",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Traffic Flow",
        "delay": "~16 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Kumthekar Road Pune"
      },
      {
        "name": "Tilak Road Outer Connector",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Movement • Normal Pace",
        "delay": "~7 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Tilak Road Alka Talkies Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_tulshibaug",
    "city_id": "city_pune",
    "name": "Tulshibaug Ganpati (Manache 4th)",
    "slug": "tulshibaug-ganpati",
    "latitude": 18.5146,
    "longitude": 73.8553,
    "address": "Tulshibaug Market, Budhwar Peth, Pune, Maharashtra 411002",
    "description": "The fourth Manache Ganpati, renowned for a magnificent 13-foot fibreglass idol adorned with silver & gold ornaments.",
    "historical_info": "Founded in 1901 in the historic Tulshibaug shopping district. Known for introducing tall artistic idols in Pune.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Shree Tulshibaug Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/tulshibaug_idol.jpg",
    "temple_image_url": "/images/mandals/tulshibaug_temple.jpg",
    "traffic_road": "Bajirao Road & Tulshibaug Market Lane",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "is_manache": true,
    "tags": [
      "Manache Ganpati",
      "13-Foot Idol",
      "Bustling Bazaar",
      "Visarjan 4th"
    ],
    "top_roads": [
      {
        "name": "Bajirao Road (Tulshibaug Entry)",
        "distance": "140m from mandal",
        "distance_meters": 140,
        "color": "red",
        "status": "Heavy Jam • Shopper & Devotee Confluence",
        "delay": "~38 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Bajirao Road Tulshibaug Pune"
      },
      {
        "name": "Laxmi Road Crossing",
        "distance": "500m from mandal",
        "distance_meters": 500,
        "color": "orange",
        "status": "Moderate Evening Rush",
        "delay": "~20 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Laxmi Road City Post Pune"
      },
      {
        "name": "Shanipar Chowk Link",
        "distance": "650m from mandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Route for Devotees",
        "delay": "~8 min delay",
        "avg_speed": "26 km/h",
        "maps_query": "Shanipar Chowk Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_kesariwada",
    "city_id": "city_pune",
    "name": "Kesariwada Ganpati (Manache 5th)",
    "slug": "kesariwada-ganpati",
    "latitude": 18.5187,
    "longitude": 73.8512,
    "address": "568, Narayan Peth, Pune, Maharashtra 411030",
    "description": "The fifth Manache Ganpati, installed at the historic courtyard where Lokmanya Tilak organized the freedom movement.",
    "historical_info": "Tilak started community Ganeshotsav here in 1894. The wada now houses the Kesari library and freedom struggle museum.",
    "timings": "06:00 AM - 10:00 PM",
    "organizer": "Kesari Trust Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/kesariwada_idol.jpg",
    "temple_image_url": "/images/mandals/kesariwada_wada.jpg",
    "traffic_road": "Narayan Peth & Kelkar Road",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "is_manache": true,
    "tags": [
      "Manache Ganpati",
      "Lokmanya Tilak Wada",
      "Freedom Movement",
      "Visarjan 5th"
    ],
    "top_roads": [
      {
        "name": "Kelkar Road (Narayan Peth)",
        "distance": "160m from mandal",
        "distance_meters": 160,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Kelkar Road Narayan Peth Pune"
      },
      {
        "name": "NC Kelkar Road Corridor",
        "distance": "400m from mandal",
        "distance_meters": 400,
        "color": "blue",
        "status": "Clear • Flowing Steadily",
        "delay": "~7 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "NC Kelkar Road Pune"
      },
      {
        "name": "Chhatrapati Shivaji Bridge Link",
        "distance": "800m from mandal",
        "distance_meters": 800,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Shivaji Bridge Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_mandai",
    "city_id": "city_pune",
    "name": "Akhil Mandai Mandal (Sharada Gajanan)",
    "slug": "akhil-mandai",
    "latitude": 18.5126,
    "longitude": 73.8559,
    "address": "Mahatma Phule Mandai, Shukrawar Peth, Pune, Maharashtra 411002",
    "description": "Iconic seated idol of Lord Ganesh with Goddess Sharada sitting on his lap, a divine depiction found only in Pune.",
    "historical_info": "Founded in 1894 by vegetable and fruit traders of Mahatma Phule Mandai market.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Akhil Mandai Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/mandai_idol.jpg",
    "temple_image_url": "/images/mandals/mandai_temple.jpg",
    "traffic_road": "Shivaji Road & Mandai Market",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Sharada Gajanan",
      "Unique Dual Idol",
      "Market Heritage",
      "Iconic Set"
    ],
    "top_roads": [
      {
        "name": "Shivaji Road (Mandai Gate)",
        "distance": "130m from pandal",
        "distance_meters": 130,
        "color": "red",
        "status": "Heavy Jam • Market Congestion",
        "delay": "~36 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Mandai Shivaji Road Pune"
      },
      {
        "name": "Shukrawar Peth Main Arterial",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~15 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Shukrawar Peth Pune"
      },
      {
        "name": "Subhash Nagar Road",
        "distance": "680m from pandal",
        "distance_meters": 680,
        "color": "blue",
        "status": "Clear Flow",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Subhash Nagar Shukrawar Peth Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_bhausaheb",
    "city_id": "city_pune",
    "name": "Shrimant Bhausaheb Rangari Ganpati",
    "slug": "bhausaheb-rangari",
    "latitude": 18.5175,
    "longitude": 73.8556,
    "address": "Bhausaheb Rangari Road, Budhwar Peth, Pune, Maharashtra 411002",
    "description": "India’s first public Ganpati installation, famous for the warrior idol depicting Bappa slaying the demon Vighnasur.",
    "historical_info": "Pioneered in 1892 by Ayurvedic doctor and revolutionary freedom fighter Bhausaheb Laxmanjav Rangari.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Shrimant Bhausaheb Rangari Trust",
    "official_url": "",
    "image_url": "/images/mandals/bhausaheb_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Bhausaheb Rangari Bhavan & Budhwar Peth",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "First Public Ganpati (1892)",
      "Warrior Idol",
      "Demon Slaying",
      "Revolutionary Lore"
    ],
    "top_roads": [
      {
        "name": "Bhausaheb Rangari Road",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "red",
        "status": "Heavy Congestion • Historic Lane",
        "delay": "~30 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Bhausaheb Rangari Road Pune"
      },
      {
        "name": "Appa Balwant Chowk Approach",
        "distance": "400m from pandal",
        "distance_meters": 400,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Appa Balwant Chowk Pune"
      },
      {
        "name": "Shaniwar Wada Peripheral Link",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Movement",
        "delay": "~7 min delay",
        "avg_speed": "26 km/h",
        "maps_query": "Shaniwar Wada Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_babu_genu",
    "city_id": "city_pune",
    "name": "Babu Genu Mandal Ganpati",
    "slug": "babu-genu",
    "latitude": 18.5158,
    "longitude": 73.8546,
    "address": "Near Mandai, Budhwar Peth, Pune, Maharashtra 411002",
    "description": "Known as the \"Navsacha Ganpati of Pune\" (wish-fulfilling deity), revered by lakhs of devotees seeking blessings.",
    "historical_info": "Founded in 1970 named in honor of freedom martyr Babu Genu Said who sacrificed his life boycotting foreign cloth.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Babu Genu Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/babu_genu_0.JPG",
    "temple_image_url": "",
    "traffic_road": "Budhwar Peth Cloth Market",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Navsacha Ganpati",
      "Cloth Market Lore",
      "Wish-Fulfilling",
      "Massive Darshan Queue"
    ],
    "top_roads": [
      {
        "name": "Budhwar Peth Cloth Market Lane",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "red",
        "status": "Heavy Jam • Devotee Queue Spillover",
        "delay": "~40 min delay",
        "avg_speed": "4 km/h",
        "maps_query": "Babu Genu Chowk Pune"
      },
      {
        "name": "Bajirao Road Connector",
        "distance": "390m from pandal",
        "distance_meters": 390,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~16 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Bajirao Road Mandai Pune"
      },
      {
        "name": "City Post Chowk Road",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Clear Access",
        "delay": "~6 min delay",
        "avg_speed": "29 km/h",
        "maps_query": "City Post Laxmi Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_jilbya_maruti",
    "city_id": "city_pune",
    "name": "Jilbya Maruti Ganpati",
    "slug": "jilbya-maruti",
    "latitude": 18.5141,
    "longitude": 73.8532,
    "address": "Shukrawar Peth, Bajirao Road, Pune, Maharashtra 411002",
    "description": "Famed for traditional floral decorations and gold crown ornaments right on historic Bajirao Road.",
    "historical_info": "Established in 1954 adjacent to the consecrated Maruti temple in Shukrawar Peth.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Jilbya Maruti Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/jilbya_maruti_0.jpg",
    "temple_image_url": "",
    "traffic_road": "Bajirao Road Corridor",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Floral Decor",
      "Bajirao Road",
      "Traditional Shringar"
    ],
    "top_roads": [
      {
        "name": "Bajirao Road (Near Mandir)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "red",
        "status": "Heavy Jam • Core Arterial",
        "delay": "~32 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Jilbya Maruti Bajirao Road Pune"
      },
      {
        "name": "Kumthekar Road Lane",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Kumthekar Road Pune"
      },
      {
        "name": "Kelkar Museum Approach Link",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "blue",
        "status": "Clear Flow Route",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Raja Dinkar Kelkar Museum Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_hatti",
    "city_id": "city_pune",
    "name": "Hatti Ganpati Mandal",
    "slug": "hatti-ganpati",
    "latitude": 18.5119,
    "longitude": 73.8504,
    "address": "Sadashiv Peth, Tilak Road, Pune, Maharashtra 411030",
    "description": "Renowned for the sacred elephant (Hatti) carriage sets and vibrant cultural youth activities during Ganeshotsav.",
    "historical_info": "Over a century old; historically sponsored elephant processions in the Peshwa era.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Hatti Ganpati Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/hatti_ganpati_0.JPG",
    "temple_image_url": "",
    "traffic_road": "Tilak Road & Sadashiv Peth",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Elephant Carriage",
      "Sadashiv Peth",
      "Dhol Tasha Hub"
    ],
    "top_roads": [
      {
        "name": "Tilak Road (Sadashiv Peth)",
        "distance": "150m from pandal",
        "distance_meters": 150,
        "color": "orange",
        "status": "Moderate Festival Rush",
        "delay": "~16 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Tilak Road Sadashiv Peth Pune"
      },
      {
        "name": "SP College Approach Corridor",
        "distance": "450m from pandal",
        "distance_meters": 450,
        "color": "blue",
        "status": "Clear Route",
        "delay": "~7 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "SP College Pune"
      },
      {
        "name": "Alka Talkies Chowk Link",
        "distance": "800m from pandal",
        "distance_meters": 800,
        "color": "orange",
        "status": "Moderate Confluence",
        "delay": "~12 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Alka Talkies Chowk Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_trishund",
    "city_id": "city_pune",
    "name": "Trishund Mayureshwar Ganpati",
    "slug": "trishund-mayureshwar",
    "latitude": 18.5218,
    "longitude": 73.8643,
    "address": "Somwar Peth, Near Nagzari, Pune, Maharashtra 411011",
    "description": "Ancient stone temple dedicated to three-trunked Lord Ganesh sitting on a peacock, featuring rare Gosavi rock carvings.",
    "historical_info": "Built between 1754 and 1770 by Bhimgir Gosavi from Indore; houses secret underground meditative crypts.",
    "timings": "06:00 AM - 10:00 PM",
    "organizer": "Trishund Mayureshwar Trust",
    "official_url": "",
    "image_url": "/images/mandals/trishund_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Somwar Peth & Nagzari Stream Lane",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Three Trunks",
      "Peacock Vahana",
      "Ancient Stone Carvings",
      "Gosavi Heritage"
    ],
    "top_roads": [
      {
        "name": "Somwar Peth Road",
        "distance": "120m from temple",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Somwar Peth Pune"
      },
      {
        "name": "Nagzari Causeway Link",
        "distance": "340m from temple",
        "distance_meters": 340,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~5 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Nagzari Somwar Peth Pune"
      },
      {
        "name": "Apollo Theatre Road",
        "distance": "650m from temple",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~6 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Apollo Theatre Rasta Peth Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_khunya",
    "city_id": "city_pune",
    "name": "Khunya Murlidhar Ganpati",
    "slug": "khunya-murlidhar",
    "latitude": 18.5133,
    "longitude": 73.8508,
    "address": "Sadashiv Peth, Near Peru Compound, Pune, Maharashtra 411030",
    "description": "Historical mandal celebrating Ganeshotsav with devotion, established beside the consecrated Murlidhar shrine.",
    "historical_info": "Dates back to 1797; witness to historical skirmishes during the installation of the marble deity.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Khunya Murlidhar Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_khunya_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Sadashiv Peth & Perugate",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Sadashiv Peth",
      "Historic 1797",
      "Serene Darshan",
      "Heritage Shrine"
    ],
    "top_roads": [
      {
        "name": "Perugate Sadashiv Peth",
        "distance": "110m from mandal",
        "distance_meters": 110,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~10 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Perugate Sadashiv Peth Pune"
      },
      {
        "name": "Tilak Road Approach",
        "distance": "380m from mandal",
        "distance_meters": 380,
        "color": "blue",
        "status": "Clear Arterial",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Tilak Road Pune"
      },
      {
        "name": "Bajirao Road Connector",
        "distance": "700m from mandal",
        "distance_meters": 700,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~28 min delay",
        "avg_speed": "7 km/h",
        "maps_query": "Bajirao Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_shanipar",
    "city_id": "city_pune",
    "name": "Shanipar Ganpati Mandal",
    "slug": "shanipar-ganpati",
    "latitude": 18.5138,
    "longitude": 73.8542,
    "address": "Shanipar Chowk, Shukrawar Peth, Pune, Maharashtra 411002",
    "description": "Historic mandal situated at Shanipar Chowk, a prominent festival landmark on the Visarjan procession route.",
    "historical_info": "Over 80 years old; one of the key coordination points for traditional Dhol Tasha troupes.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Shanipar Sarvajanik Ganeshotsav Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/shanipar_idol_2024.jpg",
    "temple_image_url": "",
    "traffic_road": "Shanipar Chowk & Bajirao Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Shanipar Landmark",
      "Visarjan Route",
      "Dhol Tasha Core",
      "Central Pune"
    ],
    "top_roads": [
      {
        "name": "Shanipar Chowk Corridor",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "red",
        "status": "Heavy Jam • Procession Hub",
        "delay": "~35 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Shanipar Chowk Pune"
      },
      {
        "name": "Mandai Connecting Lane",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Mandai Shanipar Pune"
      },
      {
        "name": "Bajirao Road Parallel",
        "distance": "550m from pandal",
        "distance_meters": 550,
        "color": "red",
        "status": "Heavy Congestion",
        "delay": "~25 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Bajirao Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_natus_peth",
    "city_id": "city_pune",
    "name": "Natus Peth Sarvajanik Ganeshotsav Mandal",
    "slug": "natus-peth-ganpati",
    "latitude": 18.5112,
    "longitude": 73.8475,
    "address": "Near Alka Talkies Chowk, Sadashiv Peth, Pune 411030",
    "description": "Renowned for colossal moving theatrical dekhavas (mythological light & sound presentations) during festival nights.",
    "historical_info": "Formed in the early 20th century by local artisans and theater artists.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Natus Peth Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/pune_utsav_idol_2024.jpg",
    "temple_image_url": "",
    "traffic_road": "Alka Talkies Chowk & Shastri Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Live Dekhava",
      "Theatrical Sets",
      "Sadashiv Peth",
      "Night Spectacle"
    ],
    "top_roads": [
      {
        "name": "Shastri Road (Alka Talkies)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~15 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Shastri Road Alka Talkies Pune"
      },
      {
        "name": "Tilak Road Entry Link",
        "distance": "340m from pandal",
        "distance_meters": 340,
        "color": "blue",
        "status": "Clear Flowing Route",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Tilak Road Pune"
      },
      {
        "name": "Lal Bahadur Shastri Bridge",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Free Flow Passage",
        "delay": "~5 min delay",
        "avg_speed": "34 km/h",
        "maps_query": "LBS Bridge Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_chhatrapati_rajaram",
    "city_id": "city_pune",
    "name": "Chhatrapati Rajaram Mandal",
    "slug": "chhatrapati-rajaram",
    "latitude": 18.5108,
    "longitude": 73.8522,
    "address": "Sadashiv Peth, Near Kanya Shala, Pune 411030",
    "description": "Famous for lifelike fort replicas and wada architecture highlighting Chhatrapati Shivaji Maharaj’s swarajya history.",
    "historical_info": "One of the oldest mandals in Sadashiv Peth, upholding Maratha heritage sets for over 90 years.",
    "timings": "06:30 AM - 11:00 PM",
    "organizer": "Chhatrapati Rajaram Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_chhatrapati_rajaram_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Sadashiv Peth Main Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Fort Replica",
      "Maratha History",
      "Sadashiv Peth"
    ],
    "top_roads": [
      {
        "name": "Sadashiv Peth Central Road",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Sadashiv Peth Central Pune"
      },
      {
        "name": "Kumthekar Road Connecting Link",
        "distance": "320m from pandal",
        "distance_meters": 320,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "27 km/h",
        "maps_query": "Kumthekar Road Pune"
      },
      {
        "name": "Bajirao Road Parallel Approach",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~24 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Bajirao Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_hirabag",
    "city_id": "city_pune",
    "name": "Hira Bag Ganpati Mandal",
    "slug": "hirabag-ganpati",
    "latitude": 18.5045,
    "longitude": 73.8538,
    "address": "Tilak Road, Near Hira Bag, Pune 411002",
    "description": "Venerated pandal on Tilak Road attracting devotees from Swargate and southern Pune with grand floral decor.",
    "historical_info": "Established in the mid-20th century by local merchants of the Hira Bag garden vicinity.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Hira Bag Mitra Mandal",
    "official_url": "",
    "image_url": "/images/mandals/pune_hirabag_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Tilak Road & Swargate Junction",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Tilak Road",
      "Floral Pandal",
      "Swargate Vicinity"
    ],
    "top_roads": [
      {
        "name": "Tilak Road (Hira Bag Chowk)",
        "distance": "140m from pandal",
        "distance_meters": 140,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~14 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Tilak Road Hira Bag Pune"
      },
      {
        "name": "Swargate Junction Approach",
        "distance": "450m from pandal",
        "distance_meters": 450,
        "color": "red",
        "status": "Heavy Congestion at Bus Station",
        "delay": "~32 min delay",
        "avg_speed": "7 km/h",
        "maps_query": "Swargate Junction Pune"
      },
      {
        "name": "Nehru Stadium Outer Link",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Clear Route",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Nehru Stadium Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_garud",
    "city_id": "city_pune",
    "name": "Garud Ganpati Mandal",
    "slug": "garud-ganpati",
    "latitude": 18.5172,
    "longitude": 73.8488,
    "address": "Narayan Peth, Pune 411030",
    "description": "Devotional shrine located in historic Narayan Peth, cherished for devotional aartis and youth social services.",
    "historical_info": "Serving the community for more than 75 years with annual social blood donation camps and Annadaanam.",
    "timings": "06:30 AM - 10:30 PM",
    "organizer": "Garud Ganpati Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_garud_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Narayan Peth & Shaniwar Wada Link",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Narayan Peth",
      "Traditional Aarti",
      "Community Seva"
    ],
    "top_roads": [
      {
        "name": "Narayan Peth Main Road",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~11 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Narayan Peth Pune"
      },
      {
        "name": "Kesariwada Approach Road",
        "distance": "320m from pandal",
        "distance_meters": 320,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "26 km/h",
        "maps_query": "Kesariwada Lane Pune"
      },
      {
        "name": "Appa Balwant Chowk Connector",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~22 min delay",
        "avg_speed": "9 km/h",
        "maps_query": "Appa Balwant Chowk Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_potnis",
    "city_id": "city_pune",
    "name": "Potnis Ganpati Mandal",
    "slug": "potnis-ganpati",
    "latitude": 18.5225,
    "longitude": 73.8535,
    "address": "Shaniwar Peth, Pune 411030",
    "description": "Preserving age-old Peshwa-era traditions with classic Dhol Tasha presentations and gold-embossed altar.",
    "historical_info": "Historic family-initiated sarvajanik trust active since 1912.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Potnis Wada Ganeshotsav Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_potnis_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Shaniwar Peth & Mutha Riverfront",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Shaniwar Peth",
      "Peshwa Tradition",
      "Heritage Wada"
    ],
    "top_roads": [
      {
        "name": "Shaniwar Peth Riverside Road",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "blue",
        "status": "Clear Riverfront Route",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Shaniwar Peth Riverside Pune"
      },
      {
        "name": "Shaniwar Wada Northern Gate",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Shaniwar Wada Pune"
      },
      {
        "name": "Dakshinmukhi Maruti Road",
        "distance": "550m from pandal",
        "distance_meters": 550,
        "color": "blue",
        "status": "Clear Access",
        "delay": "~5 min delay",
        "avg_speed": "31 km/h",
        "maps_query": "Shaniwar Peth Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_suvarnayug",
    "city_id": "city_pune",
    "name": "Suvarnayug Tarun Mandal",
    "slug": "suvarnayug-tarun-mandal",
    "latitude": 18.5165,
    "longitude": 73.857,
    "address": "Budhwar Peth, Near Dagdusheth Temple, Pune 411002",
    "description": "The energetic youth arm of the Dagdusheth Halwai Trust, known for organizing grand cultural rallies and social initiatives.",
    "historical_info": "Established in the 1970s; responsible for the crowd management marshals across central Pune.",
    "timings": "05:30 AM - 11:30 PM",
    "organizer": "Suvarnayug Tarun Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_suvarnayug_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Shivaji Road & Budhwar Chowk",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Dagdusheth Affiliate",
      "Youth Leadership",
      "Grand Lighting"
    ],
    "top_roads": [
      {
        "name": "Shivaji Road (Budhwar Chowk)",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "red",
        "status": "Heavy Jam • Devotee Peak Rush",
        "delay": "~42 min delay",
        "avg_speed": "4 km/h",
        "maps_query": "Budhwar Chowk Shivaji Road Pune"
      },
      {
        "name": "Laxmi Road East Link",
        "distance": "400m from pandal",
        "distance_meters": 400,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~16 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Laxmi Road Pune"
      },
      {
        "name": "Raviwar Peth Connector",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~7 min delay",
        "avg_speed": "27 km/h",
        "maps_query": "Raviwar Peth Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_nagarkar",
    "city_id": "city_pune",
    "name": "Nagarkar Ganpati Mandal",
    "slug": "nagarkar-ganpati",
    "latitude": 18.5238,
    "longitude": 73.8682,
    "address": "Somwar Peth, Near KEM Hospital, Pune 411011",
    "description": "Devoted neighborhood mandal known for serene aartis and eco-friendly paper-mache and clay decorations.",
    "historical_info": "Over 60 years of continuous devotional service to the Somwar Peth community.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Nagarkar Ganpati Samiti",
    "official_url": "",
    "image_url": "/images/mandals/pune_nagarkar_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "KEM Hospital Road & Somwar Peth",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Somwar Peth",
      "Eco-Friendly Clay",
      "Serene Darshan"
    ],
    "top_roads": [
      {
        "name": "KEM Hospital Road",
        "distance": "130m from pandal",
        "distance_meters": 130,
        "color": "blue",
        "status": "Clear Route for Ambulances & Visitors",
        "delay": "~5 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "KEM Hospital Somwar Peth Pune"
      },
      {
        "name": "Somwar Peth Central Link",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~12 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Somwar Peth Pune"
      },
      {
        "name": "Rasta Peth Access Road",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Free Flow Corridor",
        "delay": "~6 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Rasta Peth Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_balgopal",
    "city_id": "city_pune",
    "name": "Balgopal Mitra Mandal (Ganj Peth)",
    "slug": "balgopal-ganj-peth",
    "latitude": 18.5118,
    "longitude": 73.8635,
    "address": "Ganj Peth, Near Phule Wada, Pune 411042",
    "description": "Community-driven mandal situated near historic Mahatma Jyotirao Phule Wada, emphasizing education and social harmony.",
    "historical_info": "Inspired by Satyashodhak ideals, celebrating Ganeshotsav with cultural plays and student scholarships.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Balgopal Mitra Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_balgopal_ganj_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Ganj Peth & Phule Wada Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Phule Wada Vicinity",
      "Educational Seva",
      "Community Harmony"
    ],
    "top_roads": [
      {
        "name": "Phule Wada Road",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "blue",
        "status": "Clear Historic Route",
        "delay": "~6 min delay",
        "avg_speed": "27 km/h",
        "maps_query": "Phule Wada Ganj Peth Pune"
      },
      {
        "name": "Ganj Peth Main Arterial",
        "distance": "340m from pandal",
        "distance_meters": 340,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Ganj Peth Pune"
      },
      {
        "name": "Bhawani Peth Timber Market Link",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~7 min delay",
        "avg_speed": "29 km/h",
        "maps_query": "Timber Market Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_gokuldham",
    "city_id": "city_pune",
    "name": "Gokuldham Mitra Mandal (Navi Peth)",
    "slug": "gokuldham-navi-peth",
    "latitude": 18.5085,
    "longitude": 73.8442,
    "address": "Navi Peth, Near Vaikunth, Pune 411030",
    "description": "Popular residential mandal celebrated for artistic clay deities and community dhol tasha competitions.",
    "historical_info": "Over 40 years of community celebrations uniting Navi Peth families.",
    "timings": "06:30 AM - 10:30 PM",
    "organizer": "Gokuldham Mitra Mandal",
    "official_url": "",
    "image_url": "/images/mandals/pune_gokuldham_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Navi Peth & Shastri Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Navi Peth",
      "Residential Hub",
      "Traditional Aarti"
    ],
    "top_roads": [
      {
        "name": "Navi Peth Internal Road",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "blue",
        "status": "Clear Flow",
        "delay": "~5 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Navi Peth Pune"
      },
      {
        "name": "Shastri Road Connector",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~14 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Shastri Road Pune"
      },
      {
        "name": "Senapati Bapat Road Link",
        "distance": "850m from pandal",
        "distance_meters": 850,
        "color": "blue",
        "status": "Free Flow Corridor",
        "delay": "~6 min delay",
        "avg_speed": "34 km/h",
        "maps_query": "Senapati Bapat Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_rasta_peth",
    "city_id": "city_pune",
    "name": "Rasta Peth Ganpati Mandal",
    "slug": "rasta-peth-ganpati",
    "latitude": 18.5192,
    "longitude": 73.8698,
    "address": "Rasta Peth, Near Power House, Pune 411011",
    "description": "Historic mandal established in the Rasta Peth locality, famous for vibrant lighting arches and cultural music evenings.",
    "historical_info": "Founded during the Peshwa reconstruction era of Rasta Peth by Sardar Anandrao Raste.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Rasta Peth Sarvajanik Ganpati Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_rasta_peth_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Rasta Peth Main Road & Power House Chowk",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Raste Heritage",
      "Lighting Arches",
      "Vibrant Music"
    ],
    "top_roads": [
      {
        "name": "Rasta Peth Main Road",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~12 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Rasta Peth Main Road Pune"
      },
      {
        "name": "Power House Chowk Corridor",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Power House Rasta Peth Pune"
      },
      {
        "name": "Station Road Arterial Link",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "orange",
        "status": "Moderate Traffic to Railway Station",
        "delay": "~15 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Station Road Pune"
      }
    ]
  },
  {
    "id": "mandal_pune_someshwar",
    "city_id": "city_pune",
    "name": "Someshwar Ganpati Mandal",
    "slug": "someshwar-ganpati",
    "latitude": 18.5181,
    "longitude": 73.8589,
    "address": "Raviwar Peth, Kapad Ganj, Pune 411002",
    "description": "Venerated merchant shrine in Raviwar Peth known for sacred modak prasad offerings and gold shringar.",
    "historical_info": "Established by cloth and metal guild merchants over 70 years ago.",
    "timings": "06:00 AM - 10:30 PM",
    "organizer": "Someshwar Ganpati Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/pune_someshwar_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Raviwar Peth & Kapad Ganj",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Raviwar Peth",
      "Merchant Shrine",
      "Prasad Seva"
    ],
    "top_roads": [
      {
        "name": "Raviwar Peth Main Lane",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Raviwar Peth Pune"
      },
      {
        "name": "Kapad Ganj Corridor",
        "distance": "300m from pandal",
        "distance_meters": 300,
        "color": "red",
        "status": "Heavy Congestion",
        "delay": "~22 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Kapad Ganj Pune"
      },
      {
        "name": "Shivaji Road Access Link",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~7 min delay",
        "avg_speed": "27 km/h",
        "maps_query": "Shivaji Road Pune"
      }
    ]
  },
  {
    "id": "mandal_mumbai_lalbaug",
    "city_id": "city_mumbai",
    "name": "Lalbaugcha Raja",
    "slug": "lalbaugcha-raja",
    "latitude": 18.9904,
    "longitude": 72.8369,
    "address": "GD Ambekar Marg, Lalbaug, Parel, Mumbai, Maharashtra 400012",
    "description": "The King of Lalbaug and undisputed focal point of Mumbai Ganeshotsav, drawing over 1.5 million devotees daily.",
    "historical_info": "Founded in 1934 by local Koli fisherfolk and market traders after their open-air market was granted permanent status.",
    "timings": "24 Hours Open (Continuous Navas & Mukh Darshan Lines)",
    "organizer": "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal",
    "official_url": "https://lalbaugcharaja.com",
    "image_url": "/images/mandals/lalbaug_idol.jpg",
    "temple_image_url": "/images/mandals/lalbaug_pandal_outside.jpg",
    "traffic_road": "Dr Babasaheb Ambedkar Road & Lalbaug Flyover",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Must-Visit",
      "Navas Idol",
      "Mega Queues",
      "Celebrity Darshan",
      "Iconic"
    ],
    "top_roads": [
      {
        "name": "Dr Babasaheb Ambedkar Road",
        "distance": "150m from pandal",
        "distance_meters": 150,
        "color": "red",
        "status": "Severe Gridlock • 2km Barricaded Approach",
        "delay": "~90 min delay",
        "avg_speed": "3 km/h",
        "maps_query": "Dr Ambedkar Road Lalbaug Mumbai"
      },
      {
        "name": "GD Ambekar Marg (Chinchpokli End)",
        "distance": "450m from pandal",
        "distance_meters": 450,
        "color": "red",
        "status": "Heavy Jam • Devotee Queue Spillover",
        "delay": "~50 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "GD Ambekar Marg Lalbaug Mumbai"
      },
      {
        "name": "Lalbaug Flyover Slip Road",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "orange",
        "status": "Moderate Rush • Police Diverted",
        "delay": "~25 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "Lalbaug Flyover Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_ganesh_galli",
    "city_id": "city_mumbai",
    "name": "Mumbaicha Raja (Ganesh Galli)",
    "slug": "mumbaicha-raja",
    "latitude": 18.9918,
    "longitude": 72.8384,
    "address": "1, Ganesh Galli, Lalbaug, Parel, Mumbai, Maharashtra 400012",
    "description": "Celebrated for 22-foot monumental idols and awe-inspiring architectural replicas of India’s grandest temples.",
    "historical_info": "Founded in 1928 by mill workers of Lalbaug; pioneer of large-scale idol tradition in Mumbai.",
    "timings": "06:00 AM - 01:00 AM",
    "organizer": "Lalbaug Sarvajanik Utsav Mandal (Ganesh Galli)",
    "official_url": "https://ganeshgalli.com",
    "image_url": "/images/mandals/ganeshgalli_idol.jpg",
    "temple_image_url": "/images/mandals/ganeshgalli_pandal.jpg",
    "traffic_road": "Lalbaug Market & Dattaram Lad Marg",
    "has_verified_entrance": true,
    "status": "active",
    "is_famous": true,
    "tags": [
      "22-Foot Idol",
      "Heritage Mandir Replicas",
      "Mill Workers Legacy",
      "Parel Hub"
    ],
    "top_roads": [
      {
        "name": "Dattaram Lad Marg (Ganesh Galli)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "red",
        "status": "Heavy Jam • Dense Crowd Corridor",
        "delay": "~45 min delay",
        "avg_speed": "4 km/h",
        "maps_query": "Ganesh Galli Lalbaug Mumbai"
      },
      {
        "name": "Dr BA Road Lalbaug Jn",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "red",
        "status": "Heavy Congestion",
        "delay": "~35 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Dr Ambedkar Road Ganesh Galli Mumbai"
      },
      {
        "name": "Currey Road Station Approach",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "orange",
        "status": "Moderate Commuter Flow",
        "delay": "~18 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Currey Road Station Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_gsb",
    "city_id": "city_mumbai",
    "name": "GSB Seva Mandal (Kings Circle)",
    "slug": "gsb-seva-mandal",
    "latitude": 19.0308,
    "longitude": 72.8596,
    "address": "Shree Guru Ganesh Prasad, Bhookailash Nagar, Sion, Mumbai 400022",
    "description": "The golden jewel of Mumbai Ganeshotsav, adorned with 66+ kg of pure gold and 325+ kg of silver ornaments.",
    "historical_info": "Founded in 1954 by the Gowd Saraswat Brahmin community; known for rigorous Vedic pujas and record-breaking insurance covers.",
    "timings": "06:00 AM - 11:00 PM (5-Day Special Darshan)",
    "organizer": "GSB Seva Mandal Kings Circle",
    "official_url": "https://gsbsevamandal.org",
    "image_url": "/images/mandals/gsb_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Kings Circle & Dr BA Road Sion",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Gold Ganpati",
      "Richest Mandal",
      "Clay Idol Tradition",
      "Vedic Pujas"
    ],
    "top_roads": [
      {
        "name": "Dr BA Road (Kings Circle Flyover)",
        "distance": "180m from pandal",
        "distance_meters": 180,
        "color": "orange",
        "status": "Moderate Traffic Flow",
        "delay": "~18 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Kings Circle Flyover Mumbai"
      },
      {
        "name": "Sion Circle Arterial Link",
        "distance": "450m from pandal",
        "distance_meters": 450,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~15 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Sion Circle Mumbai"
      },
      {
        "name": "Matunga Station Connector Road",
        "distance": "800m from pandal",
        "distance_meters": 800,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~7 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Matunga Station East Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_khetwadi_12",
    "city_id": "city_mumbai",
    "name": "Khetwadicha Raja (12th Lane)",
    "slug": "khetwadicha-raja",
    "latitude": 18.9592,
    "longitude": 72.8211,
    "address": "12th Khetwadi Lane, Grant Road, Mumbai, Maharashtra 400004",
    "description": "Legendary lane famed for record-shattering tall idols, including a 40-foot colossal Ganpati and intricate jewel work.",
    "historical_info": "Founded in 1959; winner of multiple state awards for idol artistry and dramatic sets.",
    "timings": "06:00 AM - 12:00 AM",
    "organizer": "12th Khetwadi Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/khetwadi_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "SVP Road & Grant Road East",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Towering Idols",
      "Grant Road Heritage",
      "Artistic Excellence",
      "Girgaon Vicinity"
    ],
    "top_roads": [
      {
        "name": "Sardar Vallabhbhai Patel Road",
        "distance": "140m from lane",
        "distance_meters": 140,
        "color": "red",
        "status": "Heavy Jam • Khetwadi Lane Confluence",
        "delay": "~35 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "SVP Road Khetwadi Mumbai"
      },
      {
        "name": "Grant Road Station East Approach",
        "distance": "400m from lane",
        "distance_meters": 400,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~16 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Grant Road Station Mumbai"
      },
      {
        "name": "Charni Road Connector",
        "distance": "750m from lane",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~8 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Charni Road East Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_andheri",
    "city_id": "city_mumbai",
    "name": "Andhericha Raja",
    "slug": "andhericha-raja",
    "latitude": 19.1235,
    "longitude": 72.8342,
    "address": "Veera Desai Road, Azad Nagar, Andheri West, Mumbai, Maharashtra 400053",
    "description": "The King of Western Suburbs, renowned for massive palatial replicas and fulfilling vows during its 16-day celebration.",
    "historical_info": "Established in 1966 by workers of the Golden Tobacco Company; immersion takes place on Sankashti Chaturthi.",
    "timings": "05:30 AM - 12:00 AM",
    "organizer": "Azad Nagar Sarvajanik Utsav Samiti",
    "official_url": "https://andhericharaja.com",
    "image_url": "/images/mandals/mumbai_andheri_real_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Veera Desai Road & Link Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Suburban King",
      "16-Day Darshan",
      "Temple Replicas",
      "Bollywood Favorite"
    ],
    "top_roads": [
      {
        "name": "Veera Desai Road",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "red",
        "status": "Heavy Jam • Devotee Queues",
        "delay": "~38 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Veera Desai Road Andheri West Mumbai"
      },
      {
        "name": "New Link Road (Azad Nagar)",
        "distance": "400m from pandal",
        "distance_meters": 400,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~16 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "New Link Road Azad Nagar Mumbai"
      },
      {
        "name": "SV Road Andheri West Link",
        "distance": "850m from pandal",
        "distance_meters": 850,
        "color": "blue",
        "status": "Clear Route",
        "delay": "~7 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "SV Road Andheri West Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_chinchpokli",
    "city_id": "city_mumbai",
    "name": "Chinchpokli Cha Chintamani",
    "slug": "chinchpokli-chintamani",
    "latitude": 18.9856,
    "longitude": 72.8341,
    "address": "Dattaram Lad Marg, Chinchpokli, Mumbai, Maharashtra 400012",
    "description": "One of the oldest and most revered murtis in Mumbai, celebrated for the legendary Aagman Sohala (arrival festival).",
    "historical_info": "Founded in 1920; celebrated its centenary with unmatched fanfare and traditional dhol tasha.",
    "timings": "06:00 AM - 12:00 AM",
    "organizer": "Chinchpokli Sarvajanik Utsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/chinchpokli_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Chinchpokli Railway Station & Arthur Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Chintamani",
      "Centenary Legacy",
      "Aagman Sohala",
      "Mill Heartland"
    ],
    "top_roads": [
      {
        "name": "Dattaram Lad Marg (Chinchpokli)",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "red",
        "status": "Heavy Jam • Station Confluence",
        "delay": "~32 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Chinchpokli Station Road Mumbai"
      },
      {
        "name": "Arthur Road (NM Joshi Marg)",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~15 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "NM Joshi Marg Chinchpokli Mumbai"
      },
      {
        "name": "Sane Guruji Marg Approach",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~6 min delay",
        "avg_speed": "31 km/h",
        "maps_query": "Sane Guruji Marg Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_tejukaya",
    "city_id": "city_mumbai",
    "name": "Raja Tejukayacha (Tejukaya Mandal)",
    "slug": "raja-tejukayacha",
    "latitude": 18.9925,
    "longitude": 72.8362,
    "address": "Tejukaya Compound, Lalbaug, Mumbai, Maharashtra 400012",
    "description": "Eco-friendly paper-mache idol tradition championing sustainable Ganeshotsav in the heart of Lalbaug.",
    "historical_info": "Founded in the 1960s in Tejukaya chawl compound; famous for record 22-foot eco-friendly paper idols.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Tejukaya Sarvajanik Ganeshotsav Trust",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_tejukaya_real_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Lalbaug Junction & Suparibaug",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Eco-Friendly",
      "Paper Mache Pioneer",
      "Lalbaug Neighborhood",
      "Iconic Art"
    ],
    "top_roads": [
      {
        "name": "Tejukaya Compound Lane",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "red",
        "status": "Heavy Jam • Pedestrian Density",
        "delay": "~28 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Tejukaya Compound Lalbaug Mumbai"
      },
      {
        "name": "Suparibaug Road",
        "distance": "340m from pandal",
        "distance_meters": 340,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~14 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Suparibaug Road Lalbaug Mumbai"
      },
      {
        "name": "Parel TT Circle Link",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Parel TT Circle Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_girgaon",
    "city_id": "city_mumbai",
    "name": "Girgaoncha Raja (Nikadwari Lane)",
    "slug": "girgaoncha-raja",
    "latitude": 18.9548,
    "longitude": 72.8189,
    "address": "Nikadwari Lane, Girgaon, Mumbai, Maharashtra 400004",
    "description": "The landmark clay (Shadu mati) giant of South Mumbai, standing 25 feet tall without chemical plaster.",
    "historical_info": "Founded in 1928; upholds an unbroken 95-year tradition of 100% natural clay craft.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Nikadwari Lane Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_girgaon_real_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Jagannath Shankar Sheth Road (JSS Road)",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "25-Foot Shadu Idol",
      "Eco Giant",
      "Girgaon Heritage",
      "Chowpatty Visarjan"
    ],
    "top_roads": [
      {
        "name": "JSS Road (Girgaon Central)",
        "distance": "130m from pandal",
        "distance_meters": 130,
        "color": "red",
        "status": "Heavy Jam • Historic Commercial Spine",
        "delay": "~30 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "JSS Road Girgaon Mumbai"
      },
      {
        "name": "Charni Road Station Link",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Charni Road West Mumbai"
      },
      {
        "name": "Girgaon Chowpatty Sea Face",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Girgaon Chowpatty Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_fort",
    "city_id": "city_mumbai",
    "name": "Fortcha Icchapurti Ganpati",
    "slug": "fortcha-icchapurti",
    "latitude": 18.9388,
    "longitude": 72.8352,
    "address": "Mint Road, Fort, Mumbai, Maharashtra 400001",
    "description": "Renowned for recreating palace sets resembling Rajasthani mahals in the heart of Mumbai’s financial district.",
    "historical_info": "Established in the mid-1950s by government mint and RBI bank employees.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Fort Vibhag Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_fort_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Mint Road & Shahid Bhagat Singh Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Palace Replicas",
      "South Mumbai Hub",
      "Historic Fort",
      "Wish-Fulfilling"
    ],
    "top_roads": [
      {
        "name": "Shahid Bhagat Singh Road (Fort)",
        "distance": "150m from pandal",
        "distance_meters": 150,
        "color": "orange",
        "status": "Moderate Business Traffic",
        "delay": "~14 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Shahid Bhagat Singh Road Fort Mumbai"
      },
      {
        "name": "Mint Road Access Lane",
        "distance": "320m from pandal",
        "distance_meters": 320,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~5 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Mint Road Fort Mumbai"
      },
      {
        "name": "CSMT Station Peripheral Road",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "orange",
        "status": "Moderate Commuter Density",
        "delay": "~15 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "CSMT Station Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_sahyadri",
    "city_id": "city_mumbai",
    "name": "Sahyadri Krida Mandal (Chembur)",
    "slug": "sahyadri-chembur",
    "latitude": 19.0624,
    "longitude": 72.8987,
    "address": "Tilak Nagar, Chembur, Mumbai, Maharashtra 400089",
    "description": "Eastern suburbs powerhouse known for national integration themes, sports events, and Varanasi ghat replica sets.",
    "historical_info": "Founded in 1975; famous for bringing architectural wonders from across India to Tilak Nagar.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Sahyadri Krida Mandal",
    "official_url": "",
    "image_url": "/images/mandals/sahyadri_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Tilak Nagar & Chembur Railway Station",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Chembur Jewel",
      "National Themes",
      "Eastern Suburbs",
      "Cultural Marvel"
    ],
    "top_roads": [
      {
        "name": "Tilak Nagar Main Avenue",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Tilak Nagar Chembur Mumbai"
      },
      {
        "name": "Lokmanya Tilak Terminus Connector",
        "distance": "450m from pandal",
        "distance_meters": 450,
        "color": "red",
        "status": "Heavy Jam at Rail Terminus",
        "delay": "~28 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "LTT Terminus Kurla Mumbai"
      },
      {
        "name": "Eastern Express Highway Slip",
        "distance": "850m from pandal",
        "distance_meters": 850,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~6 min delay",
        "avg_speed": "36 km/h",
        "maps_query": "EEH Chembur Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_chandanwadi",
    "city_id": "city_mumbai",
    "name": "Chandanwadicha Raja",
    "slug": "chandanwadicha-raja",
    "latitude": 18.9482,
    "longitude": 72.8225,
    "address": "Chandanwadi, Marine Lines, Mumbai, Maharashtra 400002",
    "description": "Famous for its massive golden crown and royal courtroom throne in South Mumbai.",
    "historical_info": "Founded in 1977; recipient of Best Mandal awards in Maharashtra.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Chandanwadi Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_chandanwadi_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Marine Lines & Maharshi Karve Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Marine Lines",
      "Royal Crown",
      "Gold Throne",
      "South Mumbai"
    ],
    "top_roads": [
      {
        "name": "Maharshi Karve Road (Marine Lines)",
        "distance": "140m from pandal",
        "distance_meters": 140,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~15 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Maharshi Karve Road Marine Lines Mumbai"
      },
      {
        "name": "Chandanwadi Cross Lane",
        "distance": "280m from pandal",
        "distance_meters": 280,
        "color": "blue",
        "status": "Clear Pedestrian Flow",
        "delay": "~5 min delay",
        "avg_speed": "26 km/h",
        "maps_query": "Chandanwadi Marine Lines Mumbai"
      },
      {
        "name": "Marine Drive Coastal Arterial",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Coastal Route",
        "delay": "~5 min delay",
        "avg_speed": "38 km/h",
        "maps_query": "Marine Drive Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_khetwadi_11",
    "city_id": "city_mumbai",
    "name": "Khetwadi 11th Lane (Mumbaicha Maharaja)",
    "slug": "khetwadi-11th-lane",
    "latitude": 18.9587,
    "longitude": 72.8208,
    "address": "11th Khetwadi Lane, Girgaon, Mumbai, Maharashtra 400004",
    "description": "Renowned as Mumbaicha Maharaja, featuring magnificent 28-foot idols with multi-headed Avatars.",
    "historical_info": "Active for over 60 years in the historic Khetwadi hub.",
    "timings": "06:00 AM - 12:00 AM",
    "organizer": "11th Khetwadi Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/khetwadi_11_utsav_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "11th Khetwadi Lane & SVP Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Mumbaicha Maharaja",
      "Khetwadi Hub",
      "Colossal Avatar",
      "Artistic Splendor"
    ],
    "top_roads": [
      {
        "name": "11th Khetwadi Lane Corridor",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "red",
        "status": "Heavy Jam • Devotee Congestion",
        "delay": "~30 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "11th Khetwadi Lane Mumbai"
      },
      {
        "name": "SVP Road Arterial Link",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "SVP Road Mumbai"
      },
      {
        "name": "Grant Road East Concourse",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Route",
        "delay": "~7 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Grant Road East Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_khetwadi_8",
    "city_id": "city_mumbai",
    "name": "Khetwadi 8th Lane (Mumbaicha Samrat)",
    "slug": "khetwadi-8th-lane",
    "latitude": 18.9575,
    "longitude": 72.8198,
    "address": "8th Khetwadi Lane, Girgaon, Mumbai 400004",
    "description": "Celebrated as Mumbaicha Samrat, featuring regal warrior idols and spectacular palace sets.",
    "historical_info": "Continuous tradition since 1964; celebrated for dramatic light-and-sound shows.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "8th Khetwadi Sarvajanik Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_khetwadi_8_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "8th Khetwadi Lane & JSS Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Mumbaicha Samrat",
      "Khetwadi",
      "Warrior Idol"
    ],
    "top_roads": [
      {
        "name": "8th Khetwadi Lane",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "14 km/h",
        "maps_query": "8th Khetwadi Lane Mumbai"
      },
      {
        "name": "SVP Road Junction",
        "distance": "320m from pandal",
        "distance_meters": 320,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~24 min delay",
        "avg_speed": "7 km/h",
        "maps_query": "SVP Road Khetwadi Mumbai"
      },
      {
        "name": "Charni Road Rail Link",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "blue",
        "status": "Clear Flow",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Charni Road Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_khetwadi_7",
    "city_id": "city_mumbai",
    "name": "Khetwadi 7th Lane Ganpati Mandal",
    "slug": "khetwadi-7th-lane",
    "latitude": 18.957,
    "longitude": 72.8192,
    "address": "7th Khetwadi Lane, Girgaon, Mumbai 400004",
    "description": "Known for traditional clay idols sculpted in the classical Lalbaug style with diamond-studded crowns.",
    "historical_info": "Serving the community for over 50 years with dedicated volunteer marshals.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "7th Khetwadi Ganeshotsav Trust",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_khetwadi_7_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "7th Khetwadi Lane",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Khetwadi Cluster",
      "Classical Sculpting",
      "Devotee Seva"
    ],
    "top_roads": [
      {
        "name": "7th Khetwadi Lane Entrance",
        "distance": "90m from pandal",
        "distance_meters": 90,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "7th Khetwadi Lane Mumbai"
      },
      {
        "name": "JSS Road Connecting Lane",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~22 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "JSS Road Mumbai"
      },
      {
        "name": "Sardar Patel Road Crossing",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "SVP Road Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_khetwadi_4",
    "city_id": "city_mumbai",
    "name": "Khetwadi 4th Lane (Balgopal Mitra Mandal)",
    "slug": "khetwadi-4th-lane",
    "latitude": 18.9555,
    "longitude": 72.818,
    "address": "4th Khetwadi Lane, Girgaon, Mumbai 400004",
    "description": "Famed for traditional gold and silver throned idol and authentic Mahaprasad distribution.",
    "historical_info": "One of the earliest youth mandals in the Khetwadi precinct, established in 1968.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Balgopal Mitra Mandal 4th Khetwadi",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_khetwadi_4_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "4th Khetwadi Lane & VP Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Khetwadi Hub",
      "Mahaprasad",
      "Silver Throne"
    ],
    "top_roads": [
      {
        "name": "4th Khetwadi Lane",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~10 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "4th Khetwadi Lane Mumbai"
      },
      {
        "name": "VP Road Approach",
        "distance": "300m from pandal",
        "distance_meters": 300,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "VP Road Girgaon Mumbai"
      },
      {
        "name": "Opera House Connecting Link",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Opera House Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_gsb_wadala",
    "city_id": "city_mumbai",
    "name": "GSB Sarvajanik Ganeshotsav Samiti (Wadala)",
    "slug": "gsb-wadala",
    "latitude": 19.0205,
    "longitude": 72.8582,
    "address": "Dwarkanath Bhavan, Katrak Road, Wadala, Mumbai 400031",
    "description": "Revered for strict traditional Vedic rituals, daily Anna Daanam feeding thousands, and silver ornaments.",
    "historical_info": "Founded in 1955 alongside the historic Wadala Ram Mandir.",
    "timings": "06:00 AM - 10:30 PM (10-Day Festival)",
    "organizer": "GSB Sarvajanik Ganeshotsav Samiti Wadala",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_gsb_wadala_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Katrak Road & Wadala Station Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": true,
    "tags": [
      "Vedic Rituals",
      "Wadala Ram Mandir",
      "Anna Daanam",
      "GSB Tradition"
    ],
    "top_roads": [
      {
        "name": "Katrak Road (Wadala)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~12 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Katrak Road Wadala Mumbai"
      },
      {
        "name": "Wadala Station West Approach",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Wadala Station West Mumbai"
      },
      {
        "name": "Rafi Ahmed Kidwai Marg",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "34 km/h",
        "maps_query": "RA Kidwai Marg Wadala Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_balgopal_vileparle",
    "city_id": "city_mumbai",
    "name": "Bal Gopal Mitra Mandal (Vile Parle East)",
    "slug": "balgopal-vile-parle",
    "latitude": 19.0985,
    "longitude": 72.8488,
    "address": "Nehru Road, Vile Parle East, Mumbai 400057",
    "description": "Cultural hub of the suburban Marathi community in Vile Parle, known for grand musical evenings and classical decor.",
    "historical_info": "Established in 1972; focal point of cultural festivities in the western suburbs.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Bal Gopal Mitra Mandal Trust",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_balgopal_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Nehru Road & Vile Parle Station East",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Vile Parle",
      "Cultural Hub",
      "Musical Evenings"
    ],
    "top_roads": [
      {
        "name": "Nehru Road (Vile Parle)",
        "distance": "110m from pandal",
        "distance_meters": 110,
        "color": "orange",
        "status": "Moderate Market Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Nehru Road Vile Parle Mumbai"
      },
      {
        "name": "Station Road Vile Parle East",
        "distance": "320m from pandal",
        "distance_meters": 320,
        "color": "red",
        "status": "Heavy Commuter Jam",
        "delay": "~24 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Vile Parle Station East Mumbai"
      },
      {
        "name": "Western Express Highway Flyover",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Highway Arterial",
        "delay": "~6 min delay",
        "avg_speed": "38 km/h",
        "maps_query": "WEH Vile Parle Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_dongri",
    "city_id": "city_mumbai",
    "name": "Dongricha Raja",
    "slug": "dongricha-raja",
    "latitude": 18.9562,
    "longitude": 72.8375,
    "address": "Char Nul, Dongri, Mumbai 400009",
    "description": "A historic symbol of communal harmony and inter-faith brotherhood in South Mumbai for over eight decades.",
    "historical_info": "Founded in 1939; celebrated enthusiastically with participation from all local communities.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Dongri Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_dongri_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Dr Maheshwari Road & Dongri Char Nul",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Communal Harmony",
      "Dongri Landmark",
      "Inter-Faith Unity"
    ],
    "top_roads": [
      {
        "name": "Dongri Char Nul Road",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "Dongri Char Nul Mumbai"
      },
      {
        "name": "Dr Maheshwari Road Approach",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Flow",
        "delay": "~12 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Dr Maheshwari Road Dongri Mumbai"
      },
      {
        "name": "Sandhurst Road Station Link",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~5 min delay",
        "avg_speed": "29 km/h",
        "maps_query": "Sandhurst Road Station Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_kamathipura",
    "city_id": "city_mumbai",
    "name": "Kamathipura Cha Chintamani (14th Lane)",
    "slug": "kamathipura-chintamani",
    "latitude": 18.9632,
    "longitude": 72.8278,
    "address": "14th Kamathipura Lane, Mumbai 400008",
    "description": "Cherished neighborhood deity worshipped for community upliftment and youth education scholarships.",
    "historical_info": "Over 50 years of devotional social service in South Central Mumbai.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "14th Lane Kamathipura Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_kamathipura_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Bellasis Road & Kamathipura",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Kamathipura Chintamani",
      "Social Upliftment",
      "Community Unity"
    ],
    "top_roads": [
      {
        "name": "Bellasis Road",
        "distance": "140m from pandal",
        "distance_meters": 140,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Bellasis Road Mumbai"
      },
      {
        "name": "Duncan Road Corridor",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~24 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Duncan Road Kamathipura Mumbai"
      },
      {
        "name": "Mumbai Central Concourse Link",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Route",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Mumbai Central Station"
      }
    ]
  },
  {
    "id": "mandal_mumbai_mazgaon",
    "city_id": "city_mumbai",
    "name": "Mazgaoncha Raja (Tadwadi Sarvajanik)",
    "slug": "mazgaoncha-raja",
    "latitude": 18.9678,
    "longitude": 72.8435,
    "address": "Tadwadi, Mazgaon, Mumbai 400010",
    "description": "Renowned for dramatic decorative pandals mimicking Himalayan caves and ancient caves of Ellora.",
    "historical_info": "Active since the 1960s; famous for its lively Visarjan procession along the harbor docks.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Tadwadi Mazgaon Sarvajanik Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_mazgaon_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Mazgaon Dock Road & Nesbit Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Mazgaon Hub",
      "Cave Thematics",
      "Harbor Procession"
    ],
    "top_roads": [
      {
        "name": "Nesbit Road (Mazgaon)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "blue",
        "status": "Clear Flow",
        "delay": "~6 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Nesbit Road Mazgaon Mumbai"
      },
      {
        "name": "Dockyard Road Rail Approach",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~12 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Dockyard Road Station Mumbai"
      },
      {
        "name": "P D’Mello Road Eastern Freeway Link",
        "distance": "700m from pandal",
        "distance_meters": 700,
        "color": "blue",
        "status": "Free Flow Highway Corridor",
        "delay": "~5 min delay",
        "avg_speed": "40 km/h",
        "maps_query": "P D’Mello Road Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_kalachowki",
    "city_id": "city_mumbai",
    "name": "Kala Chowki Cha Mahaganpati (Abhyudaya Nagar)",
    "slug": "kalachowki-mahaganpati",
    "latitude": 18.9882,
    "longitude": 72.8421,
    "address": "Abhyudaya Nagar, Kalachowki, Mumbai 400033",
    "description": "Heart of the Lalbaug-Kalachowki festival belt, attracting massive evening darshan lines alongside Lalbaugcha Raja.",
    "historical_info": "Formed by textile mill residents of Abhyudaya Nagar over 60 years ago.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Abhyudaya Nagar Sarvajanik Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_kalachowki_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Cotton Green & Kalachowki Main Road",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Kalachowki Belt",
      "Mill Worker Roots",
      "Festival Heart"
    ],
    "top_roads": [
      {
        "name": "Kalachowki Main Road",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "red",
        "status": "Heavy Jam • Lalbaug Overflow",
        "delay": "~36 min delay",
        "avg_speed": "5 km/h",
        "maps_query": "Kalachowki Main Road Mumbai"
      },
      {
        "name": "Cotton Green Station Road",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~15 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Cotton Green Station Mumbai"
      },
      {
        "name": "Barrister Nath Pai Marg Link",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Corridor",
        "delay": "~6 min delay",
        "avg_speed": "32 km/h",
        "maps_query": "Barrister Nath Pai Marg Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_bandra",
    "city_id": "city_mumbai",
    "name": "Bandra Cha Raja (Bandra West Sarvajanik)",
    "slug": "bandra-cha-raja",
    "latitude": 19.0558,
    "longitude": 72.8315,
    "address": "Hill Road, Bandra West, Mumbai 400050",
    "description": "The King of Queen of Suburbs, bringing coastal flavor, celebrity visits, and inter-community goodwill to Bandra.",
    "historical_info": "Serving Bandra West for over 45 years with inclusive social festivals.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Bandra West Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_bandra_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Hill Road & Bandra Station West",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Bandra King",
      "Suburban Glamour",
      "Inclusive Spirit"
    ],
    "top_roads": [
      {
        "name": "Hill Road (Bandra West)",
        "distance": "120m from pandal",
        "distance_meters": 120,
        "color": "red",
        "status": "Heavy Jam • Shopper & Devotee Density",
        "delay": "~30 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Hill Road Bandra West Mumbai"
      },
      {
        "name": "Turner Road Approach Link",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~14 min delay",
        "avg_speed": "17 km/h",
        "maps_query": "Turner Road Bandra Mumbai"
      },
      {
        "name": "Bandra Bandstand Promenade Road",
        "distance": "850m from pandal",
        "distance_meters": 850,
        "color": "blue",
        "status": "Clear Sea Breeze Corridor",
        "delay": "~6 min delay",
        "avg_speed": "34 km/h",
        "maps_query": "Bandstand Bandra Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_dharavi",
    "city_id": "city_mumbai",
    "name": "Dharavicha Raja (Kumbharwada)",
    "slug": "dharavicha-raja",
    "latitude": 19.0432,
    "longitude": 72.8552,
    "address": "90 Feet Road, Kumbharwada, Dharavi, Mumbai 400017",
    "description": "Located in the historic pottery hub of Kumbharwada where master artisans sculpt clay murtis for the entire city.",
    "historical_info": "More than 70 years of potter artisan traditions sculpting sacred idols right on site.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Dharavi Kumbharwada Ganeshotsav Trust",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_dharavi_real_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "90 Feet Road & Sion Station West",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Potters Capital",
      "Kumbharwada",
      "Artisan Heart"
    ],
    "top_roads": [
      {
        "name": "90 Feet Road (Dharavi)",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "orange",
        "status": "Moderate Traffic",
        "delay": "~16 min delay",
        "avg_speed": "15 km/h",
        "maps_query": "90 Feet Road Dharavi Mumbai"
      },
      {
        "name": "Sion Bandra Link Road",
        "distance": "400m from pandal",
        "distance_meters": 400,
        "color": "red",
        "status": "Heavy Congestion",
        "delay": "~26 min delay",
        "avg_speed": "8 km/h",
        "maps_query": "Sion Bandra Link Road Mumbai"
      },
      {
        "name": "Mahim Sion Rail Concourse",
        "distance": "750m from pandal",
        "distance_meters": 750,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~7 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Mahim Station Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_parel",
    "city_id": "city_mumbai",
    "name": "Parelcha Raja (Nare Park Sarvajanik)",
    "slug": "parelcha-raja",
    "latitude": 18.9982,
    "longitude": 72.8415,
    "address": "Nare Park, Parel, Mumbai 400012",
    "description": "Venerated sarvajanik mandal famous for serene idol posture and massive sports and educational scholarships.",
    "historical_info": "Founded in 1947 in Nare Park ground; a pillar of Parel community life.",
    "timings": "06:00 AM - 11:30 PM",
    "organizer": "Parel Vibhag Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_parel_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Dr Ambedkar Road & Elphinstone Bridge",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Parel Landmark",
      "1947 Legacy",
      "Nare Park"
    ],
    "top_roads": [
      {
        "name": "Dr Ambedkar Road (Parel TT)",
        "distance": "130m from pandal",
        "distance_meters": 130,
        "color": "red",
        "status": "Heavy Jam",
        "delay": "~32 min delay",
        "avg_speed": "6 km/h",
        "maps_query": "Dr Ambedkar Road Parel TT Mumbai"
      },
      {
        "name": "Elphinstone Bridge Approach Link",
        "distance": "380m from pandal",
        "distance_meters": 380,
        "color": "orange",
        "status": "Moderate Rush",
        "delay": "~14 min delay",
        "avg_speed": "16 km/h",
        "maps_query": "Elphinstone Bridge Parel Mumbai"
      },
      {
        "name": "Acharya Donde Marg",
        "distance": "650m from pandal",
        "distance_meters": 650,
        "color": "blue",
        "status": "Clear Passage",
        "delay": "~6 min delay",
        "avg_speed": "30 km/h",
        "maps_query": "Acharya Donde Marg Parel Mumbai"
      }
    ]
  },
  {
    "id": "mandal_mumbai_sewri",
    "city_id": "city_mumbai",
    "name": "Sewri Cha Raja (Sewri Sarvajanik)",
    "slug": "sewri-cha-raja",
    "latitude": 19.0015,
    "longitude": 72.8542,
    "address": "Sewri Koliwada, Sewri, Mumbai 400015",
    "description": "Preserving coastal Koli traditions with traditional fisherman aartis and harbor blessings.",
    "historical_info": "Established by local Koli fisherfolk over 60 years ago.",
    "timings": "06:00 AM - 11:00 PM",
    "organizer": "Sewri Sarvajanik Ganeshotsav Mandal",
    "official_url": "",
    "image_url": "/images/mandals/mumbai_sewri_idol.jpg",
    "temple_image_url": "",
    "traffic_road": "Sewri Koliwada & Eastern Freeway Connector",
    "has_verified_entrance": false,
    "status": "active",
    "is_famous": false,
    "tags": [
      "Koli Heritage",
      "Harbor Blessing",
      "Sewri Coast"
    ],
    "top_roads": [
      {
        "name": "Sewri Koliwada Road",
        "distance": "100m from pandal",
        "distance_meters": 100,
        "color": "blue",
        "status": "Clear Coastal Access",
        "delay": "~5 min delay",
        "avg_speed": "28 km/h",
        "maps_query": "Sewri Koliwada Mumbai"
      },
      {
        "name": "Sewri Station East Link",
        "distance": "350m from pandal",
        "distance_meters": 350,
        "color": "orange",
        "status": "Moderate Moving Traffic",
        "delay": "~12 min delay",
        "avg_speed": "18 km/h",
        "maps_query": "Sewri Station East Mumbai"
      },
      {
        "name": "Eastern Freeway Sewri Ramp",
        "distance": "600m from pandal",
        "distance_meters": 600,
        "color": "blue",
        "status": "Free Flow Highway Corridor",
        "delay": "~4 min delay",
        "avg_speed": "42 km/h",
        "maps_query": "Eastern Freeway Sewri Mumbai"
      }
    ]
  }
];

export const SEED_CAMERA_FEEDS = [
  // Pune Dagdusheth Feeds
  {
    id: 'feed_pune_dagdusheth_main',
    mandal_id: 'mandal_pune_dagdusheth',
    name: 'Dagdusheth Sanctum Sanctorum Live Feed',
    stream_url: 'https://www.youtube.com/watch?v=live_dagdusheth_demo',
    feed_type: 'live_stream',
    status: 'LIVE',
    is_authorized: true,
    resolution: '1080p60',
    fps: 60,
  },
  {
    id: 'feed_pune_dagdusheth_queue',
    mandal_id: 'mandal_pune_dagdusheth',
    name: 'Budhwar Peth Outer Queue Monitor',
    stream_url: 'https://cdn.festival-intel.gov.in/cctv/pune/dagdusheth_queue.m3u8',
    feed_type: 'hls',
    status: 'LIVE',
    is_authorized: true,
    resolution: '720p',
    fps: 30,
  },
  // Pune Kasba Ganpati
  {
    id: 'feed_pune_kasba_stage',
    mandal_id: 'mandal_pune_kasba',
    name: 'Kasba Peth Main Sabhamandap',
    stream_url: '',
    feed_type: 'temple_webcast',
    status: 'OFFLINE',
    is_authorized: true,
    resolution: '720p',
    fps: 25,
  },
  // Pune Tulshibaug
  {
    id: 'feed_pune_tulshibaug_cam',
    mandal_id: 'mandal_pune_tulshibaug',
    name: 'Tulshibaug High Idol Stage View',
    stream_url: '',
    feed_type: 'temple_webcast',
    status: 'LIVE',
    is_authorized: true,
    resolution: '1080p',
    fps: 30,
  },
  // Mumbai Lalbaugcha Raja Feeds
  {
    id: 'feed_mumbai_lalbaug_charan',
    mandal_id: 'mandal_mumbai_lalbaug',
    name: 'Lalbaugcha Raja Charan Sparsh Stage',
    stream_url: 'https://www.youtube.com/watch?v=live_lalbaug_charan',
    feed_type: 'live_stream',
    status: 'LIVE',
    is_authorized: true,
    resolution: '1080p60',
    fps: 60,
  },
  {
    id: 'feed_mumbai_lalbaug_mukh',
    mandal_id: 'mandal_mumbai_lalbaug',
    name: 'Mukh Darshan Queue Flow Sensor',
    stream_url: '',
    feed_type: 'temple_webcast',
    status: 'LIVE',
    is_authorized: true,
    resolution: '720p',
    fps: 30,
  },
  // Mumbai GSB Seva Mandal
  {
    id: 'feed_mumbai_gsb_main',
    mandal_id: 'mandal_mumbai_gsb_seva',
    name: 'GSB Kings Circle Gold Idol Cam',
    stream_url: '',
    feed_type: 'temple_webcast',
    status: 'LIVE',
    is_authorized: true,
    resolution: '1080p',
    fps: 30,
  },
  // Mumbai Ganesh Galli
  {
    id: 'feed_mumbai_ganesh_galli_theme',
    mandal_id: 'mandal_mumbai_ganesh_galli',
    name: 'Ganesh Galli Architecture Pavilion',
    stream_url: '',
    feed_type: 'temple_webcast',
    status: 'OFFLINE',
    is_authorized: true,
    resolution: '720p',
    fps: 30,
  },
];

export function initializeSeedData(db) {
  // 1. Add Cities
  for (const city of SEED_CITIES) {
    db.addCity(city);
  }

  // 2. Add Mandals
  for (const mandal of SEED_MANDALS) {
    db.addMandal(mandal);
  }

  // 3. Add Feeds
  for (const feed of SEED_CAMERA_FEEDS) {
    db.addCameraFeed(feed);
  }

  // 4. Populate Realistic Initial Crowd & Stage Observations
  const baseCrowdMap = {
    mandal_pune_dagdusheth: { people: 340, density: 92, wait: 45, act: 95, quality: 'LIVE' },
    mandal_pune_kasba: { people: 110, density: 64, wait: 15, act: 78, quality: 'VERIFIED' },
    mandal_pune_tambdi_jogeshwari: { people: 95, density: 58, wait: 12, act: 70, quality: 'VERIFIED' },
    mandal_pune_guruji_talim: { people: 120, density: 66, wait: 18, act: 74, quality: 'VERIFIED' },
    mandal_pune_tulshibaug: { people: 280, density: 86, wait: 35, act: 88, quality: 'LIVE' },
    mandal_pune_kesariwada: { people: 85, density: 48, wait: 10, act: 62, quality: 'VERIFIED' },
    mandal_pune_akhil_mandai: { people: 230, density: 79, wait: 28, act: 84, quality: 'VERIFIED' },
    mandal_pune_bhausaheb_rangari: { people: 195, density: 73, wait: 22, act: 81, quality: 'LIVE' },
    mandal_pune_babu_genu: { people: 260, density: 83, wait: 30, act: 86, quality: 'LIVE' },
    mandal_pune_jilbya_maruti: { people: 140, density: 65, wait: 18, act: 75, quality: 'VERIFIED' },
    mandal_pune_hatti_ganpati: { people: 175, density: 70, wait: 20, act: 79, quality: 'VERIFIED' },
    mandal_pune_trishund: { people: 115, density: 55, wait: 14, act: 68, quality: 'VERIFIED' },
    mandal_pune_khunya_murlidhar: { people: 105, density: 52, wait: 12, act: 65, quality: 'VERIFIED' },

    mandal_mumbai_lalbaug: { people: 850, density: 98, wait: 180, act: 99, quality: 'LIVE' },
    mandal_mumbai_ganesh_galli: { people: 490, density: 88, wait: 60, act: 91, quality: 'VERIFIED' },
    mandal_mumbai_gsb_seva: { people: 380, density: 84, wait: 40, act: 93, quality: 'LIVE' },
    mandal_mumbai_khetwadi_12: { people: 310, density: 77, wait: 30, act: 85, quality: 'VERIFIED' },
    mandal_mumbai_andheri_raja: { people: 360, density: 82, wait: 45, act: 87, quality: 'VERIFIED' },
    mandal_mumbai_chinchpokli: { people: 420, density: 87, wait: 55, act: 90, quality: 'LIVE' },
    mandal_mumbai_tejukaya: { people: 220, density: 68, wait: 20, act: 76, quality: 'VERIFIED' },
    mandal_mumbai_girgaon_raja: { people: 290, density: 75, wait: 28, act: 82, quality: 'VERIFIED' },
    mandal_mumbai_fort_icchapurti: { people: 330, density: 80, wait: 35, act: 85, quality: 'LIVE' },
    mandal_mumbai_sahyadri_krida: { people: 370, density: 83, wait: 42, act: 88, quality: 'LIVE' },
    mandal_mumbai_chandanwadi: { people: 240, density: 71, wait: 24, act: 78, quality: 'VERIFIED' },
    mandal_mumbai_khetwadi_11: { people: 280, density: 74, wait: 26, act: 80, quality: 'VERIFIED' },
  };

  const now = Date.now();

  for (const mandal of SEED_MANDALS) {
    const crowd = baseCrowdMap[mandal.id] || { people: 150, density: 60, wait: 20, act: 70, quality: 'VERIFIED' };
    
    // Add Crowd Observation
    db.addCrowdObservation({
      mandal_id: mandal.id,
      timestamp: new Date(now - Math.floor(Math.random() * 40000)).toISOString(),
      estimated_people: crowd.people,
      density_score: crowd.density,
      queue_score: Math.min(100, Math.round(crowd.wait * 1.2)),
      estimated_wait_minutes: crowd.wait,
      activity_score: crowd.act,
      movement_direction: 'Continuous procession toward main sanctum dais',
      confidence: 0.91,
      source: crowd.quality === 'LIVE' ? 'authorized_camera_feed' : 'calibrated_model_projection',
      data_quality: crowd.quality,
    });

    // Add Stage Observation
    const hasMovingProps = mandal.id.includes('dagdusheth') || mandal.id.includes('lalbaug') || mandal.id.includes('tulshibaug');
    const isGoldIlluminated = mandal.id.includes('dagdusheth') || mandal.id.includes('gsb');
    
    db.addStageObservation({
      mandal_id: mandal.id,
      timestamp: new Date(now - Math.floor(Math.random() * 30000)).toISOString(),
      idol_detected: true,
      people_count: Math.min(25, Math.max(5, Math.round(crowd.people / 15))),
      moving_objects_count: hasMovingProps ? 4 : 1,
      led_display_detected: true,
      mechanical_prop_detected: hasMovingProps,
      lighting_effects: isGoldIlluminated ? 'Hyper-bright warm golden LED halos' : 'Multi-colored synchronized LED wash',
      smoke_effects: mandal.id.includes('lalbaug') || mandal.id.includes('dagdusheth'),
      stage_structures_detected: ['Main sanctum garbhagriha', 'Ornate floral archway', 'Silver prasad table', 'Devotee queue barrier'],
      confidence: 0.94,
      detected_objects: [
        { label: 'Ganpati Idol', confidence: 0.99, bbox: [0.25, 0.15, 0.75, 0.85] },
        { label: 'Decorative Halo / Prabhavali', confidence: 0.96, bbox: [0.20, 0.10, 0.80, 0.50] },
        { label: 'Pooja Dais', confidence: 0.92, bbox: [0.28, 0.70, 0.72, 0.95] },
        { label: 'Stage Volunteers', confidence: 0.91, bbox: [0.10, 0.65, 0.30, 0.95] },
        ...(hasMovingProps ? [{ label: 'Mechanical Prop / Chariot', confidence: 0.88, bbox: [0.70, 0.55, 0.92, 0.90] }] : []),
      ],
      scene_summary: `Grand illuminated Ganpati idol with approximately ${Math.round(crowd.people / 15)} volunteers/priests active on dais. ${
        hasMovingProps ? 'Mechanical display operating smoothly on side wings. ' : ''
      }Decorative lights active with high crowd density in darshan mandap.`,
      source: crowd.quality === 'LIVE' ? 'authorized_camera_feed' : 'calibrated_model_projection',
      data_quality: crowd.quality,
    });

    // 5. Build 24-Hour Historical Metrics Curve
    const history = [];
    const baseDensity = crowd.density;
    for (let h = 23; h >= 0; h--) {
      const timeSlot = new Date(now - h * 3600000);
      const hour = timeSlot.getHours();
      // Peak festival crowd curve (12pm - 2pm lunch lull, 6pm - 11pm heavy evening rush, 1am - 5am quiet)
      let timeFactor = 0.3;
      if (hour >= 6 && hour < 11) timeFactor = 0.65;
      else if (hour >= 11 && hour < 16) timeFactor = 0.55;
      else if (hour >= 16 && hour < 19) timeFactor = 0.85;
      else if (hour >= 19 && hour < 23) timeFactor = 1.0;
      else if (hour >= 23 || hour < 2) timeFactor = 0.70;

      const hourlyDensity = Math.min(100, Math.max(10, Math.round(baseDensity * timeFactor + (Math.random() * 8 - 4))));
      const hourlyPopularity = Math.min(100, Math.max(15, Math.round(hourlyDensity * 0.7 + (crowd.act * 0.3) + (Math.random() * 6 - 3))));
      const hourlyWait = Math.round((hourlyDensity / 100) * crowd.wait * 1.1);

      history.push({
        hour_label: `${hour.toString().padStart(2, '0')}:00`,
        timestamp: timeSlot.toISOString(),
        crowd_density: hourlyDensity,
        popularity_score: hourlyPopularity,
        estimated_wait_minutes: hourlyWait,
      });
    }
    db.setHistoricalMetrics(mandal.id, history);
  }

  // 6. Seed Initial Sponsor Ads
  db.addSponsorAd({
    id: 'ad_saraswat_bank',
    sponsor_name: 'Saraswat Bank Devotee Seva',
    badge_text: 'SEVA PARTNER',
    description: '🙏 Saraswat Bank & PMC Devotee Seva — Digital UPI Offerings & Doorstep Mahaprasad Delivery',
    cta_text: 'Prasad & Seva ↗',
    cta_url: 'https://www.saraswatbank.com',
    placement: 'top_banner',
  });

  db.addSponsorAd({
    id: 'ad_chitale_bandhu',
    sponsor_name: 'Chitale Bandhu Mithaiwale',
    badge_text: 'SPONSORED PARTNER',
    description: 'Authentic Pure Ghee Modaks, Pedhas & Mahaprasad offerings for Ganpati Bappa across Pune & Mumbai.',
    cta_text: 'Order Fresh Prasad 🪔',
    cta_url: 'https://chitalebandhu.in',
    placement: 'leaderboard',
    insert_after_rank: 2,
  });

  db.addSponsorAd({
    id: 'ad_bank_of_maharashtra',
    sponsor_name: 'Bank of Maharashtra Festival Helpline',
    badge_text: 'DEVOTEE HELPLINE',
    description: '24x7 Devotee Aid & Digital Dakshina Seva across major Mandals in Pune & Mumbai. Toll Free: 1800-233-4526.',
    cta_text: 'Helpline & Seva ↗',
    cta_url: 'https://bankofmaharashtra.in',
    placement: 'leaderboard',
    insert_after_rank: 5,
  });
}

