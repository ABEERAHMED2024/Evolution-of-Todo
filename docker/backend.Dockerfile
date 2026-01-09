# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY backend/requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code into the container
COPY backend/ .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the command to start the backend application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]