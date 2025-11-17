# GenAI DocGen - Frontend

A React-based web application for uploading documents and generating automated documentation (checksheets and work instructions) using AI-powered analysis.

## Overview

The frontend provides an intuitive user interface for:

- Uploading multiple documents (PDF, DOCX, etc.)
- Selecting the type of output to generate (checksheet or work instruction)
- Processing documents through the AI pipeline
- Downloading generated documentation

## Features

- **Multi-file Upload**: Upload multiple documents at once
- **Use Case Selection**: Choose between checksheet or work instruction generation
- **Real-time Feedback**: Loading states and progress indicators
- **Download Management**: Direct download links for generated files
- **Responsive Design**: Works on desktop and tablet devices
- **CORS Support**: Securely communicates with backend API

## Project Structure

```
frontend/
└── genai-docgen-frontendcd/
    ├── package.json              # React app dependencies
    ├── public/                   # Static assets
    │   ├── index.html           # Main HTML file
    │   ├── manifest.json        # PWA manifest
    │   └── robots.txt           # SEO robots file
    └── src/
        ├── App.js               # Main app component
        ├── App.css              # App styling
        ├── App.test.js          # App tests
        ├── index.js             # React entry point
        ├── index.css            # Global styles
        ├── logo.svg             # App logo
        ├── reportWebVitals.js   # Performance monitoring
        └── setupTests.js        # Test configuration
```

## Prerequisites

### Node.js and npm

- Node.js 16.x or higher
- npm 7.x or higher

### Backend API

The frontend requires the backend API to be running. See `../backend/README.md` for setup instructions.

## Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend/genai-docgen-frontendcd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment Configuration

### API Endpoint

The current API endpoint is hardcoded in `App.js`:

```javascript
https://iale9abotk.execute-api.us-east-1.amazonaws.com
```

To change the API endpoint:

1. Open `src/App.js`
2. Locate the fetch URL in the `uploadFilesAndGenerate` function
3. Replace with your backend API endpoint:
   ```javascript
   `https://your-api-endpoint/api/getPresignedUrl?filename=${file.name}`;
   ```

### For Local Development

If running the backend locally with Serverless Offline:

```javascript
http://localhost:3000/api/getPresignedUrl
```

## Usage

### Development Server

1. **Start the development server**

   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

2. **The app will automatically reload when you make changes**

### Building for Production

1. **Create an optimized production build**

   ```bash
   npm run build
   ```

   This creates a `build/` directory with optimized files

2. **Deploy the build folder to your hosting provider**
   - AWS S3 + CloudFront
   - Vercel
   - Netlify
   - Any static file hosting

### Running Tests

```bash
npm test
```

Launches the test runner in interactive watch mode.

## Application Flow

### User Workflow

1. **Upload Documents**

   - User selects one or more files (PDF, DOCX, etc.)
   - Files are displayed in the UI

2. **Select Use Case**

   - Choose between:
     - **Checksheet**: For maintenance technician checklists
     - **Work Instruction**: For step-by-step procedures

3. **Submit for Processing**

   - Click "Generate" button
   - UI shows loading state
   - Backend processes documents

4. **Receive Results**
   - Backend generates output file
   - Download link appears in UI
   - User downloads generated document

### Technical Flow

```
User Selection
     ↓
Upload Files to S3 (via presigned URLs)
     ↓
Send S3 keys + useCase to backend
     ↓
Backend processes documents
     ↓
Receive presigned download URL
     ↓
Provide download link to user
```

## Key Components

### App.js

Main application component with the following state management:

```javascript
const [files, setFiles] = useState([]); // Selected files
const [useCase, setUseCase] = useState(""); // checksheet or workinstruction
const [resultUrl, setResultUrl] = useState(""); // Download URL
const [loading, setLoading] = useState(false); // Loading indicator
```

### Key Functions

#### `handleFileChange(e)`

- Handles file selection from input
- Stores selected files in state

#### `handleUseCaseChange(e)`

- Handles use case selection dropdown
- Updates useCase state

#### `uploadFilesAndGenerate()`

Main orchestration function:

1. Gets presigned URLs for each file
2. Uploads files to S3
3. Calls backend `/api/generate` endpoint
4. Stores download URL
5. Displays loading state during processing

## UI Components

### File Input

```html
<input
  type="file"
  multiple
  onChange="{handleFileChange}"
  accept=".pdf,.docx,.doc,.txt"
/>
```

### Use Case Selection

```html
<select value="{useCase}" onChange="{handleUseCaseChange}">
  <option value="">Select Use Case</option>
  <option value="checksheet">Checksheet</option>
  <option value="workinstruction">Work Instruction</option>
</select>
```

### Generate Button

```html
<button
  onClick="{uploadFilesAndGenerate}"
  disabled="{!files.length"
  ||
  !useCase
  ||
  loading}
>
  {loading ? "Processing..." : "Generate"}
