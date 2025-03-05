import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Toolbar, 
  Paper, 
  Grid, 
  Button,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  alpha,
  useTheme,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Download, 
  Speed, 
  Memory, 
  Timeline,
  TrendingUp,
  PlayArrow,
  Storage,
  Add,
  ArrowDownward,
  Settings,
  Code,
  CloudUpload,
  KeyboardArrowDown,
  Cloud,
  Archive
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import BenchmarkDialog from './BenchmarkDialog';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Add this near the top of the file, outside the component
const OPTIMIZATION_TARGETS = ['Throughput', 'Latency', 'Dataset'];
const INFERENCE_ENGINES = ['vLLM', 'SGLang', 'TRT-LLM', 'TGI'];

function MetricCard({ title, value, icon, color }) {
  const theme = useTheme();
  
  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.6),
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          borderColor: alpha(color || theme.palette.primary.main, 0.3),
        }
      }}
      elevation={0}
    >
      <Stack spacing={1} direction="row" alignItems="center">
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(color || theme.palette.primary.main, 0.08),
            color: color || theme.palette.primary.main,
            mr: 1
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block' }}>
            {title}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function MainContent({ selectedModel, models, updateModelWithBenchmark }) {
  const [benchmarkDialogOpen, setBenchmarkDialogOpen] = useState(false);
  const [deployMenuAnchorEl, setDeployMenuAnchorEl] = useState(null);
  const theme = useTheme();
  
  const handleDeployMenuOpen = (event) => {
    setDeployMenuAnchorEl(event.currentTarget);
  };

  const handleDeployMenuClose = () => {
    setDeployMenuAnchorEl(null);
  };

  const handleDeployToAzure = () => {
    // Handle Azure deployment logic
    console.log('Deploying to Azure...');
    handleDeployMenuClose();
  };

  const handleExportContainer = () => {
    // Handle container export logic
    console.log('Exporting optimized container...');
    handleDeployMenuClose();
  };
  
  if (!selectedModel) {
    return (
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          bgcolor: 'background.default',
          pt: 10
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            maxWidth: 500,
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main">
            Welcome to the AI Optimization Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Select a model from the sidebar to view its performance metrics and run benchmarks.
          </Typography>
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: alpha(theme.palette.secondary.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              mt: 4
            }}
          >
            <Settings 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.secondary.main 
              }} 
            />
          </Box>
        </Box>
      </Box>
    );
  }

  const modelInfo = models.find(model => model.id === selectedModel);

  if (!modelInfo) {
    return (
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography>Model not found</Typography>
      </Box>
    );
  }

  // Initialize benchmarks array if it doesn't exist
  if (!modelInfo.benchmarks) {
    modelInfo.benchmarks = [];
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 8,
        titleFont: {
          family: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          family: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
            size: 11
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 3,
        hoverRadius: 5
      }
    }
  };

  const handleRunBenchmark = () => {
    setBenchmarkDialogOpen(true);
  };

  const handleBenchmarkComplete = (benchmarkResults) => {
    updateModelWithBenchmark(selectedModel, benchmarkResults);
    setBenchmarkDialogOpen(false);
  };

  // Get the inference engine for this model (or set a default)
  const inferenceEngine = modelInfo.inferenceEngine || INFERENCE_ENGINES[Math.floor(Math.random() * INFERENCE_ENGINES.length)];

  // Get engine color based on the engine type
  const getEngineColor = (engine) => {
    switch(engine) {
      case 'vLLM': return '#ff9800';
      case 'SGLang': return '#2196f3';
      case 'TRT-LLM': return '#4caf50';
      case 'TGI': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        p: 3,
        pt: 10,
        overflow: 'auto',
        height: '100%'
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.background.paper, 0.4)})`,
          }} 
          elevation={0}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              {modelInfo.name}
            </Typography>
            <Box>
              <Button
                variant="contained"
                onClick={handleRunBenchmark}
                startIcon={<PlayArrow />}
                sx={{ 
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  }
                }}
              >
                Run Benchmark
              </Button>
              
              <Button
                variant="contained"
                aria-controls="deploy-menu"
                aria-haspopup="true"
                onClick={handleDeployMenuOpen}
                endIcon={<KeyboardArrowDown />}
                startIcon={<CloudUpload />}
                sx={{ 
                  bgcolor: theme.palette.secondary.main,
                  color: '#000000',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark,
                  }
                }}
              >
                Deploy Now
              </Button>
              <Menu
                id="deploy-menu"
                anchorEl={deployMenuAnchorEl}
                keepMounted
                open={Boolean(deployMenuAnchorEl)}
                onClose={handleDeployMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 0.5,
                    borderRadius: 2,
                    minWidth: 220,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    '& .MuiList-root': {
                      py: 0.5
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleDeployToAzure} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Cloud sx={{ color: '#0078D4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Deploy on Azure" 
                    secondary="Deploy to Azure Machine Learning"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </MenuItem>
                <MenuItem onClick={handleExportContainer} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Archive sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Export Optimized Container" 
                    secondary="Download as Docker container"
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Throughput" 
                value={modelInfo.throughput} 
                icon={<Speed fontSize="small" />} 
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Latency" 
                value={modelInfo.latency} 
                icon={<Timeline fontSize="small" />} 
                color="#9c27b0"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Hardware" 
                value={modelInfo.hardware} 
                icon={<Memory fontSize="small" />} 
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Inference Engine" 
                value={inferenceEngine} 
                icon={<Code fontSize="small" />} 
                color={getEngineColor(inferenceEngine)}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Optimization Target:
            </Typography>
            <Chip 
              label={
                OPTIMIZATION_TARGETS.includes(modelInfo.optimizationTarget) 
                  ? modelInfo.optimizationTarget 
                  : 'Custom'
              }
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                fontWeight: 500,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                mr: 2
              }}
            />
            {modelInfo.optimizationTarget === 'Dataset' && (
              <Chip 
                label={modelInfo.optimizationDataset?.name || 'Custom Dataset'}
                size="small"
                icon={<Storage fontSize="small" />}
                sx={{ 
                  fontWeight: 500,
                  bgcolor: alpha('#ff9800', 0.1),
                  color: '#ff9800',
                  borderColor: '#ff9800'
                }}
              />
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Performance Trend
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line options={chartOptions} data={modelInfo.performanceData} />
          </Box>
        </Paper>

        {/* Benchmark Results Table */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>Benchmark Results</Typography>
            <Button 
              variant="outlined" 
              startIcon={<Add />}
              onClick={handleRunBenchmark}
              size="small"
              sx={{ 
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              New Benchmark
            </Button>
          </Box>
          
          {(!modelInfo.benchmarks || modelInfo.benchmarks.length === 0) ? (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                '.MuiAlert-icon': {
                  color: theme.palette.info.main
                }
              }}
            >
              No benchmarks have been run yet. Click "Run Benchmark" to test this model's performance.
            </Alert>
          ) : (
            <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Table sx={{ minWidth: 650 }} aria-label="benchmark results table">
                <TableHead>
                  <TableRow>
                    <TableCell>Dataset</TableCell>
                    <TableCell>Hardware</TableCell>
                    <TableCell align="right">Throughput (q/s)</TableCell>
                    <TableCell align="right">Latency (ms)</TableCell>
                    <TableCell align="right">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelInfo.benchmarks.flatMap((benchmark, benchmarkIndex) => 
                    benchmark.hardware.map((hw, hwIndex) => (
                      <TableRow
                        key={`${benchmarkIndex}-${hwIndex}`}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                        }}
                      >
                        {hwIndex === 0 && (
                          <TableCell 
                            component="th" 
                            scope="row"
                            rowSpan={benchmark.hardware.length}
                            sx={{ borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}` }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {benchmark.dataset.name}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {benchmark.dataset.description}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2">
                            {hw.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            size="small"
                            label={hw.throughput} 
                            color="primary" 
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.primary.main, 0.08)
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            size="small"
                            label={hw.latency} 
                            color="secondary" 
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              color: '#9c27b0',
                              borderColor: '#9c27b0',
                              bgcolor: alpha('#9c27b0', 0.08)
                            }}
                          />
                        </TableCell>
                        {hwIndex === 0 && (
                          <TableCell 
                            align="right"
                            rowSpan={benchmark.hardware.length}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {new Date(benchmark.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <BenchmarkDialog
        open={benchmarkDialogOpen}
        onClose={() => setBenchmarkDialogOpen(false)}
        onBenchmarkComplete={handleBenchmarkComplete}
        modelId={selectedModel}
      />
    </Box>
  );
}

export default MainContent; 