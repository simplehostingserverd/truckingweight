#!/usr/bin/env node

/**
 * Implement Missing CRUD Operations
 * Adds missing Create, Read, Update, Delete functionality throughout the application
 */

const fs = require('fs');
const path = require('path');

// Missing CRUD operations to implement
const MISSING_CRUD_OPERATIONS = {
  // Delete operations for main entities
  'src/app/(dashboard)/vehicles/page.tsx': {
    operations: ['delete'],
    entity: 'vehicles',
    description: 'Add delete functionality for vehicles',
  },
  'src/app/(dashboard)/drivers/page.tsx': {
    operations: ['delete'],
    entity: 'drivers',
    description: 'Add delete functionality for drivers',
  },
  'src/app/(dashboard)/loads/page.tsx': {
    operations: ['delete'],
    entity: 'loads',
    description: 'Add delete functionality for loads',
  },
  'src/app/(dashboard)/admin/companies/page.tsx': {
    operations: ['delete'],
    entity: 'companies',
    description: 'Add delete functionality for companies',
  },
  'src/app/(dashboard)/scales/page.tsx': {
    operations: ['delete'],
    entity: 'scales',
    description: 'Add delete functionality for scales',
  },

  // Missing API routes
  'src/app/api/vehicles/[id]/route.ts': {
    operations: ['create'],
    entity: 'vehicles',
    description: 'Create missing vehicle API route',
  },
  'src/app/api/drivers/[id]/route.ts': {
    operations: ['create'],
    entity: 'drivers',
    description: 'Create missing driver API route',
  },
  'src/app/api/loads/[id]/route.ts': {
    operations: ['update'],
    entity: 'loads',
    description: 'Update missing load API route',
  },
};

// Delete function template
const DELETE_FUNCTION_TEMPLATE = (entity, entityName) => `
  const handleDelete = async (id: number) => {
    if (!confirm(\`Are you sure you want to delete this ${entityName}?\`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('${entity}')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh the data
      mutate();

      // Show success message
      console.log('${entityName} deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting ${entityName}:', error);
      alert('Failed to delete ${entityName}');
    }
  };
`;

// API route template
const API_ROUTE_TEMPLATE = entity => `
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('${entity}')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('${entity}')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('${entity}')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

function addDeleteFunctionality(filePath, entity, entityName) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if delete functionality already exists
    if (content.includes('handleDelete') || content.includes('.delete()')) {
      console.log(`✅ Delete functionality already exists in ${path.basename(filePath)}`);
      return false;
    }

    // Add delete function before the return statement
    const deleteFunction = DELETE_FUNCTION_TEMPLATE(entity, entityName);

    // Find the component function and add the delete handler
    const componentRegex = /(export\s+default\s+function\s+\w+.*?\{)/s;
    const match = content.match(componentRegex);

    if (match) {
      const insertIndex = match.index + match[0].length;
      content = content.slice(0, insertIndex) + deleteFunction + content.slice(insertIndex);

      // Add delete button to the table/list if it doesn't exist
      if (!content.includes('Delete') && !content.includes('delete')) {
        // Look for action buttons or table cells and add delete button
        const actionButtonRegex = /(<Button[^>]*>.*?Edit.*?<\/Button>)/g;
        if (actionButtonRegex.test(content)) {
          content = content.replace(
            actionButtonRegex,
            '$1\n                <Button\n                  variant="destructive"\n                  size="sm"\n                  onClick={() => handleDelete(item.id)}\n                >\n                  Delete\n                </Button>'
          );
        }
      }

      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error adding delete functionality to ${filePath}:`, error.message);
    return false;
  }
}

function createApiRoute(filePath, entity) {
  try {
    const dir = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create the API route file
    const apiContent = API_ROUTE_TEMPLATE(entity);
    fs.writeFileSync(filePath, apiContent, 'utf8');

    return true;
  } catch (error) {
    console.error(`❌ Error creating API route ${filePath}:`, error.message);
    return false;
  }
}

function implementCrudOperation(filePath, config) {
  const { operations, entity, description } = config;
  let implemented = false;

  console.log(`🔧 ${description}`);

  for (const operation of operations) {
    switch (operation) {
      case 'delete':
        if (filePath.includes('page.tsx')) {
          const entityName = entity.slice(0, -1); // Remove 's' for singular
          if (addDeleteFunctionality(filePath, entity, entityName)) {
            implemented = true;
            console.log(`   ✅ Added delete functionality`);
          }
        }
        break;

      case 'create':
        if (filePath.includes('route.ts')) {
          if (createApiRoute(filePath, entity)) {
            implemented = true;
            console.log(`   ✅ Created API route`);
          }
        }
        break;

      case 'update':
        if (filePath.includes('route.ts')) {
          if (createApiRoute(filePath, entity)) {
            implemented = true;
            console.log(`   ✅ Updated API route`);
          }
        }
        break;
    }
  }

  return implemented;
}

function main() {
  console.log('🚀 Implementing missing CRUD operations...\n');

  let totalImplemented = 0;
  let totalOperations = Object.keys(MISSING_CRUD_OPERATIONS).length;

  for (const [filePath, config] of Object.entries(MISSING_CRUD_OPERATIONS)) {
    const fullPath = path.join(process.cwd(), filePath);

    if (implementCrudOperation(fullPath, config)) {
      totalImplemented++;
    }

    console.log(''); // Add spacing
  }

  console.log('📊 Summary:');
  console.log(`   Operations attempted: ${totalOperations}`);
  console.log(`   Operations implemented: ${totalImplemented}`);

  if (totalImplemented > 0) {
    console.log('\n🔍 Next steps:');
    console.log('   1. Test the new CRUD operations');
    console.log('   2. Run: npm run build');
    console.log('   3. Verify functionality in the UI');
    console.log('   4. Add proper error handling if needed');
  } else {
    console.log('\n✅ All CRUD operations already implemented or no changes needed!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { implementCrudOperation, addDeleteFunctionality, createApiRoute };
