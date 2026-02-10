# Deploying Evolution of Todo Backend to Hugging Face Spaces

This guide explains how to deploy the Evolution of Todo backend to Hugging Face Spaces using Docker.

## Prerequisites

- A Hugging Face account (sign up at https://huggingface.com)
- Git installed on your system
- Git credentials configured with Hugging Face access token

## Step-by-Step Deployment

### 1. Create a Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Choose the following settings:
   - **Space ID**: `syedabeerahmed/Evolution-of-Todo` (or your preferred name)
   - **SDK**: Docker
   - **Hardware**: CPU Basic (or your preferred option)
   - **Visibility**: Public or Private (as per your preference)

### 2. Clone the Space Repository

```bash
# When prompted for a password, use your Hugging Face access token
git clone https://huggingface.co/spaces/syedabeerahmed/Evolution-of-Todo

# Navigate to the space directory
cd Evolution-of-Todo
```

### 3. Prepare the Application Files

Copy the following files to your Space repository:

1. `requirements.txt` - Contains Python dependencies
2. `app.py` - The FastAPI application
3. `Dockerfile` - Docker configuration for Hugging Face
4. `README.md` - Documentation for your Space

### 4. Set Up Environment Variables (Optional)

If your application needs environment variables, you can set them in the Space settings:
1. Go to your Space page on Hugging Face
2. Click on "Files" tab
3. Look for "Secrets" or environment variable settings
4. Add any required environment variables

### 5. Commit and Push Files

```bash
# Copy the prepared files to your Space directory
cp /path/to/huggingface-backend/* .

# Add all files to git
git add .

# Commit the changes
git commit -m "Add Evolution of Todo backend application"

# Push to Hugging Face
git push
```

### 6. Monitor the Deployment

1. Go to your Space page on Hugging Face
2. Watch the "Logs" tab to monitor the build and deployment process
3. The Space will automatically build and deploy when you push changes
4. Once built, your application will be available at:
   `https://huggingface.co/spaces/syedabeerahmed/Evolution-of-Todo`

## Application Configuration

### Port Configuration
- The application is configured to listen on port 7860 as required by Hugging Face Spaces
- This is set in both the `app.py` file and the `Dockerfile`

### Database
- The application uses SQLite for persistent storage
- The database file is stored in the application directory
- Data will persist between container restarts but not between deployments

### API Endpoints
Once deployed, your API will be available at:
- Base URL: `https://YOUR_SPACE_NAME.hf.space/`
- Health check: `https://YOUR_SPACE_NAME.hf.space/health`
- Tasks API: `https://YOUR_SPACE_NAME.hf.space/tasks/`

## Testing the Deployment

After deployment, you can test your API endpoints:

```bash
# Test the main endpoint
curl https://your-space-name.hf.space/

# Test the health endpoint
curl https://your-space-name.hf.space/health

# Test the tasks endpoint
curl https://your-space-name.hf.space/tasks/
```

## Updating the Application

To update your deployed application:

1. Make changes to your local files
2. Commit and push the changes:
```bash
git add .
git commit -m "Update application"
git push
```

3. The Space will automatically rebuild and redeploy

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check the build logs in the Space dashboard
   - Ensure all dependencies are listed in `requirements.txt`
   - Verify the Dockerfile syntax is correct

2. **Runtime Errors**:
   - Check the runtime logs in the Space dashboard
   - Ensure the application listens on port 7860
   - Verify all required dependencies are installed

3. **Port Issues**:
   - Ensure your application binds to `0.0.0.0:7860`
   - Check that the CMD in Dockerfile matches the port

### Useful Commands:
```bash
# Check if your local application works
uvicorn app:app --host 0.0.0.0 --port 7860

# Test the Docker build locally
docker build -t evolution-todo-backend .
docker run -p 7860:7860 evolution-todo-backend
```

## Security Considerations

- Store sensitive information in Space secrets rather than in code
- Validate all inputs to prevent injection attacks
- Use HTTPS for all API communications
- Implement proper authentication if needed

## Scaling and Performance

- Hugging Face Spaces have resource limitations
- For heavy workloads, consider using other cloud providers
- Optimize database queries for better performance
- Implement caching where appropriate

## Additional Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Hugging Face Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)