import os
import shutil
from pathlib import Path
import subprocess
import imageio_ffmpeg

class ActionDispatcher:
    def __init__(self, target_name="Unknown", base_dir="./Processed_Archive"):
        self.base_dir = Path(base_dir) / target_name
        self.images_dir = self.base_dir / "images"
        self.videos_dir = self.base_dir / "video_clips"

    def _get_tier_dir(self, base, tier):
        tier_names = {1: "Tier_1_Definite", 2: "Tier_2_Likely", 3: "Tier_3_Review"}
        d = base / tier_names.get(tier, "Tier_Unknown")
        d.mkdir(parents=True, exist_ok=True)
        return d

    def copy_image(self, source_path, tier=1):
        """Copies matched images to tiered folder."""
        try:
            source = Path(source_path)
            tier_dir = self._get_tier_dir(self.images_dir, tier)
            dest = tier_dir / source.name
            
            # Avoid overwriting with a numeric suffix if needed
            counter = 1
            while dest.exists():
                dest = tier_dir / f"{source.stem}_{counter}{source.suffix}"
                counter += 1
                
            shutil.copy2(source_path, dest)
            return dest
        except Exception as e:
            print(f"Error copying image {source_path}: {e}")
            return None

    def extract_clips(self, source_path, timestamps, tier=1):
        """
        Merges overlapping timestamps into padded continuous ranges using a 5-second buffer.
        Slices the source video and saves sub-clips.
        """
        if not timestamps:
            return
            
        try:
            tier_dir = self._get_tier_dir(self.videos_dir, tier)
            # Sort timestamps
            timestamps = sorted(list(set(timestamps)))
            
            # Merge close timestamps (5s buffer)
            clips = []
            if timestamps:
                start = max(0, timestamps[0] - 5)
                end = timestamps[0] + 5
                
                for ts in timestamps[1:]:
                    if ts - end <= 5: # overlapping or too close
                        end = ts + 5
                    else:
                        clips.append((start, end))
                        start = max(0, ts - 5)
                        end = ts + 5
                clips.append((start, end))

            # Use imageio_ffmpeg to get the ffmpeg executable bundled with moviepy
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

            # Process clips using FFmpeg directly (lossless stream copy)
            for i, (start, end) in enumerate(clips):
                try:
                    source = Path(source_path)
                    clip_name = f"{source.stem}_clip_{i+1}.mp4"
                    clip_dest = tier_dir / clip_name
                    
                    # Avoid overwriting
                    counter = 1
                    while clip_dest.exists():
                        clip_name = f"{source.stem}_clip_{i+1}_{counter}.mp4"
                        clip_dest = tier_dir / clip_name
                        counter += 1
                    
                    temp_output = clip_dest.with_suffix(".mp4.tmp")
                    duration = end - start
                    
                    try:
                        # Use subprocess to call FFmpeg for a lossless stream copy
                        cmd = [
                            ffmpeg_exe, "-y",
                            "-ss", str(start),
                            "-i", str(source_path),
                            "-t", str(duration),
                            "-c", "copy",
                            "-avoid_negative_ts", "make_zero",
                            str(temp_output)
                        ]
                        
                        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                        temp_output.rename(clip_dest)
                    except Exception as e:
                        if temp_output.exists():
                            temp_output.unlink()
                        raise e
                except Exception as e:
                    print(f"Error extracting clip {i+1} from {source_path}: {e}")
                    
        except Exception as e:
            print(f"Error initializing clip extraction for {source_path}: {e}")
