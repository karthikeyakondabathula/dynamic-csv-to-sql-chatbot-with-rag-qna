
# 🚀 CSV-to-SQL AI Query Engine

A Python tool that turns any CSV into an SQLite database and lets you ask questions in plain English using **Google Gemini** LLM API.  
It automatically generates SQL, executes it, and explains results.

## 🧩 Features

- 📂 Automatic schema detection from CSV
- 📝 Metadata generator ("thingmaker") for LLM prompt
- 🤖 LLM-powered SQL generation (using Google Gemini API, `gemini-1.5-flash`)
- 🗄️ Works with any CSV file
- 🔄 Interactive CLI for continuous Q&A

## 🏗️ Architecture

1. Load CSV → pandas DataFrame → SQLite3 table
2. Analyze columns with **thingmaker** to create metadata summary
3. **magicpipeline:**
   - User question → Gemini → SQL query
   - SQL query → SQLite3 → result
   - Result → Gemini → plain language answer
   - Display answer

## 🏃 Example

```bash
💬 Ask a question (type 'exit' to quit): total crimes in 2023

🔍 Generated SQL:
SELECT COUNT(*) FROM crime_reports WHERE strftime('%Y', date_occurred) = '2023';

✅ Answer:
There were 12,456 crimes reported in 2023.
```

## 🔧 Requirements

- Python 3.9+
- pandas
- sqlite3
- google-generativeai
- A Google AI Studio API key for Gemini

## 📦 Installation

```bash
pip install pandas google-generativeai
```

## 🔑 Set up API key

Set your Gemini API key as an environment variable:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

or inside Python:

```python
import os
os.environ["GOOGLE_API_KEY"] = "your_api_key_here"
```

## 🏁 Run

```bash
python main.py
```

---

✨ Fork, star, and contribute!
