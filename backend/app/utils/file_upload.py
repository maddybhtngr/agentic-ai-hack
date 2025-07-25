import os
import shutil
from pathlib import Path
from fastapi import UploadFile
import uuid

class FileUploadManager:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent / "data" / "attendees"
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def save_profile_photo(self, file: UploadFile, username: str) -> str:
        """
        Save profile photo for an attendee
        
        Args:
            file: Uploaded file
            username: Username of the attendee
            
        Returns:
            str: Relative path to the saved file
        """
        try:
            # Validate file type
            if not file.content_type.startswith('image/'):
                raise ValueError("File must be an image")
            
            # Create filename with username and unique suffix
            file_extension = Path(file.filename).suffix.lower()
            if file_extension not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                file_extension = '.jpg'  # Default to jpg
            
            filename = f"{username}{file_extension}"
            file_path = self.base_path / filename
            
            # Save the file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Try to optimize image if Pillow is available
            try:
                self._optimize_image(file_path)
            except ImportError:
                print("Pillow not available, skipping image optimization")
            
            # Return relative path for storage in JSON
            return f"data/attendees/{filename}"
            
        except Exception as e:
            print(f"Error saving profile photo: {str(e)}")
            raise e
    
    def _optimize_image(self, file_path: Path):
        """
        Optimize image for web use (optional - requires Pillow)
        """
        try:
            from PIL import Image
            
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large (max 500x500)
                max_size = (500, 500)
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, 'JPEG', quality=85, optimize=True)
                
        except ImportError:
            print("Pillow not installed, skipping image optimization")
        except Exception as e:
            print(f"Error optimizing image: {str(e)}")
            # Continue even if optimization fails
    
    def delete_profile_photo(self, file_path: str):
        """
        Delete profile photo file
        
        Args:
            file_path: Relative path to the file
        """
        try:
            full_path = Path(__file__).parent.parent / file_path
            if full_path.exists():
                full_path.unlink()
        except Exception as e:
            print(f"Error deleting profile photo: {str(e)}")
    
    def get_file_url(self, file_path: str) -> str:
        """
        Get URL for the file (for frontend display)
        
        Args:
            file_path: Relative path to the file
            
        Returns:
            str: URL path for the file
        """
        if not file_path:
            return ""
        return f"/static/{file_path}" 