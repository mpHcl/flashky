from datetime import datetime, timedelta

from app.models import Progress

MINUTES_IN_DAY = 1440


def update_efactor(ef: float, q: int) -> float:
    """
    Updates the E-Factor (ease factor) based on the review quality score.

    Args:
        ef (float): The current E-Factor value.
        q (int): The quality of the review response (typically 0–5).

    Returns:
        float: The updated E-Factor, with a minimum value of 1.3.
    """
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    return max(1.3, ef)


def next_interval(repetition: int, interval: int, ef: float) -> int:
    """
    Calculates the next review interval based on repetition and E-Factor.

    Args:
        repetition (int): The number of successful repetitions.
        interval (int): The previous review interval in minutes.
        ef (float): The current E-Factor.

    Returns:
        int: The next review interval in minutes.
    """
    if repetition == 1:
        return 10
    if repetition == 2:
        return MINUTES_IN_DAY
    return int(interval * ef)


def update_progress_after_review(progress: Progress, quality: int):
    """
    Updates the learning progress of an item after a review session.

    This function adjusts repetition count, review interval, E-Factor,
    and review timestamps based on the provided review quality.

    Args:
        progress (Progress): The progress object representing the learning state.
        quality (int): The quality of the review response (typically 0–5).

    Returns:
        datetime: The scheduled date and time of the next review.
    """
    now = datetime.utcnow()

    if quality >= 3:
        progress.repetition += 1
        progress.interval = next_interval(
            progress.repetition,
            progress.interval,
            progress.efactor,
        )
    else:
        progress.repetition = 0
        progress.interval = 10

    progress.efactor = update_efactor(progress.efactor, quality)
    progress.last_review_date = now
    next_review_date = now + timedelta(minutes=progress.interval)
    progress.next_review_date = next_review_date

    return next_review_date
