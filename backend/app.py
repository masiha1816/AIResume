import os
import json
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
        page_text = page.get_text()
        text += page_text + "\n"

    return text.strip()


@app.route("/")
def home():
    return jsonify({"message": "AI Resume Checker Backend Running"})


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume uploaded"}), 400

        resume_file = request.files["resume"]
        job_description = request.form.get("job_description", "")

        if not job_description.strip():
            return jsonify({"error": "No job description provided"}), 400

        resume_text = extract_text_from_pdf(resume_file)

        prompt = f"""
You are an expert resume reviewer, ATS analyst, recruiter, and career coach.

Analyze the resume against the job description.

Return ONLY valid JSON. Do not include markdown. Do not include backticks.

Use this exact JSON structure:

{{
  "match_score": 0,
  "summary": "Short 2-3 sentence summary of the resume fit.",
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2",
    "weakness 3"
  ],
  "missing_keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3"
  ],
  "salary_estimate": {{
    "low": "$0",
    "high": "$0",
    "reasoning": "Short explanation."
  }},
  "interview_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "recommended_resume_changes": [
    "change 1",
    "change 2",
    "change 3"
  ]
}}

Rules:
- match_score must be a number from 0 to 100.
- strengths should focus on relevant qualifications.
- weaknesses should be honest but professional.
- missing_keywords should come from the job description.
- recommended_resume_changes should be practical and specific.

Resume:
{resume_text}

Job Description:
{job_description}
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        raw_output = response.choices[0].message.content

        try:
            parsed_output = json.loads(raw_output)
        except json.JSONDecodeError:
            parsed_output = {
                "match_score": 0,
                "summary": raw_output,
                "strengths": [],
                "weaknesses": [],
                "missing_keywords": [],
                "salary_estimate": {
                    "low": "N/A",
                    "high": "N/A",
                    "reasoning": "Could not parse salary estimate."
                },
                "interview_questions": [],
                "recommended_resume_changes": []
            }

        return jsonify(parsed_output)

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)