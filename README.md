# Flashky
Flashky is a modern web application that helps you create, organize, and learn with flashcards. Easily build your own flashcards, enrich them with images, audio, and video, group them into decks, and study in an interactive way.

---
## 🚀 Getting Started (Startup)
Flashky runs as a containerized application. To get started, make sure Docker is installed on your machine.

### 1. Environment configurations
Create a .env and .env.dev files in the root directory of the project with the following structures:

```env
POSTGRES_USER: user
POSTGRES_PASSWORD: pass
POSTGRES_DB: db_name
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/flashky
AUTH_KEY:key
```

*We recommend to create two different credentials and names for the dev and prod databases.*

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

After the application is running: 
- to populate the database with initial data see [database initialization](#database-initialization). 
- if the database schema changes, new [database migrations](#database-migrations) should be created

---

## 📘 User Guide (Placeholder)

### Entering page
In order to use the app you need to log in or register an account. 

![Entry page](/docs/images/entrypage.jpg)

After log in you will see following page

![Home page](/docs/images/homepage.jpg)

From here you can:
- Explore - search for decks from other users
- View your decks - browse decks created or saved by you 
- View your Flashky - browse flashcards created by you
- Edit your profile


### Flashky
#### Create
To add Flashky you need to go to /flashky/add or click on Add Flashky on sidebar. 

![Add Flashky](/docs/images/add_flashcard.jpg)

From here you can:
- Change flashcard's name and content
- Upload media (audio, video, photos) for your flashcard
- Add tags
- Add flashcard to an existing deck

#### Browse
Your flashcards are available in My Flashky page (/flashky/add).

![Flashcards list](/docs/images/flashcards_list.jpg)

Where you can view, edit and delete your cards. 

### Decks 
#### Create

#### Browse

#### Explore

#### Learn 

### Profile

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
alembic revision --autogenerate -m "description" - Generate migration
```

- Apply all pending migrations
```sh
alembic upgrade head - Apply all pending migrations
```

- Rollback last migration
```sh
alembic downgrade -1 - Rollback last migration
```

-  View migration history
```sh
alembic history - View migration history
```

- Show current revision
```sh
alembic current - Show current revision
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