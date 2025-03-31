/**
 * This file manages the real-time status tracking of app generation
 */

// Event emitter for generation status updates
class GenerationStatusEmitter {
  constructor() {
    this.listeners = [];
    this.status = {
      isGenerating: false,
      steps: [],
      progress: 0,
      currentStep: '',
      files: [],
      error: null
    };
  }

  // Subscribe to status updates
  subscribe(callback) {
    this.listeners.push(callback);
    // Immediately call with current status
    callback(this.status);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Update status and notify listeners
  updateStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
    this.notifyListeners();
  }

  // Start the generation process
  startGeneration(service, model, appIdea) {
    this.status = {
      isGenerating: true,
      steps: [{
        time: new Date().toISOString(),
        message: `Starting app generation with ${service} (${model})`,
        type: 'info'
      }],
      progress: 0,
      currentStep: 'Initializing',
      files: [],
      error: null,
      service,
      model,
      appIdea
    };
    this.notifyListeners();
  }

  // Add a step to the generation process
  addStep(message, type = 'info') {
    const step = {
      time: new Date().toISOString(),
      message,
      type
    };
    this.status.steps.push(step);
    this.status.currentStep = message;
    this.notifyListeners();
    return step;
  }

  // Update progress percentage (0-100)
  updateProgress(progress) {
    this.status.progress = Math.min(Math.max(0, progress), 100);
    this.notifyListeners();
  }

  // Add a file that has been created
  addFile(file) {
    this.status.files.push(file);
    this.addStep(`Created file: ${file.name}`, 'file');
  }

  // Set an error
  setError(error) {
    this.status.error = error;
    this.addStep(`Error: ${error.message || error}`, 'error');
  }

  // Complete the generation process
  completeGeneration() {
    this.status.isGenerating = false;
    this.status.progress = 100;
    this.addStep('Generation completed successfully', 'success');
  }

  // Notify all listeners of status changes
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }
}

// Create a singleton instance
export const generationStatus = new GenerationStatusEmitter();

// Helper functions
export const startGeneration = (service, model, appIdea) => 
  generationStatus.startGeneration(service, model, appIdea);

export const addGenerationStep = (message, type) => 
  generationStatus.addStep(message, type);

export const updateGenerationProgress = (progress) => 
  generationStatus.updateProgress(progress);

export const addGeneratedFile = (file) => 
  generationStatus.addFile(file);

export const setGenerationError = (error) => 
  generationStatus.setError(error);

export const completeGeneration = () => 
  generationStatus.completeGeneration(); 