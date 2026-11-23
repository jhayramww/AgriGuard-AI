import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from PIL import Image, ImageDraw
import pickle

# Class names
CLASSES = [
    "Tomato_Healthy", "Tomato_Early_Blight", "Tomato_Late_Blight",
    "Potato_Healthy", "Potato_Early_Blight", "Potato_Late_Blight",
    "Corn_Healthy", "Corn_Rust", "Corn_Gray_Leaf_Spot",
    "Rice_Healthy", "Rice_Blast", "Rice_Brown_Spot"
]

def generate_synthetic_leaf(class_name, size=(64, 64)):
    # Create black/dark background
    img = Image.new("RGB", size, (20, 20, 20))
    draw = ImageDraw.Draw(img)
    
    w, h = size
    cx, cy = w // 2, h // 2
    
    # Draw leaf shape based on crop type
    if "Corn" in class_name or "Rice" in class_name:
        # Long, narrow leaf
        leaf_color = (34, 139, 34) if "Healthy" in class_name else (46, 125, 50)
        draw.ellipse([cx - w//6, cy - h//2, cx + w//6, cy + h//2], fill=leaf_color)
    else:
        # Rounder leaf
        leaf_color = (0, 128, 0) if "Healthy" in class_name else (50, 110, 50)
        draw.polygon([(cx, cy - h//3), (cx + w//3, cy), (cx, cy + h//3), (cx - w//3, cy)], fill=leaf_color)
        
    # Draw disease symptoms
    if "Early_Blight" in class_name:
        # Small brown concentric spots
        for _ in range(5):
            rx, ry = np.random.randint(cx - w//4, cx + w//4), np.random.randint(cy - h//4, cy + h//4)
            # Outer halo
            draw.ellipse([rx - 4, ry - 4, rx + 4, ry + 4], fill=(139, 115, 85))
            # Inner spot
            draw.ellipse([rx - 2, ry - 2, rx + 2, ry + 2], fill=(74, 53, 27))
    elif "Late_Blight" in class_name:
        # Large yellowish-brown patches
        for _ in range(2):
            rx, ry = np.random.randint(cx - w//6, cx + w//6), np.random.randint(cy - h//6, cy + h//6)
            draw.ellipse([rx - 8, ry - 8, rx + 8, ry + 8], fill=(160, 140, 50))
            draw.ellipse([rx - 5, ry - 5, rx + 5, ry + 5], fill=(90, 70, 20))
    elif "Rust" in class_name:
        # Small reddish-orange pustules
        for _ in range(12):
            rx, ry = np.random.randint(cx - w//8, cx + w//8), np.random.randint(cy - h//3, cy + h//3)
            draw.ellipse([rx - 2, ry - 2, rx + 2, ry + 2], fill=(210, 105, 30))
    elif "Gray_Leaf_Spot" in class_name:
        # Rectangular grey-brown spots
        for _ in range(6):
            rx, ry = np.random.randint(cx - w//8, cx + w//8), np.random.randint(cy - h//3, cy + h//3)
            draw.rectangle([rx - 2, ry - 4, rx + 2, ry + 4], fill=(110, 110, 100))
    elif "Blast" in class_name:
        # Spindle-shaped grey spots with red border
        for _ in range(5):
            rx, ry = np.random.randint(cx - w//10, cx + w//10), np.random.randint(cy - h//4, cy + h//4)
            # Red outline
            draw.ellipse([rx - 3, ry - 6, rx + 3, ry + 6], fill=(180, 50, 50))
            # Grey core
            draw.ellipse([rx - 1, ry - 4, rx + 1, ry + 4], fill=(150, 150, 150))
    elif "Brown_Spot" in class_name:
        # Tiny circular brown spots
        for _ in range(10):
            rx, ry = np.random.randint(cx - w//10, cx + w//10), np.random.randint(cy - h//4, cy + h//4)
            draw.ellipse([rx - 1.5, ry - 1.5, rx + 1.5, ry + 1.5], fill=(101, 67, 33))
            
    # Add minor noise and convert to array
    arr = np.array(img, dtype=np.float32)
    # Add random pixel noise
    noise = np.random.normal(0, 5.0, arr.shape)
    arr = np.clip(arr + noise, 0, 255)
    
    return arr / 255.0

def train_disease_model(output_dir):
    print("[*] Starting Crop Disease CNN Model Training...")
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate dataset
    X = []
    y = []
    
    images_per_class = 40
    print(f"[*] Generating {images_per_class} synthetic images per class ({len(CLASSES)} classes total)...")
    
    for label_idx, class_name in enumerate(CLASSES):
        for _ in range(images_per_class):
            img_arr = generate_synthetic_leaf(class_name)
            X.append(img_arr)
            y.append(label_idx)
            
    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)
    
    # Shuffle dataset
    indices = np.arange(len(X))
    np.random.shuffle(indices)
    X = X[indices]
    y = y[indices]
    
    # Build CNN Model
    print("[*] Compiling CNN Model in TensorFlow/Keras...")
    model = models.Sequential([
        layers.Input(shape=(64, 64, 3)),
        layers.Conv2D(16, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(len(CLASSES), activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train
    print("[*] Training CNN on CPU...")
    model.fit(X, y, epochs=8, batch_size=32, validation_split=0.1)
    
    model_path = os.path.join(output_dir, 'crop_disease_model.h5')
    model.save(model_path)
    print(f"[+] Saved CNN model to '{model_path}'")
    
    # Save classes list as pickle for reference
    classes_path = os.path.join(output_dir, 'crop_disease_classes.pkl')
    with open(classes_path, 'wb') as f:
        pickle.dump(CLASSES, f)
    print(f"[+] Saved classes list to '{classes_path}'")

if __name__ == '__main__':
    train_disease_model('models')
