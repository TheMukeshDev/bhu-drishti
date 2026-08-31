import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


class OfficerVerifyRequest(BaseModel):
    officer_id: str


@router.post("/verify-officer")
def verify_officer(data: OfficerVerifyRequest):

    response = (
        supabase
        .table("department_officer_registry")
        .select("officer_id, full_name, designation, assigned_role, is_active")
        .eq("officer_id", data.officer_id)
        .eq("is_active", True)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Officer ID not found in Department of Land Resources registry."
        )

    officer = response.data[0]

    return {
        "status": "VERIFIED",
        "officer_id": officer["officer_id"],
        "full_name": officer["full_name"],
        "designation": officer["designation"],
        "assigned_role": officer["assigned_role"]
    }