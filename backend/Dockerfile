FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libc-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pipenv 

COPY Pipfile Pipfile.lock /app/

RUN pipenv install --deploy --ignore-pipfile

RUN apt-get remove -y gcc libc-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

COPY . /app

ENTRYPOINT ["pipenv", "run", "./entrypoint.sh"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--root-path=/api/"]
