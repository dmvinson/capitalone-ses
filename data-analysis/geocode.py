import json
import requests

GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse'

def reverse_geocode(coords):
    resp = requests.get(GEOCODE_URL, params={
        'format': 'jsonv2',
        'lat': coords[0],
        'lon': coords[1],
        'email': 'd.vinson@columbia.edu',
        'addressdetails': '1',
        'zoom':'18'
    })
    return resp.json()