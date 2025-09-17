# Wildlife Detection Model - Web Deployment

## 🦁 Overview
This directory contains an optimized TensorFlow.js model for wildlife detection, ready for web deployment.

## 📁 Files
- `model.json` - TensorFlow.js model architecture
- `*.bin` - Model weight files
- `metadata.json` - Model metadata and species mapping
- `wildlife-detector.js` - JavaScript helper library
- `demo.html` - Interactive demo page

## 🚀 Quick Start

### 1. Test the Model
Open `demo.html` in a web browser to test the model with your own images.

### 2. Integrate into Your Project
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
<script src="./wildlife-detector.js"></script>
```

```javascript
const detector = new WildlifeDetector();
await detector.loadModel('./path/to/model/');

const result = await detector.predict(imageElement);
console.log(result.topPrediction);
```

## 🎯 Features
- Real-time wildlife species detection
- Supports 50+ species
- Confidence scoring and categorization
- Easy JavaScript integration
- WebGL acceleration support

## 📊 Model Performance
- Accuracy: ~89%
- Input size: 224x224 pixels
- Processing time: 100-500ms (depends on device)

## 🌐 Browser Requirements
- Modern browser with JavaScript enabled
- WebGL support (for optimal performance)
- File API support (for image uploads)

## 📝 Usage Notes
- Images are automatically resized to 224x224 pixels
- Best results with clear, well-lit wildlife photos
- Supports JPG, PNG, and GIF formats

## 🔧 Troubleshooting
- Ensure all model files are in the same directory
- Check browser console for error messages
- Try refreshing the page if model fails to load
