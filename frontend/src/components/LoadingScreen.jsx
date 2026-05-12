export default function LoadingScreen({ message = "Loading cadastral parcels..." }) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
