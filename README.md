# **New-York-Housing Data**
This is a web-based visualization of housing prices in New York using **Svelte.js**.  
The data is sourced from Kaggle and preprocessed using **Python (pandas, NumPy)**.  
The backend API is built using **Flask** and serves data from an **SQLite database**.

---

## **Getting Started**
These instructions will help you set up the project on your local machine for development and testing.

---

## **Prerequisites**
Make sure you have the following installed:

### **1. Install Node.js (for frontend)**
Download and install **Node.js** (which includes npm) from the official website:  
🔗 [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

You can verify the installation by running:

node -v  
npm -v

## **2. Install Python and Virtual Environment (for backend)**
### Ensure you have Python installed:

python --version

### Create and activate a virtual environment:

python -m venv venv

source venv/bin/activate  # On macOS/Linux

venv\Scripts\activate     # On Windows

### Install the required Python dependencies:

pip install flask pandas numpy sqlite3


### Installing

## After installing the software,
#### In one terminal, you need to go to the svelte folder and do:

npm install 

#### Then do:

npm run dev

#### In another terminal start the backend, go to python folder and do:

source venv/bin/activate  # On macOS/Linux

.\.venv\Scripts\activate     # On Windows

#### Then do:
python server.py


