/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  PlayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ModelTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
  dataRequirements: string[];
  businessValue: string;
  accuracy: string;
  useCase: string;
}

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
}

export default function NewMLModelPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [modelConfig, setModelConfig] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    autoRetrain: true,
    retrainThreshold: 85,
    maxPredictions: 10000,
    alertThreshold: 80,
    environment: 'staging',
  });
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const modelTemplates: ModelTemplate[] = [
    {
      id: 'eta_prediction',
      name: 'ETA Prediction Model',
      type: 'eta_prediction',
      description:
        'AI-powered estimated time of arrival predictions using traffic, weather, and driver performance data',
      icon: <ClockIcon className="h-8 w-8" />,
      difficulty: 'intermediate',
      estimatedTime: '15-20 minutes',
      features: [
        'Real-time traffic analysis',
        'Weather integration',
        'Driver performance factors',
        'Route optimization',
      ],
      dataRequirements: [
        'GPS tracking data',
        'Traffic API access',
        'Weather API access',
        'Driver performance logs',
      ],
      businessValue:
        'Improve customer satisfaction and operational efficiency with accurate delivery predictions',
      accuracy: '92-96%',
      useCase: 'Predict accurate delivery times for customer notifications and route planning',
    },
    {
      id: 'dynamic_pricing',
      name: 'Dynamic Pricing Model',
      type: 'dynamic_pricing',
      description:
        'Market-driven pricing optimization based on demand, capacity, and competitive analysis',
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      difficulty: 'advanced',
      estimatedTime: '25-30 minutes',
      features: [
        'Market demand analysis',
        'Competitive pricing',
        'Seasonal adjustments',
        'Capacity optimization',
      ],
      dataRequirements: [
        'Load board data',
        'Market rates',
        'Fuel price APIs',
        'Historical pricing data',
      ],
      businessValue:
        'Maximize revenue through intelligent pricing strategies and market positioning',
      accuracy: '85-92%',
      useCase: 'Optimize pricing for loads based on market conditions and demand patterns',
    },
    {
      id: 'maintenance_prediction',
      name: 'Predictive Maintenance Model',
      type: 'maintenance_prediction',
      description: 'Predictive maintenance alerts using telematics data and maintenance history',
      icon: <WrenchScrewdriverIcon className="h-8 w-8" />,
      difficulty: 'intermediate',
      estimatedTime: '20-25 minutes',
      features: [
        'Component failure prediction',
        'Maintenance scheduling',
        'Cost optimization',
        'Safety alerts',
      ],
      dataRequirements: [
        'Telematics data',
        'Maintenance records',
        'Fault codes',
        'Component specifications',
      ],
      businessValue: 'Reduce maintenance costs and prevent breakdowns through predictive analytics',
      accuracy: '88-94%',
      useCase: 'Predict vehicle maintenance needs before failures occur to minimize downtime',
    },
    {
      id: 'route_optimization',
      name: 'Route Optimization Model',
      type: 'route_optimization',
      description:
        'AI-powered route optimization for fuel efficiency and delivery time optimization',
      icon: <TruckIcon className="h-8 w-8" />,
      difficulty: 'advanced',
      estimatedTime: '30-35 minutes',
      features: [
        'Multi-stop optimization',
        'Traffic-aware routing',
        'Fuel efficiency',
        'Driver preferences',
      ],
      dataRequirements: ['GPS routes', 'Traffic data', 'Fuel consumption data', 'Delivery records'],
      businessValue: 'Reduce fuel costs and improve delivery efficiency through optimized routing',
      accuracy: '80-88%',
      useCase:
        'Find the most efficient routes considering traffic, fuel costs, and delivery windows',
    },
    {
      id: 'demand_forecasting',
      name: 'Demand Forecasting Model',
      type: 'demand_forecasting',
      description: 'Market demand forecasting for capacity planning and strategic decision making',
      icon: <ChartBarIcon className="h-8 w-8" />,
      difficulty: 'advanced',
      estimatedTime: '35-40 minutes',
      features: [
        'Seasonal patterns',
        'Economic indicators',
        'Market trends',
        'Competitor analysis',
      ],
      dataRequirements: ['Load board data', 'Market reports', 'Economic data', 'Industry trends'],
      businessValue: 'Make informed capacity and investment decisions based on demand predictions',
      accuracy: '75-85%',
      useCase: 'Forecast shipping demand to optimize fleet capacity and business planning',
    },
    {
      id: 'toll_optimization',
      name: 'Toll Cost Optimization Model',
      type: 'toll_optimization',
      description:
        'AI-powered toll cost optimization using route analysis and toll provider integration',
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      difficulty: 'intermediate',
      estimatedTime: '20-25 minutes',
      features: [
        'Multi-provider toll comparison',
        'Route cost analysis',
        'Time vs cost optimization',
        'Transponder management',
      ],
      dataRequirements: [
        'Toll provider APIs',
        'Route data',
        'Vehicle classifications',
        'Historical toll costs',
      ],
      businessValue:
        'Minimize toll expenses through intelligent route planning and provider optimization',
      accuracy: '90-95%',
      useCase: 'Optimize routes to minimize toll costs while maintaining delivery schedules',
    },
  ];

  useEffect(() => {
    if (selectedTemplate) {
      const template = modelTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setModelConfig(prev => ({
          ...prev,
          name: template.name,
          description: template.description,
        }));
      }
    }
  }, [selectedTemplate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setActiveTab('configuration');
  };

  const handleDeploy = async () => {
    if (!selectedTemplate || !modelConfig.name) {
      return;
    }

    setIsDeploying(true);
    setActiveTab('deployment');

    const steps: DeploymentStep[] = [
      {
        id: 'validation',
        title: 'Validating Configuration',
        description: 'Checking model configuration and requirements',
        status: 'in-progress',
        progress: 0,
      },
      {
        id: 'data_preparation',
        title: 'Preparing Training Data',
        description: 'Loading and preprocessing training datasets',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'model_training',
        title: 'Training Model',
        description: 'Training the AI model with prepared data',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'validation_testing',
        title: 'Model Validation',
        description: 'Testing model accuracy and performance',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'deployment',
        title: 'Deploying Model',
        description: 'Deploying model to production environment',
        status: 'pending',
        progress: 0,
      },
    ];

    setDeploymentSteps(steps);

    // Simulate deployment process
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDeploymentSteps(prev =>
        prev.map((step, index) => {
          if (index === i) {
            return { ...step, status: 'completed', progress: 100 };
          } else if (index === i + 1) {
            return { ...step, status: 'in-progress', progress: 0 };
          }
          return step;
        })
      );

      // Simulate progress for current step
      if (i < steps.length - 1) {
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setDeploymentSteps(prev =>
            prev.map((step, index) => (index === i + 1 ? { ...step, progress } : step))
          );
        }
      }
    }

    setIsDeploying(false);
    setDeploymentComplete(true);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return (
          <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ml">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to ML Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Deploy New AI Model</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Choose a model template and configure deployment settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Choose Template</TabsTrigger>
          <TabsTrigger value="configuration" disabled={!selectedTemplate}>
            Configuration
          </TabsTrigger>
          <TabsTrigger value="deployment" disabled={!selectedTemplate || !modelConfig.name}>
            Deployment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Model Template</CardTitle>
              <p className="text-sm text-gray-500">
                Choose from pre-built AI model templates optimized for trucking operations
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600">
                            {template.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {template.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Estimated Time:</span>
                            <span className="font-medium">{template.estimatedTime}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Accuracy:</span>
                            <span className="font-medium text-green-600">{template.accuracy}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Key Features:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {template.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">{template.useCase}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const template = modelTemplates.find(t => t.id === selectedTemplate);
                  if (!template) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Data Requirements</h4>
                        <ul className="space-y-2">
                          {template.dataRequirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Business Value</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {template.businessValue}
                        </p>
                        <Button onClick={() => setActiveTab('configuration')} className="w-full">
                          Configure This Model
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <p className="text-sm text-gray-500">
                Configure your model settings and deployment parameters
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="modelName">Model Name</Label>
                    <Input
                      id="modelName"
                      value={modelConfig.name}
                      onChange={e => setModelConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter model name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelDescription">Description</Label>
                    <Textarea
                      id="modelDescription"
                      value={modelConfig.description}
                      onChange={e =>
                        setModelConfig(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Describe your model's purpose and functionality"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelVersion">Version</Label>
                    <Input
                      id="modelVersion"
                      value={modelConfig.version}
                      onChange={e => setModelConfig(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="environment">Deployment Environment</Label>
                    <Select
                      value={modelConfig.environment}
                      onValueChange={value =>
                        setModelConfig(prev => ({ ...prev, environment: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRetrain">Auto-Retrain</Label>
                    <Switch
                      id="autoRetrain"
                      checked={modelConfig.autoRetrain}
                      onCheckedChange={checked =>
                        setModelConfig(prev => ({ ...prev, autoRetrain: checked }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="retrainThreshold">Retrain Threshold (%)</Label>
                    <Input
                      id="retrainThreshold"
                      type="number"
                      value={modelConfig.retrainThreshold}
                      onChange={e =>
                        setModelConfig(prev => ({
                          ...prev,
                          retrainThreshold: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically retrain when accuracy drops below this threshold
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxPredictions">Max Predictions per Hour</Label>
                    <Input
                      id="maxPredictions"
                      type="number"
                      value={modelConfig.maxPredictions}
                      onChange={e =>
                        setModelConfig(prev => ({
                          ...prev,
                          maxPredictions: parseInt(e.target.value),
                        }))
                      }
                      min="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                    <Input
                      id="alertThreshold"
                      type="number"
                      value={modelConfig.alertThreshold}
                      onChange={e =>
                        setModelConfig(prev => ({
                          ...prev,
                          alertThreshold: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Send alerts when accuracy drops below this threshold
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleDeploy}
                  className="w-full"
                  disabled={!modelConfig.name || isDeploying}
                >
                  <BeakerIcon className="h-5 w-5 mr-2" />
                  Deploy Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Deployment</CardTitle>
              <p className="text-sm text-gray-500">
                {deploymentComplete
                  ? 'Deployment completed successfully!'
                  : 'Deploying your AI model...'}
              </p>
            </CardHeader>
            <CardContent>
              {deploymentComplete ? (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Model Deployed Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your {modelConfig.name} is now active and ready to make predictions.
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Link href="/ml">
                      <Button>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View in Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Deploy Another Model
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {deploymentSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{step.title}</h4>
                          {step.status === 'in-progress' && (
                            <span className="text-sm text-gray-500">{step.progress}%</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {step.description}
                        </p>
                        {step.status === 'in-progress' && (
                          <Progress value={step.progress} className="h-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
