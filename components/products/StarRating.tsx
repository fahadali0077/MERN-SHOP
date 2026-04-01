interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

export function StarRating({ rating, reviewCount }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-label={`${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = rating >= i + 1;
          const half   = !filled && rating >= i + 0.5;
          return (
            <svg key={i} viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
              <polygon
                points="6,1 7.5,4.5 11,4.5 8.5,7 9.5,11 6,8.5 2.5,11 3.5,7 1,4.5 4.5,4.5"
                fill={filled ? "#d97706" : half ? "url(#half)" : "none"}
                stroke={filled || half ? "#d97706" : "#e2dbd2"}
                strokeWidth="0.8"
              />
              {half && (
                <defs>
                  <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
            </svg>
          );
        })}
      </div>
      <span className="text-[11px] tabular text-ink-muted">
        {rating.toFixed(1)} <span className="text-border">·</span> {reviewCount.toLocaleString()}
      </span>
    </div>
  );
}
