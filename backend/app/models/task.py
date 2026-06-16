from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    done = Column(Boolean, default=False, nullable=False)
    status = Column(String, default="todo", nullable=False)  # todo | in_progress | done | cancelled
    shift = Column(String, nullable=True)
    priority = Column(String, default="medium", nullable=False)  # high | medium | low
    time_start = Column(String, nullable=True)
    time_end = Column(String, nullable=True)
    is_habit = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="tasks")
