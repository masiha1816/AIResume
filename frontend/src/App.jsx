import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!resume) {
      alert("Upload a resume first");
      return;
    }

    setLoading(true);
    setAnalysis("");

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    try {
      const response = await axios.post(
        "https://airesume-14xu.onrender.com/analyze",
        formData
      );

      setAnalysis(response.data.analysis);
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
          <h2>Resume Analysis</h2>
          <pre>{analysis}</pre>
        </div>
      )}
    </div>
  );
}

export default App;