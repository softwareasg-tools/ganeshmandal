import os
import json
import time
import subprocess
from datetime import datetime

# Path for the cached feeds output
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
OUT_FILE = os.path.join(DATA_DIR, 'live_feeds.json')

MANDALS_TO_TRACK = [
    {"id": "mandal_pune_dagdusheth", "query": "Dagdusheth Halwai Ganpati live 2026"},
    {"id": "mandal_mumbai_lalbaug", "query": "Lalbaugcha Raja live aarti 2026"},
    {"id": "mandal_mumbai_ganesh_galli", "query": "Mumbaicha Raja Ganesh Galli live 2026"},
    {"id": "mandal_pune_kasba", "query": "Kasba Ganpati live aarti 2026"},
    {"id": "mandal_mumbai_chinchpokli", "query": "Chinchpokli Chintamani live 2026"}
]

def ensure_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def fetch_youtube_feed(query):
    """
    Uses agent-reach's recommended upstream tool (yt-dlp) to search for live/recent YouTube videos.
    If yt-dlp is not available, it returns a graceful fallback.
    """
    try:
        # Search for the top 1 result matching the query
        print(f"Fetching YouTube feed for: {query}")
        result = subprocess.run(
            ['yt-dlp', f'ytsearch1:{query}', '--dump-json', '--default-search', 'ytsearch', '--no-playlist'],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout.strip().split('\n')[0])
            return {
                "title": data.get("title", ""),
                "url": data.get("webpage_url", ""),
                "thumbnail": data.get("thumbnail", ""),
                "uploader": data.get("uploader", ""),
                "is_live": data.get("is_live", False),
                "embed_url": f"https://www.youtube-nocookie.com/embed/{data.get('id')}?autoplay=1&mute=0&rel=0&playsinline=1"
            }
    except Exception as e:
        print(f"Error fetching YouTube feed for '{query}': {e}")
    return None

def main():
    ensure_dir()
    
    live_feeds = {
        "updated_at": datetime.utcnow().isoformat(),
        "mandals": {}
    }

    for mandal in MANDALS_TO_TRACK:
        print(f"Processing {mandal['id']}...")
        
        # 1. Fetch YouTube Live Stream or Latest Video
        yt_data = fetch_youtube_feed(mandal["query"])
        
        # In a full deployment, we could also call agent-reach Twitter or Instagram tools here:
        # result = subprocess.run(['twitter', 'search', mandal["query"], '-n', '1'], capture_output=True)
        # But for zero-auth safety on the VPS, we rely on YouTube which is highly visual and authentic for Mandals.
        
        live_feeds["mandals"][mandal["id"]] = {
            "youtube": yt_data
        }
        
        # Be polite to APIs
        time.sleep(2)

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(live_feeds, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully updated live feeds at {OUT_FILE}")

if __name__ == "__main__":
    main()
