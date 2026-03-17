from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()  # loads .env file

app = Flask(__name__, static_folder=".", static_url_path="")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))  

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    notes = data.get("notes", "").strip()
    if not notes:
        return jsonify({"error": "No notes provided"}), 400

    prompt = f"""You are a smart study assistant. Summarize the following notes clearly and concisely.
Use bullet points for key concepts. Keep it student-friendly.

NOTES:
{notes}

Provide:
1. A 2-3 sentence overview
2. Key points as bullet list
3. Important terms to remember"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return jsonify({"summary": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    notes = data.get("notes", "").strip()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question provided"}), 400

    context = f"Based on these notes:\n{notes}\n\n" if notes else ""
    prompt = f"""{context}Answer this student's question clearly and helpfully:
Question: {question}

Give a concise, accurate answer. If the notes don't cover the topic, use your general knowledge."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return jsonify({"answer": response.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
