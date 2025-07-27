# Use Python 3.13 slim image as base
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create data directory for static files if it doesn't exist
RUN mkdir -p app/data

# Expose the port the app runs on
EXPOSE 8000

# Set default environment variables (can be overridden)
ENV DEBUG=True
ENV HOST=0.0.0.0
ENV PORT=8000

# Command to run the application
CMD ["python", "app/main.py"] 