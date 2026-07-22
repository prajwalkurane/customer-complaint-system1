import React, { useState } from 'react';
import {
  Grid, Paper, Typography, TextField, Select, MenuItem,
  Button, LinearProgress, Box, Alert, Card, CardContent,
  Chip, Divider
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
  const [aiMessages, setAiMessages] = useState<{ type: string; text: string }[]>([]);
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: number; reference: string; similarity: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onDrop = async (files: File[]) => {
    const file = files[0];
    setUploadProgress(10);
    setAiMessages([...aiMessages, { type: 'system', text: 'Uploading document...' }]);
    try {
      const result = await dispatch(extractComplaint({ file })).unwrap();
      setUploadProgress(100);
      setCompleteness(result.completeness_score || 0);
      setMissingFields(result.missing_fields || []);
      setDuplicates(result.duplicates || []);
      setFormData({ ...formData, ...result.extracted });
      setAiMessages(prev => [
        ...prev,
        { type: 'system', text: 'Extraction completed. Form auto-filled.' },
        { type: 'info', text: `Completeness: ${result.completeness_score || 0}%` }
      ]);
      if (result.missing_fields?.length > 0) {
        setAiMessages(prev => [...prev, { type: 'warning', text: `Missing fields: ${result.missing_fields.join(', ')}` }]);
      }
      if (result.duplicates?.length > 0) {
        setAiMessages(prev => [...prev, { type: 'error', text: `⚠️ Similar complaint(s) found: ${result.duplicates.map((d: any) => `#${d.id} (${d.reference})`).join(', ')}` }]);
      }
    } catch (error) {
      setUploadProgress(0);
      setAiMessages([...aiMessages, { type: 'error', text: 'Extraction failed. Please try again.' }]);
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
    setAiMessages([]);
    setCompleteness(0);
    setMissingFields([]);
    setDuplicates([]);
    setUploadProgress(0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(createComplaint(formData)).unwrap();
      setAiMessages([...aiMessages, { type: 'success', text: 'Complaint saved successfully!' }]);
      setTimeout(handleReset, 2000);
    } catch (error) {
      setAiMessages([...aiMessages, { type: 'error', text: 'Failed to save complaint.' }]);
    } finally {
      setSaving(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Left Panel - Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">Log Customer Complaint</Typography>
              <Chip label="Pending Triage" color="warning" size="small" />
            </Box>

            {/* Section 1 */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, color: '#0A6E79' }}>
              1. ORIGIN & CUSTOMER DETAILS
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.complaint_source}
                  onChange={handleSelectChange}
                  name="complaint_source"
                >
                  <MenuItem value="" disabled>Complaint Source</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="In-Person">In-Person</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  error={missingFields.includes('customer_name')}
                  helperText={missingFields.includes('customer_name') ? 'Required' : ''}
                />
              </Grid>
            </Grid>

            {/* Section 2 */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, color: '#0A6E79' }}>
              2. PRODUCT & BATCH IDENTIFICATION
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  error={missingFields.includes('product_name')}
                  helperText={missingFields.includes('product_name') ? 'Required' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Product Strength / Grade"
                  name="product_strength"
                  value={formData.product_strength}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Batch / Lot Number"
                  name="batch_number"
                  value={formData.batch_number}
                  onChange={handleInputChange}
                  required
                  error={missingFields.includes('batch_number')}
                  helperText={missingFields.includes('batch_number') ? 'Required' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantity Affected"
                  name="quantity_affected"
                  type="number"
                  value={formData.quantity_affected}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Manufacturing Date"
                  name="manufacturing_date"
                  type="date"
                  value={formData.manufacturing_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Section 3 */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, color: '#0A6E79' }}>
              3. COMPLAINT DETAILS
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.complaint_type}
                  onChange={handleSelectChange}
                  name="complaint_type"
                >
                  <MenuItem value="" disabled>Complaint Type</MenuItem>
                  <MenuItem value="Quality Issue">Quality Issue</MenuItem>
                  <MenuItem value="Safety Concern">Safety Concern</MenuItem>
                  <MenuItem value="Packaging Issue">Packaging Issue</MenuItem>
                  <MenuItem value="Labeling Error">Labeling Error</MenuItem>
                  <MenuItem value="Adverse Event">Adverse Event</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Complaint Date"
                  name="complaint_date"
                  type="date"
                  value={formData.complaint_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Detailed Complaint Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  error={missingFields.includes('description')}
                  helperText={missingFields.includes('description') ? 'Required' : ''}
                />
              </Grid>
            </Grid>

            {/* Section 4 */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 3, color: '#0A6E79' }}>
              4. INITIAL ASSESSMENT & PRIORITY
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.initial_severity}
                  onChange={handleSelectChange}
                  name="initial_severity"
                >
                  <MenuItem value="" disabled>Initial Severity</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Select
                  fullWidth
                  displayEmpty
                  value={formData.priority}
                  onChange={handleSelectChange}
                  name="priority"
                >
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
              <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Complaint'}
              </Button>
            </Box>

            {completeness > 0 && completeness < 100 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Completeness: {completeness}% – Please fill in missing fields.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - AI Assistant */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>AI Complaint Intake Assistant</Typography>

            <Box {...getRootProps()} sx={{
              border: '2px dashed #aaa',
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 2,
              borderRadius: 2,
              '&:hover': { borderColor: '#0A6E79' }
            }}>
              <input {...getInputProps()} />
              <Typography>📄 Drag & drop complaint document here or click to browse</Typography>
              <Typography variant="caption" color="textSecondary">
                Supported: PDF, DOCX, TXT, EML (Max 10MB)
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Paste Complaint Text / Email"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ flexGrow: 1 }} />
              <Typography variant="caption">{uploadProgress}%</Typography>
            </Box>

            <Card variant="outlined" sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <CardContent>
                {aiMessages.length === 0 && (
                  <Typography color="textSecondary" variant="body2">
                    Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.
                  </Typography>
                )}
                {aiMessages.map((msg, i) => (
                  <Alert
                    key={i}
                    severity={msg.type as any}
                    sx={{ mt: 1 }}
                    icon={msg.type === 'system' ? false : undefined}
                  >
                    {msg.text}
                  </Alert>
                ))}
              </CardContent>
            </Card>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about this complaint..."
                size="small"
              />
              <Button variant="contained" size="small">Send</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintCreate;