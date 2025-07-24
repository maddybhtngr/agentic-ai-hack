import numpy as np
import math
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app
import os
import json
import uuid  # For generating unique IDs if needed
import asyncio  # Import asyncio

# For plotting the heatmap
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from google.cloud.firestore_v1 import GeoPoint

os.environ['FIREBASE_SERVICE_ACCOUNT_KEY_PATH'] = './home/key.json'
# --- Firebase Configuration ---
# These variables are provided by the Canvas environment at runtime.
# If running locally, you'll need to provide a service account key.
app_id = os.environ.get('__app_id', 'default-app-id')  # Fallback for local testing
firebase_config_str = os.environ.get('__firebase_config', '{}')  # Fallback for local testing
initial_auth_token = os.environ.get('__initial_auth_token')  # Fallback for local testing

# For local testing, ensure 'key.json' is in the same directory or adjust path
# IMPORTANT: In a production environment, use environment variables or Cloud IAM roles
# for service account keys, do NOT hardcode them or commit to public repos.
# os.environ['FIREBASE_SERVICE_ACCOUNT_KEY_PATH'] = 'key.json' # Uncomment for local testing if needed

db = None  # Initialize db as None
try:
    if firebase_config_str and firebase_config_str != '{}':
        firebase_config = json.loads(firebase_config_str)
        # Use a dummy credential for firebase_admin.initialize_app if running in Canvas
        # as the actual authentication is handled by signInWithCustomToken.
        # For local, you'd load a service account key.
        if not firebase_admin._apps:  # Initialize only once
            # cred = credentials.Certificate({
            #     "projectId": firebase_config.get("projectId"),
            #     "privateKey": "dummy-key",  # Placeholder, actual auth via token
            #     "clientEmail": "dummy@example.com"
            # })
            # firebase_admin.initialize_app(cred, {'projectId': firebase_config.get("projectId")})
            cred = credentials.Certificate("./home/key.json")
            firebase_admin.initialize_app(cred)
        db = firestore.client(database_id="agentic-ai-hackathon")
        print("Firebase app initialized using Canvas environment config.")
    else:
        # Fallback for local development: Load service account key from file
        # IMPORTANT: Replace 'path/to/your/serviceAccountKey.json' with your actual path
        # and ensure this file is securely stored and NOT committed to public repos.
        # For production, use environment variables or Cloud IAM roles.
        service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            db = firestore.client(database_id="agentic-ai-hackathon")

            print("Firebase app initialized using local service account key.")
        else:
            print("Warning: Firebase not initialized. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH "
                  "environment variable for local testing, or ensure __firebase_config "
                  "is provided in a Canvas environment.")
            db = None  # Set db to None if initialization fails
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    db = None

# Define the Firestore collection path (using the user's provided path 'geolocations')
CROWD_COLLECTION_PATH = f"geolocations"


def generate_random_lat_lng_in_square(
        center_lat: float,
        center_lon: float,
        field_area_sq_ft: float,
        num_points: int
) -> list[tuple[float, float]]:
    """
    Generates random latitude and longitude points within a square field.

    Args:
        center_lat (float): Latitude of the center of the square field.
        center_lon (float): Longitude of the center of the square field.
        field_area_sq_ft (float): The area of the square field in square feet.
        num_points (int): The number of random points to generate.

    Returns:
        list[tuple[float, float]]: A list of (latitude, longitude) tuples.
    """
    field_area_sq_m = field_area_sq_ft * 0.092903
    print(f"Field area: {field_area_sq_ft:.2f} sq ft = {field_area_sq_m:.2f} sq meters")

    side_length_m = math.sqrt(field_area_sq_m)
    half_side_m = side_length_m / 2
    print(f"Side length of the square: {side_length_m:.2f} meters")

    lat_to_m = 111139.0
    lon_to_m_at_center_lat = 111320.0 * math.cos(math.radians(center_lat))

    if lon_to_m_at_center_lat == 0:
        print("Warning: Center latitude is at or very near a pole, longitude conversion will be inaccurate.")
        lon_to_m_at_center_lat = 0.000001

    random_x_offsets_m = np.random.uniform(-half_side_m, half_side_m, num_points)
    random_y_offsets_m = np.random.uniform(-half_side_m, half_side_m, num_points)

    delta_lat_degrees = random_y_offsets_m / lat_to_m
    delta_lon_degrees = random_x_offsets_m / lon_to_m_at_center_lat

    generated_lats = center_lat + delta_lat_degrees
    generated_lons = center_lon + delta_lon_degrees

    points = list(zip(generated_lats, generated_lons))
    return points


