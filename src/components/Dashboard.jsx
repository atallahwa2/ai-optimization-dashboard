import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Paper, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

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

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3,
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(224, 252, 0, 0.03) 0%, rgba(61, 30, 47, 0.02) 90%)',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            width: '95%',
            maxWidth: '1800px',
            height: 'calc(100vh - 48px)', // 48px accounts for the padding
            overflow: 'hidden',
            borderRadius: 4,
            position: 'relative',
            backdropFilter: 'blur(8px)',
          }}
        >
          <CssBaseline />
          <AppBar 
            position="absolute" 
            elevation={0}
            sx={{ 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              background: 'linear-gradient(90deg, #3d1e2f 0%, #4d2e3f 100%)',
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    bgcolor: 'secondary.main',
                    mr: 2,
                    boxShadow: '0 0 10px rgba(224, 252, 0, 0.5)'
                  }} 
                />
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                  AI Optimization Dashboard
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
          <Sidebar 
            width={drawerWidth} 
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
            models={models}
            setModels={setModels}
          />
          <MainContent 
            selectedModel={selectedModel}
            models={models}
            updateModelWithBenchmark={updateModelWithBenchmark}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard; 