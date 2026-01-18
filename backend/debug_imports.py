import sys
import os

sys.path.append(os.getcwd())

try:
    print("Importing app.main...")
    import app.main
    print("Success app.main")
    
    print("Importing app.api.deps...")
    import app.api.deps
    print("Success app.api.deps")

    print("Importing app.services.analysis_pipeline...")
    import app.services.analysis_pipeline
    print("Success app.services.analysis_pipeline")

except Exception as e:
    print(f"IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
