import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Checkbox,
  CircularProgress,
  TextField,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { Upload, Storage, Speed, Timer } from '@mui/icons-material';

const steps = ['Select Dataset', 'Configure Hardware', 'Run Benchmark'];

const datasetOptions = [
  { 
    id: 'sharegpt', 
    name: 'ShareGPT', 
    description: '250/200 tokens in/out',
    icon: <Storage />
  },
  { 
    id: 'longcontext', 
    name: 'Long Context', 
    description: '2000/500 tokens in/out',
    icon: <Storage />
  },
  { 
    id: 'verylongcontext', 
    name: 'Very Long Context', 
    description: '100000/2000 tokens in/out',
    icon: <Storage />
  },
  { 
    id: 'reasoning', 
    name: 'Reasoning', 
    description: '500/10000 tokens in/out',
    icon: <Storage />
  },
  { 
    id: 'custom', 
    name: 'Upload your own', 
    description: 'Custom dataset',
    icon: <Upload />
  }
];

const hardwareOptions = [
  { id: 'a100', name: 'NVIDIA A100' },
  { id: 'v100', name: 'NVIDIA V100' },
  { id: 't4', name: 'NVIDIA T4' },
  { id: 'a10', name: 'NVIDIA A10' },
  { id: 'h100', name: 'NVIDIA H100' }
];

function BenchmarkDialog({ open, onClose, onBenchmarkComplete, modelId }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [customDatasetFile, setCustomDatasetFile] = useState(null);
  const [selectedHardware, setSelectedHardware] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [benchmarkResults, setBenchmarkResults] = useState(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setSelectedDataset('');
      setCustomDatasetFile(null);
      setSelectedHardware([]);
      setIsRunning(false);
      setProgress(0);
      setBenchmarkResults(null);
    }
  }, [open]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      if (benchmarkResults) {
        // If we have results, complete the benchmark and close
        onBenchmarkComplete(benchmarkResults);
      } else {
        // Otherwise, run the benchmark
        runBenchmark();
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    if (!isRunning) {
      onClose();
    }
  };

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  const handleHardwareToggle = (hardwareId) => {
    const currentIndex = selectedHardware.indexOf(hardwareId);
    const newSelectedHardware = [...selectedHardware];

    if (currentIndex === -1) {
      newSelectedHardware.push(hardwareId);
    } else {
      newSelectedHardware.splice(currentIndex, 1);
    }

    setSelectedHardware(newSelectedHardware);
  };

  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setCustomDatasetFile(event.target.files[0]);
    }
  };

  const runBenchmark = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate benchmark progress
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(timer);
          // Generate dummy results
          generateDummyResults();
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const generateDummyResults = () => {
    // Create dummy benchmark results
    const results = {
      dataset: datasetOptions.find(d => d.id === selectedDataset),
      hardware: selectedHardware.map(hw => {
        const hwInfo = hardwareOptions.find(h => h.id === hw);
        return {
          ...hwInfo,
          throughput: Math.round(50 + Math.random() * 100),
          latency: Math.round(20 + Math.random() * 80)
        };
      }),
      timestamp: new Date().toISOString()
    };
    
    setBenchmarkResults(results);
    setIsRunning(false);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        if (selectedDataset === 'custom') {
          return customDatasetFile !== null;
        }
        return selectedDataset !== '';
      case 1:
        return selectedHardware.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Dataset</FormLabel>
              <RadioGroup
                aria-label="dataset"
                name="dataset"
                value={selectedDataset}
                onChange={handleDatasetChange}
              >
                {datasetOptions.map((dataset) => (
                  <FormControlLabel
                    key={dataset.id}
                    value={dataset.id}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {dataset.icon}
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body1">{dataset.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dataset.description}
                          </Typography>
                        </Box>
                      </Box>
                    } 
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            {selectedDataset === 'custom' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                >
                  Upload Dataset
                  <input
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
                {customDatasetFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {customDatasetFile.name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Hardware Platforms (select multiple)
            </Typography>
            <List>
              {hardwareOptions.map((hardware) => (
                <ListItem key={hardware.id} dense button onClick={() => handleHardwareToggle(hardware.id)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedHardware.indexOf(hardware.id) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={hardware.name} />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      case 2:
        if (isRunning) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <CircularProgress variant="determinate" value={progress} size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Running Benchmark...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress}% Complete
              </Typography>
            </Box>
          );
        }
        
        if (benchmarkResults) {
          return (
            <Box>
              <Typography variant="h6" gutterBottom>Benchmark Results</Typography>
              <Typography variant="subtitle2">
                Dataset: {benchmarkResults.dataset.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {benchmarkResults.hardware.map((hw, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">{hw.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Chip 
                      icon={<Speed />} 
                      label={`Throughput: ${hw.throughput} queries/sec`} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      icon={<Timer />} 
                      label={`Latency: ${hw.latency} ms`} 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          );
        }
        
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ready to Run Benchmark
            </Typography>
            <Typography variant="body1">
              Dataset: {datasetOptions.find(d => d.id === selectedDataset)?.name}
            </Typography>
            <Typography variant="body1">
              Hardware: {selectedHardware.map(hw => 
                hardwareOptions.find(h => h.id === hw)?.name
              ).join(', ')}
            </Typography>
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
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={isRunning}
    >
      <DialogTitle>Run Benchmark</DialogTitle>
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
      <DialogActions>
        <Button onClick={handleClose} disabled={isRunning}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isRunning}>
            Back
          </Button>
        )}
        <Button 
          onClick={handleNext}
          variant="contained"
          disabled={!isStepValid() || isRunning}
        >
          {activeStep === steps.length - 1 ? 
            (benchmarkResults ? 'Done' : 'Run Benchmark') : 
            'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BenchmarkDialog; 