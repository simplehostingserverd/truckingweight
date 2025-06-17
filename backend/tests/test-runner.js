/**
 * TMS Test Runner
 * Comprehensive test execution for all TMS modules
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TMSTestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      api: { passed: 0, failed: 0, total: 0 },
      overall: { passed: 0, failed: 0, total: 0 }
    };
    
    this.testSuites = [
      {
        name: 'Maintenance API Tests',
        file: 'maintenance.test.js',
        type: 'api'
      },
      {
        name: 'IoT & Sensor Tests',
        file: 'iot.test.js',
        type: 'api'
      },
      {
        name: 'Analytics API Tests',
        file: 'analytics.test.js',
        type: 'api'
      },
      {
        name: 'Compliance API Tests',
        file: 'compliance.test.js',
        type: 'api'
      },
      {
        name: 'EDI Integration Tests',
        file: 'edi.test.js',
        type: 'api'
      },
      {
        name: 'ML Management Tests',
        file: 'ml.test.js',
        type: 'api'
      },
      {
        name: 'TMS Integration Tests',
        file: 'integration/tms-integration.test.js',
        type: 'integration'
      }
    ];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    const border = '='.repeat(60);
    this.log(border, 'cyan');
    this.log(`  ${message}`, 'cyan');
    this.log(border, 'cyan');
  }

  logSection(message) {
    this.log(`\n${'-'.repeat(40)}`, 'blue');
    this.log(`  ${message}`, 'blue');
    this.log(`${'-'.repeat(40)}`, 'blue');
  }

  async runTestSuite(suite) {
    this.log(`\nRunning ${suite.name}...`, 'yellow');
    
    try {
      const testPath = path.join(__dirname, suite.file);
      
      if (!fs.existsSync(testPath)) {
        this.log(`  ⚠️  Test file not found: ${suite.file}`, 'yellow');
        return { passed: 0, failed: 1, total: 1 };
      }

      // Run Jest for the specific test file
      const command = `npx jest ${testPath} --verbose --no-cache`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse Jest output to extract test results
      const results = this.parseJestOutput(output);
      
      this.log(`  ✅ ${results.passed} passed`, 'green');
      if (results.failed > 0) {
        this.log(`  ❌ ${results.failed} failed`, 'red');
      }
      
      return results;
      
    } catch (error) {
      this.log(`  ❌ Test suite failed: ${error.message}`, 'red');
      
      // Try to parse error output for test counts
      const errorOutput = error.stdout || error.stderr || '';
      const results = this.parseJestOutput(errorOutput);
      
      if (results.total === 0) {
        return { passed: 0, failed: 1, total: 1 };
      }
      
      return results;
    }
  }

  parseJestOutput(output) {
    const results = { passed: 0, failed: 0, total: 0 };
    
    // Look for Jest summary line like "Tests: 5 passed, 2 failed, 7 total"
    const summaryMatch = output.match(/Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+total)?/);
    
    if (summaryMatch) {
      results.passed = parseInt(summaryMatch[1]) || 0;
      results.failed = parseInt(summaryMatch[2]) || 0;
      results.total = parseInt(summaryMatch[3]) || (results.passed + results.failed);
    } else {
      // Fallback: count individual test results
      const passedMatches = output.match(/✓/g) || [];
      const failedMatches = output.match(/✕/g) || [];
      
      results.passed = passedMatches.length;
      results.failed = failedMatches.length;
      results.total = results.passed + results.failed;
    }
    
    return results;
  }

  async runAllTests() {
    this.logHeader('TMS Test Suite Runner');
    this.log('Running comprehensive tests for all TMS modules\n', 'bright');

    const startTime = Date.now();

    for (const suite of this.testSuites) {
      const results = await this.runTestSuite(suite);
      
      // Update overall results
      this.testResults[suite.type].passed += results.passed;
      this.testResults[suite.type].failed += results.failed;
      this.testResults[suite.type].total += results.total;
      
      this.testResults.overall.passed += results.passed;
      this.testResults.overall.failed += results.failed;
      this.testResults.overall.total += results.total;
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.generateReport(duration);
  }

  generateReport(duration) {
    this.logSection('Test Results Summary');

    // Overall results
    const { overall } = this.testResults;
    const successRate = overall.total > 0 ? ((overall.passed / overall.total) * 100).toFixed(1) : 0;
    
    this.log(`\nOverall Results:`, 'bright');
    this.log(`  Total Tests: ${overall.total}`, 'cyan');
    this.log(`  Passed: ${overall.passed}`, 'green');
    this.log(`  Failed: ${overall.failed}`, overall.failed > 0 ? 'red' : 'green');
    this.log(`  Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
    this.log(`  Duration: ${duration}s`, 'cyan');

    // Breakdown by test type
    this.log(`\nBreakdown by Test Type:`, 'bright');
    
    Object.entries(this.testResults).forEach(([type, results]) => {
      if (type === 'overall') return;
      
      const typeSuccessRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
      this.log(`  ${type.toUpperCase()}: ${results.passed}/${results.total} (${typeSuccessRate}%)`, 
        typeSuccessRate >= 90 ? 'green' : typeSuccessRate >= 70 ? 'yellow' : 'red');
    });

    // Coverage information
    this.logSection('Test Coverage');
    this.log('Modules Tested:', 'bright');
    this.log('  ✅ Maintenance Management', 'green');
    this.log('  ✅ IoT & Sensor Management', 'green');
    this.log('  ✅ Analytics & KPIs', 'green');
    this.log('  ✅ Compliance & Safety', 'green');
    this.log('  ✅ EDI Integration', 'green');
    this.log('  ✅ ML Management', 'green');
    this.log('  ✅ Cross-module Integration', 'green');

    // Recommendations
    this.logSection('Recommendations');
    
    if (overall.failed === 0) {
      this.log('🎉 All tests passed! Your TMS implementation is ready for deployment.', 'green');
    } else if (successRate >= 90) {
      this.log('✅ Most tests passed. Review failed tests before deployment.', 'yellow');
    } else if (successRate >= 70) {
      this.log('⚠️  Some tests failed. Address issues before proceeding.', 'yellow');
    } else {
      this.log('❌ Many tests failed. Significant issues need to be resolved.', 'red');
    }

    // Next steps
    this.log('\nNext Steps:', 'bright');
    this.log('1. Review any failed tests and fix underlying issues');
    this.log('2. Run frontend tests: npm run test:frontend');
    this.log('3. Perform manual testing of critical user flows');
    this.log('4. Check database migrations and seed data');
    this.log('5. Verify API documentation is up to date');

    // Exit with appropriate code
    process.exit(overall.failed > 0 ? 1 : 0);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'yellow');
    
    try {
      // Check if Jest is available
      execSync('npx jest --version', { stdio: 'pipe' });
      this.log('  ✅ Jest is available', 'green');
    } catch (error) {
      this.log('  ❌ Jest is not available. Run: npm install', 'red');
      process.exit(1);
    }

    // Check if test files exist
    const testDir = __dirname;
    if (!fs.existsSync(testDir)) {
      this.log('  ❌ Tests directory not found', 'red');
      process.exit(1);
    }
    
    this.log('  ✅ Test directory exists', 'green');
    this.log('Prerequisites check completed.\n', 'green');
  }
}

// Main execution
async function main() {
  const runner = new TMSTestRunner();
  
  try {
    await runner.checkPrerequisites();
    await runner.runAllTests();
  } catch (error) {
    runner.log(`\n❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TMSTestRunner;
