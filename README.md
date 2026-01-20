# Flashky
Flashky is a modern web application that helps you create, organize, and learn with flashcards. Easily build your own flashcards, enrich them with images, audio, and video, group them into decks, and study in an interactive way.

---
## 🚀 Getting Started (Startup)
Flashky runs as a containerized application. To get started, make sure Docker is installed on your machine.

### 1. Environment configurations
Create two files in the project root:
- `.env`
- `.env.dev`

Environment files should have following structure

```env
POSTGRES_USER: user
POSTGRES_PASSWORD: pass
POSTGRES_DB: db_name
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/flashky
AUTH_KEY:key
```

*⚠️ We recommend to create two different credentials sets and names for the dev and the prod databases.*

### 2. Run the application 
Start the application using Docker Compose:

- Development server
```sh
docker compose -f compose.dev.yaml -p flashky-dev up
```

- Production server
```sh
docker compose -f compose.yaml -p flashky up
```

To apply frontend changes on production server you need to rebuild the frontend container 
```sh
docker compose -f compose.yaml -p flashky up --build
```

#### 📌 After Startup
- Populate the database with sample data: see [database initialization](#database-initialization). 
- If the schema changes, create new [database migrations](#database-migrations)

---

## 📘 User Guide

### 🟢 Entry & Home Page
To use Flashky, you must log in or register.

![Entry page](/docs/images/entrypage.jpg)

After login, you will see the Home Page, where you can:
- Explore - search for decks from other users
- View your decks - browse decks created or saved by you 
- View your Flashky - browse flashcards created by you
- Edit your profile

![Home page](/docs/images/homepage.jpg)

### 📝 Flashky (Flashcards)
#### Create a Flashcard
Go to:
- /flashky/add
- or click Add Flashky in the sidebar

![Add Flashky](/docs/images/add_flashcard.jpg)

From here you can:
- Set flashcard title & content
- Upload images, audio, or video
- Add tags
- Add the card to an existing deck

#### View & Manage Flashcards
Go to **My Flashky**:
- View all your cards
- Edit or delete cards
- Organize and manage your flashcards

![Flashcards list](/docs/images/flashcards_list.jpg)


### 📚 Decks 
#### Create
Go to:
- /decks/add
- or click Add Deck in the sidebar

![Add deck](/docs/images/add_deck.jpg)

From here you can:
- Set deck name & description
- Add tags
- Add flashcards to the deck

#### View Your Decks
Your decks are available in My Decks page (/decks/add).

![Decks list](/docs/images/decks_list.jpg)

Where you can view, edit, delete and learn your decks. You can also view, learn and remove your saved decks.  

#### Explore Community Decks
You can search, save and comment decks made by the Flashky community. 

![Search](/docs/images/search.jpg)


![View search item](/docs//images/search_view.jpg)

### 🎓 Learn 
Learning is the core feature of Flashky.
To start learning:
- Open a deck
- Click the Academic Cap icon

![Learn](/docs//images/learn.jpg)

While studying, rate your confidence:

| Rating | Meaning         |
| ------ | --------------- |
| 1      | Not confident   |
| 5      | Fully confident |


### 👤 Profile
You can edit your profile:
- Change description
- Upload profile picture
- Update credentials
- Delete your account

![Profile](/docs/images/profile.jpg)

### 🛡️ Moderator
You need moderator role to access those pages

#### Reports
View and verify user reports:
- /reports

![Reports](/docs/images/reports.jpg)

#### Users
View and manage users:
- /users
- Deactivate accounts if needed

![Users](/docs/images/users.jpg)

--- 

## 🌐 API & Web Application

Flashky works as both:
- a *REST API*
- an interactive web application

### API Documentation
API endpoints are documented in the following formats:
- *Swagger*/*OpenAPI*
    - OpenAPI file [](/docs/openapi.json)
    - Interactive docs: http://localhost:8000/docs (after application is running) 
- *Postman*
    - Postman collection [](/docs/postman.json)

---

## 🗄️Database migrations 
Database migrations are managed using Alembic and should be executed from inside the application container. 

### Common commands
- Generate migration
```sh
alembic revision --autogenerate -m "description" 
```

- Apply all pending migrations
```sh
alembic upgrade head
```

- Rollback last migration
```sh
alembic downgrade -1
```

-  View migration history
```sh
alembic history 
```

- Show current revision
```sh
alembic current
```
### Notes on SQLModel Compatibility
If a migration contains mixed `sqlalchemy` and `SQLModel` types, you may need to adjust it manually.

```python
# if in migration file 
sa.Column('some_name', sqlmodel.sql.sqltypes.AutoString() , nullable=True),

# change to 
sa.Column('some_name', sa.String() , nullable=True),

```
---

## 🧪 Database initialization
To insert sample data into the database, run the following command from inside the *container*:
```sh
python -m app.init_db
``` 
---

## 🔬 Backend tests
You can run tests using command from within the backend container  
```sh
pytest
```