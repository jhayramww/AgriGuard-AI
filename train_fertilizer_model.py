import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

def train_fertilizer_model(csv_path, output_dir):
    print("[*] Starting Fertilizer Prediction Model Training...")
    
    # Load dataset
    if not os.path.exists(csv_path):
        print(f"[!] Error: Dataset not found at {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    print(f"[*] Loaded dataset with {len(df)} records.")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Target column and features
    # Note exact spelling from CSV: Temparature, Phosphorous
    feature_cols = ['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']
    target_col = 'Fertilizer Name'
    
    # Encoders
    encoders = {}
    categorical_cols = ['Soil Type', 'Crop Type']
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        print(f"[*] Encoded '{col}' classes: {list(le.classes_)}")
        
    # Split data
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("[*] Training RandomForest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"[+] Model Training Completed. Accuracy: {accuracy * 100:.2f}%")
    
    # Save model and encoders
    model_path = os.path.join(output_dir, 'fertilizer_model.pkl')
    encoders_path = os.path.join(output_dir, 'fertilizer_encoders.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    with open(encoders_path, 'wb') as f:
        pickle.dump(encoders, f)
        
    print(f"[+] Saved model to '{model_path}' and encoders to '{encoders_path}'")

if __name__ == '__main__':
    train_fertilizer_model('Fertilizer Prediction.csv', 'models')
