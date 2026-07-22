import React, { useState } from 'react';
import {
  Grid, Paper, Typography, TextField, Select, MenuItem,
  Button, LinearProgress, Box, Chip, Alert, Card, CardContent
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { extractComplaint, createComplaint } from '../store/complaintSlice';

const ComplaintCreate = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    complaint_source: '',
    customer_name: '',
    product_name: '',
    product_strength: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity_affected: '',
    complaint_type: '',
    complaint_date: new Date().toISOString().split('T')[0],
    description: '',
    initial_severity: '',
    priority: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [aiMessages, setAiMessages] = useState<{ type: string; text: string }[]>([]);
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: number; reference: string; similarity: number }[]>([]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Select change handler
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onDrop = async (files: File[]) => {
    const file = files[0];
    setUploadProgress(10);
    try {
      const result = await dispatch(extractComplaint({ file })).unwrap();
      setExtractedData(result.extracted);
      setUploadProgress(100);
      setCompleteness(result.completeness_score || 0);
      setMissingFields(result.missing_fields || []);
      setDuplicates(result.duplicates || []);
      setFormData({ ...formData, ...result.extracted });
      setAiMessages([...aiMessages, { type: 'system', text: 'Extraction completed. Form auto-filled.' }]);
    } catch (error) {
      setAiMessages([...aiMessages, { type: 'system', text: 'Extraction failed. Please try again.' }]);
    }
  };

  const handleReset = () => {
    setFormData({
      complaint_source: '',
      customer_name: '',
      product_name: '',
      product_strength: '',
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity_affected: '',
      complaint_type: '',
      complaint_date: new Date().toISOString().split('T')[0],
      description: '',
      initial_severity: '',
      priority: ''
    });
  };

  const handleSave = async () => {
    await dispatch(createComplaint(formData));
    // optionally redirect
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Left Panel - Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Log Customer Complaint</Typography>
            <Box sx={{ mt: 2 }}>
              {/* Section 1 */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>1. ORIGIN & CUSTOMER DETAILS</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Complaint Source" name="complaint_source" value={formData.complaint_source} onChange={handleInputChange} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Customer Name" name="customer_name" value={formData.customer_name} onChange={handleInputChange} required />
                </Grid>
              </Grid>
              {/* Section 2 */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>2. PRODUCT & BATCH IDENTIFICATION</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Product Name" name="product_name" value={formData.product_name} onChange={handleInputChange} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Product Strength/Grade" name="product_strength" value={formData.product_strength} onChange={handleInputChange} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Batch/Lot Number" name="batch_number" value={formData.batch_number} onChange={handleInputChange} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Quantity Affected" name="quantity_affected" type="number" value={formData.quantity_affected} onChange={handleInputChange} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Manufacturing Date" name="manufacturing_date" type="date" value={formData.manufacturing_date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Expiry Date" name="expiry_date" type="date" value={formData.expiry_date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
              </Grid>
              {/* Section 3 */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>3. COMPLAINT DETAILS</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Complaint Type" name="complaint_type" value={formData.complaint_type} onChange={handleInputChange} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Complaint Date" name="complaint_date" type="date" value={formData.complaint_date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Detailed Complaint Description" name="description" multiline rows={4} value={formData.description} onChange={handleInputChange} required /></Grid>
              </Grid>
              {/* Section 4 */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3 }}>4. INITIAL ASSESSMENT & PRIORITY</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Select fullWidth displayEmpty value={formData.initial_severity} onChange={handleSelectChange} name="initial_severity">
                    <MenuItem value="" disabled>Initial Severity</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <Select fullWidth displayEmpty value={formData.priority} onChange={handleSelectChange} name="priority">
                    <MenuItem value="" disabled>Priority</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleReset}>Reset Form</Button>
                <Button variant="contained" color="primary" onClick={handleSave}>Save Complaint</Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - AI Assistant */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>AI Complaint Intake Assistant</Typography>
            <Box {...getRootProps()} sx={{ border: '2px dashed #aaa', p: 4, textAlign: 'center', cursor: 'pointer', mb: 2 }}>
              <input {...getInputProps()} />
              <Typography>Drag & drop complaint document here or click to browse</Typography>
              <Typography variant="caption">Supported: PDF, DOCX, TXT, EML (Max 10MB)</Typography>
            </Box>

            <TextField fullWidth multiline rows={2} placeholder="Paste Complaint Text / Email" sx={{ mt: 2, mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ flexGrow: 1 }} />
              <Typography>{uploadProgress}%</Typography>
            </Box>

            {/* AI Messages */}
            <Card variant="outlined" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <CardContent>
                {aiMessages.map((msg, i) => (
                  <Alert severity={msg.type === 'system' ? 'info' : 'success'} key={i} sx={{ mt: 1 }}>
                    {msg.text}
                  </Alert>
                ))}
                {missingFields.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Missing fields: {missingFields.join(', ')}
                  </Alert>
                )}
                {duplicates.length > 0 && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    ⚠️ Similar complaint(s) found: {duplicates.map(d => `#${d.id} (${d.reference})`).join(', ')}
                  </Alert>
                )}
                {completeness > 0 && (
                  <Alert severity={completeness > 80 ? 'success' : 'warning'} sx={{ mt: 1 }}>
                    Completeness: {completeness}%
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Box sx={{ mt: 2 }}>
              <TextField fullWidth placeholder="Ask me anything about this complaint..." />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintCreate;