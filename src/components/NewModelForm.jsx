import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Paper,
  alpha,
  useTheme,
  Switch,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { 
  Speed, 
  Timer, 
  Storage, 
  Code, 
  AutoFixHigh, 
  Memory, 
  Settings,
  AttachMoney,
  Bolt
} from '@mui/icons-material';

const steps = ['Model Link', 'Hardware & Settings', 'Confirmation'];

const gpuOptions = [
  { value: 'auto', label: 'Auto-select optimal hardware' },
  { value: 'A100', label: 'NVIDIA A100' },
  { value: 'V100', label: 'NVIDIA V100' },
  { value: 'T4', label: 'NVIDIA T4' }
];

const datasetOptions = [
  { id: 'sharegpt', name: 'ShareGPT', description: '250/200 tokens in/out' },
  { id: 'longcontext', name: 'Long Context', description: '2000/500 tokens in/out' },
  { id: 'verylongcontext', name: 'Very Long Context', description: '100000/2000 tokens in/out' },
  { id: 'reasoning', name: 'Reasoning', description: '500/10000 tokens in/out' }
];

const inferenceEngineOptions = [
  { id: 'auto', name: 'Auto-select', description: 'Automatically choose the best engine', icon: <AutoFixHigh /> },
  { id: 'vLLM', name: 'vLLM', description: 'High throughput serving', icon: <Code /> },
  { id: 'SGLang', name: 'SGLang', description: 'Optimized for structured generation', icon: <Code /> },
  { id: 'TRT-LLM', name: 'TRT-LLM', description: 'NVIDIA TensorRT optimized', icon: <Code /> },
  { id: 'TGI', name: 'TGI', description: 'Text Generation Inference', icon: <Code /> }
];

const hardwareOptimizationOptions = [
  { 
    id: 'performance', 
    name: 'Maximize Performance', 
    description: 'Select hardware for best possible speed and throughput',
    icon: <Bolt />,
    color: '#2196f3'
  },
  { 
    id: 'costEfficiency', 
    name: 'Maximize Performance per Dollar', 
    description: 'Balance performance with cost efficiency',
    icon: <AttachMoney />,
    color: '#4caf50'
  }
];

