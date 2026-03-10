import logging
from functools import wraps
from typing import Callable, Any
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

def transactional(session_factory: Callable[..., Session]):
    """
    Decorator that enforces strict commit and rollback protocols for database operations.
    Ensures that any failure within the wrapped function automatically rolls back the SQLAlchemy
    session state to prevent orphan records or partial commits.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Create a new session from the factory
            with session_factory() as session:
                try:
                    # Inject session into the function context
                    kwargs['session'] = session
                    result = func(*args, **kwargs)
                    session.commit()
                    return result
                except Exception as e:
                    logger.error(f"Transaction failed in {func.__name__}: {str(e)}")
                    session.rollback()
                    raise e
        return wrapper
    return decorator
