import { useState } from "react";
import axios from "axios";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");

  const analyzeResume = async () => {
    if (!resume) {
      alert("Upload a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze",
        formData
      );

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error(error);
      alert("Error analyzing resume");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto" }}>
      <h1>AI Resume Checker</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setResume(e.target.files[0])}
      />

      <br />
      <br />

      <textarea
        rows="10"
        style={{ width: "100%" }}
        placeholder="Paste Job Description Here"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <br />
      <br />

      <button onClick={analyzeResume}>Analyze Resume</button>

      <br />
      <br />

      <pre>{analysis}</pre>
    </div>
  );
}

export default App;