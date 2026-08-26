from typing import Annotated

from bson import ObjectId
from pydantic import BeforeValidator

PyObjectId = Annotated[str, BeforeValidator(str)]


def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)
