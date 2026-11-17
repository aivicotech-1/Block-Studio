@echo off
cd /d "%~dp0"
echo Open http://localhost:5500/?editor=python after the server starts.
python server.py
pause
