import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import os
import shutil
import queue

from engine import FaceEngine
from dispatcher import ActionDispatcher
from parser import MediaParser

class FaceScannerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Local Archive Face Scanner")
        self.root.minsize(600, 450)
        
        self.target_dir = None
        self.target_name_var = tk.StringVar()
        self.status_queue = queue.Queue()
        self.progress_queue = queue.Queue()
        
        self._build_ui()
        self._check_queue()
        
    def _build_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Target Name
        name_frame = ttk.Frame(main_frame)
        name_frame.pack(pady=5, fill=tk.X)
        
        ttk.Label(name_frame, text="Target Name:").pack(side=tk.LEFT, padx=5)
        name_entry = ttk.Entry(name_frame, textvariable=self.target_name_var)
        name_entry.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        # Update status when name changes
        self.target_name_var.trace_add("write", lambda *args: self._update_ref_status())

        # Reference folder status
        ref_frame = ttk.Frame(main_frame)
        ref_frame.pack(pady=5, fill=tk.X)
        
        self.ref_label = ttk.Label(ref_frame, text="Reference folder: ./reference_faces")
        self.ref_label.pack(side=tk.LEFT, padx=5)
        
        select_ref_btn = ttk.Button(ref_frame, text="Add Reference Image", command=self._select_reference_image)
        select_ref_btn.pack(side=tk.RIGHT, padx=5)
        
        clear_ref_btn = ttk.Button(ref_frame, text="Clear References", command=self._clear_references)
        clear_ref_btn.pack(side=tk.RIGHT, padx=5)
        
        self._update_ref_status()
        
        # Target directory selection
        self.target_label = ttk.Label(main_frame, text="No target archive selected", foreground="gray")
        self.target_label.pack(pady=10)
        
        select_btn = ttk.Button(main_frame, text="Select Target Archive Folder", command=self._select_target_dir)
        select_btn.pack(pady=5)
        
        # Settings frame
        settings_frame = ttk.LabelFrame(main_frame, text="Scan Settings", padding="10")
        settings_frame.pack(fill=tk.X, pady=10)
        
        # Tolerance slider
        ttk.Label(settings_frame, text="Strictness (0.1 = Strict, 1.0 = Loose):").pack(anchor=tk.W)
        self.threshold_var = tk.DoubleVar(value=0.68)
        threshold_slider = ttk.Scale(settings_frame, from_=0.1, to=1.0, variable=self.threshold_var, orient=tk.HORIZONTAL)
        threshold_slider.pack(fill=tk.X, pady=(0, 5))
        
        # Enhance checkbox
        self.enhance_var = tk.BooleanVar(value=False)
        enhance_check = ttk.Checkbutton(settings_frame, text="Enable Old Media Enhancement (Slower)", variable=self.enhance_var)
        enhance_check.pack(anchor=tk.W)
        
        # Start button
        self.start_btn = ttk.Button(main_frame, text="Start Scan", command=self._start_scan, state=tk.DISABLED)
        self.start_btn.pack(pady=20)
        
        # Dynamic status label
        self.status_var = tk.StringVar()
        self.status_var.set("Ready.")
        status_label = ttk.Label(main_frame, textvariable=self.status_var, wraplength=550, justify="center")
        status_label.pack(side=tk.BOTTOM, pady=(0, 20))
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(main_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.pack(side=tk.BOTTOM, fill=tk.X, pady=10)

    def _get_current_ref_dir(self):
        target_name = self.target_name_var.get().strip()
        if not target_name:
            return None
        return os.path.join(os.path.dirname(__file__), "reference_faces", target_name)

    def _update_ref_status(self):
        ref_dir = self._get_current_ref_dir()
        if not ref_dir:
            self.ref_label.config(text="Reference folder: (Waiting for Name...)")
            return
            
        if not os.path.exists(ref_dir):
            self.ref_label.config(text="Reference folder: (Empty!)")
            return
            
        images = [f for f in os.listdir(ref_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if images:
            self.ref_label.config(text=f"Reference folder: (Ready - {len(images)} images)")
        else:
            self.ref_label.config(text="Reference folder: (Empty!)")

    def _select_reference_image(self):
        target_name = self.target_name_var.get().strip()
        if not target_name:
            messagebox.showwarning("Name Required", "Please enter a Target Name first.")
            return

        file_path = filedialog.askopenfilename(
            title="Select a clear photo of the target face",
            filetypes=[("Image files", "*.jpg *.jpeg *.png")]
        )
        
        if file_path:
            ref_dir = self._get_current_ref_dir()
            if not os.path.exists(ref_dir):
                os.makedirs(ref_dir)
                
            # Copy new image
            try:
                shutil.copy2(file_path, ref_dir)
                messagebox.showinfo("Success", f"Successfully added reference face: {os.path.basename(file_path)}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to copy image: {e}")
                
            self._update_ref_status()

    def _clear_references(self):
        target_name = self.target_name_var.get().strip()
        if not target_name:
            messagebox.showwarning("Name Required", "Please enter a Target Name first.")
            return
            
        ref_dir = self._get_current_ref_dir()
        if os.path.exists(ref_dir):
            for f in os.listdir(ref_dir):
                f_path = os.path.join(ref_dir, f)
                if os.path.isfile(f_path):
                    try:
                        os.remove(f_path)
                    except Exception as e:
                        print(f"Error removing {f_path}: {e}")
            messagebox.showinfo("Success", "Cleared all reference images.")
            self._update_ref_status()

    def _select_target_dir(self):
        dir_path = filedialog.askdirectory(title="Select Archive Folder")
        if dir_path:
            self.target_dir = dir_path
            self.target_label.config(text=f"Target: {self.target_dir}", foreground="black")
            self.start_btn.config(state=tk.NORMAL)

    def _check_queue(self):
        try:
            while True:
                msg = self.status_queue.get_nowait()
                self.status_var.set(msg)
                
                # Check for completion to re-enable button
                if msg == "Scan complete.":
                    self.start_btn.config(state=tk.NORMAL)
                    self.progress_var.set(100)
                    messagebox.showinfo("Complete", "Scanning has finished. Check ./Processed_Archive")
        except queue.Empty:
            pass
            
        try:
            while True:
                current, total = self.progress_queue.get_nowait()
                if total > 0:
                    percent = (current / total) * 100
                    self.progress_var.set(percent)
        except queue.Empty:
            pass
            
        finally:
            self.root.after(100, self._check_queue)

    def _update_status(self, msg):
        self.status_queue.put(msg)
        
    def _update_progress(self, current, total):
        self.progress_queue.put((current, total))

    def _start_scan(self):
        if not self.target_dir:
            return
            
        target_name = self.target_name_var.get().strip()
        if not target_name:
            messagebox.showwarning("Name Required", "Please enter a Target Name first.")
            return
            
        self.start_btn.config(state=tk.DISABLED)
        self.status_var.set("Initializing engine...")
        
        # Run in background thread
        threshold = self.threshold_var.get()
        enhance = self.enhance_var.get()
        
        thread = threading.Thread(target=self._run_pipeline, args=(target_name, threshold, enhance), daemon=True)
        thread.start()

    def _run_pipeline(self, target_name, threshold, enhance):
        try:
            # Initialize core components
            self._update_status(f"Loading reference faces for {target_name}...")
            ref_dir = os.path.join(os.path.dirname(__file__), "reference_faces", target_name)
            engine = FaceEngine(reference_dir=ref_dir)
            
            if not engine.known_encodings:
                self._update_status("Error: No valid reference faces found. Cannot proceed.")
                self.status_queue.put("Scan complete.") # To re-enable button
                return
                
            self._update_status("Initializing dispatcher...")
            out_dir = os.path.join(os.path.dirname(__file__), "Processed_Archive")
            dispatcher = ActionDispatcher(target_name=target_name, base_dir=out_dir)
            
            self._update_status("Starting scan...")
            self.progress_var.set(0)
            parser = MediaParser(
                engine, 
                dispatcher, 
                threshold=threshold,
                enhance_media=enhance,
                status_callback=self._update_status, 
                progress_callback=self._update_progress
            )
            parser.scan_directory(self.target_dir)
            
        except Exception as e:
            self._update_status(f"Fatal error during scan: {e}")
            self.status_queue.put("Scan complete.") # To re-enable button

if __name__ == "__main__":
    root = tk.Tk()
    
    # Configure grid/style if desired
    style = ttk.Style()
    if "clam" in style.theme_names():
        style.theme_use("clam")
        
    app = FaceScannerApp(root)
    root.mainloop()
