from datetime import datetime
import pytest

from app.tools.learn.learn import (
    next_interval,
    update_efactor,
    MINUTES_IN_DAY,
    update_progress_after_review,
)
from app.models import Progress

update_efactor_data = [(0, 5, 1.3), (2, 1, 1.46), (2.5, 4, 2.5)]


@pytest.mark.parametrize("e,q,expected", update_efactor_data)
def test_update_efactor(e, q, expected):
    # Arrange

    # Act
    result = update_efactor(e, q)

    assert result == expected


next_interval_data = [
    (1, 19, 5.0, 10),
    (1, 0, 0, 10),
    (2, 0, 0, MINUTES_IN_DAY),
    (2, 18, 4.5, MINUTES_IN_DAY),
    (3, 2, 2.0, 4),
    (4, 2, 2.0, 4),
]


@pytest.mark.parametrize("repetition,interval,ef,expected", next_interval_data)
def test_next_interval(repetition, interval, ef, expected):
    # Arrange

    # Act
    result = next_interval(repetition, interval, ef)

    # Assert
    assert result == expected


def test_update_progress_after_review_low_quality():
    # Arrange
    efactor = 2.0
    quality = 2.5
    progress = Progress(efactor=efactor)

    # Act
    update_progress_after_review(progress, quality)

    # Assert
    assert progress.last_review_date < datetime.utcnow()
    assert progress.efactor == update_efactor(efactor, quality)
    assert progress.repetition == 0
    assert progress.interval == 10


def test_update_progress_after_review_high_quality():
    # Arrange
    efactor = 2.0
    quality = 3
    interval = 10
    repetition = 10
    progress = Progress(efactor=efactor, interval=interval, repetition=repetition)

    # Act
    update_progress_after_review(progress, quality)

    # Assert
    assert progress.last_review_date < datetime.utcnow()
    assert progress.efactor == update_efactor(efactor, quality)
    assert progress.repetition == repetition + 1
    assert progress.interval == next_interval(repetition, interval, efactor)
