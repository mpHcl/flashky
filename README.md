# flashky
Flashcards web application 


---

## Database migrations 
To manage migrations from the **container** use following commends: 

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

In case of problems with mixed `sqlalchemy` and `SQLModel` types in a migration, change it manually to `sqlalchemy` types
```python
# if in migration file 
sa.Column('some_name', sqlmodel.sql.sqltypes.AutoString() , nullable=True),

# change to 
sa.Column('some_name', sa.String() , nullable=True),

```

## Database initialization
To add sample data to the database execute from the **container**  following command:
```sh
python -m app.init_db
``` 


