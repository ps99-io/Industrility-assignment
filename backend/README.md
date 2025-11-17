# GenAI DocGen - Backend

A serverless AWS Lambda-based backend for generating automated documentation (checksheets and work instructions) using AI. This service processes uploaded documents, embeds them using AWS Bedrock, stores embeddings in Pinecone, and generates formatted outputs using Claude AI.

## Overview

The backend is a serverless application built with Node.js and deployed using the Serverless Framework. It orchestrates the following workflow:

1. **Document Upload**: Handles presigned URL generation for secure file uploads to AWS S3
2. **Document Processing**: Parses uploaded documents (PDF, DOCX, etc.) into text chunks
3. **Embedding**: Generates vector embeddings using AWS Bedrock (Titan Embed model)
4. **Vector Storage**: Stores embeddings in Pinecone vector database
5. **AI Generation**: Uses Claude 3.5 Haiku to generate checksheets or work instructions
6. **Output Generation**: Creates formatted XLSX or DOCX files
7. **Download**: Provides presigned URLs for secure file downloads

## Architecture

### AWS Services Used

- **AWS S3**: File storage for uploads and outputs
- **AWS Lambda**: Serverless compute for handler functions
- **AWS Bedrock**: LLM and embedding models
- **AWS API Gateway**: HTTP API endpoints

### Third-Party Services

- **Pinecone**: Vector database for storing embeddings
- **Claude AI**: LLM for content generation

## Project Structure

```
backend/
├── handler.js                 # Lambda handler functions
├── serverless.yml            # Serverless Framework configuration
├── package.json              # Node.js dependencies
└── src/
    ├── clients/              # AWS and external service clients
    │   ├── bedRock.js       # Bedrock LLM client
    │   ├── pineCone.js      # Pinecone vector DB client
    │   └── s3Client.js      # AWS S3 client
    ├── services/             # Business logic services
    │   ├── embeddingService.js    # Embedding generation and storage
    │   └── llmService.js          # LLM querying logic
    └── utils/                # Utility functions
        └── fileStreamHelpers.js    # File parsing and generation
```

## Prerequisites

### Required Accounts & Credentials

- AWS Account with access to:
  - S3, Lambda, Bedrock, API Gateway
  - IAM permissions for creating resources
- Pinecone account with API key
- Claude AI access via AWS Bedrock

### Environment Variables

Create a `.env` file in the backend directory (or set in Lambda):

```env
BUCKET_NAME=genai-doc-generate
PINECONE_INDEX=llama-text-embed-v2-index
PINECONE_API_KEY=your_pinecone_api_key_here
AWS_REGION=us-east-1
```

## Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Serverless Framework (if not already installed)**

   ```bash
   npm install -g serverless
   ```

4. **Configure AWS credentials**
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID and Secret Access Key

## Usage

### Local Development with Serverless Offline

1. **Install serverless-offline plugin** (already in devDependencies)

   ```bash
   npm install --save-dev serverless-offline
   ```

2. **Start the local server**
   ```bash
   serverless offline start
   ```
   The API will be available at `http://localhost:3000`

### Deploy to AWS

1. **Deploy the stack**

   ```bash
   serverless deploy
   ```

2. **View deployment info**

   ```bash
   serverless info
   ```

3. **Tear down resources**
   ```bash
   serverless remove
   ```

## API Endpoints

### 1. Get Presigned URL

Generates a presigned S3 URL for uploading files.

**Endpoint**: `GET /api/getPresignedUrl`

**Query Parameters**:

- `filename` (string): Name of the file to upload

**Response**:

```json
{
  "url": "https://s3.amazonaws.com/...",
  "key": "uploads/document.pdf"
}
```

**Example**:

```bash
curl "http://localhost:3000/api/getPresignedUrl?filename=document.pdf"
```

### 2. Generate Documentation

Processes documents and generates checksheet or work instruction.

**Endpoint**: `POST /api/generate`

**Request Body**:

```json
{
  "keys": ["uploads/document1.pdf", "uploads/document2.docx"],
  "useCase": "checksheet" | "workinstruction"
}
```

**Response**:

```json
{
  "resultUrl": "https://s3.amazonaws.com/outputs/..."
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "keys": ["uploads/doc.pdf"],
    "useCase": "checksheet"
  }'
```

## Key Functions

### `handler.js`

#### `getPresignedUrl(event)`

Generates a presigned URL for file upload to S3.

- **Input**: Query parameter `filename`
- **Output**: Presigned URL and S3 key
- **Duration**: 5 minutes expiration

#### `generate(event)`

Main orchestration function that:

1. Fetches documents from S3
2. Parses document content
3. Generates embeddings and stores in Pinecone
4. Queries Claude LLM with document context
5. Generates output file (XLSX or DOCX)
6. Returns presigned download URL

