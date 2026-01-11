interface BookCoverProps {
  src?: string | null;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookCover({ src, title, size = 'md' }: BookCoverProps) {
  const sizes = {
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-32 h-48',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className={`${sizes[size]} object-cover rounded-md shadow-md`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-md shadow-md flex items-center justify-center p-2`}
    >
      <span className="text-indigo-600 text-xs text-center font-medium line-clamp-3">
        {title}
      </span>
    </div>
  );
}
