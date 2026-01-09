from sqlmodel import Session
from .tools.auth.hash import hash_password
from .database import engine

from .models import (
    Media,
    User,
    Role,
    Permission,
    Deck,
    Flashcard,
    FlashcardSide,
    Tag,
    SavedDeck,
)


def init_data():
    with Session(engine) as session:
        # --------------------------
        # Users
        # --------------------------
        user1 = User(
            username="admin", email="admin@test.com", password=hash_password("admin")
        )
        user2 = User(
            username="test", email="test@test.com", password=hash_password("Test1234!")
        )
        user3 = User(
            username="test1",
            email="test1@test.com",
            password=hash_password("Test1234!"),
        )
        user4 = User(
            username="test2",
            email="test2@test.com",
            password=hash_password("Test1234!"),
        )
        user5 = User(
            username="moderator",
            email="moderator@test.com",
            password=hash_password("Test1234!"),
        )
        session.add_all([user1, user2, user3, user4, user5])
        session.commit()

        # --------------------------
        # Roles
        # --------------------------
        role_admin = Role(name="ADMIN")
        role_user = Role(name="USER")
        role_moderator = Role(name="MODERATOR")
        session.add_all([role_admin, role_user, role_moderator])
        session.commit()

        # Assign roles to users
        user1.roles.append(role_admin)
        user2.roles.append(role_user)
        user3.roles.append(role_user)
        user4.roles.append(role_user)
        user5.roles.append(role_moderator)
        session.commit()

        # --------------------------
        # Permissions
        # --------------------------
        perm_create_deck = Permission(
            name="create_deck", description="Can create new decks"
        )
        perm_edit_deck = Permission(name="edit_deck", description="Can edit decks")
        perm_view_reports = Permission(
            name="view_report", description="Can view reports"
        )
        session.add_all([perm_create_deck, perm_edit_deck, perm_view_reports])
        session.commit()

        # Assign permissions to roles
        role_admin.permissions.extend([perm_create_deck, perm_edit_deck])
        role_user.permissions.extend([perm_create_deck, perm_edit_deck])
        role_moderator.permissions.append(perm_view_reports)
        session.commit()

        # --------------------------
        # Tags
        # --------------------------
        tag_math = Tag(name="Math", type="predefined")
        tag_science = Tag(name="Science", type="predefined")
        session.add_all([tag_math, tag_science])
        session.commit()

        # --------------------------
        # FlashcardSides
        # --------------------------
        front1 = FlashcardSide(content="What is 2 + 2?")
        back1 = FlashcardSide(content="4")
        front2 = FlashcardSide(content="Water's chemical formula?")
        back2 = FlashcardSide(content="H2O")
        front3 = FlashcardSide(content="What is PYTHON?")
        back3 = FlashcardSide(content="Programming language/Snake")
        front4 = FlashcardSide(content="What is second Newton's law?")
        back4 = FlashcardSide(content="F=m*a")

        session.add_all([front1, back1, front2, back2, front3, back3, front4, back4])
        session.commit()

        # --------------------------
        # Media
        # --------------------------
        media1 = Media(
            path="samples/python.jpg", type="image", flashcard_sides=[front3]
        )
        media2 = Media(path="samples/python.mp3", type="audio", flashcard_sides=[back3])
        media3 = Media(path="samples/python.mp4", type="video", flashcard_sides=[back3])

        session.add_all([media1, media2, media3])
        session.commit()

        # --------------------------
        # Flashcards
        # --------------------------
        flashcard1 = Flashcard(
            name="Simple Math",
            owner_id=user2.id,
            front_side_id=front1.id,
            back_side_id=back1.id,
        )
        flashcard2 = Flashcard(
            name="Basic Chemistry",
            owner_id=user3.id,
            front_side_id=front2.id,
            back_side_id=back2.id,
        )
        flashcard3 = Flashcard(
            name="Simple Computer Science",
            owner_id=user4.id,
            front_side_id=front3.id,
            back_side_id=back3.id,
        )
        flashcard4 = Flashcard(
            name="Basic Physics",
            owner_id=user4.id,
            front_side_id=front4.id,
            back_side_id=back4.id,
        )
        session.add_all([flashcard1, flashcard2, flashcard3, flashcard4])
        session.commit()

        # Link flashcards to tags
        flashcard1.tags.append(tag_math)
        flashcard2.tags.append(tag_science)
        flashcard3.tags.append(tag_science)
        flashcard4.tags.append(tag_science)
        session.commit()

        # --------------------------
        # Decks
        # --------------------------
        deck1 = Deck(
            name="Math Deck",
            description="A deck for basic math questions",
            owner_id=user2.id,
            public=True,
        )
        deck2 = Deck(
            name="Science Deck",
            description="A deck for basic science questions",
            owner_id=user3.id,
            public=True,
        )
        deck3 = Deck(
            name="Science Deck - CS and Physics",
            description="A deck for basic science questions",
            owner_id=user4.id,
            public=True,
        )
        session.add_all([deck1, deck2, deck3])
        session.commit()

        # Link decks to flashcards
        deck1.flashcards.append(flashcard1)
        deck2.flashcards.append(flashcard2)
        deck3.flashcards.append(flashcard3)
        deck3.flashcards.append(flashcard4)
        session.commit()

        # Link decks to tags
        deck1.tags.append(tag_math)
        deck2.tags.append(tag_science)
        deck3.tags.append(tag_science)
        session.commit()

        # --------------------------
        # Saved Decks
        # --------------------------
        saved_deck = SavedDeck(user_id=user3.id, deck_id=deck3.id)
        session.add(saved_deck)
        session.commit()

        print("Database initialized with sample data!")


if __name__ == "__main__":
    init_data()