</button>
```

### Download Link

```html
{resultUrl && (
<a href="{resultUrl}" download> Download Generated Document </a>
)}
```

## Styling

The application uses CSS files for styling:

- **App.css**: Component-specific styles
- **index.css**: Global styles and base styling

### Customizing Styles

Edit the CSS files to customize:

- Colors and fonts
- Layout and spacing
- Responsive breakpoints
- Button and input styles

## API Integration

### Endpoints Called

#### 1. Get Presigned URL

```javascript
GET /api/getPresignedUrl?filename={filename}

Response:
{
  "url": "https://s3.amazonaws.com/...",
  "key": "uploads/filename"
}
```

#### 2. Generate Documentation

```javascript
POST /api/generate

Body:
{
  "keys": ["uploads/file1.pdf", "uploads/file2.pdf"],
  "useCase": "checksheet|workinstruction"
}

Response:
{
  "resultUrl": "https://s3.amazonaws.com/outputs/..."
}
```

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- **Code Splitting**: React Scripts automatically optimizes bundle size
- **Lazy Loading**: Consider lazy loading components for larger apps
- **Caching**: Service Worker can be enabled via `create-react-app`
- **Compression**: Enable Gzip compression on hosting

## Deployment

### Deploy to AWS S3 + CloudFront

1. **Build the app**

   ```bash
   npm run build
   ```

2. **Create S3 bucket**

   ```bash
   aws s3 mb s3://your-app-bucket --region us-east-1
   ```

3. **Upload build files**

   ```bash
   aws s3 sync build/ s3://your-app-bucket
   ```

4. **Create CloudFront distribution** pointing to S3 bucket

### Deploy to Vercel

1. **Push code to GitHub**
2. **Connect GitHub repo to Vercel**
3. **Vercel automatically builds and deploys on push**

### Deploy to Netlify

1. **Push code to GitHub**
2. **Connect GitHub repo to Netlify**
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `build`

## Troubleshooting

### Common Issues

**"CORS error when calling backend"**

- Verify backend has CORS enabled
- Check `serverless.yml` has correct allowed origins
- Test with backend running locally first

**"Files not uploading"**

- Check browser console for error details
- Verify file size is reasonable
- Check S3 bucket permissions

**"Generate button disabled"**

- Ensure you've selected at least one file
- Select a use case from dropdown
- Check files are valid format

**"Download link not working"**

- Presigned URL may have expired (10 minute timeout)
- Resubmit to generate new URL
- Check browser's download settings

**"API endpoint 404 error"**

- Verify backend API is running
- Check endpoint URL in `App.js`
- Test endpoint with curl before testing in app

## Development Workflow

### Making Changes

1. Edit files in `src/` directory
2. App automatically reloads in browser
3. Check console for errors/warnings

### Adding Features

Example: Adding file size validation

```javascript
const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validFiles = selectedFiles.filter((file) => file.size <= maxSize);

  setFiles(validFiles);
};
```

## Testing

### Running Tests

```bash
npm test
```

### Example Test (App.test.js)

```javascript
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders upload section", () => {
  render(<App />);
  const uploadInput = screen.getByRole("button", { name: /generate/i });
  expect(uploadInput).toBeInTheDocument();
});
```

## Security Considerations

### Production Checklist

- [ ] Update API endpoint to production URL
- [ ] Enable HTTPS only
- [ ] Implement authentication if needed
- [ ] Add request/response validation
- [ ] Sanitize file inputs
- [ ] Implement rate limiting on frontend
- [ ] Remove console.log statements
- [ ] Configure Content Security Policy headers
- [ ] Enable secure cookies
- [ ] Add error boundary components

### Current Limitations

- No user authentication
- No file size validation
- Presigned URLs visible in network tab
- No offline capability

## Dependencies

| Package                   | Version | Purpose              |
| ------------------------- | ------- | -------------------- |
| react                     | ^19.2.0 | UI library           |
| react-dom                 | ^19.2.0 | React DOM rendering  |
| react-scripts             | 5.0.1   | Build and dev server |
| @testing-library/react    | ^16.3.0 | Component testing    |
| @testing-library/jest-dom | ^6.9.1  | Testing utilities    |
| web-vitals                | ^2.1.4  | Performance metrics  |

## Available Scripts

```bash
npm start          # Run development server
npm run build      # Create production build
npm test           # Run tests in watch mode
npm run eject      # Eject from Create React App (irreversible)
```

## Environment Variables

Create a `.env` file in the frontend directory (optional):

```env
REACT_APP_API_ENDPOINT=https://your-api-endpoint
REACT_APP_ENVIRONMENT=development
```

Access in code:

```javascript
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
```

## Performance Monitoring

The app includes Web Vitals monitoring in `reportWebVitals.js`. To view metrics:

```javascript
import reportWebVitals from "./reportWebVitals";

reportWebVitals(console.log);
```

## Next Steps

1. Update API endpoint to your backend
2. Test with local backend running
3. Deploy backend to AWS
4. Update API endpoint to production URL
5. Test end-to-end flow
6. Deploy frontend to hosting provider
7. Monitor for errors and optimize

## Support

For issues or questions:

1. Check browser console for error messages
2. Verify backend API is running and accessible
3. Test API endpoints with curl or Postman
4. Review React and Create React App documentation

## License

Proprietary - All rights reserved
