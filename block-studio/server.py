"""
Block Studio - Local Development Server
Reads configuration from .env and serves the Block Studio application on localhost.
"""
import os
import sys
import json
import hashlib
import threading
from urllib.request import urlopen, Request
from urllib.parse import urlparse, unquote
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Ensure UTF-8 output on Windows consoles to prevent UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Load environment variables from .env
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_file)
except ImportError:
    pass

PORT = int(os.getenv("PORT", "5500"))
HOST = os.getenv("HOST", "localhost")
APP_NAME = os.getenv("APP_NAME", "Block Studio")
ENV = os.getenv("ENVIRONMENT", "development")

PACKAGE_DIRECTORY = Path(__file__).resolve().parent / 'vendor' / 'pyodide'
PACKAGE_INDEX = json.loads((PACKAGE_DIRECTORY / 'pyodide-lock.json').read_text(encoding='utf-8'))['packages']
PACKAGE_FILES = {item['file_name']: item for item in PACKAGE_INDEX.values()}
PACKAGE_DOWNLOAD_LOCK = threading.Lock()


def ensure_python_package(filename):
    """Cache only hash-verified files named by the bundled official runtime lock."""
    package = PACKAGE_FILES.get(filename)
    if package is None:
        raise ValueError('Unknown Pyodide package file.')
    target = PACKAGE_DIRECTORY / filename
    with PACKAGE_DOWNLOAD_LOCK:
        if target.exists(): return target
        url = 'https://cdn.jsdelivr.net/pyodide/v314.0.8/full/' + filename
        with urlopen(Request(url, headers={'User-Agent': 'BlockStudio/1.0'}), timeout=45) as response:
            payload = response.read(100_000_001)
        if len(payload) > 100_000_000: raise ValueError('Package exceeds the 100 MB download limit.')
        if hashlib.sha256(payload).hexdigest() != package['sha256']:
            raise ValueError('Package integrity verification failed.')
        temporary = target.with_suffix(target.suffix + '.part')
        temporary.write_bytes(payload)
        temporary.replace(target)
    return target


class BlockStudioHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler that disables caching and allows CORS for local development."""
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      '.mjs': 'text/javascript', '.js': 'text/javascript',
                      '.wasm': 'application/wasm'}
    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path.startswith('/vendor/pyodide/'):
            filename = path.removeprefix('/vendor/pyodide/')
            if filename in PACKAGE_FILES:
                try: ensure_python_package(filename)
                except Exception as error:
                    self.send_error(502, str(error))
                    return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

def main():
    # Set directory to project root
    script_dir = Path(__file__).resolve().parent
    os.chdir(script_dir)

    bind_address = HOST
    server_address = (bind_address, PORT)

    handler = partial(BlockStudioHandler, directory=str(script_dir))
    try:
        httpd = ThreadingHTTPServer(server_address, handler)
    except OSError as err:
        print(f"[ERROR] Could not start server on {HOST}:{PORT}: {err}", flush=True)
        sys.exit(1)

    url = f"http://{HOST}:{PORT}/"
    print("=" * 60, flush=True)
    print(f"🚀 {APP_NAME} ({ENV}) is running!", flush=True)
    print(f"🌐 Local URL: {url}", flush=True)
    print(f"📁 Serving:   {script_dir}", flush=True)
    print("=" * 60, flush=True)
    print("Press Ctrl+C to stop the server.\n", flush=True)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        httpd.server_close()

if __name__ == "__main__":
    main()
