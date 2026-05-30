import { useState } from "react";
import axios from "axios";
import "./App.css";
import aiko from "./assets/aiko.png";

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
      alert("Analysis failed");
    }

    setLoading(false);
  };

  return (
    <div className="app">

      <div className="hero">
        <div className="badge">🦊 AikoFox AI</div>

        <h1>AI Resume Checker</h1>

        <p>
          Let Aiko, your fox spirit career guide, review your resume,
          match it to a job, and prepare you for interviews.
        </p>
      </div>

      <div className="card">

        <label className="fileBox">
          {resume ? resume.name : "Upload your resume PDF"}

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files[0])}
          />
        </label>

        <textarea
          rows="8"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button onClick={analyzeResume}>
          Analyze Resume
        </button>

      </div>

      {loading && (
        <div className="aikoLoading">

          <img
            src={aiko}
            alt="Aiko"
            className="aikoImage"
          />

          <h2>🦊 Aiko is analyzing...</h2>

          <p>
            Reading resume... ✨
          </p>

        </div>
      )}

      {analysis && (
        <div className="results">

          <h2>🦊 Aiko's Resume Analysis</h2>

          <pre>
            {JSON.stringify(analysis, null, 2)}
          </pre>

        </div>
      )}

    </div>
  );
}

export default App;