### `embeddingService.js`

#### `embedAndStoreTexts(textChunks)`

- Uses AWS Bedrock Titan Embed model
- Generates 1024-dimensional embeddings
- Stores in Pinecone with unique chunk IDs

### `llmService.js`

#### `queryLLM(prompt)`

- Uses Claude 3.5 Haiku model (most cost-effective)
- Max output tokens: 1000
- Returns formatted AI-generated content

### `fileStreamHelpers.js`

#### `parseDocument(buffer)`

Parses multiple file formats and extracts text chunks

#### `createChecksheetXLS(content)`

Generates an Excel checksheet formatted for maintenance technicians

#### `createWorkInstructionDOCX(content)`

Generates a Word document with structured work instructions

## Use Cases

### Checksheet Generation

Generates a maintenance checklist in Excel format that technicians can fill out:

- Row-column format for ease of use
- Structured checkpoints
- Printable format

### Work Instruction Generation

Creates detailed step-by-step instructions in Word format:

- Numbered steps
- Clear procedures
- Professional formatting

## Configuration

### serverless.yml

**Key Settings**:

- `runtime`: Node.js 22.x
- `region`: us-east-1
- `httpApi.cors`: Enabled for cross-origin requests
- `CORS origins`: Configured for `http://localhost:3000`

To modify allowed origins for deployment, update the `CorsConfiguration` in `serverless.yml`:

```yaml
AllowedOrigins:
  - "https://your-frontend-domain.com"
```

## Error Handling

All endpoints return:

- **Success**: `statusCode: 200` with JSON response body
- **Error**: `statusCode: 500` with error message

**CORS Headers**: All responses include `Access-Control-Allow-Origin: *` (modify for production)

## Security Considerations

### Production Checklist

- [ ] Move API keys to AWS Secrets Manager (not in code)
- [ ] Restrict CORS origins to your frontend domain
- [ ] Enable S3 bucket encryption
- [ ] Add request validation and rate limiting
- [ ] Implement authentication/authorization
- [ ] Use VPC endpoints for Pinecone
- [ ] Enable CloudTrail for audit logging
- [ ] Set S3 bucket versioning

### Current Limitations

- API keys are exposed in `serverless.yml` (development only)
- Presigned URLs expire after 5-10 minutes
- Max document processing time limited by Lambda timeout

## Dependencies

| Package                         | Version  | Purpose                  |
| ------------------------------- | -------- | ------------------------ |
| @aws-sdk/client-bedrock         | ^3.932.0 | Bedrock LLM client       |
| @aws-sdk/client-bedrock-runtime | ^3.932.0 | Bedrock runtime          |
| @aws-sdk/client-s3              | ^3.932.0 | S3 file operations       |
| @aws-sdk/s3-request-presigner   | ^3.932.0 | Presigned URL generation |
| @pinecone-database/pinecone     | ^6.1.3   | Vector database          |
| docx                            | ^7.1.2   | DOCX file generation     |
| xlsx                            | ^0.18.5  | XLSX file generation     |
| pdf-parse                       | ^1.1.1   | PDF parsing              |
| mammoth                         | ^1.4.2   | DOCX parsing             |

## Troubleshooting

### Common Issues

**"Bedrock access denied"**

- Verify AWS credentials are configured correctly
- Check IAM permissions include Bedrock access
- Verify correct region (us-east-1)

**"Pinecone connection failed"**

- Verify PINECONE_API_KEY environment variable
- Check Pinecone index exists and is active
- Verify index name matches PINECONE_INDEX

**"S3 bucket not found"**

- Verify bucket exists in correct region
- Check bucket name in BUCKET_NAME environment variable
- Verify CORS configuration for local development

**"File parsing failed"**

- Ensure file format is supported (PDF, DOCX, etc.)
- Check file is not corrupted
- Verify file size is reasonable

## Performance Optimization

- **Embedding**: Processes chunks in parallel where possible
- **LLM Calls**: Uses Haiku model for cost efficiency
- **File Generation**: Streams large files to reduce memory usage
- **S3 Upload**: Uses multipart uploads for large files

## Monitoring

View Lambda logs:

```bash
serverless logs -f generate
serverless logs -f getPresignedUrl
```

## Next Steps

1. Deploy backend to AWS
2. Update frontend with actual API endpoint
3. Test end-to-end document generation
4. Configure production domain and CORS
5. Set up CloudWatch monitoring and alarms

## Support

For issues or questions:

1. Check CloudWatch logs for error details
2. Verify all environment variables are set
3. Test individual endpoints with curl or Postman
4. Review AWS Bedrock and Pinecone documentation

## License

Proprietary - All rights reserved
