from datetime import datetime, timedelta

from app.models import Progress

MINUTES_IN_DAY = 1440

def update_efactor(ef: float, q: int) -> float:
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    return max(1.3, ef)


def next_interval(repetition: int, interval: int, ef: float) -> int:
    if repetition == 1:
        return 10
    if repetition == 2:
        return MINUTES_IN_DAY
    return int(interval * ef)


def update_progress_after_review(progress: Progress, quality: int):
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