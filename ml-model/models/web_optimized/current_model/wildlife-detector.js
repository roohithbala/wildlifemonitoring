/**
 * Wildlife Detection Helper
 * Easy integration for TensorFlow.js wildlife detection model
 */

class WildlifeDetector {
    constructor() {
        this.model = null;
        this.metadata = null;
        this.isLoaded = false;
    }

    async loadModel(modelPath = './') {
        try {
            console.log('🦁 Loading wildlife detection model...');
            console.log('📁 Model path:', modelPath);
            
            // Ensure TensorFlow.js is available
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js is not loaded. Please include the TensorFlow.js script.');
            }
            
            console.log('🔧 TensorFlow.js version:', tf.version.tfjs);
            console.log('🔧 Current backend:', tf.getBackend());
            
            // Load metadata first
            console.log('📋 Loading metadata...');
            const metadataUrl = modelPath + 'metadata.json';
            console.log('📋 Metadata URL:', metadataUrl);
            
            const response = await fetch(metadataUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
            }
            
            this.metadata = await response.json();
            console.log('✅ Metadata loaded:', this.metadata.model_info);
            
            // Load model
            console.log('🧠 Loading TensorFlow.js model...');
            const modelUrl = modelPath + 'model.json';
            console.log('🧠 Model URL:', modelUrl);
            
            this.model = await tf.loadLayersModel(modelUrl);
            console.log('✅ Model architecture loaded');
            console.log('📊 Model input shape:', this.model.inputs[0].shape);
            console.log('📊 Model output shape:', this.model.outputs[0].shape);
            
            // Verify model is ready
            if (!this.model) {
                throw new Error('Model failed to load properly');
            }
            
            this.isLoaded = true;
            console.log('✅ Wildlife detection model loaded successfully!');
            console.log(`🎯 Model supports ${Object.keys(this.metadata.species_mapping).length} species`);
            
            return true;
        } catch (error) {
            console.error('❌ Error loading model:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                modelPath: modelPath
            });
            this.isLoaded = false;
            return false;
        }
    }

    preprocessImage(imageElement) {
        if (!this.isLoaded) {
            throw new Error('Model not loaded yet!');
        }

        return tf.tidy(() => {
            const tensor = tf.browser.fromPixels(imageElement)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .div(255.0)
                .expandDims(0);
            return tensor;
        });
    }

    async predict(imageElement, topK = 5) {
        if (!this.isLoaded) {
            throw new Error('Model not loaded yet!');
        }

        try {
            // Preprocess image
            const preprocessed = this.preprocessImage(imageElement);
            
            // Make prediction
            const startTime = performance.now();
            const predictions = await this.model.predict(preprocessed).data();
            const processingTime = performance.now() - startTime;
            
            // Get top predictions
            const indexed = Array.from(predictions).map((p, i) => ({
                index: i,
                probability: p,
                species: this.metadata.species_mapping[i] || `Species ${i}`,
                confidence: Math.round(p * 100)
            }));
            
            indexed.sort((a, b) => b.probability - a.probability);
            const topPredictions = indexed.slice(0, topK);
            
            // Add confidence categories
            topPredictions.forEach(pred => {
                if (pred.probability >= this.metadata.confidence_thresholds.high_confidence) {
                    pred.confidenceLevel = 'high';
                } else if (pred.probability >= this.metadata.confidence_thresholds.medium_confidence) {
                    pred.confidenceLevel = 'medium';
                } else {
                    pred.confidenceLevel = 'low';
                }
            });
            
            // Clean up
            preprocessed.dispose();
            
            return {
                predictions: topPredictions,
                topPrediction: topPredictions[0],
                processingTime: Math.round(processingTime),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Prediction error:', error);
            throw error;
        }
    }

    getSpeciesInfo(speciesName) {
        const speciesIndex = Object.entries(this.metadata.species_mapping)
            .find(([index, name]) => name === speciesName)?.[0];
        
        if (!speciesIndex) return null;
        
        // Check which category this species belongs to
        let category = 'unknown';
        for (const [cat, indices] of Object.entries(this.metadata.detection_categories || {})) {
            if (indices.includes(speciesIndex)) {
                category = cat;
                break;
            }
        }
        
        return {
            index: parseInt(speciesIndex),
            name: speciesName,
            category: category
        };
    }

    dispose() {
        if (this.model) {
            this.model.dispose();
        }
        this.isLoaded = false;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WildlifeDetector;
} else if (typeof window !== 'undefined') {
    window.WildlifeDetector = WildlifeDetector;
}
