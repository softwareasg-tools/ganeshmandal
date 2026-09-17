import os
import json
import time
import subprocess
from datetime import datetime, timezone

# Path for the cached feeds output
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
OUT_FILE = os.path.join(DATA_DIR, 'live_feeds.json')
def load_mandals():
    try:
        # Ask the Node backend for the authoritative list of mandals
        node_script = '''
import('./server/seedData.js').then(m => {
    import('./server/db.js').then(dbMod => {
        const db = dbMod.db;
        m.initializeSeedData(db);
        console.log(JSON.stringify(db.getAllMandals()));
    });
});
'''
        result = subprocess.run(['node', '-e', node_script], capture_output=True, text=True, cwd=os.path.dirname(DATA_DIR))
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout.strip())
            return data if isinstance(data, list) else data.get('mandals', [])
    except Exception as e:
        print(f"Error loading mandals from Node: {e}")
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
        # Search for top 1 result across 3 different query types to guarantee variety (Live, Shorts, Vlog)
        city = 'Mumbai' if 'mumbai' in query.lower() else 'Pune'
        base_name = query.replace(' live aarti 2026', '')
        if base_name.endswith(city):
            base_name = base_name[:-len(city)].strip()
            
        queries = [
            f'ytsearch1:{base_name} {city} live aarti 2026',
            f'ytsearch1:{base_name} {city} ganpati shorts 2026',
            f'ytsearch1:{base_name} {city} public darshan vlog 2026'
        ]
        print(f"Fetching YouTube feed for: {base_name} {city}")
        
        args = ['yt-dlp'] + queries + ['--flat-playlist', '--dump-json', '--default-search', 'ytsearch', '--no-playlist']
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=45
        )
        # yt-dlp can return non-zero exit code if some results are age-restricted or unavailable, 
        # but it still outputs valid JSON for the successful ones!
        videos = []
        if result.stdout:
            for line in result.stdout.strip().split('\n'):
                if not line.strip(): continue
                try:
                    data = json.loads(line)
                    # Extract best thumbnail from flat-playlist output
                    thumb_url = data.get("thumbnail", "")
                    if not thumb_url and data.get("thumbnails"):
                        thumb_url = data["thumbnails"][-1].get("url", "")
                    
                    is_live = data.get("live_status") == "is_live" or data.get("is_live") is True
                    
                    videos.append({
                        "title": data.get("title", ""),
                        "url": data.get("webpage_url") or data.get("url", ""),
                        "thumbnail": thumb_url,
                        "uploader": data.get("uploader", ""),
                        "is_live": is_live,
                        "embed_url": f"https://www.youtube-nocookie.com/embed/{data.get('id')}?autoplay=1&mute=0&rel=0&playsinline=1"
                    })
                except json.JSONDecodeError:
                    print(f"Warning: yt-dlp output not valid JSON: {line[:50]}")
        
        if not videos and result.returncode != 0:
            print(f"yt-dlp failed with code {result.returncode}: {result.stderr}")
            
        return videos
    except Exception as e:
        print(f"Error fetching YouTube feed for '{query}': {e}")
    return []

import concurrent.futures

def process_mandal(mandal):
    mandal_id = mandal.get("id")
    if not mandal_id:
        return None
        
    query = get_mandal_query(mandal)
    print(f"Processing {mandal_id}...")
    yt_data = fetch_youtube_feed(query)
    
    return mandal_id, yt_data

def main():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    live_feeds = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "mandals": {}
    }

    all_mandals = load_mandals()
    print(f"Loaded {len(all_mandals)} mandals to track.")

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(process_mandal, all_mandals)
        
        for result in results:
            if result:
                mandal_id, yt_data = result
                live_feeds["mandals"][mandal_id] = {
                    "youtube": yt_data
                }

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(live_feeds, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated live feeds at {OUT_FILE}")

if __name__ == "__main__":
    main()
