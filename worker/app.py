import os
import sys
from typing import Dict
from celery import Celery
from celery.utils.log import get_task_logger
from kombu import Exchange, Queue

logger = get_task_logger(__name__)

broker_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672//")

app = Celery("tasks", broker=broker_url)

default_exchange = Exchange("sample_exchange", type="direct")
default_queue = Queue(
    "sample_queue",
    exchange=default_exchange,
    routing_key="sample_routing_key",
)

max_concurrency = int(os.getenv("WORKER_CONCURRENCY", 2))
maximum_prefetch = int(
    os.getenv("MAXIMUM_PREFETCH", os.getenv("MAXIMUM_FREFETCH", 10))
)

app.conf.update(
    # Serialization & Security
    task_serializer="json",  # Format for serializing task payloads (JSON ensures Node.js / NestJS compatibility)
    accept_content=["json"],  # Whitelist of allowed payload formats to accept (blocks insecure formats like pickle)
    result_serializer="json",  # Format used to store return values in the result backend
    # Timezone Settings
    timezone="UTC",  # Reference timezone for task execution and timestamps
    enable_utc=True,  # Enforces UTC internally to prevent daylight saving and timezone drift issues
    # Queue, Exchange & Routing Configuration
    task_queues=[default_queue],  # Explicit list of Kombu Queues to consume from (binds sample_queue to sample_exchange)
    task_default_queue="sample_queue",  # Default mailbox/queue the worker listens to if not specified
    task_default_exchange="sample_exchange",  # Default exchange where published task messages are routed
    task_default_routing_key="sample_routing_key",  # Default address label on the message envelope used to route into queue
    # Acknowledgment & Reliability Policies
    task_acks_late=True,  # Hold AMQP ACK until task execution finishes (prevents message loss if worker halts)
    task_acks_on_failure_or_timeout=True,  # Send AMQP ACK even if task code raises an error (avoids infinite error loops)
    task_reject_on_worker_lost=True,  # If worker process dies mid-task (SIGKILL, update, OOM), NACK and requeue task
    # Performance, Concurrency & Prefetch
    worker_concurrency=max_concurrency,  # Number of simultaneous parallel child worker processes (CPU cores)
    worker_prefetch_multiplier=maximum_prefetch,  # Max unacknowledged messages pre-buffered per worker (0 = unlimited)
    # Broker Optimization (Single-Queue Mode)
    worker_enable_remote_control=False,  # Disables *.pidbox queue (saves broker overhead, turns off remote CLI control)
    worker_send_task_events=False,  # Disables celeryev.* queue & live event emission (maximizes throughput)
)


@app.task(bind=True, name="process_message_one", acks_late=True, reject_on_worker_lost=True)
def process_message_one(self, message: Dict[str, str]):
    """
    Task one to process incoming messages published by the NestJS server.
    """
    task_id = self.request.id or "unknown"
    status = "SUCCESS"
    try:
        content = message.get("message", "")
        output = f"[CELERY WORKER ONE RECEIVED]: {content}"
        print(output, flush=True)
        sys.stdout.flush()

        logger.info("Executed task process_message_one with: %s", message)
    except Exception as exc:
        status = "FAILED"
        logger.error("Error in task process_message_one (%s): %s", task_id, exc)
    finally:
        # ALWAYS ACK: Celery's parent process transmits the AMQP basic.ack to RabbitMQ
        print(f"[CELERY WORKER ONE ACKED]: Task {task_id} acknowledged (Always ACK, Never NACK)", flush=True)
        sys.stdout.flush()
        return {"status": status, "task": "process_message_one", "message": message}


@app.task(bind=True, name="process_message_two", acks_late=True, reject_on_worker_lost=True)
def process_message_two(self, message: Dict[str, str]):
    """
    Task two to process incoming messages published by the NestJS server.
    """
    task_id = self.request.id or "unknown"
    status = "SUCCESS"
    try:
        content = message.get("message", "")
        output = f"[CELERY WORKER TWO RECEIVED]: {content}"
        print(output, flush=True)
        sys.stdout.flush()

        logger.info("Executed task process_message_two with: %s", message)
    except Exception as exc:
        status = "FAILED"
        logger.error("Error in task process_message_two (%s): %s", task_id, exc)
    finally:
        # ALWAYS ACK: Celery's parent process transmits the AMQP basic.ack to RabbitMQ
        print(f"[CELERY WORKER TWO ACKED]: Task {task_id} acknowledged (Always ACK, Never NACK)", flush=True)
        sys.stdout.flush()
        return {"status": status, "task": "process_message_two", "message": message}


if __name__ == "__main__":
    app.start()
