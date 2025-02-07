from flask import Flask, Response, jsonify
import pandas as pd
import sqlite3

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/get_data", methods=["GET"])
def get_data():
    connection = sqlite3.connect("./database.db")
    df = pd.read_sql('''
            SELECT * FROM NYhousing
        ''', con=connection)
    connection.close()
    return Response(
        response=df.to_json(orient="records"),
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.run(port=8002)