const ContentOptionCard = ({ option, selected, onSelect }) => {
  return (
    <div
      className={`card h-100 shadow-sm content-option-card ${
        selected ? 'border-primary border-2' : ''
      }`}
      onClick={() => onSelect(option)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(option)}
      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-light text-dark border">
            <i className="bi bi-stars me-1 text-warning"></i>AI Option
          </span>
          {selected && (
            <span className="badge bg-primary">
              <i className="bi bi-check-lg me-1"></i>Selected
            </span>
          )}
        </div>
        <p className="mb-2 flex-grow-1">{option.caption}</p>
        <p className="text-primary small mb-0">{option.hashtags}</p>
      </div>
    </div>
  );
};

export default ContentOptionCard;