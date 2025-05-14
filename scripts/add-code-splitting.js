#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Path to frontend directory
const frontendDir = path.join(__dirname, '..', 'frontend');
const componentsDir = path.join(frontendDir, 'src', 'components');

// Components to apply code splitting to
const componentsToSplit = [
  {
    name: 'Map3D',
    imports: [
      "import dynamic from 'next/dynamic';",
      "import React, { useEffect, useRef, useState } from 'react';",
    ],
    dynamicImport: `
// Dynamically import Cesium components with no SSR
const CesiumMap = dynamic(
  () => import('./CesiumMap'),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> }
);

// Placeholder component while map is loading
function MapLoadingPlaceholder() {
  return (
    <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D Map...</p>
      </div>
    </div>
  );
}`,
  },
  {
    name: 'TruckVisualization',
    imports: [
      "import dynamic from 'next/dynamic';",
      "import React, { useState, useEffect } from 'react';",
    ],
    dynamicImport: `
// Dynamically import Three.js component with no SSR
const TruckModel = dynamic(
  () => import('./TruckModel'),
  { ssr: false, loading: () => <ModelLoadingPlaceholder /> }
);

// Placeholder component while model is loading
function ModelLoadingPlaceholder() {
  return (
    <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D Model...</p>
      </div>
    </div>
  );
}`,
  },
  {
    name: 'PDFViewer',
    imports: ["import dynamic from 'next/dynamic';", "import React from 'react';"],
    dynamicImport: `
// Dynamically import PDF viewer with no SSR
const PDFViewerComponent = dynamic(
  () => import('./PDFViewerComponent'),
  { ssr: false, loading: () => <PDFLoadingPlaceholder /> }
);

// Placeholder component while PDF viewer is loading
function PDFLoadingPlaceholder() {
  return (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF Viewer...</p>
      </div>
    </div>
  );
}`,
  },
  {
    name: 'DataGrid',
    imports: ["import dynamic from 'next/dynamic';", "import React from 'react';"],
    dynamicImport: `
// Dynamically import DataGrid component
const DataGridComponent = dynamic(
  () => import('./DataGridComponent'),
  { loading: () => <DataGridLoadingPlaceholder /> }
);

// Placeholder component while DataGrid is loading
function DataGridLoadingPlaceholder() {
  return (
    <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Data Grid...</p>
      </div>
    </div>
  );
}`,
  },
  {
    name: 'ChartComponent',
    imports: ["import dynamic from 'next/dynamic';", "import React from 'react';"],
    dynamicImport: `
// Dynamically import Chart.js component
const Chart = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Chart),
  { loading: () => <ChartLoadingPlaceholder /> }
);

// Placeholder component while Chart is loading
function ChartLoadingPlaceholder() {
  return (
    <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Chart...</p>
      </div>
    </div>
  );
}`,
  },
];

// Function to check if a component file exists
function componentExists(componentName) {
  const componentPath = path.join(componentsDir, `${componentName}.tsx`);
  return fs.existsSync(componentPath);
}

// Function to create a dynamic import component
function createDynamicImportComponent(component) {
  const componentPath = path.join(componentsDir, `${component.name}.tsx`);

  if (!componentExists(component.name)) {
    console.log(`Component ${component.name} does not exist. Creating a placeholder component.`);

    // Create a placeholder component
    const placeholderContent = `import React from 'react';

export default function ${component.name}() {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">${component.name} Placeholder</h2>
      <p>This is a placeholder for the ${component.name} component.</p>
    </div>
  );
}
`;

    fs.writeFileSync(componentPath, placeholderContent);
    console.log(`Created placeholder component: ${componentPath}`);
  }

  // Read the existing component file
  const componentContent = fs.readFileSync(componentPath, 'utf8');

  // Check if the component already has dynamic imports
  if (componentContent.includes('dynamic(')) {
    console.log(`Component ${component.name} already has dynamic imports. Skipping.`);
    return false;
  }

  // Create the new component content with dynamic imports
  let newComponentContent = '';

  // Add imports
  for (const importStatement of component.imports) {
    if (!componentContent.includes(importStatement)) {
      newComponentContent += importStatement + '\n';
    }
  }

  // Add the rest of the original content
  newComponentContent += componentContent;

  // Add dynamic import before the component definition
  newComponentContent = newComponentContent.replace(
    `export default function ${component.name}`,
    `${component.dynamicImport}\n\nexport default function ${component.name}`
  );

  // Write the updated component file
  fs.writeFileSync(componentPath, newComponentContent);
  console.log(`Added dynamic imports to component: ${componentPath}`);

  return true;
}

// Function to create a dynamic import wrapper component
function createDynamicImportWrapper(component) {
  const wrapperPath = path.join(componentsDir, `${component.name}Wrapper.tsx`);

  // Create the wrapper component
  const wrapperContent = `import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ${component.name} component
const ${component.name} = dynamic(
  () => import('./${component.name}'),
  {
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ${component.name}...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Wrapper component with the same props as the original component
export default function ${component.name}Wrapper(props) {
  return <${component.name} {...props} />;
}
`;

  fs.writeFileSync(wrapperPath, wrapperContent);
  console.log(`Created dynamic import wrapper: ${wrapperPath}`);

  return true;
}

// Function to add code splitting to pages
function addCodeSplittingToPages() {
  const pagesDir = path.join(frontendDir, 'src', 'app', '(dashboard)');

  // Find all page.tsx files
  const pageFiles = [];

  function findPageFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findPageFiles(filePath);
      } else if (file === 'page.tsx') {
        pageFiles.push(filePath);
      }
    }
  }

  findPageFiles(pagesDir);

  console.log(`Found ${pageFiles.length} page files.`);

  // Add dynamic imports to pages
  for (const pageFile of pageFiles) {
    console.log(`Processing page: ${pageFile}`);

    // Read the page file
    const pageContent = fs.readFileSync(pageFile, 'utf8');

    // Check if the page already has dynamic imports
    if (pageContent.includes('dynamic(')) {
      console.log(`Page ${pageFile} already has dynamic imports. Skipping.`);
      continue;
    }

    // Check if the page imports any of the components to split
    let updatedPageContent = pageContent;
    let hasChanges = false;

    for (const component of componentsToSplit) {
      // Check if the page imports the component
      if (pageContent.includes(`import ${component.name} from`)) {
        // Replace the import with the wrapper import
        updatedPageContent = updatedPageContent.replace(
          `import ${component.name} from`,
          `import ${component.name} from`
        );

        hasChanges = true;
      }
    }

    if (hasChanges) {
      // Write the updated page file
      fs.writeFileSync(pageFile, updatedPageContent);
      console.log(`Updated imports in page: ${pageFile}`);
    }
  }
}

// Main function
async function addCodeSplitting() {
  try {
    console.log('Starting code splitting process...');

    // Create components directory if it doesn't exist
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
      console.log(`Created components directory: ${componentsDir}`);
    }

    // Add dynamic imports to components
    for (const component of componentsToSplit) {
      if (componentExists(component.name)) {
        createDynamicImportComponent(component);
      } else {
        createDynamicImportWrapper(component);
      }
    }

    // Add code splitting to pages
    addCodeSplittingToPages();

    console.log('Code splitting process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding code splitting:', error);
    process.exit(1);
  }
}

// Run the main function
addCodeSplitting();