async def push_locations_to_firestore(locations: list[tuple[float, float]], batch_id: str):
    """
    Pushes a list of (latitude, longitude) points to Firestore.
    Each point is stored as a separate document with a GeoPoint field.

    Args:
        locations (list[tuple[float, float]]): The list of (latitude, longitude) tuples.
        batch_id (str): A unique identifier for this batch (used for logging, not document ID).
    """
    if db is None:
        print("Firestore client not initialized. Cannot push data.")
        return

    print(f"\nAttempting to push {len(locations)} locations to Firestore under batch ID: {batch_id}")

    try:
        collection_ref = db.collection(CROWD_COLLECTION_PATH)

        # Use a batch write for efficiency if pushing many documents
        batch = db.batch()
        count = 0
        for lat, lon in locations:
            # Each location is a separate document with a 'location' GeoPoint field
            doc_ref = collection_ref.document()  # Let Firestore auto-generate document ID
            print("doc ref: ", doc_ref)
            batch.set(doc_ref, {
                'timestamp': firestore.SERVER_TIMESTAMP,
                'location': GeoPoint(lat, lon),
                'user_id': uuid.uuid4().hex  # A unique ID for each point
            })
            count += 1
            if count % 500 == 0:  # Commit every 500 operations
                await batch.commit()
                batch = db.batch()  # Start a new batch

        # Commit any remaining operations in the last batch
        if count % 500 != 0 or count == 0:
            await batch.commit()

        print(f"Successfully pushed {len(locations)} locations to collection '{CROWD_COLLECTION_PATH}'.")
    except Exception as e:
        print(f"Error pushing locations to Firestore: {e}")


def fetch_geolocation_data_from_firestore(db_client: firestore.Client, collection_path: str) -> list[
    tuple[float, float]]:
    """
    Fetches latitude and longitude data from Firestore.
    Assumes each document has a 'location' field of type GeoPoint.

    Args:
        db_client (firestore.Client): The initialized Firestore client.
        collection_path (str): The path to the Firestore collection containing location data.

    Returns:
        list[tuple[float, float]]: A list of (latitude, longitude) tuples.
    """
    if db_client is None:
        print("Firestore client is not initialized. Cannot fetch data.")
        return []

    locations = []
    try:
        docs = db_client.collection(collection_path).stream()

        for doc in docs:
            data = doc.to_dict()
            # Check if 'location' field exists and is a GeoPoint
            if data and 'location' in data and isinstance(data['location'], GeoPoint):
                locations.append((data['location'].latitude, data['location'].longitude))
        print(f"Fetched {len(locations)} location points from Firestore for heatmap generation.")
    except Exception as e:
        print(f"Error fetching data from Firestore: {e}")
    return locations


