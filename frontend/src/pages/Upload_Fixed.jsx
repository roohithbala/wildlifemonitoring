import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, Image, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import wildlifeTensorFlowService from '../services/wildlifeTensorFlowClean';

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    handleFiles(imageFiles);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      result: null
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(item => item.id !== id);
      // Clean up object URL
      const removed = prev.find(item => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
    
    setResults(prev => prev.filter(result => result.id !== id));
  };

  const analyzeImages = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsAnalyzing(true);
    setResults([]);
    
    try {
      // Initialize the service if not already done
      if (!wildlifeTensorFlowService.isInitialized()) {
        await wildlifeTensorFlowService.initialize();
      }

      const analysisResults = [];
      
      for (const fileItem of selectedFiles) {
        try {
          console.log(`Analyzing image: ${fileItem.file.name}`);
          
          // Update status to analyzing
          setSelectedFiles(prev => 
            prev.map(item => 
              item.id === fileItem.id 
                ? { ...item, status: 'analyzing' }
                : item
            )
          );

          // Convert file to blob and analyze
          const blob = new Blob([fileItem.file], { type: fileItem.file.type });
          const result = await wildlifeTensorFlowService.analyzeImage(blob);
          
          const analysisResult = {
            id: fileItem.id,
            filename: fileItem.file.name,
            preview: fileItem.preview,
            result: result,
            status: 'completed',
            timestamp: new Date().toISOString()
          };
          
          analysisResults.push(analysisResult);
          
          // Update status to completed
          setSelectedFiles(prev => 
            prev.map(item => 
              item.id === fileItem.id 
                ? { ...item, status: 'completed', result }
                : item
            )
          );

          // Add to results
          setResults(prev => [...prev, analysisResult]);
          
        } catch (error) {
          console.error(`Error analyzing ${fileItem.file.name}:`, error);
          
          const errorResult = {
            id: fileItem.id,
            filename: fileItem.file.name,
            preview: fileItem.preview,
            error: error.message,
            status: 'error',
            timestamp: new Date().toISOString()
          };
          
          analysisResults.push(errorResult);
          
          // Update status to error
          setSelectedFiles(prev => 
            prev.map(item => 
              item.id === fileItem.id 
                ? { ...item, status: 'error', error: error.message }
                : item
            )
          );

          setResults(prev => [...prev, errorResult]);
        }
      }
      
    } catch (error) {
      console.error('Error during analysis:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    selectedFiles.forEach(item => {
      URL.revokeObjectURL(item.preview);
    });
    setSelectedFiles([]);
    setResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzing':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Image className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Analyze Images</h1>
        <p className="text-gray-600">
          Upload wildlife images to identify species using our AI model
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop images here or click to upload
        </h3>
        <p className="text-gray-500">
          Support for JPEG, PNG, WebP formats
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Selected Images ({selectedFiles.length})
            </h2>
            <div className="space-x-2">
              <button
                onClick={analyzeImages}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Images'}
              </button>
              <button
                onClick={clearAll}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((fileItem) => (
              <div key={fileItem.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="relative">
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    disabled={isAnalyzing}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileItem.file.name}
                  </p>
                  {getStatusIcon(fileItem.status)}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Show result if available */}
                {fileItem.result && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-900">
                      {fileItem.result.species || 'Unknown'}
                    </p>
                    {fileItem.result.confidence && (
                      <p className="text-xs text-gray-600">
                        Confidence: {(fileItem.result.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                )}

                {/* Show error if available */}
                {fileItem.error && (
                  <div className="mt-3 p-2 bg-red-50 rounded">
                    <p className="text-xs text-red-600">
                      Error: {fileItem.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Species
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={result.preview}
                            alt={result.filename}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                              {result.filename}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.result?.species || result.error ? 'Error' : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.result?.confidence 
                          ? `${(result.result.confidence * 100).toFixed(1)}%`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(result.status)}
                          <span className="ml-2 text-sm text-gray-600 capitalize">
                            {result.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;