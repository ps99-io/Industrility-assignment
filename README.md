# GenAI DocGen

An AI-powered document generation platform that automatically creates checksheets and work instructions from uploaded documents using AWS Bedrock (Claude AI), Pinecone vector database, and document processing.

## 🎯 Project Overview

GenAI DocGen is a full-stack application that leverages generative AI to automatically transform source documents into structured, formatted documentation. The system processes documents, extracts relevant information using AI embeddings, and generates professional output tailored to specific use cases.

### Key Capabilities

- **Document Upload**: Secure multi-file upload to AWS S3
- **AI-Powered Analysis**: Uses Claude 3.5 Haiku for intelligent content generation
- **Vector Embeddings**: AWS Bedrock Titan Embed model for semantic understanding
- **Semantic Search**: Pinecone vector database for context retrieval
- **Multiple Output Formats**:
  - Checksheets (XLSX) - For maintenance technician checklists
  - Work Instructions (DOCX) - For step-by-step procedures
- **Presigned URLs**: Secure, time-limited access to files

## 📁 Repository Structure

```
genai-doc/
├── README.md                          # This file
├── package.json                       # Root package configuration
│
├── backend/                           # Serverless Lambda backend
│   ├── README.md                     # Backend documentation
│   ├── handler.js                    # Lambda handler functions
│   ├── serverless.yml                # Serverless Framework config
│   ├── package.json                  # Backend dependencies
│   └── src/
│       ├── clients/                  # AWS & external service clients
│       │   ├── bedRock.js           # Bedrock LLM client
│       │   ├── pineCone.js          # Pinecone vector DB client
│       │   └── s3Client.js          # AWS S3 client
│       ├── services/                 # Business logic
│       │   ├── embeddingService.js  # Embedding generation & storage
│       │   └── llmService.js        # LLM querying logic
│       └── utils/                    # Helper functions
│           └── fileStreamHelpers.js # File parsing & generation
│
└── frontend/                          # React web application
    └── genai-docgen-frontendcd/
        ├── README.md                 # Frontend documentation
        ├── package.json              # Frontend dependencies
        ├── public/                   # Static assets
        │   ├── index.html           # Main HTML
        │   ├── manifest.json        # PWA manifest
        │   └── robots.txt           # SEO robots file
        └── src/                      # React components
            ├── App.js               # Main app component
            ├── App.css              # App styles
            ├── App.test.js          # Tests
            ├── index.js             # React entry point
            ├── index.css            # Global styles
            ├── logo.svg             # Logo
            ├── reportWebVitals.js   # Performance monitoring
            └── setupTests.js        # Test setup
```

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         React Frontend Application                  │  │
│  │  - File Upload UI                                   │  │
│  │  - Use Case Selection                               │  │
│  │  - Download Management                              │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
         ┌───────────┴──────────┐
         │                      │
    ┌────▼──────┐      ┌───────▼────┐
    │   AWS S3  │      │ API Gateway│
    │(File Repo)│      │  Lambda    │
    └────▲──────┘      └───────┬────┘
         │                     │
         │                ┌────▼─────────────┐
         │                │  Handler.js      │
         │                │  (Orchestration) │
         │                └────┬──────┬──────┘
         │                     │      │
    ┌────┴─────────┬───────────┘      │
    │              │                  │
┌───▼─────┐ ┌─────▼───────┐ ┌────────▼────────┐
│AWS S3   │ │AWS Bedrock  │ │  Pinecone       │
│Storage  │ │- Titan      │ │ Vector DB       │
│(Files)  │ │  Embed      │ │(Embeddings)     │
│         │ │- Claude AI  │ └─────────────────┘
└─────────┘ └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 16.x or higher
- **npm**: 7.x or higher
- **AWS Account** with:
  - S3, Lambda, Bedrock, API Gateway access
  - IAM permissions configured
- **Pinecone Account** with active index
- **Git**: For version control

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/ps99-io/Industrility-assignment.git
cd genai-doc
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure AWS credentials
aws configure

