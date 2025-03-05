import React, { useState, useEffect, useRef } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Paper, ThemeProvider, createTheme, alpha, Container } from '@mui/material';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import NewModelForm from './NewModelForm';
import BenchmarkReportGenerator from './BenchmarkReportGenerator';

// Custom theme with company colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#3d1e2f',
      light: '#5a3a4c',
      dark: '#2a0f1f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e0fc00',
      light: '#eafd4d',
      dark: '#b2c900',
      contrastText: '#000000',
    },
    background: {
      default: '#f8f8f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    divider: 'rgba(61, 30, 47, 0.12)',
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(61, 30, 47, 0.04)',
        },
      },
    },
  },
});

const drawerWidth = 260;

function Dashboard() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState([
    // Initial models with their data
    {
      id: 1,
      name: "Model A",
      throughput: "95 queries/sec",
      latency: "45 ms",
      hardware: "NVIDIA A100 × 2",
      improvement: "+46.2%",
      optimizationTarget: "Throughput",
      inferenceEngine: "vLLM",
      benchmarks: [],
      performanceData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Throughput (queries/sec)',
          data: [65, 75, 81, 87, 91, 95],
          borderColor: '#3d1e2f',
          backgroundColor: 'rgba(61, 30, 47, 0.1)',
          tension: 0.3,
          fill: true,
        }]
      }
    },
    {
      id: 2,
      name: "Model B",
      throughput: "120 queries/sec",
      latency: "32 ms",
      hardware: "NVIDIA A100 × 4",
      improvement: "+58.3%",
      optimizationTarget: "Latency",
      inferenceEngine: "TRT-LLM",
      benchmarks: [],
      performanceData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Throughput (queries/sec)',
          data: [75, 85, 95, 105, 115, 120],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.3,
          fill: true,
        }]
      }
    },
    {
      id: 3,
      name: "Model C",
      throughput: "78 queries/sec",
      latency: "52 ms",
      hardware: "NVIDIA T4 × 2",
      improvement: "+28.7%",
      optimizationTarget: "Throughput",
      inferenceEngine: "SGLang",
      benchmarks: [],
      performanceData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Throughput (queries/sec)',
          data: [60, 65, 68, 72, 75, 78],
          borderColor: '#9c27b0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.3,
          fill: true,
        }]
      }
    }
  ]);

  const [modelFormOpen, setModelFormOpen] = useState(false);

  // Add a function to update models with benchmark results
  const updateModelWithBenchmark = (modelId, benchmarkResults) => {
    setModels(models.map(model => {
      if (model.id === modelId) {
        const benchmarks = model.benchmarks || [];
        return {
          ...model,
          benchmarks: [...benchmarks, benchmarkResults]
        };
      }
      return model;
    }));
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  const handleAddModel = (newModel) => {
    setModels([...models, newModel]);
    setSelectedModel(newModel);
    setModelFormOpen(false);
  };

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(224, 252, 0, 0.03)');
      gradient.addColorStop(1, 'rgba(61, 30, 47, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <CssBaseline />
        
        {/* Background Canvas */}
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            opacity: 0.8
          }}
        />
        
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" color="primary" sx={{ fontWeight: 600 }}>
              AI Model Optimization Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        
        {/* Main content container */}
        <Box sx={{ mt: '64px', display: 'flex', flexDirection: 'column', width: '100%', px: 3 }}>
          {/* Dashboard with Sidebar */}
          <Box sx={{ display: 'flex', width: '100%', border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, overflow: 'hidden', mt: 2 }}>
            {/* Sidebar */}
            <Sidebar 
              models={models} 
              selectedModel={selectedModel?.id}
              onModelSelect={handleModelSelect}
              onAddModelClick={() => setModelFormOpen(true)}
              width={drawerWidth}
              setModels={setModels}
            />
            
            {/* Dashboard Content */}
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <MainContent 
                selectedModel={selectedModel} 
                models={models}
                updateModelWithBenchmark={updateModelWithBenchmark}
              />
            </Box>
          </Box>
          
          {/* Benchmark Report Generator - Full Width */}
          <Box 
            sx={{ 
              width: '100%',
              mt: 5,
              pb: 5,
              pt: 3
            }}
          >
            <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 600, pl: 1 }}>
              Benchmark and TCO Report Generator
            </Typography>
            <BenchmarkReportGenerator />
          </Box>
        </Box>
        
        <NewModelForm
          open={modelFormOpen}
          onClose={() => setModelFormOpen(false)}
          onSubmit={handleAddModel}
        />
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 