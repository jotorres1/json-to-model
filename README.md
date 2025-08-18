# JSON to Model Converter

A full-stack application that converts JSON into **Pydantic** or **TypeScript** models with support for nested objects. Designed for developers looking to quickly scaffold model definitions from raw JSON data.

## 🌐 Live Demo

➡️ [https://json-to-model.vercel.app](https://json-to-model.vercel.app)

---

## 🛠️ Features

- 🔄 Convert JSON into:
  - TypeScript Interfaces
  - Pydantic Models (Python)
- 🧠 Nested object support
- 🧪 Validates JSON input before processing
- ⚡ FastAPI backend
- 🧩 V0 + Tailwind CSS styled frontend

---

## 🧭 Project Structure

```
json-to-model/
│
├── backend/              # FastAPI backend
│   ├── api/              # Route definitions
│   ├── models/           # Request/response models
│   ├── services/         # Conversion logic
│   ├── utils/            # Type inference helpers
│   └── main.py           # Entry point
│
├── frontend/             # Next.js + Tailwind UI
│   └── app/              # UI pages and components
│
└── README.md
```

---

## 🧪 Sample Input

```json
{
  "name": "Alice",
  "age": 30,
  "is_active": true,
  "address": {
    "street": "123 Main St",
    "city": "Wonderland"
  },
  "tags": ["dev", "python"]
}
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv 
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

---

## 🤝 Contributing / Sponsors

This project is open-source and MIT licensed.  
If you build upon this and profit from it, consider sponsoring the author.

---

## 🪪 License

[MIT License](./LICENSE) © 2025 Jorge Torres
