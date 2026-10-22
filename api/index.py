"""Iris Flower Classification API Root / Health Check."""

from http.server import BaseHTTPRequestHandler
import json
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({
            "service": "CodeAlpha Iris Flower Classification API",
            "version": "1.0.0",
            "status": "healthy",
            "runtime": f"Python {sys.version.split()[0]}",
            "endpoints": {
                "predict": "/api/predict (POST)",
                "health": "/api (GET)"
            }
        }, indent=2).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
