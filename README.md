# Mzansi-Speak

Mzansi-Speak is a high-performance South African Text-to-Speech (TTS) engine relying on the `kokoro-onnx` inference engine, built with a Next.js frontend and FastAPI backend.

## Prerequisites

- Node.js (v18+)
- Python (3.10+)

## Running the Application Locally

The application is split into two components that must be run simultaneously: the backend API and the frontend UI.

### 1. Download the AI Model Weights

Before running the backend, you MUST download the `kokoro-onnx` neural network models, as they are too large to store in Git.

1. Open a terminal and navigate to the models directory:
   ```bash
   cd backend/data/models/
   ```
2. Download the ONNX model and the voices configuration:
   ```bash
   wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
   wget https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin -O voices.json
   ```

### 2. Start the Backend (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```
3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server (it will run on `http://localhost:8000`):
   ```bash
   python main.py
   ```

### 2. Start the Frontend (Next.js)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server (it will run on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

### 3. Usage

Once both servers are running, open your browser and navigate to `http://localhost:3000`. You will see the Mzansi-Speak playground where you can enter text, select a voice, and generate audio.

## Architecture

- **Backend**: FastAPI manages the web endpoints and rate limiting. It uses `kokoro-onnx` to generate audio directly from the model (`data/models/kokoro-v1.0.onnx`). Audio files are hashed (MD5) and saved in `data/outputs/` to cache repeated text queries.
- **Frontend**: Next.js 15 provides a beautiful glassmorphic Tailwind UI. Edge middleware is utilized for security policies (CSP) and preventing rendering issues.
