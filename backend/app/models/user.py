from typing import Optional

class UserBase:
    def __init__(self, email: str, username: str, role: str):
        self.email = email
        self.username = username
        self.role = role

class UserCreate(UserBase):
    def __init__(self, email: str, username: str, role: str, password: str):
        super().__init__(email, username, role)
        self.password = password

class User(UserBase):
    def __init__(self, id: int, email: str, username: str, role: str):
        super().__init__(email, username, role)
        self.id = id 