import os
import json
import time
import subprocess
from datetime import datetime, timezone

# Path for the cached feeds output
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
OUT_FILE = os.path.join(DATA_DIR, 'live_feeds.json')
MANDALS_FILE = os.path.join(DATA_DIR, 'mandals.json')

def load_mandals():
    try:
        with open(MANDALS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Handle if the root is an array or an object containing an array
            return data if isinstance(data, list) else data.get('mandals', [])
    except Exception as e:
        print(f"Error loading mandals.json: {e}")
        return []

def get_mandal_query(mandal):
    name = mandal.get('name', 'Ganpati')
    city = 'Mumbai' if 'mumbai' in (mandal.get('city_id', '')).lower() else 'Pune'
    return f"{name} {city} live aarti 2026"


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
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    live_feeds = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "mandals": {}
    }

    all_mandals = load_mandals()
    print(f"Loaded {len(all_mandals)} mandals to track.")

    for mandal in all_mandals:
        mandal_id = mandal.get("id")
        if not mandal_id:
            continue
            
        query = get_mandal_query(mandal)
        print(f"Processing {mandal_id}...")
        
        # 1. Fetch YouTube Live Stream or Latest Video
        yt_data = fetch_youtube_feed(query)
        
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
