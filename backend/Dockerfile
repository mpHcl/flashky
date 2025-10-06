FROM python:3.11-slim

WORKDIR /src
COPY backend/requirements.txt /src/requirements/.txt
RUN pip install --no-cache-dir --upgrade -r /src/requirements/.txt

CMD ["fastapi", "run", "/src/app/main.py", "--port", "80", "--workers", "4"]