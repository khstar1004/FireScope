# syntax=docker/dockerfile:1.7

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MPLCONFIGDIR=/tmp/matplotlib

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY gym/setup.py ./gym/setup.py
COPY gym/blade ./gym/blade
COPY gym/scripts ./gym/scripts
COPY gym/README.md ./gym/README.md

ARG GYM_EXTRAS=gym
RUN python -m pip install --upgrade pip \
  && cd /app/gym \
  && if [ -n "$GYM_EXTRAS" ]; then pip install --no-cache-dir -e ".[${GYM_EXTRAS}]"; else pip install --no-cache-dir -e .; fi

RUN mkdir -p /app/gym/artifacts /tmp/matplotlib

VOLUME ["/app/gym/artifacts"]

CMD ["python", "gym/scripts/simple_demo/demo.py"]
