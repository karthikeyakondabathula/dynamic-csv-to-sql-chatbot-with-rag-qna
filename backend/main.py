import sqlite3
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
from dotenv import load_dotenv
import google.generativeai as genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add this global variable at the top
thingmaker_metadata = ""
# 1. ---- GOOGLE API ----
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
print("API Key:", api_key)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

# 2. ---- GLOBAL VARIABLES ----
DB_FILE = "dbdb.db"
thingmaker_metadata = ""  # This will be updated after upload


# 3. ---- HELPERS ----
def generate_schema(df):
    schema = []
    for column in df.columns:
        dtype = df[column].dtype
        if dtype == 'int64':
            schema.append(f"{column} INTEGER")
        elif dtype == 'float64':
            schema.append(f"{column} REAL")
        elif dtype == 'bool':
            schema.append(f"{column} BOOLEAN")
        elif dtype == 'object':
            schema.append(f"{column} TEXT")
        elif dtype == 'datetime64[ns]':
            schema.append(f"{column} DATE")
        else:
            schema.append(f"{column} TEXT")
    return f"CREATE TABLE IF NOT EXISTS tblofdata (\n  {', '.join(schema)}\n);"


def insert_data(df, conn):
    cols = df.columns.tolist()
    cursor = conn.cursor()
    placeholders = ', '.join(['?' for _ in cols])
    insert_sql = f"INSERT INTO tblofdata ({', '.join(cols)}) VALUES ({placeholders})"
    for _, row in df.iterrows():
        cursor.execute(insert_sql, tuple(row))
    conn.commit()
def thingmaker(df):
    info = ['table name : tblofdata']
    for col in df.columns:
        dtype = df[col].dtype
        col_info = f"{col} - "
        if dtype == 'int64' or dtype == 'float64':
            col_info += f"int - ({df[col].min()} - {df[col].max()})"
        elif dtype == 'bool':
            col_info += "bool - (True, False)"
        elif dtype == 'object':
            uniq = df[col].nunique()
            if uniq < 15:
                col_info += f"string - {list(df[col].dropna().unique())}"
            else:
                col_info += "string - NA"
        elif dtype == 'datetime64[ns]':
            col_info += f"date - ({df[col].min().strftime('%Y-%m-%d')} - {df[col].max().strftime('%Y-%m-%d')})"
        else:
            col_info += "unknown - NA"
        info.append(col_info)
    return "\n".join(info)

def clean_sql_response(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split('```')[-1]
    return text.strip()

def magicpipeline(user_question, thingmaker_metadata):
    prompt_sql = f"""
You are an AI that converts user questions into valid SQL for SQLite.
Schema info:
{thingmaker_metadata}
Write an SQL query for:
"{user_question}"
Only return the SQL query. Do NOT use ```sql or ``` code fences.
"""
    response_sql = model.generate_content(prompt_sql)
    sql_query = clean_sql_response(response_sql.text.strip())
    print(f"\n🔍 Generated SQL: {sql_query}")

    try:
        conn = sqlite3.connect(DB_FILE)
        df_result = pd.read_sql_query(sql_query, conn)
        conn.close()
    except Exception as e:
        return f"❌ SQL execution error: {e}"

    result_markdown = df_result.to_markdown(index=False)
    prompt_answer = f"""
User question: "{user_question}"
CSV Dataset/SQL DB Schema info:
{thingmaker_metadata}
SQL query result:
{result_markdown}
Write a clear answer:
"""
    response_answer = model.generate_content(prompt_answer)
    return response_answer.text.strip()


# 4. ---- ROUTES ----
@app.post("/api/chat")
async def chat(data: dict):
    global thingmaker_metadata
    user_q = data.get('message', '')
    if not thingmaker_metadata:
        return {"reply": "❌ No data uploaded yet. Please upload a CSV file first."}

    answer = magicpipeline(user_q, thingmaker_metadata)
    print(f"\n✅ Answer:\n{answer}")
    return {"reply": answer}


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    global thingmaker_metadata
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content), dtype=str)

        # Clean column names (optional but recommended)
        df.columns = df.columns.str.strip().str.replace(' ', '_').str.replace('[^0-9a-zA-Z_]', '', regex=True)

        # Save to SQLite
        conn = sqlite3.connect(DB_FILE)
        df.to_sql("tblofdata", conn, if_exists='replace', index=False)
        conn.close()

        # Generate metadata
        thingmaker_metadata = thingmaker(df)
        print(thingmaker_metadata)

        return {"content": str(thingmaker_metadata)}
    except Exception as e:
        return {"error": str(e)}