# Set environment variables (create .env file)
cat > .env << EOF
BUCKET_NAME=genai-doc-generate
PINECONE_INDEX=llama-text-embed-v2-index
PINECONE_API_KEY=your_pinecone_api_key
AWS_REGION=us-east-1
EOF

# Start local development server (optional)
serverless offline start
```

See [Backend README](./backend/README.md) for detailed instructions.

#### 3. Frontend Setup

```bash
cd frontend/genai-docgen-frontendcd

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

See [Frontend README](./frontend/README.md) for detailed instructions.

## 📚 Documentation

Each component has detailed documentation:

- **[Backend Documentation](./backend/README.md)**

  - API endpoints
  - Architecture and services
  - Deployment to AWS
  - Configuration options
  - Security best practices

- **[Frontend Documentation](./frontend/README.md)**
  - Component structure
  - Development workflow
  - Deployment guides
  - API integration
  - Testing and optimization

## 🔌 API Endpoints

### Presigned URL Generation

```bash
GET /api/getPresignedUrl?filename=document.pdf

Response:
{
  "url": "https://s3.amazonaws.com/...",
  "key": "uploads/document.pdf"
}
```

### Document Processing & Generation

```bash
POST /api/generate

Body:
{
  "keys": ["uploads/doc1.pdf", "uploads/doc2.docx"],
  "useCase": "checksheet" | "workinstruction"
}

Response:
{
  "resultUrl": "https://s3.amazonaws.com/outputs/checksheet-1234567890.xlsx"
}
```

## 🔄 User Workflow

```
1. User Selects Files
   └─> Choose one or more documents (PDF, DOCX, etc.)

2. Select Use Case
   └─> Choose output type:
       ├─> Checksheet (XLSX format)
       └─> Work Instruction (DOCX format)

3. Upload & Process
   └─> Frontend uploads files to S3 via presigned URLs
   └─> Backend receives S3 keys and processes documents

4. AI Processing
   └─> Parse documents into text chunks
   └─> Generate embeddings via AWS Bedrock
   └─> Store embeddings in Pinecone
   └─> Query Claude AI for content generation

5. Output Generation
   └─> Format content based on use case
   └─> Generate XLSX or DOCX file
   └─> Upload to S3

6. Download
   └─> User receives presigned download URL
   └─> Download generated document
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 22.x
- **Framework**: AWS Lambda (Serverless)
- **Deployment**: Serverless Framework
- **Cloud Services**:
  - AWS S3 (Storage)
  - AWS Bedrock (LLM & Embeddings)
  - AWS Lambda (Compute)
  - AWS API Gateway (HTTP API)
- **External Services**:
  - Pinecone (Vector Database)
  - Claude AI (LLM)
- **Libraries**:
  - aws-sdk (AWS services)
  - xlsx (Excel generation)
  - docx (Word document generation)
  - pdf-parse (PDF extraction)
  - mammoth (DOCX parsing)

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Create React App 5.0.1
- **Testing**: Jest with React Testing Library
- **Styling**: CSS3
- **Package Manager**: npm

## 📋 Feature Details

### Checksheet Generation

- Creates maintenance technician checklists
- Excel format (XLSX)
- Row-column structure for easy filling
- Based on document analysis

### Work Instruction Generation

- Step-by-step procedures
- Word document format (DOCX)
- Professional formatting
- Numbered instructions based on document context

## 🔒 Security Features

### Implemented

- ✅ Presigned URLs for file access (time-limited)
- ✅ CORS enabled for cross-origin requests
- ✅ S3 bucket isolation
- ✅ AWS IAM permissions

### Recommended for Production

- [ ] Move API keys to AWS Secrets Manager
- [ ] Implement user authentication
- [ ] Enable S3 encryption at rest
- [ ] Configure CloudTrail logging
- [ ] Restrict CORS to specific domains
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable VPC endpoints

See security sections in [Backend](./backend/README.md#security-considerations) and [Frontend](./frontend/README.md#security-considerations) READMEs for details.

## 📊 Performance Metrics

- **File Upload**: 5-minute presigned URL expiration
- **Processing Time**: Depends on document size (typically 30-60 seconds)
- **Embedding Generation**: AWS Bedrock Titan Embed (1024-dimensional vectors)
- **LLM Response**: Claude 3.5 Haiku (cost-optimized, max 1000 tokens)
- **Download URL**: 10-minute presigned URL expiration

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend/genai-docgen-frontendcd
npm test
```

