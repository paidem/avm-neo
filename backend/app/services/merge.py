import os
import subprocess


def merge_files(full_paths: list[str]) -> dict:
    """Merge video files using mp4_merge."""
    if not full_paths:
        return {"status": "error", "message": "No files selected"}

    first_file = full_paths[0]
    output_dir = os.path.dirname(first_file)
    base_name, extension = os.path.splitext(os.path.basename(first_file))

    new_name = f"{base_name}_{len(full_paths)}_joined{extension}"
    output_file = os.path.join(output_dir, new_name)

    # Ensure unique filename
    counter = 1
    while os.path.exists(output_file):
        new_name = f"{base_name}_{len(full_paths)}_joined_{counter}{extension}"
        output_file = os.path.join(output_dir, new_name)
        counter += 1

    # Create source tracking file
    source_file = output_file + ".source"
    with open(source_file, "w") as f:
        for path in full_paths:
            f.write(os.path.basename(path) + "\n")

    # Run merge asynchronously
    cmd = ["mp4_merge"] + full_paths + ["--out", output_file]
    subprocess.Popen(cmd)

    return {
        "status": "success",
        "message": f"Merge started. Output: {os.path.basename(output_file)}",
    }
