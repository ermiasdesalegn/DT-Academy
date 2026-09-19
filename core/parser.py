from pathlib import Path
import cv2
import numpy as np
import json
import time

class MediaParser:
    def __init__(self, engine, dispatcher, threshold=0.68, enhance_media=False, status_callback=None, progress_callback=None):
        self.engine = engine
        self.dispatcher = dispatcher
        self.threshold = threshold
        self.enhance_media = enhance_media
        self.status_callback = status_callback
        self.progress_callback = progress_callback
        
    def _update_status(self, message):
        if self.status_callback:
            self.status_callback(message)
        else:
            print(message)
            
    def _update_progress(self, current, total):
        if self.progress_callback:
            self.progress_callback(current, total)

    def scan_directory(self, target_dir):
        target = Path(target_dir)
        
        while not target.exists() or not target.is_dir():
            self._update_status(f"[!] Target archive {target_dir} disconnected! Waiting 5s...")
            time.sleep(5)
            
        self._update_status(f"Scanning directory: {target_dir}")
        
        # Load ledger
        state_file = Path(self.dispatcher.base_dir) / "scan_state.json"
        state_file.parent.mkdir(parents=True, exist_ok=True)
        completed_files = set()
        if state_file.exists():
            try:
                with open(state_file, 'r') as f:
                    completed_files = set(json.load(f))
            except Exception:
                pass

        files_to_process = []
        for file_path in target.rglob('*'):
            if file_path.is_file():
                if str(file_path.absolute()) in completed_files:
                    continue
                suffix = file_path.suffix.lower()
                if suffix in ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.mkv']:
                    files_to_process.append(file_path)
                    
        total_files = len(files_to_process)
        if total_files == 0:
            self._update_status("No new media files found in the selected directory.")
            self._update_progress(100, 100)
            return
            
        self._update_status(f"Found {total_files} new media files. Starting processing...")
        self._update_progress(0, total_files)

        for i, file_path in enumerate(files_to_process):
            # Check connection
            while not target.exists():
                self._update_status(f"[!] Connection lost! Waiting to resume...")
                time.sleep(5)
                
            suffix = file_path.suffix.lower()
            if suffix in ['.jpg', '.jpeg', '.png']:
                self._process_image(file_path, i + 1, total_files)
            elif suffix in ['.mp4', '.mov', '.mkv']:
                self._process_video(file_path, i + 1, total_files)
                
            # Update ledger
            completed_files.add(str(file_path.absolute()))
            try:
                with open(state_file, 'w') as f:
                    json.dump(list(completed_files), f)
            except Exception as e:
                self._update_status(f"Error saving ledger: {e}")
                
            self._update_progress(i + 1, total_files)
                
        self._update_status("Scan complete.")

    def _enhance_frame(self, frame):
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl,a,b))
        frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        # Mild Sharpening
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        frame = cv2.filter2D(frame, -1, kernel)
        return frame

    def _process_image(self, file_path, current, total):
        self._update_status(f"Scanning image ({current}/{total}): {file_path.name}")
        try:
            img = cv2.imread(str(file_path))
            if img is None:
                return
            if self.enhance_media:
                img = self._enhance_frame(img)
            
            rgb_frame = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            is_match, dist, tier = self.engine.has_match(rgb_frame, self.threshold)
            
            if is_match:
                self._update_status(f"Match (Tier {tier}) found in image: {file_path.name}")
                self.dispatcher.copy_image(str(file_path), tier)
        except Exception as e:
            self._update_status(f"Error processing image {file_path.name}: {e}")

    def _process_video(self, file_path, current, total):
        self._update_status(f"Scanning video ({current}/{total}): {file_path.name}")
        try:
            cap = cv2.VideoCapture(str(file_path))
            if not cap.isOpened():
                self._update_status(f"Error: Could not open video {file_path.name}")
                return

            fps = cap.get(cv2.CAP_PROP_FPS)
            if fps <= 0:
                fps = 30.0 # Default if unable to read

            # Map tier -> list of timestamps
            tier_timestamps = {1: [], 2: [], 3: []}
            frame_count = 0
            
            # Consecutive frame tracking
            consecutive_matches = 0
            required_consecutive = 2
            last_tier = None

            while True:
                ret, frame = cap.read()
                if not ret:
                    if not file_path.exists():
                        raise ConnectionError("Storage drive disconnected mid-video!")
                    break

                # Process 1 frame per second
                if frame_count % int(fps) == 0:
                    current_time_sec = frame_count / fps
                    
                    # Downscale to 720p width (1280) if larger, maintaining aspect ratio
                    height, width = frame.shape[:2]
                    target_width = 1280
                    if width > target_width:
                        scale = target_width / width
                        target_height = int(height * scale)
                        frame = cv2.resize(frame, (target_width, target_height))
                        
                    if self.enhance_media:
                        frame = self._enhance_frame(frame)
                        
                    # Convert BGR to RGB
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    is_match, dist, tier = self.engine.has_match(rgb_frame, self.threshold)
                    if is_match:
                        consecutive_matches += 1
                        last_tier = tier if last_tier is None else min(last_tier, tier) # keep best tier
                        
                        if consecutive_matches >= required_consecutive:
                            self._update_status(f"Match (Tier {last_tier}) found in {file_path.name} at {int(current_time_sec)}s")
                            # Add the current time and also the ones we buffered
                            tier_timestamps[last_tier].append(current_time_sec)
                            tier_timestamps[last_tier].append(current_time_sec - 1)
                            # Reset so we don't spam
                            consecutive_matches = 0
                            last_tier = None
                    else:
                        consecutive_matches = 0
                        last_tier = None

                frame_count += 1

            cap.release()
            
            for tier, timestamps in tier_timestamps.items():
                if timestamps:
                    self._update_status(f"Extracting Tier {tier} clips from {file_path.name}...")
                    self.dispatcher.extract_clips(str(file_path), timestamps, tier)
                    self._update_status(f"Finished extracting Tier {tier} clips from {file_path.name}")
                
        except Exception as e:
            self._update_status(f"Error processing video {file_path.name}: {e}")
