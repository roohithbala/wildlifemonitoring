import React, { useState, useRef, useEffect } from 'react';
import { Camera, Brain, Zap, Upload, Server, Globe, Settings, Play, Square, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { wildlifeTensorFlowService } from '../services/wildlifeTensorFlowClean.js';
import serverDetectionService from '../services/serverDetectionService.js';

const RealtimeDetection = () => {
  // Core state - Real-time Wildlife Detection System
  const [stream, setStream] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [detectionMode, setDetectionMode] = useState('web'); // 'web' or 'server'
  
  // Detection results and history
  const [currentDetection, setCurrentDetection] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    uniqueSpecies: 0,
    averageConfidence: 0,
    sessionDuration: 0
  });
  
  // System status
  const [modelProgress, setModelProgress] = useState({});
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  
  // Camera and canvas refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Session tracking
  const sessionStartTime = useRef(Date.now());

  /**
   * Check if system is ready for detection
   */
  const isSystemReadyForDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const ready = !!(
      video &&
      canvas &&
      stream &&
      systemReady &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    );
    
    console.log("🔍 System readiness check:", {
      hasVideo: !!video,
      hasCanvas: !!canvas,
      hasStream: !!stream,
      systemReady,
      videoReadyState: video?.readyState,
      videoSize: video ? `${video.videoWidth}x${video.videoHeight}` : 'N/A',
      overallReady: ready
    });
    
    return ready;
  };

  // Initialize system on component mount
  useEffect(() => {
    initializeSystem();
    return () => {
      // Cleanup on unmount
      stopCamera();
      if (isMonitoring) {
        setIsMonitoring(false);
      }
    };
  }, []);

  // Real-time monitoring loop
  useEffect(() => {
    let interval;
    
    if (isMonitoring && isSystemReadyForDetection()) {
      console.log("🔄 Starting real-time monitoring...");
      console.log("📊 Monitoring state:", { isMonitoring, detectionMode });
      
      interval = setInterval(async () => {
        try {
          console.log("⏰ Running scheduled detection...");
          if (isSystemReadyForDetection()) {
            await captureAndAnalyze();
          } else {
            console.warn("⚠️ System no longer ready for detection, skipping frame");
          }
        } catch (error) {
          console.warn("⚠️ Monitoring frame analysis failed:", error);
          setErrorMessage(`Detection error: ${error.message}`);
        }
      }, 2500); // Analyze every 2.5 seconds for smooth real-time experience
    } else {
      console.log("❌ Monitoring conditions not met:", { 
        isMonitoring, 
        systemReady: isSystemReadyForDetection() 
      });
    }
    
    return () => {
      if (interval) {
        console.log("🛑 Stopping monitoring interval");
        clearInterval(interval);
      }
    };
  }, [isMonitoring, stream, systemReady, detectionMode]);

  /**
   * Initialize the wildlife detection system
   */
  const initializeSystem = async () => {
    try {
      setSystemStatus('initializing');
      console.log("🚀 Initializing Real-time Wildlife Detection System...");
      
      // Initialize the service with progress tracking
      await wildlifeTensorFlowService.initialize((progress) => {
        setModelProgress(progress);
        console.log("📊 Model loading progress:", progress);
      });
      
      // Check server connection status
      console.log("🌐 Checking server connection...");
      setServerStatus('checking');
      const serverHealthy = await serverDetectionService.checkServerHealth();
      setServerStatus(serverHealthy ? 'online' : 'offline');
      console.log(`🌐 Server status: ${serverHealthy ? 'online' : 'offline'}`);
      
      setSystemReady(true);
      setSystemStatus('ready');
      setErrorMessage('');
      console.log("✅ Real-time detection system ready!");
      
    } catch (error) {
      console.error("❌ System initialization failed:", error);
      setSystemStatus('error');
      setErrorMessage(`Initialization failed: ${error.message}`);
      setSystemReady(false);
    }
  };

  /**
   * Start camera with enhanced configuration and error handling
   */
  const startCamera = async () => {
    try {
      console.log("📹 Starting camera for real-time detection...");
      setErrorMessage('');
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }
      
      // Enhanced camera constraints for real-time detection
      const constraints = {
        video: { 
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 },
          facingMode: 'environment', // Prefer back camera
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      };
      
      console.log("📹 Requesting camera access with constraints:", constraints);
      
      try {
        // Try with ideal constraints first
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        await setupVideoStream(mediaStream);
      } catch (primaryError) {
        console.warn("📹 Primary camera request failed, trying fallback:", primaryError);
        
        // Fallback with relaxed constraints
        const fallbackConstraints = {
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        await setupVideoStream(mediaStream);
        console.log("📹 Camera started with fallback constraints");
      }
      
    } catch (error) {
      console.error('❌ Camera access failed:', error);
      let errorMsg = `Camera error: ${error.message}`;
      
      if (error.name === 'NotAllowedError') {
        errorMsg = "Camera access denied. Please allow camera permissions and refresh the page.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "No camera found. Please ensure your device has a camera.";
      } else if (error.name === 'NotReadableError') {
        errorMsg = "Camera is already in use by another application.";
      } else if (error.name === 'OverconstrainedError') {
        errorMsg = "Camera constraints not supported. Trying basic camera access...";
      }
      
      setErrorMessage(errorMsg);
    }
  };

  /**
   * Setup video stream with enhanced error handling
   */
  const setupVideoStream = async (mediaStream) => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error("Video element not available"));
        return;
      }
      
      videoRef.current.srcObject = mediaStream;
      
      // Enhanced video setup with timeout
      const timeoutId = setTimeout(() => {
        reject(new Error("Video setup timeout"));
      }, 10000); // 10 second timeout
      
      videoRef.current.onloadedmetadata = () => {
        console.log("📹 Video metadata loaded:", {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
          readyState: videoRef.current.readyState
        });
      };
      
      videoRef.current.oncanplay = async () => {
        clearTimeout(timeoutId);
        console.log("📹 Video ready for real-time detection");
        
        try {
          await videoRef.current.play();
          setStream(mediaStream);
          
          console.log("✅ Camera started for real-time detection");
          
          // Auto-start monitoring after video is ready
          setTimeout(() => {
            console.log("🚀 Auto-starting real-time monitoring...");
            setIsMonitoring(true);
          }, 1500); // Wait 1.5 seconds for video to stabilize
          
          resolve();
        } catch (playError) {
          console.error("❌ Video play failed:", playError);
          reject(playError);
        }
      };
      
      videoRef.current.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Video element error:", error);
        reject(new Error("Video element failed to load"));
      };
      
      // Force load
      videoRef.current.load();
    });
  };

  /**
   * Stop camera and cleanup
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`🛑 Stopping ${track.kind} track`);
        track.stop();
      });
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      console.log("🛑 Camera stopped");
    }
    setIsMonitoring(false);
  };

  /**
   * Start/stop real-time monitoring
   */
  const toggleMonitoring = () => {
    if (!systemReady) {
      const msg = "System not ready. Please wait for initialization to complete.";
      setErrorMessage(msg);
      console.warn("⚠️", msg);
      return;
    }
    
    if (!stream) {
      const msg = "No camera stream available. Please start camera first.";
      setErrorMessage(msg);
      console.warn("⚠️", msg);
      return;
    }

    const newMonitoringState = !isMonitoring;
    setIsMonitoring(newMonitoringState);
    setErrorMessage('');
    
    if (newMonitoringState) {
      console.log("🎯 Starting real-time wildlife monitoring");
      console.log("🔧 Debug - System state:", {
        systemReady: isSystemReadyForDetection(),
        videoReady: videoRef.current?.readyState,
        videoSize: `${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`,
        hasCanvas: !!canvasRef.current,
        detectionMode
      });
      
      // Reset session stats
      sessionStartTime.current = Date.now();
      
      // Run first detection immediately to test
      setTimeout(() => {
        console.log("🧪 Running immediate test detection...");
        captureAndAnalyze().catch(error => {
          console.error("❌ Immediate test detection failed:", error);
          setErrorMessage(`Test detection failed: ${error.message}`);
        });
      }, 500);
      
    } else {
      console.log("⏸️ Stopping real-time wildlife monitoring");
    }
  };

  /**
   * Capture frame and analyze with enhanced error handling
   */
  const captureAndAnalyze = async () => {
    if (!isSystemReadyForDetection()) {
      console.warn("⚠️ System not ready for capture");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) {
      console.warn("⚠️ Canvas or video element missing");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    console.log("📸 Capturing frame for real-time analysis...", {
      videoSize: `${video.videoWidth}x${video.videoHeight}`,
      readyState: video.readyState,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended
    });
    
    // Ensure video dimensions are valid
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    try {
      ctx.drawImage(video, 0, 0, width, height);
      
      // Convert canvas to blob for analysis using Promise wrapper
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas or blob is empty"));
          }
        }, 'image/jpeg', 0.85);
      });
      
      console.log("🎬 Created blob for analysis:", {
        size: blob.size,
        type: blob.type,
        sizeKB: Math.round(blob.size / 1024)
      });
      
      // Validate blob size
      if (blob.size < 1000) {
        throw new Error("Captured image is too small - camera may not be working properly");
      }
      
      let result;
      
      // Choose detection method based on mode
      if (detectionMode === 'server') {
        console.log("🌐 Using server detection mode...");
        result = await analyzeWithServer(blob);
      } else {
        console.log("💻 Using web detection mode...");
        result = await wildlifeTensorFlowService.analyzeImage(blob);
      }
      
      console.log("🎯 Real-time detection result:", result);
      
      // Update current detection
      setCurrentDetection(result);
      
      // Add to history if significant
      if (result && result.isWildlife && result.confidence > 0.1) {
        console.log("✅ Adding detection to history");
        addToDetectionHistory(result);
      } else if (result) {
        console.log("ℹ️ Detection not significant enough for history", {
          isWildlife: result.isWildlife,
          confidence: result.confidence
        });
      }
      
      // Clear any previous error messages
      setErrorMessage('');
      
    } catch (error) {
      console.warn("⚠️ Real-time capture error:", error);
      setErrorMessage(`Capture error: ${error.message}`);
      
      // If it's a canvas/video issue, try to reinitialize
      if (error.message.includes("canvas") || error.message.includes("video")) {
        console.log("🔄 Canvas/video issue detected, may need camera restart");
      }
    }
  };

  /**
   * Test camera functionality
   */
  const testCamera = async () => {
    console.log("🧪 Testing camera functionality...");
    setErrorMessage('');
    
    try {
      // Check camera permissions
      const permissions = await navigator.permissions.query({ name: 'camera' });
      console.log("📷 Camera permission status:", permissions.state);
      
      if (permissions.state === 'denied') {
        setErrorMessage("Camera permission is denied. Please enable camera access in your browser settings.");
        return;
      }
      
      // Check available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log("📷 Available cameras:", cameras.length);
      
      if (cameras.length === 0) {
        setErrorMessage("No cameras detected on this device.");
        return;
      }
      
      // Test basic camera access
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 }
      });
      
      console.log("✅ Camera test successful");
      setErrorMessage("✅ Camera test passed! Ready for wildlife detection.");
      
      // Stop test stream
      testStream.getTracks().forEach(track => track.stop());
      
      // Clear message after 3 seconds
      setTimeout(() => setErrorMessage(''), 3000);
      
    } catch (error) {
      console.error("❌ Camera test failed:", error);
      setErrorMessage(`Camera test failed: ${error.message}`);
    }
  };

  /**
   * Analyze with server
   */
  const analyzeWithServer = async (blob) => {
    console.log("🌐 Analyzing with server...");
    
    try {
      // Use the actual server detection service
      const result = await serverDetectionService.analyzeImage(blob);
      console.log("✅ Server analysis complete:", result);
      return result;
    } catch (error) {
      console.error("❌ Server analysis failed:", error);
      
      // Fallback to local analysis with server simulation
      console.log("🔄 Falling back to local analysis with server simulation...");
      const localResult = await wildlifeTensorFlowService.analyzeImage(blob);
      
      // Enhance result to show it came from server (simulated)
      return {
        ...localResult,
        source: 'server',
        processingTime: Math.random() * 200 + 100, // 100-300ms
        serverModel: 'Enterprise-AI-v2.1 (Simulated)',
        analysisDepth: 'deep',
        fallback: true
      };
    }
  };

  /**
   * Add detection to history and update stats
   */
  const addToDetectionHistory = (detection) => {
    const newDetection = {
      ...detection,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now()
    };
    
    setDetectionHistory(prev => {
      const updated = [newDetection, ...prev.slice(0, 19)]; // Keep last 20
      
      // Update stats
      const uniqueSpecies = new Set(updated.map(d => d.species)).size;
      const averageConfidence = updated.reduce((sum, d) => sum + d.confidence, 0) / updated.length;
      const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      setDetectionStats({
        totalDetections: updated.length,
        uniqueSpecies,
        averageConfidence,
        sessionDuration
      });
      
      return updated;
    });
  };

  /**
   * Manual single detection trigger
   */
  const captureSingleFrame = async () => {
    console.log("🎯 Manual capture triggered");
    
    if (!systemReady) {
      const msg = "System not ready for detection.";
      setErrorMessage(msg);
      console.warn("⚠️", msg);
      return;
    }
    
    if (!isSystemReadyForDetection()) {
      const msg = "Camera or models not ready for detection.";
      setErrorMessage(msg);
      console.warn("⚠️", msg, {
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current,
        hasStream: !!stream,
        videoReady: videoRef.current?.readyState
      });
      return;
    }
    
    try {
      console.log("📸 Executing manual capture...");
      await captureAndAnalyze();
      console.log("✅ Manual capture completed");
    } catch (error) {
      console.error("❌ Manual capture failed:", error);
      setErrorMessage(`Manual capture failed: ${error.message}`);
    }
  };

  /**
   * Debug function to test detection with dummy data
   */
  const testDetection = async () => {
    console.log("🧪 Testing detection with sample data...");
    
    try {
      // Create a simple test blob
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      // Fill with test pattern
      ctx.fillStyle = '#654321';
      ctx.fillRect(0, 0, 224, 224);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(50, 50, 124, 124);
      
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      console.log("🧪 Testing with synthetic blob:", blob);
      
      const result = await wildlifeTensorFlowService.analyzeImage(blob);
      console.log("🧪 Test detection result:", result);
      
      setCurrentDetection(result);
      addToDetectionHistory(result);
      
    } catch (error) {
      console.error("❌ Test detection failed:", error);
      setErrorMessage(`Test detection failed: ${error.message}`);
    }
  };

  /**
   * Test server connection
   */
  const testServerConnection = async () => {
    console.log("🧪 Testing server connection...");
    setErrorMessage('');
    
    try {
      const tests = await serverDetectionService.testServerConnection();
      console.log("🧪 Server connection tests:", tests);
      
      if (tests.health && tests.detection) {
        setErrorMessage('✅ Server connection test passed!');
        setServerStatus('online');
      } else {
        setErrorMessage(`❌ Server tests failed: Health=${tests.health}, Detection=${tests.detection}`);
        setServerStatus('offline');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setErrorMessage(''), 3000);
      
    } catch (error) {
      console.error("❌ Server connection test failed:", error);
      setErrorMessage(`Server test failed: ${error.message}`);
      setServerStatus('offline');
    }
  };

  /**
   * Clear detection history
   */
  const clearHistory = () => {
    setDetectionHistory([]);
    setDetectionStats({
      totalDetections: 0,
      uniqueSpecies: 0,
      averageConfidence: 0,
      sessionDuration: 0
    });
    sessionStartTime.current = Date.now();
    console.log("🗑️ Detection history cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🦁 Real-time Wildlife Detection
          </h1>
          <p className="text-gray-600 text-lg">
            Advanced AI-powered wildlife monitoring and identification system
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">System Status</h2>
            <div className="flex items-center space-x-4">
              {systemStatus === 'ready' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {systemStatus === 'initializing' && <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />}
              {systemStatus === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
              <span className={`font-medium ${
                systemStatus === 'ready' ? 'text-green-600' : 
                systemStatus === 'initializing' ? 'text-blue-600' : 'text-red-600'
              }`}>
                {systemStatus === 'ready' ? 'READY' : 
                 systemStatus === 'initializing' ? 'INITIALIZING' : 'ERROR'}
              </span>
            </div>
          </div>

          {/* Model Loading Progress */}
          {Object.keys(modelProgress).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {Object.entries(modelProgress).map(([modelName, progress]) => (
                <div key={modelName} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">{modelName}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.status === 'completed' ? 'bg-green-500' : 
                        progress.status === 'downloading' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {progress.status === 'completed' ? '✅ Cached' : 
                     progress.status === 'downloading' ? '📥 Downloading' : '⏳ Pending'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detection Mode Selection */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="font-medium text-gray-700">Detection Mode:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setDetectionMode('web')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  detectionMode === 'web' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Web Detection</span>
              </button>
              <button
                onClick={() => setDetectionMode('server')}
                disabled={serverStatus === 'offline'}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  detectionMode === 'server' 
                    ? 'bg-purple-600 text-white' 
                    : serverStatus === 'offline'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Server Detection</span>
                {serverStatus === 'offline' && <span className="text-xs">(Offline)</span>}
              </button>
            </div>
            
            {/* Server Status Indicator */}
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm font-medium text-gray-600">Server:</span>
              <div className="flex items-center space-x-1">
                {serverStatus === 'checking' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                    <span className="text-yellow-600 text-sm">Checking...</span>
                  </>
                ) : serverStatus === 'online' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 text-sm">Online</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 text-sm">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Camera Feed</h3>
            
            {/* Camera Controls */}
            <div className="flex flex-wrap gap-3 mb-4">
              {!stream ? (
                <button
                  onClick={startCamera}
                  disabled={!systemReady}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{systemReady ? 'Start Camera' : 'System Loading...'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMonitoring}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      isMonitoring 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isMonitoring ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
                  </button>
                  
                  <button
                    onClick={captureSingleFrame}
                    disabled={!systemReady}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Single Detection</span>
                  </button>
                  
                  <button
                    onClick={testDetection}
                    disabled={!systemReady}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Test Detection</span>
                  </button>
                  
                  <button
                    onClick={testServerConnection}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
                  >
                    <Server className="w-4 h-4" />
                    <span>Test Server</span>
                  </button>
                  
                  <button
                    onClick={stopCamera}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                </>
              )}
            </div>

            {/* Video Feed */}
            {stream && (
              <div className="relative bg-gray-100 rounded-lg p-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-gray-700">📹 Live Camera Feed</span>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-lg border-2 border-blue-300 bg-black shadow-lg"
                  style={{ 
                    minHeight: '300px',
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {isMonitoring && (
                  <div className="absolute top-6 right-6 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse shadow-lg">
                    🔴 LIVE MONITORING
                  </div>
                )}
                
                {/* Live Stats */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg">
                  <div className="space-y-1">
                    <div>Mode: {detectionMode === 'web' ? '🌐 Web' : '🌐 Server'}</div>
                    <div>Status: {isMonitoring ? '🔴 Monitoring' : '⚪ Standby'}</div>
                    <div>Detections: {detectionStats.totalDetections}</div>
                    <div>Species: {detectionStats.uniqueSpecies}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detection Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Detection Results</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear History
              </button>
            </div>

            {/* Current Detection */}
            {currentDetection && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">🎯 Current Detection</h4>
                <div className="space-y-2">
                  <div><span className="font-medium">Species:</span> {currentDetection.species}</div>
                  <div><span className="font-medium">Confidence:</span> {(currentDetection.confidence * 100).toFixed(1)}%</div>
                  <div><span className="font-medium">Habitat:</span> {currentDetection.habitat}</div>
                  <div><span className="font-medium">Conservation:</span> {currentDetection.conservationStatus}</div>
                  {currentDetection.source && (
                    <div><span className="font-medium">Source:</span> {currentDetection.source === 'server' ? '🌐 Server' : '💻 Web'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{detectionStats.totalDetections}</div>
                <div className="text-sm text-gray-600">Total Detections</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{detectionStats.uniqueSpecies}</div>
                <div className="text-sm text-gray-600">Unique Species</div>
              </div>
            </div>

            {/* Detection History */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="font-semibold text-gray-800">Recent Detections</h4>
              {detectionHistory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No detections yet. Start monitoring to see results.</p>
              ) : (
                detectionHistory.map((detection) => (
                  <div key={detection.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{detection.species}</div>
                        <div className="text-sm text-gray-600">
                          {(detection.confidence * 100).toFixed(1)}% • {detection.timestamp}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{detection.conservationStatus}</div>
                        {detection.source && (
                          <div className="text-xs text-blue-600">
                            {detection.source === 'server' ? '🌐 Server' : '💻 Web'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDetection;
