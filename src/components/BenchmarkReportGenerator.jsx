import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  useTheme,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  Speed, 
  Timer, 
  AttachMoney, 
  CloudDownload,
  ArrowForward,
  Rocket,
  Check
} from '@mui/icons-material';

const hardwareOptions = [
  { id: 'a100-40gb', name: 'NVIDIA A100 40GB', cost: 3.0 },
  { id: 'a100-80gb', name: 'NVIDIA A100 80GB', cost: 4.1 },
  { id: 'h100', name: 'NVIDIA H100', cost: 5.5 },
  { id: 'v100', name: 'NVIDIA V100', cost: 2.5 },
  { id: 't4', name: 'NVIDIA T4', cost: 0.8 },
  { id: 'a10g', name: 'NVIDIA A10G', cost: 1.5 },
  { id: 'l4', name: 'NVIDIA L4', cost: 1.2 }
];

function BenchmarkReportGenerator() {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [modelLink, setModelLink] = useState('');
  const [selectedHardware, setSelectedHardware] = useState(
    hardwareOptions.reduce((acc, hw) => ({ ...acc, [hw.id]: true }), {})
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [deployingHardware, setDeployingHardware] = useState(null);

  const steps = ['Select Model', 'Choose Hardware', 'View Report'];

  const handleNext = () => {
    if (activeStep === 0 && !modelLink) {
      return; // Don't proceed if no model link
    }
    
    if (activeStep === 1) {
      // Generate report
      setIsGenerating(true);
      setTimeout(() => {
        generateMockReport();
        setIsGenerating(false);
        setActiveStep(prevStep => prevStep + 1);
      }, 2000);
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setModelLink('');
    setSelectedHardware(hardwareOptions.reduce((acc, hw) => ({ ...acc, [hw.id]: true }), {}));
    setReportData(null);
  };

  const handleHardwareChange = (event) => {
    setSelectedHardware({
      ...selectedHardware,
      [event.target.name]: event.target.checked
    });
  };

  const handleDeploy = (hardwareId) => {
    setDeployingHardware(hardwareId);
    
    // Simulate deployment process
    setTimeout(() => {
      setDeployingHardware(null);
      // Here you would typically redirect to a deployment page or show a success message
      alert(`Model deployed on ${hardwareId.includes('optimized') ? 'Mako-Optimized ' : ''}${hardwareOptions.find(hw => hw.id === hardwareId.replace('-optimized', '')).name}!`);
    }, 2000);
  };

  const generateMockReport = () => {
    const selectedHardwareList = hardwareOptions.filter(hw => selectedHardware[hw.id]);
    
    let mockData = [];
    
    selectedHardwareList.forEach(hw => {
      // Generate realistic but random performance data for standard version
      const baseLatency = hw.id.includes('a100') ? 120 : 
                          hw.id.includes('h100') ? 90 : 
                          hw.id.includes('v100') ? 180 : 
                          hw.id.includes('l4') ? 220 : 250;
      
      const baseThroughput = hw.id.includes('a100') ? 140 : 
                             hw.id.includes('h100') ? 190 : 
                             hw.id.includes('v100') ? 100 : 
                             hw.id.includes('l4') ? 80 : 60;
      
      // Add some randomness
      const latency = (baseLatency + (Math.random() * 20 - 10)).toFixed(1);
      const throughput = (baseThroughput + (Math.random() * 20 - 10)).toFixed(1);
      const throughputPerDollar = (parseFloat(throughput) / hw.cost).toFixed(2);
      
      // Add standard version
      mockData.push({
        ...hw,
        id: hw.id,
        name: hw.name,
        isOptimized: false,
        latency,
        throughput,
        throughputPerDollar
      });
      
      // Add Mako-Optimized version with better performance
      // Improvement factors: 30-40% better throughput, 20-30% better latency
      const optimizationThroughputFactor = 1.3 + (Math.random() * 0.1); // 1.3-1.4x improvement
      const optimizationLatencyFactor = 0.7 + (Math.random() * 0.1); // 0.7-0.8x (lower is better)
      
      const optimizedLatency = (parseFloat(latency) * optimizationLatencyFactor).toFixed(1);
      const optimizedThroughput = (parseFloat(throughput) * optimizationThroughputFactor).toFixed(1);
      const optimizedThroughputPerDollar = (parseFloat(optimizedThroughput) / hw.cost).toFixed(2);
      
      mockData.push({
        ...hw,
        id: `${hw.id}-optimized`,
        name: `${hw.name} (Mako-Optimized)`,
        isOptimized: true,
        latency: optimizedLatency,
        throughput: optimizedThroughput,
        throughputPerDollar: optimizedThroughputPerDollar
      });
    });
    
    // Group by hardware and sort groups by throughput
    // First, create a map of hardware to its standard and optimized entries
    const hardwareGroups = {};
    mockData.forEach(entry => {
      const baseId = entry.id.replace('-optimized', '');
      if (!hardwareGroups[baseId]) {
        hardwareGroups[baseId] = [];
      }
      hardwareGroups[baseId].push(entry);
    });
    
    // Sort each group to ensure standard version is followed by optimized version
    Object.values(hardwareGroups).forEach(group => {
      group.sort((a, b) => a.isOptimized ? 1 : -1);
    });
    
    // Sort groups by the throughput of their standard versions
    const sortedGroups = Object.values(hardwareGroups).sort((groupA, groupB) => {
      const standardA = groupA.find(entry => !entry.isOptimized);
      const standardB = groupB.find(entry => !entry.isOptimized);
      return parseFloat(standardB.throughput) - parseFloat(standardA.throughput);
    });
    
    // Flatten the sorted groups into a new array
    mockData = sortedGroups.flatMap(group => group);
    
    // Find best throughput per dollar and performance
    // Reset all previous flags first
    mockData.forEach(item => {
      item.isBestPerformance = false;
      item.isBestValue = false;
    });
    
    // Find entry with highest throughput
    const highestThroughputEntry = mockData.reduce((highest, item) => 
      parseFloat(item.throughput) > parseFloat(highest.throughput) ? item : highest, mockData[0]);
      
    // Find entry with highest throughput per dollar
    const highestValueEntry = mockData.reduce((highest, item) => 
      parseFloat(item.throughputPerDollar) > parseFloat(highest.throughputPerDollar) ? item : highest, mockData[0]);
    
    // Mark only these two entries
    highestThroughputEntry.isBestPerformance = true;
    highestValueEntry.isBestValue = true;
    
    setReportData({
      model: modelLink.split('/').pop() || 'Unknown Model',
      timestamp: new Date().toISOString(),
      results: mockData
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enter Model Information
            </Typography>
            <TextField
              label="HuggingFace Model Link"
              placeholder="e.g., https://huggingface.co/meta-llama/Llama-2-7b"
              fullWidth
              value={modelLink}
              onChange={(e) => setModelLink(e.target.value)}
              sx={{ mt: 2 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Enter the HuggingFace link to the model you want to benchmark.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Hardware for Benchmarking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              All hardware options are pre-selected. Uncheck any that you don't want to include in the benchmark.
            </Typography>
            
            <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
              {hardwareOptions.map((hardware) => (
                <FormControlLabel
                  key={hardware.id}
                  control={
                    <Checkbox 
                      checked={selectedHardware[hardware.id] || false}
                      onChange={handleHardwareChange}
                      name={hardware.id}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{hardware.name}</Typography>
                      <Typography variant="caption" color="text.secondary">${hardware.cost.toFixed(2)}/hr</Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Benchmark Results for {reportData?.model}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<CloudDownload />}
                sx={{ 
                  borderRadius: 2,
                }}
              >
                Export Report
              </Button>
            </Box>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell>Hardware</TableCell>
                    <TableCell align="right">Throughput (q/s)</TableCell>
                    <TableCell align="right">Latency (ms)</TableCell>
                    <TableCell align="right">Throughput/$</TableCell>
                    <TableCell align="right">Cost ($/hr)</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData?.results.map((result) => (
                    <TableRow
                      key={result.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: result.isBestPerformance ? alpha(theme.palette.secondary.main, 0.1) :
                                result.isBestValue ? alpha('#4caf50', 0.1) : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: result.isBestPerformance || result.isBestValue ? 600 : 400,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            {result.name}
                            {result.isOptimized && (
                              <Chip 
                                size="small" 
                                label="Mako-Optimized" 
                                color="secondary"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.65rem',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Typography>
                          
                          {(result.isBestPerformance || result.isBestValue) && (
                            <Stack direction="row" spacing={0.5}>
                              {result.isBestPerformance && (
                                <Chip 
                                  size="small" 
                                  label="Best Performance" 
                                  color="secondary"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.65rem',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                              {result.isBestValue && (
                                <Chip 
                                  size="small" 
                                  label="Best Value" 
                                  color="success"
                                  sx={{ 
                                    height: 20, 
                                    fontSize: '0.65rem',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          size="small"
                          label={result.throughput} 
                          color="primary" 
                          variant="outlined"
                          icon={<Speed sx={{ fontSize: '1rem !important' }} />}
                          sx={{ 
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          size="small"
                          label={result.latency} 
                          variant="outlined"
                          icon={<Timer sx={{ fontSize: '1rem !important' }} />}
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          size="small"
                          label={result.throughputPerDollar} 
                          variant="outlined"
                          icon={<AttachMoney sx={{ fontSize: '1rem !important' }} />}
                          sx={{ 
                            fontWeight: 500,
                            color: '#4caf50',
                            borderColor: '#4caf50',
                            bgcolor: alpha('#4caf50', 0.08),
                            ...(result.isBestValue ? {
                              fontWeight: 600,
                              color: '#ffffff',
                              bgcolor: '#4caf50',
                              borderColor: '#4caf50'
                            } : {})
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${result.cost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={deployingHardware === result.id ? <CircularProgress size={16} color="inherit" /> : <Rocket />}
                          onClick={() => handleDeploy(result.id)}
                          disabled={deployingHardware !== null}
                          sx={{
                            borderRadius: 2,
                            bgcolor: '#3d1e2f', // Use the specified deep purple/burgundy color
                            color: 'white', // White text for better contrast with dark background
                            '&:hover': {
                              bgcolor: '#2a1521', // Slightly darker on hover
                            },
                            minWidth: '110px'
                          }}
                        >
                          {deployingHardware === result.id ? 'Deploying...' : 'Deploy Now'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Check sx={{ color: theme.palette.secondary.main }} />
                Mako-Optimized models include specialized kernel optimizations, quantization, and tensor parallelism for improved performance.
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Report generated on {new Date().toLocaleString()}
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleReset}
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  mr: 2
                }}
              >
                New Benchmark
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        mb: 4,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.1)
      }}
    >
      
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} sx={{ pt: 3, px: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {isGenerating ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">Generating Benchmark Report...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Running performance tests across selected hardware. This may take a few minutes.
            </Typography>
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            {activeStep < 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, pt: 0 }}>
                {activeStep > 0 && (
                  <Button 
                    onClick={handleBack}
                    sx={{ 
                      mr: 1,
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
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && !modelLink}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: '#000000',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: theme.palette.secondary.dark,
                    },
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.5),
                      color: alpha('#000000', 0.4)
                    }
                  }}
                >
                  {activeStep === 1 ? 'Generate Report' : 'Next'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}

export default BenchmarkReportGenerator; 