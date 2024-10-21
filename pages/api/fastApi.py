from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient, ASCENDING, DESCENDING
from typing import Optional, List, Dict
import re

app = FastAPI()

# Allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vercel-demo-two-iota.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient("mongodb+srv://vercel-admin-user:8NwSANtKuJWRLLdN@cluster0.iygo7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = client["sample_restaurants"]
restaurants_collection = db["restaurants"]

# Test MongoDB Connection
try:
    client.admin.command('ping')  # Simple test to see if MongoDB is reachable
except Exception as e:
    raise HTTPException(status_code=500, detail="Could not connect to MongoDB")

@app.get("/api/restaurants", response_model=List[Dict])
def get_restaurants(
    sort_by: Optional[str] = Query("average_rating"),  # Default sorting by average rating
    order: Optional[str] = Query("desc"),  # Default order descending
    limit: Optional[int] = Query(15),  # Default limit
    filter_cuisine: Optional[str] = Query(None),  # Optional cuisine filter
    filter_borough: Optional[str] = Query(None),  # Optional borough filter
):
    # Construct the query based on filters
    query = {}
    if filter_cuisine:
        query["cuisine"] = {"$regex": re.escape(filter_cuisine), "$options": "i"}
    if filter_borough:
        query["borough"] = filter_borough

    # Query the restaurants without sorting
    try:
        restaurants_cursor = restaurants_collection.find(query).limit(limit)
        restaurants = []

        for restaurant in restaurants_cursor:
            # Calculate average rating from grades
            if "grades" in restaurant and len(restaurant["grades"]) > 0:
                average_rating = sum(grade["score"] for grade in restaurant["grades"]) / len(restaurant["grades"])
            else:
                average_rating = 0  # Default to 0 if there are no grades

            restaurant["_id"] = str(restaurant["_id"])  # Convert ObjectId to string
            restaurant["average_rating"] = average_rating  # Add average rating to restaurant data
            restaurants.append(restaurant)  # Append restaurant data to list

        # Now sort restaurants based on the computed average_rating
        if sort_by == "average_rating":
            restaurants.sort(key=lambda x: x.get("average_rating", 0), reverse=(order == "desc"))
        elif sort_by == "name":
            restaurants.sort(key=lambda x: x.get("name", "").lower(), reverse=(order == "desc"))

        return restaurants
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cuisines", response_model=List[str])
def get_unique_cuisines():
    try:
        # Find unique cuisines, excluding those with '/'
        cuisines_cursor = restaurants_collection.distinct("cuisine")
        filtered_cuisines = [cuisine for cuisine in cuisines_cursor if "/" not in cuisine]
        return filtered_cuisines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/boroughs", response_model=List[str])
def get_boroughs():
    try:
        # Get unique boroughs from the restaurant collection
        boroughs = restaurants_collection.distinct("borough")
        boroughs = [borough for borough in boroughs if '/' not in borough]  # Exclude boroughs with '/'
        return boroughs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
