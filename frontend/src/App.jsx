import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!resume) {
      alert("Upload a resume first");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    try {
      const response = await axios.post(
        "https://airesume-14xu.onrender.com/analyze",
        formData
      );

      setAnalysis(response.data);
    } catch (error) {
      console.error(error);
      alert("Error analyzing resume");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="hero">
        <div className="badge">AI Powered Resume Analyzer</div>
        <h1>AI Resume Checker</h1>
        <p>
          Upload your resume, paste a job description, and get an instant match
          score, missing keywords, strengths, weaknesses, salary estimate, and
          interview questions.
        </p>
      </div>

      <div className="card">
        <label className="fileBox">
          <span>{resume ? resume.name : "Upload your resume PDF"}</span>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files[0])}
          />
        </label>

        <textarea
          rows="10"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button onClick={analyzeResume} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {analysis && (
        <div className="results">
          <h2>ATS Match Score: {analysis.match_score}%</h2>

          <div className="scoreBar">
            <div
              className="scoreFill"
              style={{ width: `${analysis.match_score || 0}%` }}
            ></div>
          </div>

          <div className="section">
            <h3>Summary</h3>
            <p>{analysis.summary}</p>
          </div>

          <div className="grid">
            <div className="miniCard">
              <h3>Strengths</h3>
              <ul>
                {analysis.strengths?.map((item, index) => (
                  <li key={index}>✅ {item}</li>
                ))}
              </ul>
            </div>

            <div className="miniCard">
              <h3>Weaknesses</h3>
              <ul>
                {analysis.weaknesses?.map((item, index) => (
                  <li key={index}>⚠️ {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="section">
            <h3>Missing Keywords</h3>
            <div className="keywords">
              {analysis.missing_keywords?.map((item, index) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>Salary Estimate</h3>
            <p className="salary">
              {analysis.salary_estimate?.low} - {analysis.salary_estimate?.high}
            </p>
            <p>{analysis.salary_estimate?.reasoning}</p>
          </div>

          <div className="section">
            <h3>Recommended Resume Changes</h3>
            <ul>
              {analysis.recommended_resume_changes?.map((item, index) => (
                <li key={index}>🚀 {item}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3>Interview Questions</h3>
            <ol>
              {analysis.interview_questions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;