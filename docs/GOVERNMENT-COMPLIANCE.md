# Government Compliance Documentation

This document outlines the compliance measures implemented in the city dashboard database to ensure data security, privacy, and adherence to government regulations.

## Data Isolation

### Row Level Security (RLS)

Row Level Security has been implemented on all tables to ensure that city users can only access data from their own city:

1. **Cities Table**
   - City users can only view their own city's information
   - City admins can only update their own city's information
   - Basic city information is available to all users for registration purposes

2. **City Users Table**
   - City users can only view users from their own city
   - City admins can manage users from their own city
   - Users can always see their own profile

3. **City Scales Table**
   - City users can only view scales from their own city
   - City admins and operators can manage scales from their own city

4. **City Permits Table**
   - City users can only view permits from their own city
   - City admins and operators can manage permits from their own city

5. **City Weigh Tickets Table**
   - City users can only view weigh tickets from their own city
   - City admins, operators, and inspectors can manage weigh tickets from their own city

6. **City Violations Table**
   - City users can only view violations from their own city
   - City admins and inspectors can manage violations from their own city

## Audit Logging

An audit logging system has been implemented to track all changes to the database:

1. **Audit Logs Table**
   - Records all INSERT, UPDATE, and DELETE operations
   - Captures old and new data values
   - Records the user who made the change
   - Records timestamp, IP address, and user agent
   - Only city admins can view audit logs for their own city

2. **Audit Triggers**
   - Automatically log changes to all city-related tables
   - Capture detailed information about each change

## Data Retention

A data retention policy has been implemented to comply with government record-keeping requirements:

1. **Archive Tables**
   - Archived_weigh_tickets
   - Archived_violations
   - Archived_permits

2. **Retention Periods**
   - Data is archived after 7 years (typical government retention period)
   - Archived data is still accessible to city admins for compliance purposes

3. **Archiving Process**
   - Automated archiving function moves old data to archive tables
   - Original data is deleted after successful archiving

## Data Encryption

Sensitive data encryption has been implemented:

1. **Encryption Functions**
   - `encrypt_sensitive_data()` - Encrypts sensitive information
   - `decrypt_sensitive_data()` - Decrypts data when needed

2. **Encrypted Data Types**
   - Personal identifying information
   - Financial information
   - Sensitive vehicle information

## User Authentication and Authorization

1. **User Roles**
   - Admin: Full access to all city features
   - Operator: Can record weighings and manage permits
   - Inspector: Can record weighings and issue violations
   - Viewer: Read-only access to dashboard, scales, permits, and reports

2. **Role-Based Access Control**
   - Each role has specific permissions
   - Access is restricted based on role and city

## Compliance with Government Standards

The database implementation complies with the following government standards:

1. **NIST 800-53**
   - Access Control (AC)
   - Audit and Accountability (AU)
   - Identification and Authentication (IA)
   - System and Information Integrity (SI)

2. **FIPS 140-2**
   - Cryptographic module security

3. **FISMA**
   - Federal Information Security Management Act requirements

4. **State and Local Government Requirements**
   - Data retention policies
   - Public records requirements
   - Transportation department regulations

## Data Backup and Recovery

1. **Backup Procedures**
   - Daily automated backups
   - Point-in-time recovery capability
   - 30-day backup retention

2. **Disaster Recovery**
   - Offsite backup storage
   - Recovery procedures documented

## Security Monitoring

1. **Activity Monitoring**
   - Unusual access patterns detection
   - Failed login attempt tracking
   - Suspicious activity alerts

2. **Vulnerability Management**
   - Regular security assessments
   - Patch management procedures

## Implementation Verification

To verify that the security measures are working correctly:

1. **Testing Procedure**
   - Log in as a user from one city
   - Attempt to access data from another city
   - Verify that access is denied
   - Check audit logs to confirm the access attempt was recorded

2. **Regular Audits**
   - Quarterly security audits
   - Annual compliance review

## Reporting and Compliance

1. **Compliance Reports**
   - Generate reports from audit logs
   - Track user activity and data access

2. **Incident Response**
   - Procedures for handling security incidents
   - Reporting requirements for data breaches

## Conclusion

The implemented security measures ensure that:

1. Each city can only access its own data
2. All data access and changes are tracked
3. Sensitive data is encrypted
4. Data is retained according to government requirements
5. The system complies with relevant government standards

These measures provide a secure, compliant environment for city transportation departments to manage their weighing operations while maintaining strict data isolation between different cities.
