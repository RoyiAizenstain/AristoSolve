export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      <span className="page-loader-text">{message}</span>
    </div>
  );
}
