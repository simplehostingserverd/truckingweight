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
 * 
 * Designed and built by Michael Anthony Trevino Jr., Lead Full-Stack Developer
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the application
  await initializeApp();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  await loadLicenses();
  await loadCustomers();
  await loadSettings();
});

// Initialize the application
async function initializeApp() {
  // Create the generate license form
  createGenerateLicenseForm();
  
  // Create the add customer form
  createAddCustomerForm();
  
  // Listen for refresh data events
  window.api.on('refresh-data', async () => {
    await loadLicenses();
    await loadCustomers();
  });
  
  // Listen for open settings events
  window.api.on('open-settings', () => {
    // Show settings tab
    const settingsTab = document.querySelector('[data-bs-target="#settings-tab"]');
    const tab = new bootstrap.Tab(settingsTab);
    tab.show();
  });
}

// Set up event listeners
function setupEventListeners() {
  // Generate license button
  document.getElementById('generate-license-btn').addEventListener('click', generateLicense);
  
  // Add customer button
  document.getElementById('add-customer-btn').addEventListener('click', addCustomer);
  
  // Settings form
  document.getElementById('settings-form').addEventListener('submit', saveSettings);
}

// Load licenses
async function loadLicenses() {
  try {
    const licenses = await window.api.getLicenses();
    const tbody = document.getElementById('licenses-tbody');
    tbody.innerHTML = '';
    
    if (licenses.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="7" class="text-center">No licenses found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    licenses.forEach(license => {
      const tr = document.createElement('tr');
      
      // Format dates
      const createdDate = new Date(license.createdAt).toLocaleDateString();
      const expiresDate = new Date(license.expiresAt).toLocaleDateString();
      
      // Determine status badge class
      let statusBadgeClass = 'badge-active';
      if (license.status === 'revoked') {
        statusBadgeClass = 'badge-revoked';
      } else if (new Date(license.expiresAt) < new Date()) {
        statusBadgeClass = 'badge-expired';
      }
      
      tr.innerHTML = `
        <td><code>${license.key}</code></td>
        <td>${license.customerName}</td>
        <td>${license.plan}</td>
        <td>${createdDate}</td>
        <td>${expiresDate}</td>
        <td><span class="badge ${statusBadgeClass}">${license.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-info view-license-btn" data-license-id="${license.id}">
            <i class="bi bi-eye"></i>
          </button>
          ${license.status === 'active' ? `
            <button class="btn btn-sm btn-outline-danger revoke-license-btn" data-license-id="${license.id}">
              <i class="bi bi-x-circle"></i>
            </button>
          ` : ''}
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.revoke-license-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const licenseId = e.currentTarget.getAttribute('data-license-id');
        if (confirm('Are you sure you want to revoke this license? This action cannot be undone.')) {
          await revokeLicense(licenseId);
        }
      });
    });
    
    document.querySelectorAll('.view-license-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const licenseId = e.currentTarget.getAttribute('data-license-id');
        const license = licenses.find(l => l.id === licenseId);
        if (license) {
          viewLicenseDetails(license);
        }
      });
    });
  } catch (error) {
    console.error('Error loading licenses:', error);
    alert('Failed to load licenses');
  }
}

// Load customers
async function loadCustomers() {
  try {
    const customers = await window.api.getCustomers();
    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = '';
    
    if (customers.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" class="text-center">No customers found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    customers.forEach(customer => {
      const tr = document.createElement('tr');
      
      // Format date
      const createdDate = new Date(customer.createdAt).toLocaleDateString();
      
      tr.innerHTML = `
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.company || '-'}</td>
        <td>${createdDate}</td>
        <td>${customer.stripeCustomerId || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary generate-for-customer-btn" data-customer-id="${customer.id}">
            <i class="bi bi-key"></i>
          </button>
          <button class="btn btn-sm btn-outline-info view-customer-btn" data-customer-id="${customer.id}">
            <i class="bi bi-eye"></i>
          </button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.generate-for-customer-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const customerId = e.currentTarget.getAttribute('data-customer-id');
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          openGenerateLicenseModal(customer);
        }
      });
    });
    
    document.querySelectorAll('.view-customer-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const customerId = e.currentTarget.getAttribute('data-customer-id');
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          viewCustomerDetails(customer);
        }
      });
    });
    
    // Update customer select in generate license form
    const customerSelect = document.getElementById('license-customer');
    customerSelect.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a customer';
    customerSelect.appendChild(defaultOption);
    
    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = `${customer.name} (${customer.email})`;
      customerSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading customers:', error);
    alert('Failed to load customers');
  }
}