## 🚢 Deployment

### Deploy Backend to AWS

```bash
cd backend
serverless deploy
```

### Deploy Frontend

```bash
cd frontend/genai-docgen-frontendcd
npm run build
# Then deploy build/ folder to your hosting provider
```

See individual README files for detailed deployment instructions.

## 🐛 Troubleshooting

### Backend Issues

- **Bedrock Access Denied**: Check AWS credentials and IAM permissions
- **Pinecone Connection Failed**: Verify API key and index name
- **S3 Bucket Not Found**: Check bucket name and region
- **CORS Errors**: Verify CORS configuration in serverless.yml

### Frontend Issues

- **API Endpoint 404**: Verify backend is running and endpoint is correct
- **Files Not Uploading**: Check browser console, verify S3 permissions
- **Download Not Working**: Presigned URL may have expired, resubmit

See detailed troubleshooting guides in respective README files.

## 📝 Environment Variables

### Backend (.env)

```env
BUCKET_NAME=genai-doc-generate
PINECONE_INDEX=llama-text-embed-v2-index
PINECONE_API_KEY=your_api_key
AWS_REGION=us-east-1
```

### Frontend (.env)

```env
REACT_APP_API_ENDPOINT=https://your-api-endpoint
REACT_APP_ENVIRONMENT=development
```

## 📦 Dependencies

See `package.json` files in each directory for complete dependency lists:

- [Backend Dependencies](./backend/package.json)
- [Frontend Dependencies](./frontend/genai-docgen-frontendcd/package.json)

## 🔄 Development Workflow

```bash
# Terminal 1: Start Backend
cd backend
serverless offline start

# Terminal 2: Start Frontend
cd frontend/genai-docgen-frontendcd
npm start

# Terminal 3: Git operations
git add .
git commit -m "Your message"
git push
```

## 📞 Support & Questions

For issues or questions:

1. Check the detailed README in respective component directory
2. Review CloudWatch logs for backend issues
3. Check browser console for frontend errors
4. Test API endpoints with curl or Postman
5. Verify all environment variables are set correctly

## 📄 License

Proprietary - All rights reserved

## 👥 Contributors

- Project Lead: ps99.io

## 🔗 Repository Links

- **GitHub**: https://github.com/ps99-io/Industrility-assignment.git
- **Main Branch**: https://github.com/ps99-io/Industrility-assignment/tree/main

## 📅 Project Timeline

- **Creation Date**: November 2025
- **Current Version**: 1.0.0
- **Last Updated**: November 17, 2025

## 🚀 Future Enhancements

- [ ] Add user authentication and authorization
- [ ] Implement document preview before processing
- [ ] Support for additional output formats (PDF, HTML)
- [ ] Batch processing for multiple document sets
- [ ] Advanced customization templates
- [ ] Real-time processing progress updates
- [ ] Document versioning and history
- [ ] Multi-language support
- [ ] Mobile application (React Native)
- [ ] API rate limiting and usage analytics

## 💡 Architecture Decisions

### Why Serverless?

- No infrastructure management
- Pay-per-use pricing
- Auto-scaling
- Reduced operational overhead

### Why Pinecone?

- Managed vector database
- Easy integration with embeddings
- Semantic search capabilities
- No infrastructure to maintain

### Why AWS Bedrock?

- Access to multiple LLMs including Claude
- Managed service (no model hosting)
- Cost-effective for batch processing
- Built-in security and compliance

### Why React?

- Component-based architecture
- Rich ecosystem
- Developer experience
- Easy deployment to static hosting

---

**For detailed setup and usage instructions, please refer to the README files in the [backend](./backend/README.md) and [frontend](./frontend/README.md) directories.**
