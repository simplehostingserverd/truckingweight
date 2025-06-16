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
import { useToast } from '@/hooks/useToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, Bluetooth, Usb, Network, Server } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';

interface HardwareOption {
  id: string;
  name: string;
  description: string;
  connectionTypes: string[];
  supportedSensors: string[];
  setupInstructions: string;
  isCityScaleCompatible: boolean;
}

interface HardwareSelectorProps {
  scaleId: number;
  onConfigured?: (success: boolean) => void;
}

const HardwareSelector: React.FC<HardwareSelectorProps> = ({ scaleId, onConfigured }) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hardwareOptions, setHardwareOptions] = useState<HardwareOption[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<string>('');
  const [connectionType, setConnectionType] = useState<string>('');
  const [config, setConfig] = useState({
    ipAddress: '',
    port: '',
    serialPort: '',
    baudRate: '9600',
    username: '',
    password: '',
    apiKey: '',
    sensorType: '',
    updateInterval: '5',
  });

  // Fetch hardware options
  useEffect(() => {
    const fetchHardwareOptions = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const response = await fetch('/api/scales/hardware-options', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData?.session?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch hardware options');
        }

        const data = await response.json();

        if (data.success && data.options) {
          setHardwareOptions(data.options);
        } else {
          throw new Error(data.error || 'Failed to fetch hardware options');
        }
      } catch (error) {
        console.error('Error fetching hardware options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hardware options. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHardwareOptions();
  }, [supabase, toast]);

  // Handle hardware selection
  const handleHardwareChange = (value: string) => {
    setSelectedHardware(value);
    setConnectionType('');

    // Reset config
    setConfig({
      ipAddress: '',
      port: '',
      serialPort: '',
      baudRate: '9600',
      username: '',
      password: '',
      apiKey: '',
      sensorType: '',
      updateInterval: '5',
    });
  };

  // Handle form input changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      // Prepare configuration based on connection type
      const hardwareConfig = {
        connectionType,
        ...config,
      };

      const response = await fetch(`/api/scales/${scaleId}/configure-hardware`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData?.session?.access_token}`,
        },
        body: JSON.stringify({
          hardwareType: selectedHardware,
          config: hardwareConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Hardware configured successfully',
        });
        if (onConfigured) onConfigured(true);
      } else {
        throw new Error(data.error || 'Failed to configure hardware');
      }
    } catch (error: unknown) {
      console.error('Error configuring hardware:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to configure hardware. Please try again.',
        variant: 'destructive',
      });
      if (onConfigured) onConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Get connection icon
  const getConnectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4" />;
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'ethernet':
        return <Network className="h-4 w-4" />;
      case 'serial':
        return <Server className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  // Get selected hardware option
  const selectedOption = hardwareOptions.find(option => option.id === selectedHardware);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IoT Hardware Configuration</CardTitle>
        <CardDescription>Select and configure IoT hardware for your scale</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !hardwareOptions.length ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hardware-type">Hardware Type</Label>
                <Select value={selectedHardware} onValueChange={handleHardwareChange}>
                  <SelectTrigger id="hardware-type">
                    <SelectValue placeholder="Select hardware type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardwareOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                        {option.isCityScaleCompatible && (
                          <Badge variant="outline" className="ml-2">
                            City Compatible
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOption && (
                <>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm">{selectedOption.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedOption.supportedSensors.map(sensor => (
                        <Badge key={sensor} variant="secondary">
                          {sensor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="connection-type">Connection Type</Label>
                    <Select value={connectionType} onValueChange={setConnectionType}>
                      <SelectTrigger id="connection-type">
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedOption.connectionTypes.map(type => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            <div className="flex items-center">
                              {getConnectionIcon(type)}
                              <span className="ml-2">{type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {connectionType && (
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                      </TabsList>
                      <TabsContent value="basic" className="space-y-4">
                        {(connectionType === 'ethernet' || connectionType === 'wifi') && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="ipAddress">IP Address</Label>
                              <Input
                                id="ipAddress"
                                name="ipAddress"
                                value={config.ipAddress}
                                onChange={handleConfigChange}
                                placeholder="192.168.1.100"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="port">Port</Label>
                              <Input
                                id="port"
                                name="port"
                                value={config.port}
                                onChange={handleConfigChange}
                                placeholder="8080"
                              />
                            </div>
                          </>
                        )}
                        {(connectionType === 'usb' || connectionType === 'serial') && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="serialPort">Serial Port</Label>
                              <Input
                                id="serialPort"
                                name="serialPort"
                                value={config.serialPort}
                                onChange={handleConfigChange}
                                placeholder="/dev/ttyUSB0 or COM3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="baudRate">Baud Rate</Label>
                              <Select
                                value={config.baudRate}
                                onValueChange={value =>
                                  setConfig(prev => ({ ...prev, baudRate: value }))
                                }
                              >
                                <SelectTrigger id="baudRate">
                                  <SelectValue placeholder="Select baud rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="9600">9600</SelectItem>
                                  <SelectItem value="19200">19200</SelectItem>
                                  <SelectItem value="38400">38400</SelectItem>
                                  <SelectItem value="57600">57600</SelectItem>
                                  <SelectItem value="115200">115200</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="sensorType">Sensor Type</Label>
                          <Select
                            value={config.sensorType}
                            onValueChange={value =>
                              setConfig(prev => ({ ...prev, sensorType: value }))
                            }
                          >
                            <SelectTrigger id="sensorType">
                              <SelectValue placeholder="Select sensor type" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedOption.supportedSensors.map(sensor => (
                                <SelectItem
                                  key={sensor}
                                  value={sensor.toLowerCase().replace(' ', '_')}
                                >
                                  {sensor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                      <TabsContent value="advanced" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="updateInterval">Update Interval (seconds)</Label>
                          <Input
                            id="updateInterval"
                            name="updateInterval"
                            type="number"
                            min="1"
                            max="3600"
                            value={config.updateInterval}
                            onChange={handleConfigChange}
                          />
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="instructions">
                            <AccordionTrigger>Setup Instructions</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm">
                                For detailed setup instructions, please visit:
                                <a
                                  href={selectedOption.setupInstructions}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary ml-1 underline"
                                >
                                  {selectedOption.setupInstructions}
                                </a>
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>
                      <TabsContent value="security" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username (if required)</Label>
                          <Input
                            id="username"
                            name="username"
                            value={config.username}
                            onChange={handleConfigChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password (if required)</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={config.password}
                            onChange={handleConfigChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key (if required)</Label>
                          <Input
                            id="apiKey"
                            name="apiKey"
                            value={config.apiKey}
                            onChange={handleConfigChange}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </>
              )}
            </div>

            <CardFooter className="flex justify-end pt-6 px-0">
              <Button type="submit" disabled={!selectedHardware || !connectionType || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Configure Hardware
              </Button>
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default HardwareSelector;