// Load settings
async function loadSettings() {
  try {
    const settings = await window.api.getSettings();
    
    document.getElementById('apiUrl').value = settings.apiUrl || '';
    document.getElementById('stripeApiKey').value = settings.stripeApiKey || '';
    document.getElementById('adminEmail').value = settings.adminEmail || '';
  } catch (error) {
    console.error('Error loading settings:', error);
    alert('Failed to load settings');
  }
}

// Create generate license form
function createGenerateLicenseForm() {
  const form = document.getElementById('generate-license-form');
  
  form.innerHTML = `
    <div class="mb-3">
      <label for="license-customer" class="form-label">Customer</label>
      <select class="form-select" id="license-customer" required>
        <option value="">Select a customer</option>
      </select>
    </div>
    
    <div class="mb-3">
      <label for="license-plan" class="form-label">Plan</label>
      <select class="form-select" id="license-plan" required>
        <option value="basic">Basic</option>
        <option value="professional">Professional</option>
        <option value="enterprise">Enterprise</option>
        <option value="custom">Custom</option>
      </select>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <div class="mb-3">
          <label for="license-duration" class="form-label">Duration (days)</label>
          <input type="number" class="form-control" id="license-duration" value="365" min="1" required>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="mb-3">
          <label for="license-max-users" class="form-label">Max Users</label>
          <input type="number" class="form-control" id="license-max-users" value="10" min="1" required>
        </div>
      </div>
    </div>
    
    <div class="mb-3">
      <label for="license-max-tenants" class="form-label">Max Tenants</label>
      <input type="number" class="form-control" id="license-max-tenants" value="1" min="1" required>
    </div>
    
    <div class="mb-3">
      <label class="form-label">Features</label>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="feature-basic" checked disabled>
        <label class="form-check-label" for="feature-basic">Basic Features</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="feature-advanced">
        <label class="form-check-label" for="feature-advanced">Advanced Features</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="feature-api">
        <label class="form-check-label" for="feature-api">API Access</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="feature-premium">
        <label class="form-check-label" for="feature-premium">Premium Support</label>
      </div>
    </div>
    
    <div class="mb-3">
      <label for="license-domains" class="form-label">Authorized Domains (comma-separated)</label>
      <input type="text" class="form-control" id="license-domains" placeholder="example.com, subdomain.example.com">
    </div>
    
    <div class="mb-3">
      <label for="license-notes" class="form-label">Notes</label>
      <textarea class="form-control" id="license-notes" rows="3"></textarea>
    </div>
  `;
}

// Create add customer form
function createAddCustomerForm() {
  const form = document.getElementById('add-customer-form');
  
  form.innerHTML = `
    <div class="mb-3">
      <label for="customer-name" class="form-label">Name</label>
      <input type="text" class="form-control" id="customer-name" required>
    </div>
    
    <div class="mb-3">
      <label for="customer-email" class="form-label">Email</label>
      <input type="email" class="form-control" id="customer-email" required>
    </div>
    
    <div class="mb-3">
      <label for="customer-company" class="form-label">Company</label>
      <input type="text" class="form-control" id="customer-company">
    </div>
    
    <div class="mb-3">
      <label for="customer-phone" class="form-label">Phone</label>
      <input type="tel" class="form-control" id="customer-phone">
    </div>
    
    <div class="mb-3">
      <label for="customer-stripe-id" class="form-label">Stripe Customer ID</label>
      <input type="text" class="form-control" id="customer-stripe-id" placeholder="cus_...">
    </div>
    
    <div class="mb-3">
      <label for="customer-notes" class="form-label">Notes</label>
      <textarea class="form-control" id="customer-notes" rows="3"></textarea>
    </div>
  `;
}

