# Wildlife Monitoring System - Frontend

A comprehensive real-time wildlife detection system built with React and advanced AI models.

## 🌟 Features

### Real-time Detection System
- **Dedicated Real-time Detection Page**: `/realtime` - Complete separation from upload functionality
- **Dual Detection Modes**: 
  - **Web Detection**: Local TensorFlow.js processing for instant results
  - **Server Detection**: Cloud-based AI analysis with enterprise models
- **Live Camera Monitoring**: Real-time wildlife detection with enhanced video display
- **Detection History**: Session tracking with species variety and statistics
- **Server Status Monitoring**: Real-time server connection status with fallback capabilities

### Enhanced AI Capabilities
- **15 Species Detection**: Comprehensive wildlife database with scientific names
- **Intelligent Species Selection**: Variety-forcing algorithms prevent repetitive detections
- **Model Caching System**: localStorage-based model persistence for faster loading
- **Confidence Scoring**: Advanced accuracy metrics with habitat and conservation data

### User Interface
- **Protected Routes**: Authentication-based access control
- **Real-time Navigation**: Direct access to monitoring from main navigation
- **Session Statistics**: Live tracking of detections, species variety, and session duration
- **Error Handling**: Comprehensive error states with fallback mechanisms

## 🚀 Quick Start

### Development Server
```bash
npm run dev
```

### Access Real-time Detection
1. Navigate to `/realtime` from the main navigation
2. Click "Real-time Detection" with the Video icon
3. Choose between Web or Server detection modes
4. Start camera and begin real-time monitoring

## 🔧 Technical Setup

### Dependencies
- React + Vite for fast development
- TensorFlow.js for local AI processing
- React Router for navigation
- Lucide React for icons
- Tailwind CSS for styling

### Model Management
- Automatic model downloading and caching
- localStorage persistence for offline capabilities
- Progress tracking during initialization
- Multiple model formats support

## 🌐 Detection Modes

### Web Detection (Local)
- Uses TensorFlow.js models in browser
- Instant processing without server dependency
- 15 wildlife species coverage
- Offline capability with cached models

### Server Detection (Cloud)
- Enterprise AI models with deep analysis
- Enhanced accuracy and broader species coverage
- Metadata enrichment and scientific classification
- Automatic fallback to local processing

## 📱 Real-time Monitoring

### Camera Features
- Enhanced video constraints (1920x1080 ideal resolution)
- Environment camera preference for wildlife detection
- 30fps ideal frame rate for smooth monitoring
- Automatic video element management

### Detection Workflow
- 2.5-second analysis intervals for real-time experience
- Automatic history tracking for significant detections (>30% confidence)
- Session statistics with unique species counting
- Live detection display with confidence metrics

## 🔐 Authentication
- Protected route access to real-time detection
- Token-based authentication system
- User session management
- Secure API endpoints

## 📊 Analytics & Tracking
- Total detections per session
- Unique species variety counting
- Average confidence scoring
- Session duration tracking
- Detection history with timestamps

## 🛠️ Development Notes

### Expanding the ESLint configuration
If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled.

### Plugin Information
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
