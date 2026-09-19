import os
import cv2
import face_recognition
import shutil
import json
import subprocess
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

# ==========================================
# MODULE A: CONFIGURATION
# ==========================================
class Config:
    TARGET_PERSON_NAME = "Ermias" 
    SOURCE_DIR = Path("E:/Primary_School_Archive") # Change to your external drive path
    OUTPUT_DIR = Path(f"C:/Processed_Archive/{TARGET_PERSON_NAME}")
    REFERENCE_FACES_DIR = Path("./reference_faces") 
    STATE_FILE = Path("./scan_state.json") # Ledger for crash resilience
    
    VIDEO_FRAME_SKIP_SECONDS = 1.0  # Check 1 frame every second
    VIDEO_DOWNSCALE_WIDTH = 720     # Resize to 720p for faster AI processing
    VIDEO_CLIP_PADDING = 5          # Add 5 seconds before/after a face is spotted
    FACE_TOLERANCE = 0.68           # Wide net for aging faces
    
    VALID_IMAGES = {".jpg", ".jpeg", ".png"}
    VALID_VIDEOS = {".mp4", ".mov", ".mkv", ".avi"}
    MAX_WORKERS = os.cpu_count() - 1 or 1 # Leave 1 core free for OS stability

# ==========================================
# MODULE B: ACTION DISPATCHER (FFmpeg)
# ==========================================
class ActionDispatcher:
    @staticmethod
    def extract_video_clips(source_path, matches):
        if not matches: return

        # Extract timestamps and average confidence score for the segments
        timestamps = [m['timestamp'] for m in matches]
        avg_confidence = int(sum(m['confidence'] for m in matches) / len(matches))
        
        segments = ActionDispatcher._merge_timestamps(timestamps, padding=Config.VIDEO_CLIP_PADDING)
        Config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        for i, (start, end) in enumerate(segments):
            duration = end - start
            out_filename = Config.OUTPUT_DIR / f"CONF_{avg_confidence:03d}_{source_path.stem}_clip_{i+1}{source_path.suffix}"
            
            # FAST SLICING: Call FFmpeg directly with stream copy
            cmd = [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-ss", str(max(0, start)),
                "-i", str(source_path),
                "-t", str(duration),
                "-c", "copy", "-map", "0",
                str(out_filename)
            ]
            
            try:
                subprocess.run(cmd, check=True)
                print(f"    -> [Instant Slice] Saved: {out_filename.name}")
            except subprocess.CalledProcessError as e:
                print(f"[!] FFmpeg Error on {source_path.name}: {e}")

    @staticmethod
    def _merge_timestamps(timestamps, padding):
        ranges = [[max(0, t - padding), t + padding] for t in timestamps]
        merged = [ranges[0]]
        for current in ranges[1:]:
            last = merged[-1]
            if current[0] <= last[1]:  
                last[1] = max(last[1], current[1])
            else:
                merged.append(current)
        return merged

# ==========================================
# MODULE C: WORKER PROCESS (Runs per Core)
# ==========================================
def process_file_worker(file_path_str, known_encodings):
    """Standalone worker function for ProcessPoolExecutor."""
    file_path = Path(file_path_str)
    ext = file_path.suffix.lower()
    
    if ext in Config.VALID_IMAGES:
        return process_image(file_path, known_encodings)
    elif ext in Config.VALID_VIDEOS:
        return process_video(file_path, known_encodings)
    return None

def process_image(file_path, known_encodings):
    try:
        image = face_recognition.load_image_file(str(file_path))
        matches = get_face_matches(image, known_encodings)
        if matches:
            best_conf = int(max(m['confidence'] for m in matches))
            dest = Config.OUTPUT_DIR / f"CONF_{best_conf:03d}_{file_path.name}"
            shutil.copy2(file_path, dest)
            return str(file_path)
    except Exception:
        pass
    return str(file_path) # Return path to mark as processed

