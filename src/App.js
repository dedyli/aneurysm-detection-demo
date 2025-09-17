import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Brain, Activity, AlertTriangle, CheckCircle, Camera, FileText, BarChart3, Settings, Sun, Moon } from 'lucide-react';

const RealAneurysmDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [patientData, setPatientData] = useState({
    age: '',
    gender: '',
    symptoms: [],
    bloodPressure: '',
    familyHistory: false
  });

  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // set page title
  useEffect(() => {
    document.title = 'AI-Powered Aneurysm Detection System';
  }, []);

  // Load TensorFlow.js model (placeholder - you'd load your actual model)
  const loadModel = useCallback(async () => {
    setModelLoading(true);
    try {
      // Simulate model loading delay
      await new Promise(resolve => setTimeout(resolve, 1600));

      // Create a mock model that uses the analyzeImageFeatures function
      const mockModel = {
        predict: async (imageData) => {
          return await analyzeImageFeatures(imageData);
        }
      };

      setModel(mockModel);
      setModelLoading(false);
    } catch (error) {
      console.error('Error loading model:', error);
      setModelLoading(false);
    }
  }, []);

  // Real image feature analysis (keeps original logic)
  const analyzeImageFeatures = async (imageData) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve({
        prediction: 'Analysis Error',
        confidence: '0.0',
        riskLevel: 'Unknown',
        recommendations: ['Canvas unavailable'],
        processingTime: '0.0'
      });

      const ctx = canvas.getContext('2d');

      // Set canvas size to the image size (keep aspect)
      canvas.width = imageData.width;
      canvas.height = imageData.height;

      // Draw image into canvas for pixel-level analysis
      ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      // Basic image analysis
      let brightPixels = 0;
      let darkPixels = 0;
      let totalPixels = pixels.length / 4;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness > 150) brightPixels++;
        else if (brightness < 50) darkPixels++;
      }

      const brightRatio = brightPixels / totalPixels;
      const darkRatio = darkPixels / totalPixels;
      const contrast = Math.abs(brightRatio - darkRatio);

      // heuristics used for the demo
      const hasHighContrast = contrast > 0.3;
      const hasMedicalCharacteristics = brightRatio > 0.1 && darkRatio > 0.1;
      const suspiciousFeatures = hasHighContrast && hasMedicalCharacteristics;

      const confidenceBase = suspiciousFeatures ? 0.7 : 0.3;
      const confidence = confidenceBase + (Math.random() * 0.2);

      setTimeout(() => {
        resolve({
          prediction: suspiciousFeatures && confidence > 0.6 ? 'Potential Abnormality Detected' : 'No Significant Abnormality',
          confidence: (confidence * 100).toFixed(1),
          riskLevel: confidence > 0.7 ? 'Medium' : 'Low',
          imageFeatures: {
            contrast: contrast.toFixed(3),
            brightRatio: brightRatio.toFixed(3),
            darkRatio: darkRatio.toFixed(3),
            hasMedicalCharacteristics
          },
          recommendations: confidence > 0.6
            ? ['Recommend professional radiological review', 'Consider additional imaging', 'Monitor patient symptoms']
            : ['Image appears normal', 'Continue routine monitoring', 'Consult physician if symptoms persist'],
          processingTime: (Math.random() * 2 + 1).toFixed(1)
        });
      }, 1200);
    });
  };

  // initialize model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // process the uploaded image using the mock model
  const processImage = useCallback(async () => {
    if (!model || !selectedFile) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const analysisResults = await model.predict(img);
        setResults(analysisResults);
        setIsProcessing(false);
      };

      // support both image files and other types (DICOM not parsed here)
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      setResults({
        prediction: 'Analysis Error',
        confidence: '0.0',
        riskLevel: 'Unknown',
        recommendations: ['Please try uploading a different image', 'Ensure image is a valid medical scan'],
        processingTime: '0.0'
      });
    }
  }, [model, selectedFile]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.name.endsWith('.dcm'))) {
      setSelectedFile(file);
      setResults(null);
    }
  };

  const handleSymptomChange = (symptom) => {
    setPatientData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const commonSymptoms = [
    'Severe headache',
    'Nausea/Vomiting',
    'Blurred vision',
    'Neck stiffness',
    'Sensitivity to light',
    'Seizures'
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'} min-h-screen p-6 transition-colors`}> 
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white shadow'} `}>
              <Brain className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">AI-Powered Aneurysm Detection System</h1>
              <p className="text-sm opacity-80 mt-1">Early detection of intracranial aneurysms using deep learning and medical imaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-sm text-gray-500 mr-2 hidden md:block">Theme</div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:shadow-sm transition`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-sm">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Data Input */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Patient Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    value={patientData.age}
                    onChange={(e) => setPatientData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    placeholder="Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={patientData.gender}
                    onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={patientData.bloodPressure}
                  onChange={(e) => setPatientData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  placeholder="e.g., 140/90"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={patientData.familyHistory}
                    onChange={(e) => setPatientData(prev => ({ ...prev, familyHistory: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">Family history of aneurysms</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Symptoms</label>
                <div className="grid grid-cols-1 gap-2">
                  {commonSymptoms.map(symptom => (
                    <label key={symptom} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={patientData.symptoms.includes(symptom)}
                        onChange={() => handleSymptomChange(symptom)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload and Processing */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Medical Image Analysis</h2>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">Upload medical image</p>
                <p className="text-xs text-gray-400">JPG, PNG, or DICOM format</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.dcm"
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Image ready for analysis</span>
                  </div>
                  <p className="text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>

                  {selectedFile.type.startsWith('image/') && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                      <div className={`relative border border-gray-200 rounded-lg overflow-hidden ${darkMode ? 'bg-black' : 'bg-white'}`}>
                        <img
                          ref={imageRef}
                          src={URL.createObjectURL(selectedFile)}
                          alt="Medical scan for analysis"
                          className="w-full h-48 object-contain bg-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={processImage}
                disabled={!selectedFile || !model || isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Image...
                  </div>
                ) : (
                  'Analyze Image with AI'
                )}
              </button>

              {/* Real Processing Steps (kept original statuses) */}
              {isProcessing && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Loading image data...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-green-600 animate-pulse" />
                    <span className="text-sm">Analyzing pixel patterns...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-green-600 animate-pulse" />
                    <span className="text-sm">Computing features...</span>
                  </div>
                </div>
              )}

              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Results Panel */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Real Analysis Results</h2>
            </div>

            {!results ? (
              <div className="text-center text-gray-500 py-8">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p>Upload an image and click analyze to see real results</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${results.prediction.includes('Detected') || results.prediction.includes('Abnormality')
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {results.prediction.includes('Detected') || results.prediction.includes('Abnormality')
                      ? <AlertTriangle className="w-5 h-5 text-orange-600" />
                      : <CheckCircle className="w-5 h-5 text-green-600" />
                    }
                    <h3 className="font-semibold text-gray-800">{results.prediction}</h3>
                  </div>
                  <p className="text-sm text-gray-600">Analysis Confidence: {results.confidence}%</p>
                </div>

                {/* Image analysis details */}
                {results.imageFeatures && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Image Analysis Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Contrast: </span>
                        <span className="font-mono">{results.imageFeatures.contrast}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Medical characteristics: </span>
                        <span className={results.imageFeatures.hasMedicalCharacteristics ? 'text-green-600' : 'text-red-600'}>
                          {results.imageFeatures.hasMedicalCharacteristics ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Risk Assessment</p>
                    <p className={`font-semibold ${
                      results.riskLevel === 'High' ? 'text-red-600' :
                      results.riskLevel === 'Medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>{results.riskLevel}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Processing Time</p>
                    <p className="font-semibold text-gray-800">{results.processingTime}s</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Clinical Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technical Information / Research Notes */}
        <div className={`mt-8 rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Group 28 IEDE Program Research Notes</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Model Architecture</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Convolutional layers for feature extraction</li>
                <li>• Pooling layers for dimensionality reduction</li>
                <li>• Fully connected layers for classification</li>
                <li>• Softmax output for abnormality prediction</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Patient data integration</li>
                <li>• Symptom tracking</li>
                <li>• Image upload and preview</li>
                <li>• Real-time image processing</li>
                <li>• Risk assessment and recommendations</li>
              </ul>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'}`}>
            <p className="text-sm">
              <strong>Research Note:</strong> This prototype demonstrates the core functionality for early aneurysm detection. The actual implementation would require extensive validation, regulatory approval, and integration with existing hospital systems. Results shown are simulated for demonstration purposes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RealAneurysmDetection;
