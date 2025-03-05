import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Toolbar,
  IconButton,
  TextField,
  ListItemSecondaryAction,
  Typography,
  Divider,
  alpha
} from '@mui/material';
import { Edit, Check, Close, Add } from '@mui/icons-material';
import NewModelForm from './NewModelForm';

function Sidebar({ width, selectedModel, onModelSelect, models, setModels }) {
  const [isNewModelDialogOpen, setNewModelDialogOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState(null);
  const [editName, setEditName] = useState('');

  const datasetOptions = [
    { id: 'sharegpt', name: 'ShareGPT', description: '250/200 tokens in/out' },
    { id: 'longcontext', name: 'Long Context', description: '2000/500 tokens in/out' },
    { id: 'verylongcontext', name: 'Very Long Context', description: '100000/2000 tokens in/out' },
    { id: 'reasoning', name: 'Reasoning', description: '500/10000 tokens in/out' }
  ];

  const generateBaselineMetrics = (gpuType, gpuCount) => {
    // Generate realistic-looking baseline metrics based on GPU config
    const baseMetrics = {
      'A100': { baseThrough: 80, baseLat: 40 },
      'V100': { baseThrough: 60, baseLat: 50 },
      'T4': { baseThrough: 40, baseLat: 65 }
    };

    const base = baseMetrics[gpuType] || baseMetrics['T4'];
    const throughputScale = Math.min(gpuCount * 0.8, 2.5); // Diminishing returns
    
    // Generate 6 months of dummy improvement data
    const monthlyData = Array(6).fill(0).map((_, index) => {
      const improvement = 1 + (index * 0.05); // 5% improvement each month
      return Math.round(base.baseThrough * throughputScale * improvement);
    });

    const finalThroughput = monthlyData[monthlyData.length - 1];
    const baselineThroughput = monthlyData[0];
    
    return {
      throughput: `${finalThroughput} queries/sec`,
      latency: `${Math.round(base.baseLat / throughputScale)} ms`,
      hardware: `NVIDIA ${gpuType} × ${gpuCount}`,
      improvement: `+${Math.round((finalThroughput - baselineThroughput) / baselineThroughput * 100)}%`,
      optimizationTarget: Math.random() > 0.5 ? 'Throughput' : 'Latency',
      performanceData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Throughput (queries/sec)',
          data: monthlyData,
          borderColor: `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`,
          tension: 0.1
        }]
      }
    };
  };

  const handleNewModel = (formData) => {
    const newModelId = models.length + 1;
    const newModelName = `Model ${String.fromCharCode(65 + models.length)}`; // A, B, C, etc.
    
    // Generate baseline metrics based on selected hardware
    const metrics = generateBaselineMetrics(formData.gpuType, formData.gpuCount);

    // Prepare the optimization info
    let optimizationInfo = {};
    if (formData.optimizationMode === 'general') {
      optimizationInfo = {
        optimizationTarget: formData.optimizationTarget,
        optimizationMode: 'general'
      };
    } else {
      const dataset = datasetOptions.find(d => d.id === formData.optimizationDataset);
      optimizationInfo = {
        optimizationTarget: 'Dataset',
        optimizationMode: 'dataset',
        optimizationDataset: dataset ? dataset.name : '',
        optimizationDatasetDescription: dataset ? dataset.description : ''
      };
    }

    const newModel = {
      id: newModelId,
      name: newModelName,
      ...formData,
      ...metrics,
      ...optimizationInfo,
      benchmarks: []
    };

    setModels([...models, newModel]);
    setNewModelDialogOpen(false);
  };

  const startEditing = (model) => {
    setEditingModelId(model.id);
    setEditName(model.name);
  };

  const cancelEditing = () => {
    setEditingModelId(null);
    setEditName('');
  };

  const saveModelName = () => {
    if (editName.trim() !== '') {
      setModels(models.map(model => 
        model.id === editingModelId 
          ? { ...model, name: editName.trim() } 
          : model
      ));
      setEditingModelId(null);
    }
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: width,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: width, 
            boxSizing: 'border-box',
            position: 'static',
            borderRight: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            boxShadow: 'none',
            bgcolor: alpha('#3d1e2f', 0.02),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
            Models
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Box>
        <Box sx={{ overflow: 'auto', px: 1 }}>
          <List>
            {models.map((model) => (
              <ListItem
                key={model.id}
                selected={selectedModel === model.id}
                onClick={() => editingModelId !== model.id && onModelSelect(model.id)}
                sx={{ 
                  borderRadius: 2,
                  mb: 0.5,
                  pr: 8,
                  '&.Mui-selected': {
                    bgcolor: alpha('#3d1e2f', 0.08),
                    '&:hover': {
                      bgcolor: alpha('#3d1e2f', 0.12),
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha('#3d1e2f', 0.04),
                  }
                }}
              >
                {editingModelId === model.id ? (
                  // Edit mode
                  <>
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                      autoFocus
                      fullWidth
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveModelName();
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        }
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={saveModelName} size="small" sx={{ color: 'success.main' }}>
                        <Check />
                      </IconButton>
                      <IconButton edge="end" onClick={cancelEditing} size="small" sx={{ color: 'error.main' }}>
                        <Close />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                ) : (
                  // View mode
                  <>
                    <ListItemText 
                      primary={model.name} 
                      primaryTypographyProps={{ 
                        fontWeight: selectedModel === model.id ? 600 : 400,
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => startEditing(model)} 
                        size="small"
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Add />}
              onClick={() => setNewModelDialogOpen(true)}
              sx={{ 
                mt: 2,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'secondary.dark',
                }
              }}
            >
              Add New Model
            </Button>
          </Box>
        </Box>
      </Drawer>

      <NewModelForm
        open={isNewModelDialogOpen}
        onClose={() => setNewModelDialogOpen(false)}
        onSubmit={handleNewModel}
      />
    </>
  );
}

export default Sidebar; 