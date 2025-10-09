FROM python:3.11-slim

WORKDIR /src
COPY backend/requirements.txt /src/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /src/requirements.txt

ENV ENV=dev
ENV DATABASE_URL=postgresql+psycopg2://flashky_user:flashky_pass@db:5432/flashky

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]