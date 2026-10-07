import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysisResults, setAnalysisResults] = useState([]);
  
  // State to hold the reviewer's typed feedback
  const [formData, setFormData] = useState({
    summary: '', issuesFound: '', priority: 'Low', suggestions: ''
  });

  const fileInputRef = useRef(null);

  // 1. Handle File Upload & Trigger ESLint Analysis
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const uploadedText = e.target.result;
      setCode(uploadedText);

      try {
        // Send the code to our Node.js Backend API
        const response = await axios.post('http://localhost:5000/api/analyze', {
          sourceCode: uploadedText
        });
        
        setAnalysisResults(response.data.issues);
        setActiveTab('analysis'); // Auto-switch to the analysis tab
      } catch (error) {
        console.error('Analysis failed', error);
        alert('Failed to analyze code. Make sure your Node.js backend is running!');
      }
    };
    reader.readAsText(file);
  };

  // 2. Handle Form Typing
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Save everything to MongoDB
  const handleSubmitReview = async () => {
    if (!code) {
      alert("Please upload some code first!");
      return;
    }

    try {
      const reviewPayload = {
        fileName: fileName,
        sourceCode: code,
        reviewerName: "Ilie Anutoiu", // Hardcoded for prototype simplicity
        automatedAnalysis: analysisResults,
        reviewerFeedback: formData
      };

      // Send the final package to our MongoDB via Node.js
      await axios.post('http://localhost:5000/api/reviews', reviewPayload);
      alert('Success! Review saved to MongoDB database.');
      
      // Clear the screen for the next review
      setCode('');
      setAnalysisResults([]);
      setFormData({ summary: '', issuesFound: '', priority: 'Low', suggestions: '' });
      
    } catch (error) {
      console.error('Submit failed', error);
      alert('Failed to save review to database.');
    }
  };

  return (
    <div className="app-container">
      <header className="top-nav">
        <h1>Intelligent Code Review Assistant</h1>
        
        {/* Hidden file input triggered by the button */}
        <input 
          type="file" 
          accept=".js" 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
          Upload .js File
        </button>
      </header>

      <main className="main-content">
        <section className="left-panel">
          <h2>The Code View {fileName && `(${fileName})`}</h2>
          <textarea 
            className="code-editor" 
            placeholder="Uploaded code will appear here..."
            value={code}
            readOnly
          ></textarea>
        </section>

        <section className="right-panel">
          <h2>The Assistant & Feedback</h2>
          
          <div className="tabs">
            <button 
              className={activeTab === 'analysis' ? 'active-tab' : 'tab'} 
              onClick={() => setActiveTab('analysis')}
            >
              1. Automated Analysis
            </button>
            <button 
              className={activeTab === 'form' ? 'active-tab' : 'tab'} 
              onClick={() => setActiveTab('form')}
            >
              2. Reviewer Form
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'analysis' && (
              <div className="analysis-box">
                {analysisResults.length === 0 ? (
                  <p>Upload a file to see ESLint results...</p>
                ) : (
                  <ul>
                    {analysisResults.map((issue, index) => (
                      <li key={index} style={{ color: issue.severity === 'Error' ? '#d9534f' : '#f0ad4e', marginBottom: '10px' }}>
                        <strong>Line {issue.line} ({issue.severity}):</strong> {issue.message} <em>({issue.ruleId})</em>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'form' && (
              <form className="reviewer-form">
                <label>Summary</label>
                <textarea name="summary" value={formData.summary} onChange={handleFormChange} placeholder="Overall summary..."></textarea>
                
                <label>Issues Found</label>
                <textarea name="issuesFound" value={formData.issuesFound} onChange={handleFormChange} placeholder="Describe issues..."></textarea>
                
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleFormChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                
                <label>Suggestions</label>
                <textarea name="suggestions" value={formData.suggestions} onChange={handleFormChange} placeholder="How to fix..."></textarea>
                
                <button type="button" className="submit-btn" onClick={handleSubmitReview}>
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;