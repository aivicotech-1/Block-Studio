"""
Block Studio - Local Development Server
Reads configuration from .env and serves the Block Studio application on localhost.
"""
import os
import sys
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

class BlockStudioHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler that disables caching and allows CORS for local development."""
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

    bind_address = "" if HOST in ("localhost", "127.0.0.1", "0.0.0.0") else HOST
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
