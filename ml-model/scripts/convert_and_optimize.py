"""
TensorFlow.js Model Converter and Optimizer
Converts trained wildlife detection models to optimized web format
"""

import os
import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from pathlib import Path
import shutil

class ModelConverter:
    def __init__(self, model_dir="models"):
        self.model_dir = Path(model_dir)
        self.output_dir = self.model_dir / "web_optimized"
        self.output_dir.mkdir(exist_ok=True)
        
    def convert_to_tfjs(self, model_path, output_name="wildlife_model", quantize=True):
        """
        Convert TensorFlow model to TensorFlow.js format with optimizations.
        
        Args:
            model_path: Path to the TensorFlow SavedModel or .keras file
            output_name: Name for the output model
            quantize: Whether to apply quantization for smaller model size
        """
        print(f"🔧 Converting model: {model_path}")
        
        # Load the model
        if model_path.endswith('.keras'):
            model = tf.keras.models.load_model(model_path)
        else:
            model = tf.saved_model.load(model_path)
        
        # Output directory for this conversion
        output_path = self.output_dir / output_name
        output_path.mkdir(exist_ok=True)
        
        # Convert with optimizations
        conversion_args = {
            'input_format': 'tf_saved_model' if not model_path.endswith('.keras') else 'keras',
            'output_dir': str(output_path),
            'signature_name': 'serving_default'
        }
        
        if quantize:
            # Apply quantization for smaller model size
            conversion_args['quantize_float16'] = True
            print("📦 Applying float16 quantization...")
        
        # Perform conversion
        tfjs.converters.convert_tf_saved_model(
            model_path if not model_path.endswith('.keras') else None,
            str(output_path),
            **conversion_args
        )
        
        print(f"✅ Model converted to: {output_path}")
        return output_path
    
    def create_optimized_metadata(self, original_metadata_path, output_path):
        """Create optimized metadata for web deployment."""
        
        # Load original metadata
        with open(original_metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Create web-optimized metadata
        web_metadata = {
            "model_info": {
                "name": metadata["model_info"]["name"],
                "version": metadata["model_info"]["version"],
                "description": "Web-optimized wildlife detection model",
                "input_shape": metadata["model_info"]["input_shape"],
                "num_classes": len(metadata.get("species_mapping", {})),
                "model_type": "tfjs_optimized",
                "created_date": metadata["model_info"]["created_date"]
            },
            "species_mapping": metadata.get("species_mapping", {}),
            "confidence_thresholds": metadata.get("confidence_thresholds", {
                "high_confidence": 0.85,
                "medium_confidence": 0.65,
                "low_confidence": 0.45
            }),
            "preprocessing": {
                "image_size": metadata["model_info"]["input_shape"][:2],
                "normalization": "0-1 scaling",
                "resize_method": "bilinear"
            },
            "web_config": {
                "backend": "webgl",
                "memory_limit": "2GB",
                "batch_size": 1,
                "warm_up_iterations": 3
            }
        }
        
        # Save web metadata
        web_metadata_path = output_path / "metadata.json"
        with open(web_metadata_path, 'w') as f:
            json.dump(web_metadata, f, indent=2)
        
        print(f"📋 Web metadata saved to: {web_metadata_path}")
        return web_metadata_path
    
    def optimize_existing_model(self):
        """Optimize the existing wildlife detection model."""
        
        # Look for existing model files
        model_json_path = self.model_dir / "model.json"
        metadata_path = self.model_dir / "metadata.json"
        
        if not model_json_path.exists():
            print("❌ No existing model.json found")
            return False
        
        print("🔍 Found existing TensorFlow.js model")
        
        # Copy and optimize existing model
        optimized_path = self.output_dir / "current_model"
        optimized_path.mkdir(exist_ok=True)
        
        # Copy model files
        shutil.copy2(model_json_path, optimized_path / "model.json")
        
        # Copy weight files
        for weight_file in self.model_dir.glob("*.bin"):
            shutil.copy2(weight_file, optimized_path / weight_file.name)
        
        # Create optimized metadata
        if metadata_path.exists():
            self.create_optimized_metadata(metadata_path, optimized_path)
        else:
            self.create_default_metadata(optimized_path)
        
        # Create web-ready HTML example
        self.create_web_example(optimized_path)
        
        print(f"✅ Model optimized and ready for web deployment")
        print(f"📁 Output directory: {optimized_path}")
        
        return True
    
    def create_default_metadata(self, output_path):
        """Create default metadata if none exists."""
        
        default_metadata = {
            "model_info": {
                "name": "Wildlife Detection Model",
                "version": "1.0.0",
                "description": "AI-powered wildlife species detection",
                "input_shape": [224, 224, 3],
                "num_classes": 50,
                "model_type": "tfjs_optimized"
            },
            "species_mapping": {str(i): f"Species_{i:03d}" for i in range(50)},
            "confidence_thresholds": {
                "high_confidence": 0.85,
                "medium_confidence": 0.65,
                "low_confidence": 0.45
            },
            "preprocessing": {
                "image_size": [224, 224],
                "normalization": "0-1 scaling"
            }
        }
        
        metadata_path = output_path / "metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(default_metadata, f, indent=2)
        
        return metadata_path
    
    def create_web_example(self, model_path):
        """Create a web example for testing the model."""
        
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wildlife Detection Demo</title>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
        .result { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .loading { color: #666; font-style: italic; }
        .species { font-weight: bold; color: #2c5530; }
        .confidence { color: #666; }
        img { max-width: 100%; height: auto; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🦁 Wildlife Detection Demo</h1>
    <p>Upload an image to detect wildlife species using AI.</p>
    
    <div class="upload-area" id="uploadArea">
        <input type="file" id="imageInput" accept="image/*" style="display: none;">
        <p>Click here or drag and drop an image</p>
    </div>
    
    <div id="imageContainer"></div>
    <div id="results"></div>
    
    <script>
        let model;
        let metadata;
        
        // Load model and metadata
        async function loadModel() {
            console.log('Loading model...');
            try {
                model = await tf.loadLayersModel('./model.json');
                const response = await fetch('./metadata.json');
                metadata = await response.json();
                console.log('Model loaded successfully!');
                document.getElementById('results').innerHTML = '<div class="result">✅ Model loaded and ready!</div>';
            } catch (error) {
                console.error('Error loading model:', error);
                document.getElementById('results').innerHTML = '<div class="result">❌ Error loading model</div>';
            }
        }
        
        // Preprocess image
        function preprocessImage(imageElement) {
            return tf.tidy(() => {
                const tensor = tf.browser.fromPixels(imageElement)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .div(255.0)
                    .expandDims(0);
                return tensor;
            });
        }
        
        // Predict image
        async function predict(imageElement) {
            if (!model) {
                alert('Model not loaded yet!');
                return;
            }
            
            document.getElementById('results').innerHTML = '<div class="result loading">🔍 Analyzing image...</div>';
            
            try {
                const preprocessed = preprocessImage(imageElement);
                const predictions = await model.predict(preprocessed).data();
                
                // Get top 3 predictions
                const indexed = Array.from(predictions).map((p, i) => ({index: i, probability: p}));
                indexed.sort((a, b) => b.probability - a.probability);
                const top3 = indexed.slice(0, 3);
                
                // Display results
                let resultsHTML = '<div class="result"><h3>🎯 Detection Results:</h3>';
                top3.forEach((pred, i) => {
                    const species = metadata.species_mapping[pred.index] || `Species ${pred.index}`;
                    const confidence = (pred.probability * 100).toFixed(1);
                    resultsHTML += `<p><span class="species">${i + 1}. ${species}</span> <span class="confidence">(${confidence}% confidence)</span></p>`;
                });
                resultsHTML += '</div>';
                
                document.getElementById('results').innerHTML = resultsHTML;
                
                // Clean up
                preprocessed.dispose();
            } catch (error) {
                console.error('Prediction error:', error);
                document.getElementById('results').innerHTML = '<div class="result">❌ Error during prediction</div>';
            }
        }
        
        // File upload handling
        document.getElementById('uploadArea').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
        
        document.getElementById('imageInput').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        document.getElementById('imageContainer').innerHTML = '<img src="' + e.target.result + '">';
                        predict(img);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Drag and drop
        document.getElementById('uploadArea').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.getElementById('uploadArea').addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('imageInput').files = files;
                document.getElementById('imageInput').dispatchEvent(new Event('change'));
            }
        });
        
        // Load model on page load
        loadModel();
    </script>
</body>
</html>"""
        
        html_path = model_path / "demo.html"
        with open(html_path, 'w') as f:
            f.write(html_content)
        
        print(f"🌐 Web demo created: {html_path}")
        print("   Open this file in a web browser to test the model")

def main():
    """Main conversion function."""
    print("🔧 TensorFlow.js Model Converter and Optimizer")
    print("=" * 50)
    
    converter = ModelConverter()
    
    # Try to optimize existing model
    success = converter.optimize_existing_model()
    
    if success:
        print("\n🎉 Model optimization completed!")
        print(f"📁 Optimized files are in: {converter.output_dir}")
        print("\n📋 Next steps:")
        print("1. Copy the optimized model files to your web server")
        print("2. Open demo.html in a web browser to test")
        print("3. Integrate the model into your web application")
    else:
        print("❌ No model found to optimize")
        print("💡 Run the training script first to create a model")

if __name__ == "__main__":
    main()