def create_density_grid(
        locations: list[tuple[float, float]],
        min_lat: float, max_lat: float,
        min_lon: float, max_lon: float,
        grid_size_degrees: float  # Size of each grid segment in degrees (e.g., 0.01 degrees)
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Creates a density grid from a list of geolocation points.

    Args:
        locations (list[tuple[float, float]]): List of (latitude, longitude) tuples.
        min_lat (float): Minimum latitude for the grid area.
        max_lat (float): Maximum latitude for the grid area.
        min_lon (float): Minimum longitude for the grid area.
        max_lon (float): Maximum longitude for the grid area.
        grid_size_degrees (float): The size of each square grid cell in degrees.

    Returns:
        tuple[np.ndarray, np.ndarray, np.ndarray]:
            - lons_grid (ndarray): 2D array of grid cell longitudes (centers).
            - lats_grid (ndarray): 2D array of grid cell latitudes (centers).
            - density_data (ndarray): 2D array of density counts for each grid cell.
    """
    # Define grid boundaries and number of cells
    # Ensure bins cover the full range including max_lat/lon
    lon_bins = np.arange(min_lon, max_lon + grid_size_degrees, grid_size_degrees)
    lat_bins = np.arange(min_lat, max_lat + grid_size_degrees, grid_size_degrees)

    # Use numpy.histogram2d to count points in each bin
    # Note: histogram2d returns counts for bins, so its dimensions are (len(lat_bins)-1, len(lon_bins)-1)
    # The order is (y_edges, x_edges) or (lat_edges, lon_edges)
    density_data, _, _ = np.histogram2d(
        [loc[0] for loc in locations],  # latitudes
        [loc[1] for loc in locations],  # longitudes
        bins=[lat_bins, lon_bins]
    )

    # Transpose density_data to match (lon, lat) order for pcolormesh
    # pcolormesh expects (X, Y, C) where X and Y are meshgrid-like
    density_data = density_data.T

    # Create meshgrid for plotting (center of each bin)
    lons_grid, lats_grid = np.meshgrid(
        (lon_bins[:-1] + lon_bins[1:]) / 2,  # Center longitudes of bins
        (lat_bins[:-1] + lat_bins[1:]) / 2  # Center latitudes of bins
    )

    print(f"Created density grid with shape {density_data.shape}. Max density: {density_data.max()}")
    return lons_grid, lats_grid, density_data


def plot_density_heatmap(
        lons_grid: np.ndarray,
        lats_grid: np.ndarray,
        density_data: np.ndarray,
        plot_title: str = "Geolocation Density Heatmap",
        cbar_label: str = "Point Density",
        cmap_name: str = 'YlOrRd',  # 'hot_r', 'YlOrRd', 'plasma' are good for density
        projection: ccrs.Projection = ccrs.PlateCarree()
):
    """
    Generates a heatmap of geolocation point density.

    Args:
        lons_grid (np.ndarray): 2D array of grid cell longitudes.
        lats_grid (np.ndarray): 2D array of grid cell latitudes.
        density_data (np.ndarray): 2D array of density counts.
        plot_title (str): Title of the plot.
        cbar_label (str): Label for the colorbar.
        cmap_name (str): Name of the matplotlib colormap.
        projection (cartopy.crs.Projection): Cartopy projection for the map.
    """
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(1, 1, 1, projection=projection)

    # Set the extent of the map based on the grid boundaries
    ax.set_extent([lons_grid.min(), lons_grid.max(), lats_grid.min(), lats_grid.max()], crs=ccrs.PlateCarree())

    # Plot the heatmap
    # Use pcolormesh for gridded data. transform=ccrs.PlateCarree() is crucial.
    # vmin/vmax can be set to normalize color scale, e.g., vmin=0, vmax=density_data.max()
    mesh = ax.pcolormesh(lons_grid, lats_grid, density_data, cmap=cmap_name, transform=ccrs.PlateCarree())

    # Add geographical features
    ax.add_feature(cfeature.COASTLINE, linewidth=0.8)
    ax.add_feature(cfeature.BORDERS, linestyle=':', linewidth=0.5)
    ax.add_feature(cfeature.STATES, linestyle=':', linewidth=0.3, edgecolor='gray')  # For US states
    ax.add_feature(cfeature.LAND, edgecolor='black', facecolor=cfeature.COLORS['land'])
    ax.add_feature(cfeature.OCEAN, edgecolor='black', facecolor=cfeature.COLORS['water'])

    # Add gridlines
    gl = ax.gridlines(draw_labels=True, dms=True, x_inline=False, y_inline=False)
    gl.top_labels = False  # Hide labels on top
    gl.right_labels = False  # Hide labels on right

    # Add a colorbar
    cbar = fig.colorbar(mesh, ax=ax, orientation='vertical', pad=0.05, shrink=0.7)
    cbar.set_label(cbar_label, fontsize=12)

    # Set title
    ax.set_title(plot_title, fontsize=16)

    plt.show()


# --- Main Execution ---
if __name__ == "__main__":
    # --- Part 1: Generate and Push New Data to Firestore (Optional, for populating DB) ---
    # You can comment out this section if your Firestore already has data
    # and you only want to generate the heatmap from existing data.
    crowd_locations_to_push = None

    if db:  # Only attempt to push if Firestore was initialized
        example_center_lat = 34.052235  # Example: Los Angeles
        example_center_lon = -118.243683  # Example: Los Angeles
        field_dimension_sq_ft = 200000  # 20,000 square feet
        number_of_people = 10000  # Number of points to generate and push

        print(f"Generating {number_of_people} random points within a {field_dimension_sq_ft} sq ft square field.")
        print(f"Centered at Latitude: {example_center_lat}, Longitude: {example_center_lon}")

        crowd_locations_to_push = generate_random_lat_lng_in_square(
            center_lat=example_center_lat,
            center_lon=example_center_lon,
            field_area_sq_ft=field_dimension_sq_ft,
            num_points=number_of_people
        )

        print("\n--- Generated Crowd Locations (first 5 points to push) ---")
        for i, (lat, lon) in enumerate(crowd_locations_to_push[:5]):
            print(f"Point {i + 1}: Lat={lat:.6f}, Lon={lon:.6f}")

        print(f"\nTotal points generated for push: {len(crowd_locations_to_push)}")

        # Check if an asyncio event loop is already running
        # try:
        #     loop = asyncio.get_running_loop()
        # except RuntimeError:  # No running loop
        #     loop = None
    #
    #     if loop and loop.is_running():
    #         loop.create_task(push_locations_to_firestore(crowd_locations_to_push, f"crowd_batch_{uuid.uuid4().hex}"))
    #         print("Scheduled Firestore push on existing event loop.")
    #     else:
    #         asyncio.run(push_locations_to_firestore(crowd_locations_to_push, f"crowd_batch_{uuid.uuid4().hex}"))
    #         print("Completed Firestore push using new event loop.")
    # else:
    #     print("\nSkipping Firestore data generation and push: Firestore client not initialized.")
    #     print("Please ensure Firebase Admin SDK credentials are set up for data push.")

    # --- Part 2: Fetch Data from Firestore and Generate Heatmap ---
    if db is None:
        print("\nCannot generate heatmap: Firestore client not initialized for data retrieval.")
    else:
        print("\nFetching geolocation data from Firestore for heatmap generation...")
        # all_locations = fetch_geolocation_data_from_firestore(db, CROWD_COLLECTION_PATH )
        all_locations = crowd_locations_to_push

        if not all_locations:
            print("No location data found in Firestore. Heatmap cannot be generated.")
            print("Please ensure your Python script is pushing data to the correct collection.")
        else:
            # Determine the geographical extent from the fetched data
            lats = [loc[0] for loc in all_locations]
            lons = [loc[1] for loc in all_locations]
            # Define the area for the heatmap (can be slightly larger than data extent)
            # Add a small buffer to min/max to ensure all points are covered and map looks good
            area_min_lat = min(lats) - 0.1
            area_max_lat = max(lats) + 0.1
            area_min_lon = min(lons) - 0.1
            area_max_lon = max(lons) + 0.1

            # Define grid segment size (e.g., 0.005 degrees for a reasonable resolution)
            # This value will determine the "pixel" size of your heatmap cells.
            # Smaller values = finer grid, more computation.
            grid_segment_size = 0.00005  # Example: approx 0.5 km at equator for each cell

            print(
                f"\nCreating density grid over area: Lat [{area_min_lat:.2f}, {area_max_lat:.2f}], Lon [{area_min_lon:.2f}, {area_max_lon:.2f}]")
            print(f"Grid segment size: {grid_segment_size} degrees.")

            # Create the density grid
            lons_density, lats_density, density_data = create_density_grid(
                all_locations,
                area_min_lat, area_max_lat,
                area_min_lon, area_max_lon,
                grid_segment_size
            )

            # Plot the density heatmap
            plot_density_heatmap(
                lons_density, lats_density, density_data,
                plot_title="Crowd Density Heatmap from Firestore Data",
                cbar_label="Number of People",
                cmap_name='YlOrRd'  # Yellow-Orange-Red sequential colormap
            )