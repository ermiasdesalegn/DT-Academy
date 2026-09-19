import os
# Suppress DeepFace and TensorFlow logs that cause UnicodeEncodeErrors on Windows
os.environ["DEEPFACE_LOG_LEVEL"] = "3" 
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import glob
from deepface import DeepFace
import numpy as np

class FaceEngine:
    def __init__(self, reference_dir):
        self.reference_dir = reference_dir
        self.known_encodings = []
        self._load_reference_faces()
        
    def _load_reference_faces(self):
        """Load all images from the reference directory and generate their ArcFace encodings."""
        if not os.path.exists(self.reference_dir):
            return
            
        for file_path in glob.glob(os.path.join(self.reference_dir, "*.*")):
            if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    reps = DeepFace.represent(
                        img_path=file_path, 
                        model_name="ArcFace", 
                        detector_backend="retinaface",
                        enforce_detection=True
                    )
                    if reps and len(reps) > 0:
                        self.known_encodings.append(reps[0]["embedding"])
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")

    def has_match(self, rgb_frame, threshold=0.68):
        """
        Compare a given frame against the known encodings using cosine distance.
        Returns: (is_match, best_distance, tier)
        """
        if not self.known_encodings:
            return False, 1.0, 0
            
        try:
            reps = DeepFace.represent(
                img_path=rgb_frame, 
                model_name="ArcFace", 
                detector_backend="retinaface",
                enforce_detection=True
            )
            
            best_distance = float('inf')
            
            for rep in reps:
                frame_emb = rep["embedding"]
                for known_emb in self.known_encodings:
                    a = np.array(frame_emb)
                    b = np.array(known_emb)
                    dist = 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
                    if dist < best_distance:
                        best_distance = dist
                        
            if best_distance < threshold:
                tier = 1 if best_distance < (threshold - 0.2) else (2 if best_distance < (threshold - 0.1) else 3)
                return True, best_distance, tier
                
            return False, best_distance, 0
        except Exception as e:
            # Happens when no face is found
            return False, 1.0, 0
