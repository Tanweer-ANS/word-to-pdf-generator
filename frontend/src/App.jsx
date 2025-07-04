import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://word-to-pdf-generator-1.onrender.com/convert", formData, {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "converted.pdf";
      link.click();
    } catch (err) {
      alert("Conversion failed.");
      console.error(err);
    }
  };

  // Add/remove "dark" class from <html> based on state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="container">
      <h2>Word to PDF Converter</h2>
      <button onClick={() => setDarkMode(!darkMode)} style={{
        marginBottom: "1rem",
        backgroundColor: darkMode ? "#222" : "#ccc",
        color: darkMode ? "#fff" : "#000"
      }}>
        {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".docx" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Convert to PDF</button>
      </form>
    </div>
  );
}

export default App;
