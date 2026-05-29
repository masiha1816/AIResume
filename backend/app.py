import os
import fitz
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(file):
    text = ""
    pdf = fitz.open(stream=file.read(), filetype="pdf")
    for page in pdf:
        text += page.get_text()
    return text

@app.route("/")
def home():
    return {"message": "AI Resume Checker Backend Running"}

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No resume uploaded"}), 400

    resume_file = request.files["resume"]
    job_description = request.form.get("job_description", "")

    resume_text = extract_text_from_pdf(resume_file)

    prompt = f"""
You are an expert resume reviewer and ATS analyst.

Analyze this resume against the job description.

Return:
1. Job match percentage
2. Missing keywords
3. Strengths
4. Weaknesses
5. Salary estimate
6. Interview questions

Resume:
{resume_text}

Job Description:
{job_description}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return jsonify({"analysis": response.choices[0].message.content})

if __name__ == "__main__":
    app.run(debug=True)