def process_video(file_path, known_encodings):
    cap = cv2.VideoCapture(str(file_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_skip = int(fps * Config.VIDEO_FRAME_SKIP_SECONDS)
    frame_count = 0
    detected_frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        if frame_count % frame_skip == 0:
            h, w = frame.shape[:2]
            if w > Config.VIDEO_DOWNSCALE_WIDTH:
                ratio = Config.VIDEO_DOWNSCALE_WIDTH / float(w)
                frame = cv2.resize(frame, (Config.VIDEO_DOWNSCALE_WIDTH, int(h * ratio)))

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            matches = get_face_matches(rgb_frame, known_encodings)
            
            if matches:
                current_seconds = frame_count / fps
                best_confidence = max(m['confidence'] for m in matches)
                detected_frames.append({'timestamp': current_seconds, 'confidence': best_confidence})

        frame_count += 1
    cap.release()
    
    if detected_frames:
        ActionDispatcher.extract_video_clips(file_path, detected_frames)
    
    return str(file_path)

def get_face_matches(rgb_frame, known_encodings):
    locations = face_recognition.face_locations(rgb_frame)
    encodings = face_recognition.face_encodings(rgb_frame, locations)
    
    found = []
    for encoding in encodings:
        distances = face_recognition.face_distance(known_encodings, encoding)
        best_match_index = distances.argmin()
        if distances[best_match_index] <= Config.FACE_TOLERANCE:
            # Convert mathematical distance to a 0-100 confidence score
            confidence = int((1.0 - distances[best_match_index]) * 100)
            found.append({'distance': distances[best_match_index], 'confidence': confidence})
    return found

# ==========================================
# MODULE D: PIPELINE MANAGER (Orchestrator)
# ==========================================
class PipelineManager:
    def __init__(self):
        self.known_encodings = self._load_references()
        self.processed_ledger = self._load_ledger()

    def _load_references(self):
        encodings = []
        print(f"[*] Loading reference face encodings from {Config.REFERENCE_FACES_DIR}...")
        for file in Config.REFERENCE_FACES_DIR.glob("*.*"):
            if file.suffix.lower() in Config.VALID_IMAGES:
                image = face_recognition.load_image_file(str(file))
                enc = face_recognition.face_encodings(image)
                if enc: 
                    encodings.append(enc[0])
                    print(f"    -> Loaded model data for: {file.name}")
        
        if not encodings:
            raise ValueError("No valid faces found in reference directory! Please add clear photos.")
        return encodings

    def _load_ledger(self):
        if Config.STATE_FILE.exists():
            with open(Config.STATE_FILE, 'r') as f:
                return set(json.load(f))
        return set()

    def _update_ledger(self, file_path_str):
        self.processed_ledger.add(file_path_str)
        with open(Config.STATE_FILE, 'w') as f:
            json.dump(list(self.processed_ledger), f)

    def run(self):
        print(f"\n=== Spawning {Config.MAX_WORKERS} Worker Processes ===")
        Config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        target_files = []
        for f in Config.SOURCE_DIR.rglob("*"):
            if f.suffix.lower() in (Config.VALID_IMAGES | Config.VALID_VIDEOS):
                if str(f) not in self.processed_ledger:
                    target_files.append(str(f))

        print(f"[*] Found {len(target_files)} new files to process.")

        with ProcessPoolExecutor(max_workers=Config.MAX_WORKERS) as executor:
            futures = {
                executor.submit(process_file_worker, f, self.known_encodings): f 
                for f in target_files
            }
            
            for future in as_completed(futures):
                try:
                    completed_file = future.result()
                    if completed_file:
                        self._update_ledger(completed_file)
                        print(f"[-] Logged completion: {Path(completed_file).name}")
                except Exception as e:
                    print(f"[!] Worker crashed on a file: {e}")

if __name__ == "__main__":
    Config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    Config.REFERENCE_FACES_DIR.mkdir(parents=True, exist_ok=True)
    
    pipeline = PipelineManager()
    pipeline.run()
    print("\n=== Scan Complete ===")
