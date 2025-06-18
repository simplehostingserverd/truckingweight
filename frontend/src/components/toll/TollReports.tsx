/**
 * Toll Reports Component
 * Generate and display toll cost reports and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  GetApp as DownloadIcon,
  DateRange as DateIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
// Removed MUI date picker imports for now
import { useToll } from '../../hooks/useToll';

const TollReports: React.FC = () => {
  const { summary, loading, error, fetchSummary, fetchReports } = useToll();

  const [reportConfig, setReportConfig] = useState({
    type: 'monthly',
    format: 'json',
    period: 'month',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [reportData, setReportData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Load default summary for current month
    fetchSummary('month');
  }, []);

  const handleConfigChange = (field: string, value: unknown) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const startDate = reportConfig.startDate?.toISOString().split('T')[0];
      const endDate = reportConfig.endDate?.toISOString().split('T')[0];

      const data = await fetchReports(reportConfig.type, reportConfig.format, startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (format: string) => {
    try {
      const startDate = reportConfig.startDate?.toISOString().split('T')[0];
      const endDate = reportConfig.endDate?.toISOString().split('T')[0];

      const data = await fetchReports(reportConfig.type, format, startDate, endDate);

      // Create download link
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toll-report-${reportConfig.type}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Toll Reports & Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Generate detailed reports on toll costs, usage patterns, and provider performance.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(summary.totalCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Toll Costs
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary.period} period
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ReportIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{summary.totalTransactions}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary.period} period
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <DateIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{summary.costsByProvider?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Providers
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Currently configured
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{summary.costsByVehicle?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vehicles with Tolls
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {summary.period} period
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Report Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generate Custom Report
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportConfig.type}
                  onChange={e => handleConfigChange('type', e.target.value)}
                >
                  <MenuItem value="monthly">Monthly Summary</MenuItem>
                  <MenuItem value="vehicle">By Vehicle</MenuItem>
                  <MenuItem value="driver">By Driver</MenuItem>
                  <MenuItem value="route">By Route</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={
                  reportConfig.startDate ? reportConfig.startDate.toISOString().split('T')[0] : ''
                }
                onChange={e =>
                  handleConfigChange('startDate', e.target.value ? new Date(e.target.value) : null)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={reportConfig.endDate ? reportConfig.endDate.toISOString().split('T')[0] : ''}
                onChange={e =>
                  handleConfigChange('endDate', e.target.value ? new Date(e.target.value) : null)
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1} height="100%" alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={generating}
                  startIcon={generating ? <CircularProgress size={20} /> : <ReportIcon />}
                  fullWidth
                >
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Provider Breakdown */}
      {summary?.costsByProvider && summary.costsByProvider.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Costs by Provider
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Avg per Transaction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.costsByProvider.map((provider, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {provider.provider}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary" fontWeight="medium">
                          {formatCurrency(provider.totalCost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{provider.transactionCount}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(provider.totalCost / provider.transactionCount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Report Results */}
      {reportData && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Report Results -{' '}
                {reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)}
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadReport('json')}
                >
                  JSON
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadReport('csv')}
                >
                  CSV
                </Button>
              </Box>
            </Box>

            {reportData.data && Array.isArray(reportData.data) ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.data.slice(0, 10).map((item: unknown, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.transaction_date || item.created_at
                            ? new Date(
                                item.transaction_date || item.created_at
                              ).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.toll_facility_name || item.description || 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {item.amount ? formatCurrency(item.amount) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.transaction_status || item.status || 'N/A'}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No data available for the selected criteria.</Alert>
            )}

            {reportData.data && reportData.data.length > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Showing first 10 of {reportData.data.length} records. Download full report for
                complete data.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!summary && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Report Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up toll accounts and sync transaction data to generate reports.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TollReports;