// Generate license
async function generateLicense() {
  try {
    const customerId = document.getElementById('license-customer').value;
    const plan = document.getElementById('license-plan').value;
    const duration = parseInt(document.getElementById('license-duration').value);
    const maxUsers = parseInt(document.getElementById('license-max-users').value);
    const maxTenants = parseInt(document.getElementById('license-max-tenants').value);
    const domains = document.getElementById('license-domains').value.split(',').map(d => d.trim()).filter(Boolean);
    const notes = document.getElementById('license-notes').value;
    
    // Get features
    const features = ['basic'];
    if (document.getElementById('feature-advanced').checked) features.push('advanced');
    if (document.getElementById('feature-api').checked) features.push('api');
    if (document.getElementById('feature-premium').checked) features.push('premium');
    
    // Validate form
    if (!customerId) {
      alert('Please select a customer');
      return;
    }
    
    // Get customer data
    const customers = await window.api.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
      alert('Customer not found');
      return;
    }
    
    // Generate license
    const licenseData = {
      id: customerId,
      name: customer.name,
      email: customer.email,
      plan,
      duration,
      maxUsers,
      maxTenants,
      features,
      domains,
      notes,
      stripeCustomerId: customer.stripeCustomerId,
    };
    
    const license = await window.api.generateLicense(licenseData);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('generateLicenseModal'));
    modal.hide();
    
    // Show success message
    alert(`License generated successfully: ${license.key}`);
    
    // Reload licenses
    await loadLicenses();
  } catch (error) {
    console.error('Error generating license:', error);
    alert('Failed to generate license');
  }
}

// Add customer
async function addCustomer() {
  try {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const company = document.getElementById('customer-company').value;
    const phone = document.getElementById('customer-phone').value;
    const stripeCustomerId = document.getElementById('customer-stripe-id').value;
    const notes = document.getElementById('customer-notes').value;
    
    // Validate form
    if (!name || !email) {
      alert('Name and email are required');
      return;
    }
    
    // Add customer
    const customerData = {
      name,
      email,
      company,
      phone,
      stripeCustomerId,
      notes,
    };
    
    await window.api.addCustomer(customerData);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCustomerModal'));
    modal.hide();
    
    // Show success message
    alert('Customer added successfully');
    
    // Reload customers
    await loadCustomers();
  } catch (error) {
    console.error('Error adding customer:', error);
    alert('Failed to add customer');
  }
}

// Revoke license
async function revokeLicense(licenseId) {
  try {
    await window.api.revokeLicense(licenseId);
    
    // Show success message
    alert('License revoked successfully');
    
    // Reload licenses
    await loadLicenses();
  } catch (error) {
    console.error('Error revoking license:', error);
    alert('Failed to revoke license');
  }
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();
  
  try {
    const apiUrl = document.getElementById('apiUrl').value;
    const stripeApiKey = document.getElementById('stripeApiKey').value;
    const adminEmail = document.getElementById('adminEmail').value;
    
    // Save settings
    await window.api.saveSettings({
      apiUrl,
      stripeApiKey,
      adminEmail,
    });
    
    // Show success message
    alert('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('Failed to save settings');
  }
}

// Open generate license modal for a specific customer
function openGenerateLicenseModal(customer) {
  const customerSelect = document.getElementById('license-customer');
  customerSelect.value = customer.id;
  
  const modal = new bootstrap.Modal(document.getElementById('generateLicenseModal'));
  modal.show();
}

// View license details
function viewLicenseDetails(license) {
  // Implementation will be added later
  alert(`License details for ${license.key}`);
}

// View customer details
function viewCustomerDetails(customer) {
  // Implementation will be added later
  alert(`Customer details for ${customer.name}`);
}
