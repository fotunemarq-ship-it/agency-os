# CSV Upload Format Guide

## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically


## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically


## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically


## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically


## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically


## Required CSV Format for Lead Uploads

### Required Column
- **Business Name** (required) - The name of the business/company

### Required/Optional Columns
- **Phone Number** - Contact phone number (recommended)
- **City** - City location (will be overridden by dropdown selection)
- **Has Website** - Boolean value indicating if business has a website: `true`, `false`, `yes`, `no`, `1`, or `0` (case-insensitive)
- **Website Link** - Full URL of the website (e.g., https://example.com)

### Auto-Assigned
- **Industry** - Will be set from dropdown selection (overrides CSV if present)

## Important Notes

1. **Industry Override**: The Industry column in your CSV (if present) will be **overridden** by the dropdown selection you make in the uploader. All leads in the upload will be tagged with the selected Industry.

2. **City Override**: The City column in your CSV will be **overridden** by the dropdown selection. All leads will be tagged with the selected City.

3. **Column Headers**: Column headers must match exactly (case-sensitive):
   - `Business Name` (required)
   - `Phone Number` (with space)
   - `City`
   - `Has Website` (with space)
   - `Website Link` (with space)

4. **Has Website Values**: Accepts multiple formats (case-insensitive):
   - `true` / `false`
   - `yes` / `no`
   - `1` / `0`

5. **File Format**: Must be a `.csv` file

## Example CSV File

```csv
Business Name,Phone Number,City,Has Website,Website Link
ABC Dental Clinic,555-123-4567,Austin,true,https://abcdental.com
XYZ Real Estate,555-234-5678,New York,true,https://xyzre.com
FitZone Gym,555-345-6789,Chicago,false,
Cool Air HVAC,555-456-7890,Los Angeles,true,https://coolairhvac.com
Legal Experts,555-567-8901,Miami,yes,https://legalexperts.com
```

## Minimal CSV Format (Only Required Column)

You can also use a minimal format with just the required column:

```csv
Business Name
ABC Dental Clinic
XYZ Real Estate
FitZone Gym
```

## Complete CSV Template

Here's a complete template you can copy and fill in:

```csv
Business Name,Phone Number,City,Has Website,Website Link
[Business Name 1],[Phone],[City],[true/false],[https://website.com]
[Business Name 2],[Phone],[City],[true/false],[https://website.com]
[Business Name 3],[Phone],[City],[true/false],[https://website.com]
```

## Upload Process

1. Select **Industry** from dropdown (required)
2. Select **City** from dropdown (required)
3. Choose **Lead Type** (Outbound/Cold or Inbound/Hot)
4. If Inbound, select **Source** (Facebook Ads, Google Ads, Website Form, Referral, or Other)
5. Upload your CSV file
6. Preview the data
7. Click "Upload" to save

## Common Issues

- **Missing Company Name**: Each row must have a Company Name
- **Invalid File Format**: Must be `.csv` file
- **Header Mismatch**: Column headers must match exactly as shown above
- **Empty Rows**: Empty rows will be skipped automatically

