FROM python:3.11-slim

WORKDIR /src
COPY backend/requirements.txt /src/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /src/requirements.txt

ENV ENV=dev
ENV PYTHONPATH=/src
ENV DATABASE_URL=postgresql+psycopg2://flashky_user:flashky_pass@db:5432/flashky

# Copy and set executable permission for entrypoint
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use entrypoint instead of direct CMD
CMD ["/entrypoint.sh"]