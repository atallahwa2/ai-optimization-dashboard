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

const steps = ['Model Settings', 'Advanced Configuration', 'Confirmation'];

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
    gpuType: 'A100',
    gpuCount: 1,
    autoSelectHardware: false,
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
    } else if (activeStep === 0 && !showAdvanced) {
      // Skip the advanced configuration step if user hasn't toggled advanced settings
      setActiveStep(2); // Go directly to confirmation
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 2 && !showAdvanced) {
      // If we're at confirmation and skipped advanced, go back to basic settings
      setActiveStep(0);
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setShowAdvanced(false);
    setFormData({
      modelLink: '',
      gpuType: 'A100',
      gpuCount: 1,
      autoSelectHardware: false,
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
        // Basic validation - just need model link and hardware selection
        return formData.modelLink.trim() !== '' && 
               (formData.autoSelectHardware || (formData.gpuType && formData.gpuCount > 0));
      case 1:
        // Advanced settings validation
        return true; // All advanced settings have defaults
      case 2:
        return true; // Confirmation step is always valid
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Basic settings
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
              sx={{ mt: 1, mb: 3 }}
            />
            
            <Typography variant="subtitle1" gutterBottom>
              Select hardware
            </Typography>
            
            <Box sx={{ mb: 2 }}>
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
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Button
                variant="text"
                color="primary"
                startIcon={<Settings />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ mb: 1 }}
              >
                {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
              </Button>

              {showAdvanced && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03), 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}>
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
                    sx={{ mb: 2 }}
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
                              {React.cloneElement(engine.icon, { fontSize: 'small' })}
                            </Box>
                            <Typography variant="body2">{engine.name}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
          </Box>
        );
      
      case 1: // Advanced configuration
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Optimization Target
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <RadioGroup
                name="optimizationMode"
                value={formData.optimizationMode}
                onChange={handleOptimizationModeChange}
              >
                <FormControlLabel 
                  value="general" 
                  control={<Radio />} 
                  label="General optimization" 
                />
                <FormControlLabel 
                  value="dataset" 
                  control={<Radio />} 
                  label="Dataset-specific optimization" 
                />
              </RadioGroup>
            </FormControl>
            
            {formData.optimizationMode === 'general' ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Choose what to optimize for:
                </Typography>
                <ToggleButtonGroup
                  value={formData.optimizationTarget}
                  exclusive
                  onChange={handleOptimizationTargetChange}
                  aria-label="optimization target"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  <ToggleButton 
                    value="Throughput" 
                    aria-label="throughput"
                    sx={{ 
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        }
                      }
                    }}
                  >
                    <Speed />
                    <Typography variant="body2">Throughput</Typography>
                  </ToggleButton>
                  <ToggleButton 
                    value="Latency" 
                    aria-label="latency"
                    sx={{ 
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        }
                      }
                    }}
                  >
                    <Timer />
                    <Typography variant="body2">Latency</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a specific dataset to optimize for:
                </Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel id="dataset-select-label">Dataset</InputLabel>
                  <Select
                    labelId="dataset-select-label"
                    name="optimizationDataset"
                    value={formData.optimizationDataset}
                    onChange={handleChange}
                    label="Dataset"
                  >
                    {datasetOptions.map((dataset) => (
                      <MenuItem key={dataset.id} value={dataset.id}>
                        <Box>
                          <Typography variant="body2">{dataset.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dataset.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Inference Engine
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the inference engine that will be used to serve your model.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {inferenceEngineOptions.map((engine) => (
                <Paper
                  key={engine.id}
                  onClick={() => handleInferenceEngineSelect(engine.id)}
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: formData.inferenceEngine === engine.id 
                      ? theme.palette.primary.main 
                      : theme.palette.divider,
                    bgcolor: formData.inferenceEngine === engine.id 
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'background.paper',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    },
                    borderRadius: 2,
                    transition: 'all 0.2s'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: formData.inferenceEngine === engine.id 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.grey[500], 0.1),
                        color: formData.inferenceEngine === engine.id 
                          ? theme.palette.primary.main
                          : theme.palette.grey[700],
                      }}
                    >
                      {engine.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {engine.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {engine.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );
        
      case 2: // Confirmation
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Summary
            </Typography>
            <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <p><strong>Model Link:</strong> {formData.modelLink}</p>
              <p><strong>GPU Configuration:</strong> {formData.gpuType} × {formData.gpuCount}</p>
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