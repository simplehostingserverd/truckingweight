'use client';

import React from 'react';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">TruckingWeight Design System</h1>
        <p className="text-xl text-muted-foreground">
          A showcase of our design system components and styles
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Color Palette</h2>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Primary Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-deepBlue text-white rounded-md">
              Deep Blue <br /> #0D2B4B
            </div>
            <div className="p-6 bg-highwayYellow text-black rounded-md">
              Highway Yellow <br /> #FFC107
            </div>
            <div className="p-6 bg-steelGray text-white rounded-md">
              Steel Gray <br /> #607D8B
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Secondary Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 bg-forestGreen text-white rounded-md">
              Forest Green <br /> #2E7D32
            </div>
            <div className="p-6 bg-brickRed text-white rounded-md">
              Brick Red <br /> #C62828
            </div>
            <div className="p-6 bg-slate text-white rounded-md">
              Slate <br /> #455A64
            </div>
            <div className="p-6 bg-skyBlue text-white rounded-md">
              Sky Blue <br /> #03A9F4
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">System Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-alert-DEFAULT text-white rounded-md">
              Alert Red <br /> #D50000
            </div>
            <div className="p-6 bg-success-DEFAULT text-white rounded-md">
              Success Green <br /> #00C853
            </div>
            <div className="p-6 bg-warning-DEFAULT text-black rounded-md">
              Warning Orange <br /> #FF6D00
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Typography</h2>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1 (36px)</h1>
            <p className="text-muted-foreground">Font weight: Bold (700)</p>
          </div>
          
          <div>
            <h2 className="text-3xl font-semibold">Heading 2 (30px)</h2>
            <p className="text-muted-foreground">Font weight: Semibold (600)</p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold">Heading 3 (24px)</h3>
            <p className="text-muted-foreground">Font weight: Semibold (600)</p>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold">Heading 4 (20px)</h4>
            <p className="text-muted-foreground">Font weight: Semibold (600)</p>
          </div>
          
          <div>
            <p className="text-base">Body text (16px) - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-muted-foreground">Font weight: Regular (400)</p>
          </div>
          
          <div>
            <p className="text-sm">Small text (14px) - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-muted-foreground">Font weight: Regular (400)</p>
          </div>
          
          <div>
            <p className="text-xs">Caption text (12px) - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-muted-foreground">Font weight: Regular (400)</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Buttons</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Button Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Button Sizes</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Button States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading>Loading</Button>
              <Button isLoading loadingText="Saving...">Save</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Form Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Input</h3>
            <Input label="Default Input" placeholder="Enter text here" />
            <Input 
              label="Input with Helper Text" 
              placeholder="Enter text here" 
              helperText="This is some helpful text"
            />
            <Input 
              label="Input with Error" 
              placeholder="Enter text here" 
              error="This field is required"
            />
            <Input 
              label="Disabled Input" 
              placeholder="Enter text here" 
              disabled
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Select</h3>
            <Select 
              label="Default Select" 
              placeholder="Select an option"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
            <Select 
              label="Select with Helper Text" 
              placeholder="Select an option"
              helperText="This is some helpful text"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
            <Select 
              label="Select with Error" 
              placeholder="Select an option"
              error="This field is required"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
            <Select 
              label="Disabled Select" 
              placeholder="Select an option"
              disabled
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card. It can contain any elements.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Primary Action</Button>
              <Button variant="ghost" className="ml-2">Secondary Action</Button>
            </CardFooter>
          </Card>
          
          <Card hoverable>
            <CardHeader>
              <CardTitle>Hoverable Card</CardTitle>
              <CardDescription>This card has a hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the effect. This is useful for clickable cards.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Learn More</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Badges</h2>
        
        <div className="flex flex-wrap gap-4">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="alert">Alert</Badge>
        </div>
      </section>
    </div>
  );
}
