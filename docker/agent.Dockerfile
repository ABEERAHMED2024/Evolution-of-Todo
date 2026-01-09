# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY agent/requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the agent application code into the container
COPY agent/ .

# Make port 8001 available to the world outside this container
EXPOSE 8001

# Run the command to start the agent application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]