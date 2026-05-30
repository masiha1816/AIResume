import { useState } from "react";
import axios from "axios";
import "./App.css";

const BACKEND_URL = "https://airesume-14xu.onrender.com";

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [optimizedResume, setOptimizedResume] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [step, setStep] = useState("Waiting for your resume...");

  const playChime = (type = "ding") => {
    if (!soundOn) return;

    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = type === "swish" ? 520 : 760;
    gain.gain.value = 0.04;

    oscillator.start();
    oscillator.stop(audio.currentTime + 0.15);
  };

  const runLoadingSteps = () => {
    const steps = [
      { text: "🦊 Reading your resume...", sound: "ding" },
      { text: "🎐 Matching your skills...", sound: "swish" },
      { text: "✨ Calculating ATS score...", sound: "ding" },
      { text: "🐾 Preparing interview questions...", sound: "swish" },
      { text: "🌸 Aiko is polishing your results...", sound: "ding" },
    ];

    steps.forEach((item, index) => {
      setTimeout(() => {
        setStep(item.text);
        playChime(item.sound);
      }, index * 1200);
    });
  };

  const analyzeResume = async () => {
    if (!resume) {
      alert("Upload a resume first");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Paste a job description first");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setOptimizedResume("");
    setResumeText("");
    runLoadingSteps();

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);

    try {
      const response = await axios.post(`${BACKEND_URL}/analyze`, formData);

      setAnalysis(response.data);

      if (response.data.resume_text) {
        setResumeText(response.data.resume_text);
      }

      setStep("🎉 Aiko finished your analysis!");
      playChime("ding");
    } catch (error) {
      console.error(error);
      alert("Error analyzing resume");
      setStep("Something went wrong.");
    }

    setLoading(false);
  };

  const generateOptimizedResume = async () => {
    if (!analysis) {
      alert("Analyze your resume first");
      return;
    }

    setLoadingResume(true);
    setOptimizedResume("");
    setStep("🦊 Aiko is tailoring your resume...");

    try {
      const response = await axios.post(`${BACKEND_URL}/generate_resume`, {
        analysis: analysis,
        job_description: jobDescription,
        resume_text: resumeText,
      });

      setOptimizedResume(response.data.resume);
      playChime("ding");
    } catch (error) {
      console.error(error);
      alert("Error generating optimized resume");
    }

    setLoadingResume(false);
  };

  const downloadResume = async () => {
    if (!optimizedResume) {
      alert("Generate a personalized resume first");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/download_resume`,
        { resume: optimizedResume },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "Aiko_Optimized_Resume.docx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error downloading resume");
    }
  };

  return (
    <div className="app">
      <button className="soundToggle" onClick={() => setSoundOn(!soundOn)}>
        {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
      </button>

      <div className="particles">
        <span>🌸</span>
        <span>✨</span>
        <span>🎐</span>
        <span>🐾</span>
        <span>🌙</span>
      </div>

      <div className="hero">
        <div className="badge">🦊 AikoFox AI</div>
        <h1>AI Resume Checker</h1>
        <p>
          Let Aiko, your fox spirit career guide, review your resume, match it
          to a job, and create a personalized resume tailored to the role.
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
          {loading ? "Aiko is analyzing..." : "Analyze Resume"}
        </button>

        {loading && (
          <div className="aikoLoading">
            <div className="fox">🦊</div>
            <p>{step}</p>
            <div className="dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {analysis && (
        <div className="results">
          <h2>🦊 Aiko's Resume Analysis</h2>

          <div className="scoreBox">
            <div className="scoreCircle">{analysis.match_score}%</div>
            <div>
              <h3>ATS Match Score</h3>
              <p>{analysis.summary}</p>
            </div>
          </div>

          <div className="scoreBar">
            <div
              className="scoreFill"
              style={{ width: `${analysis.match_score || 0}%` }}
            ></div>
          </div>

          <div className="grid">
            <div className="miniCard">
              <h3>✅ Strengths</h3>
              <ul>
                {analysis.strengths?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="miniCard">
              <h3>⚠️ Weaknesses</h3>
              <ul>
                {analysis.weaknesses?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="section">
            <h3>🏷 Missing Keywords</h3>
            <div className="keywords">
              {analysis.missing_keywords?.map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>💰 Salary Estimate</h3>
            <p className="salary">
              {analysis.salary_estimate?.low} - {analysis.salary_estimate?.high}
            </p>
            <p>{analysis.salary_estimate?.reasoning}</p>
          </div>

          <div className="section">
            <h3>🚀 Recommended Resume Changes</h3>
            <ul>
              {analysis.recommended_resume_changes?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3>🎤 Interview Questions</h3>
            <ol>
              {analysis.interview_questions?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          <button
            className="magicButton"
            onClick={generateOptimizedResume}
            disabled={loadingResume}
          >
            {loadingResume
              ? "🦊 Aiko is tailoring your resume..."
              : "✨ Generate Personalized Resume"}
          </button>
        </div>
      )}

      {loadingResume && (
        <div className="results optimizedResume">
          <h2>🦊 Aiko is working her magic...</h2>
          <p>Rewriting your resume to better match the job description.</p>
          <div className="fox">🦊</div>
        </div>
      )}

      {optimizedResume && (
        <div className="results optimizedResume">
          <h2>✨ Aiko's Personalized Resume</h2>

          <button className="magicButton" onClick={downloadResume}>
            📄 Download as DOCX
          </button>

          <pre>{optimizedResume}</pre>
        </div>
      )}
    </div>
  );
}

export default App;