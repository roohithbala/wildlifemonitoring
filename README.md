# Wildlife Monitoring and Detection System 🦅

A powerful AI-powered wildlife monitoring system that detects, classifies, and tracks animals using TensorFlow/Keras with a modern React frontend and Express backend.

## 🌟 Features

- **AI/ML Model**: TensorFlow.js integration for real-time wildlife classification
- **Modern Frontend**: React + Vite with TailwindCSS for responsive design
- **Robust Backend**: Express.js with MongoDB for data management
- **Real-time Monitoring**: WebSocket support for live updates
- **Interactive Maps**: Geolocation tracking of wildlife sightings
- **Analytics Dashboard**: Charts and reports for monitoring data
- **User Authentication**: Secure login system with JWT
- **Dark Mode**: Toggle between light and dark themes
- **Export Functionality**: Generate PDF/CSV reports
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Tech Stack

### Frontend
- **React 18** with **Vite** for fast development
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Leaflet.js** for interactive maps
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time communication

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **TensorFlow.js Node** for ML inference

### AI/ML
- **TensorFlow.js** for browser-based inference
- **EfficientNet** models for image classification
- **Sharp** for image preprocessing

## 📁 Project Structure

```
wildlife-monitoring-system/
├── backend/                 # Express.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── uploads/           # File upload storage
│   ├── Dockerfile         # Backend Docker configuration
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS files
│   ├── public/            # Static assets
│   ├── Dockerfile         # Frontend Docker configuration
│   └── nginx.conf         # Nginx configuration
├── ml-model/              # ML model files
│   ├── models/            # Trained models
│   └── scripts/           # Training scripts
├── docker-compose.yml     # Docker Compose configuration
├── deploy.sh              # Unix deployment script
├── deploy.ps1             # Windows deployment script
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Docker & Docker Compose (for containerized deployment)
- Git

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd wildlife-monitoring-system
```

2. **Deploy with Docker**

For Windows (PowerShell):
```powershell
.\deploy.ps1
```

For Unix/Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2: Manual Development Setup

1. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Setup MongoDB**
- Install MongoDB locally or use MongoDB Atlas
- Update the MONGODB_URI in backend/.env

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wildlife-monitoring
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📱 Usage

### Getting Started

1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Images**: Upload wildlife images for AI classification
3. **View Results**: See detected species with confidence scores
4. **Monitor Dashboard**: Track wildlife activity with charts and maps
5. **Export Reports**: Generate PDF or CSV reports of your data

### Demo Credentials

For testing purposes, you can use these demo credentials:
- Email: demo@wildlifemonitor.com
- Password: demo123

### API Documentation

The backend provides RESTful APIs for:

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify JWT token

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences

#### Detections
- `POST /api/detections/analyze` - Upload and analyze image
- `GET /api/detections` - Get user's detections
- `GET /api/detections/:id` - Get single detection
- `DELETE /api/detections/:id` - Delete detection
- `PUT /api/detections/:id/verify` - Verify detection (admin/researcher)

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/species/:species` - Get species-specific analytics
- `GET /api/analytics/heatmap` - Get location heatmap data
- `GET /api/analytics/export` - Export analytics data

## 🔌 Real-time Features

The application uses Socket.io for real-time communication:

### Socket Events
- `detection-processing` - Image analysis started
- `detection-completed` - Analysis completed with results
- `detection-error` - Analysis failed
- `rare-species-detected` - Rare species notification

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose build --no-cache
```

## 🚀 Deployment

### Using Docker Compose
The easiest way to deploy is using the provided Docker Compose configuration:

```bash
docker-compose up -d
```

### Manual Deployment

1. **Deploy Backend**
   - Use services like Heroku, Render, or AWS
   - Set environment variables
   - Connect to MongoDB Atlas

2. **Deploy Frontend**
   - Use services like Vercel, Netlify, or AWS S3
   - Update API base URL
   - Build and deploy

3. **Database**
   - Use MongoDB Atlas for production
   - Set up proper indexes and security

## 🔒 Security

- JWT authentication for API access
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Rate limiting
- Security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TensorFlow.js team for making ML accessible in the browser
- EfficientNet model creators for excellent pre-trained models
- Open source wildlife datasets for training data
- React and Vite communities for amazing development tools
- MongoDB team for the excellent database solution

## 📞 Support

If you have any questions or issues, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Join our community discussions

## 🗺️ Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced ML models (YOLO for object detection)
- [ ] Video analysis capabilities
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with wildlife databases
- [ ] Camera trap integration
- [ ] Automated species identification workflows

---

Made with ❤️ for wildlife conservation