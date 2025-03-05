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

const steps = ['Model Source', 'Optimization Target', 'Hardware Configuration', 'Inference Engine', 'Confirmation'];

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
  const [formData, setFormData] = useState({
    modelLink: '',
    gpuType: 'auto',
    gpuCount: 1,
    autoSelectHardware: true,
    hardwareOptimization: 'performance', // 'performance' or 'costEfficiency'
    optimizationTarget: '',
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
    setFormData({
      modelLink: '',
      gpuType: 'auto',
      gpuCount: 1,
      autoSelectHardware: true,
      hardwareOptimization: 'performance',
      optimizationTarget: '',
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
        return formData.modelLink.trim() !== '';
      case 1:
        if (formData.optimizationMode === 'general') {
          return formData.optimizationTarget !== '';
        } else {
          return formData.optimizationDataset !== '';
        }
      case 2:
        if (formData.autoSelectHardware) {
          return formData.hardwareOptimization !== '';
        }
        return formData.gpuType !== '' && formData.gpuType !== 'auto';
      case 3:
        return formData.inferenceEngine !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
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
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select optimization target
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
                  <ToggleButton 
                    value="Dataset" 
                    aria-label="dataset"
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
                    <Storage />
                    <Typography variant="body2">Dataset</Typography>
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
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configure hardware
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Switch
                checked={formData.autoSelectHardware}
                onChange={handleAutoSelectHardwareChange}
                color="primary"
              />
              <Typography variant="body1" sx={{ ml: 1 }}>
                Auto-select optimal hardware
              </Typography>
            </Box>
            
            {formData.autoSelectHardware ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                  Choose hardware optimization strategy:
                </Typography>
                
                <Stack spacing={2}>
                  {hardwareOptimizationOptions.map((option) => (
                    <Card 
                      key={option.id}
                      variant="outlined"
                      onClick={() => handleHardwareOptimizationSelect(option.id)}
                      sx={{ 
                        cursor: 'pointer',
                        borderColor: formData.hardwareOptimization === option.id 
                          ? option.color 
                          : theme.palette.divider,
                        borderWidth: formData.hardwareOptimization === option.id ? 2 : 1,
                        boxShadow: formData.hardwareOptimization === option.id 
                          ? `0 0 0 1px ${alpha(option.color, 0.2)}` 
                          : 'none',
                        bgcolor: formData.hardwareOptimization === option.id 
                          ? alpha(option.color, 0.05)
                          : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: option.color,
                          bgcolor: alpha(option.color, 0.02)
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(option.color, 0.1),
                              color: option.color,
                              mr: 2
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: 'italic' }}>
                  Our system will automatically select the optimal hardware configuration based on your model and optimization preferences.
                </Typography>
              </Box>
            ) : (
              <Box>
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
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select inference engine
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the inference engine that will be used to serve your model.
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration Summary
            </Typography>
            <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <p><strong>Model Link:</strong> {formData.modelLink}</p>
              
              {formData.optimizationMode === 'general' ? (
                <p><strong>Optimization Target:</strong> {formData.optimizationTarget}</p>
              ) : (
                <p>
                  <strong>Dataset-Specific Optimization:</strong> {
                    datasetOptions.find(d => d.id === formData.optimizationDataset)?.name || ''
                  }
                </p>
              )}
              
              {formData.autoSelectHardware ? (
                <p>
                  <strong>Hardware:</strong> Auto-selected optimal hardware 
                  ({formData.hardwareOptimization === 'performance' ? 'Maximizing Performance' : 'Maximizing Performance per Dollar'})
                </p>
              ) : (
                <p><strong>GPU Configuration:</strong> {formData.gpuType} × {formData.gpuCount}</p>
              )}
              
              <p>
                <strong>Inference Engine:</strong> {
                  inferenceEngineOptions.find(e => e.id === formData.inferenceEngine)?.name || ''
                }
              </p>
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