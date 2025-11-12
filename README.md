# Meter Reader AI Agent

Ein API-basierter AI-Agent zur automatischen Erkennung von Zählerständen (Strom, Wasser, Gas) aus Bildern mit Claude Vision und Persistierung in Supabase.

## Features

- 🤖 **Claude Vision Integration**: Automatische Erkennung von Zählerständen, Zähler-IDs und Zählertypen
- 📸 **Bildverarbeitung**: Unterstützt JPEG, PNG, GIF, WebP
- 💾 **Supabase Integration**: Automatische Persistierung der Daten
- 📊 **REST API**: Einfache Endpoints für Upload und Abfrage
- 🔍 **Tracking**: Verlauf aller Messwerte pro Zähler

## Setup

### 1. Voraussetzungen

- Node.js 18+
- npm oder yarn
- Anthropic API Key
- Supabase Projekt

### 2. Installation

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env`:

```bash
cp .env.example .env
```

Fülle folgende Variablen aus:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGc...
PORT=3000
```

### 4. Supabase Datenbank einrichten

1. Gehe zu deinem Supabase Dashboard
2. Öffne den SQL Editor
3. Führe den Inhalt von `supabase_setup.sql` aus
4. Dies erstellt automatisch die notwendigen Tabellen und Indizes

### 5. Server starten

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/meter-reading

Lädt ein Bild hoch und erkennt den Zählerstand automatisch.

**Request:**
```bash
curl -X POST -F "image=@meter_photo.jpg" http://localhost:3000/api/meter-reading
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "meter_id": "1234567890",
    "meter_type": "electricity",
    "reading_value": 12345.67,
    "unit": "kWh",
    "confidence": "high",
    "supabase_id": 42
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Kein Bild hochgeladen"
}
```

### GET /api/readings

Ruft alle gespeicherten Zählerstände ab.

**Request:**
```bash
curl http://localhost:3000/api/readings
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "meter_id": "1234567890",
      "meter_type": "electricity",
      "reading_value": 12345.67,
      "unit": "kWh",
      "confidence": "high",
      "created_at": "2025-01-15T10:30:00Z"
    },
    ...
  ]
}
```

### GET /api/readings/:meter_id

Ruft alle Zählerstände für einen spezifischen Zähler ab.

**Request:**
```bash
curl http://localhost:3000/api/readings/1234567890
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "meter_id": "1234567890",
      "meter_type": "electricity",
      "reading_value": 12345.67,
      "unit": "kWh",
      "confidence": "high",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "meter_id": "1234567890",
      "meter_type": "electricity",
      "reading_value": 12346.01,
      "unit": "kWh",
      "confidence": "high",
      "created_at": "2025-01-15T11:30:00Z"
    }
  ]
}
```

### GET /health

Einfacher Health-Check.

```bash
curl http://localhost:3000/health
```

## Verwendungsbeispiele

### Python Client

```python
import requests

# Zählerstand hochladen
with open('meter_photo.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post(
        'http://localhost:3000/api/meter-reading',
        files=files
    )
    
result = response.json()
if result['success']:
    print(f"Zählerstand: {result['data']['reading_value']} {result['data']['unit']}")
    print(f"Zähler-ID: {result['data']['meter_id']}")
else:
    print(f"Fehler: {result['error']}")

# Alle Messwerte abrufen
response = requests.get('http://localhost:3000/api/readings')
readings = response.json()['data']
for reading in readings:
    print(f"{reading['meter_id']}: {reading['reading_value']} {reading['unit']}")
```

### JavaScript/Node.js Client

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadMeterReading(imagePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/meter-reading',
      form,
      { headers: form.getHeaders() }
    );
    
    console.log('Zählerstand erkannt:', response.data.data);
  } catch (error) {
    console.error('Fehler:', error.response.data);
  }
}

uploadMeterReading('meter_photo.jpg');
```

### cURL Examples

```bash
# Zählerstand hochladen
curl -X POST \
  -F "image=@meter_photo.jpg" \
  http://localhost:3000/api/meter-reading

# Letzte 10 Messwerte abrufen
curl http://localhost:3000/api/readings?limit=10

# Messwerte für einen Zähler
curl http://localhost:3000/api/readings/1234567890

# Health Check
curl http://localhost:3000/health
```

## Bildanforderungen

- **Format**: JPEG, PNG, GIF oder WebP
- **Größe**: Max 20 MB (AWS Lambda Limit)
- **Qualität**: Mindestens 640x480 Pixel
- **Beleuchtung**: Gute, helle Beleuchtung empfohlen
- **Winkel**: Zähler sollte deutlich sichtbar sein, idealerweise frontal fotografiert

## Zukunftserweiterungen

- [ ] Batch-Upload mehrerer Bilder
- [ ] OCR-Fallback wenn Claude nicht mit Bild zurechtkommt
- [ ] Automatische Anomalieerkennung (z.B. Rückwärtsdrehung)
- [ ] Export zu CSV/Excel
- [ ] Webhooks für automatische Benachrichtigungen
- [ ] Mobile App
- [ ] Authentifizierung und Multi-Tenant-Support

## Troubleshooting

**Fehler: "ANTHROPIC_API_KEY nicht gesetzt"**
- Stelle sicher, dass `.env` Datei mit gültigem API Key existiert

**Fehler: "Supabase Verbindung fehlgeschlagen"**
- Überprüfe SUPABASE_URL und SUPABASE_KEY
- Stelle sicher, dass Row Level Security richtig konfiguriert ist

**Claude erkennt Zählerstand nicht**
- Überprüfe Bildqualität und Beleuchtung
- Stelle sicher, dass der Zähler deutlich sichtbar ist
- Versuche ein neues Bild mit besserem Winkel

## Lizenz

MIT