function NewModelForm({ open, onClose, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    modelLink: '',
    gpuType: 'auto',
    gpuCount: 1,
    autoSelectHardware: true,
    hardwareOptimization: 'performance', // 'performance' or 'costEfficiency'
    optimizationTarget: 'Throughput', // Default to Throughput optimization
    optimizationMode: 'general', // 'general' or 'dataset'
    optimizationDataset: '',
    inferenceEngine: 'auto'
  });
  const theme = useTheme();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSubmit(formData);
      handleClose();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setShowAdvanced(false);
    setFormData({
      modelLink: '',
      gpuType: 'auto',
      gpuCount: 1,
      autoSelectHardware: true,
      hardwareOptimization: 'performance',
      optimizationTarget: 'Throughput',
      optimizationMode: 'general',
      optimizationDataset: '',
      inferenceEngine: 'auto'
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOptimizationTargetChange = (_, newValue) => {
    if (newValue) {
      setFormData({
        ...formData,
        optimizationTarget: newValue
      });
    }
  };

  const handleOptimizationModeChange = (e) => {
    setFormData({
      ...formData,
      optimizationMode: e.target.value,
      // Reset dataset if switching to general mode
      optimizationDataset: e.target.value === 'general' ? '' : formData.optimizationDataset
    });
  };

  const handleInferenceEngineSelect = (engineId) => {
    setFormData({
      ...formData,
      inferenceEngine: engineId
    });
  };

  const handleAutoSelectHardwareChange = (e) => {
    const autoSelect = e.target.checked;
    setFormData({
      ...formData,
      autoSelectHardware: autoSelect,
      gpuType: autoSelect ? 'auto' : (formData.gpuType === 'auto' ? '' : formData.gpuType)
    });
  };

  const handleHardwareOptimizationSelect = (optimizationId) => {
    setFormData({
      ...formData,
      hardwareOptimization: optimizationId
    });
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        // Model link validation
        return formData.modelLink.trim() !== '';
      case 1:
        // Hardware selection validation
        return formData.autoSelectHardware || (formData.gpuType && formData.gpuCount > 0);
      case 2:
        return true; // Confirmation step is always valid
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Step 1: Model Link
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter the Hugging Face model link or repository name
            </Typography>
            <TextField
              name="modelLink"
              label="Model Link"
              value={formData.modelLink}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="e.g., meta-llama/Llama-2-7b-chat-hf"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Enter the URL or repository name of the model you want to optimize
            </Typography>
          </Box>
        );
      
      case 1: // Step 2: Hardware & Settings
        return (
          <Box sx={{ mt: 2 }}>
            {/* Hardware Selection */}
            <Typography variant="subtitle1" gutterBottom>
              Select hardware
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Switch
                  checked={formData.autoSelectHardware}
                  onChange={handleAutoSelectHardwareChange}
                  color="primary"
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  Auto-select optimal hardware (recommended)
                </Typography>
              </Box>
              
              {!formData.autoSelectHardware ? (
                <>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="gpu-type-label">GPU Type</InputLabel>
                    <Select
                      labelId="gpu-type-label"
                      name="gpuType"
                      value={formData.gpuType}
                      onChange={handleChange}
                      label="GPU Type"
                    >
                      {gpuOptions.filter(gpu => gpu.value !== 'auto').map((gpu) => (
                        <MenuItem key={gpu.value} value={gpu.value}>{gpu.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel id="gpu-count-label">GPU Count</InputLabel>
                    <Select
                      labelId="gpu-count-label"
                      name="gpuCount"
                      value={formData.gpuCount}
                      onChange={handleChange}
                      label="GPU Count"
                    >
                      {[1, 2, 4, 8].map((count) => (
                        <MenuItem key={count} value={count}>{count}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    mr: 2
                  }}>
                    <Bolt />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Performance-optimized hardware will be selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our system will automatically choose the best hardware configuration for your model
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Advanced Settings Section */}
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Settings sx={{ mr: 1, fontSize: '1.2rem' }} />
              Advanced Settings (Optional)
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Optimization Target
              </Typography>
              <ToggleButtonGroup
                value={formData.optimizationTarget}
                exclusive
                onChange={handleOptimizationTargetChange}
                aria-label="optimization target"
                fullWidth
                size="small"
                sx={{ mb: 3 }}
              >
                <ToggleButton value="Throughput" aria-label="throughput">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Speed sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">Throughput</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="Latency" aria-label="latency">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer sx={{ mr: 1, fontSize: '1rem' }} />
                    <Typography variant="body2">Latency</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Typography variant="subtitle2" gutterBottom>
                Inference Engine
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="inference-engine-label">Inference Engine</InputLabel>
                <Select
                  labelId="inference-engine-label"
                  name="inferenceEngine"
                  value={formData.inferenceEngine}
                  onChange={handleChange}
                  label="Inference Engine"
                >
                  {inferenceEngineOptions.map((engine) => (
                    <MenuItem key={engine.id} value={engine.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          {engine.icon}
                        </Box>
                        <Typography variant="body2">{engine.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );
        
      case 2: // Step 3: Confirmation
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Summary
            </Typography>
            <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <p><strong>Model Link:</strong> {formData.modelLink}</p>
              
              {formData.autoSelectHardware ? (
                <p><strong>Hardware:</strong> <em>Auto-select optimal hardware</em></p>
              ) : (
                <p><strong>GPU Configuration:</strong> {formData.gpuType} × {formData.gpuCount}</p>
              )}
              
              <p><strong>Optimization Target:</strong> {formData.optimizationTarget}</p>
              <p>
                <strong>Inference Engine:</strong> {
                  inferenceEngineOptions.find(e => e.id === formData.inferenceEngine)?.name || 'Auto-select'
                }
              </p>
              
              {formData.optimizationMode === 'dataset' && (
                <p>
                  <strong>Dataset-Specific Optimization:</strong> {
                    datasetOptions.find(d => d.id === formData.optimizationDataset)?.name || ''
                  }
                </p>
              )}
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Add New Model
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.08)
            }
          }}
        >
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            sx={{ 
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            Back
          </Button>
        )}
        <Button 
          onClick={handleNext}
          variant="contained"
          disabled={!isStepValid()}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#000000',
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: alpha(theme.palette.secondary.main, 0.5),
              color: alpha('#000000', 0.4)
            }
          }}
        >
          {activeStep === steps.length - 1 ? 'Add Model' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewModelForm; 