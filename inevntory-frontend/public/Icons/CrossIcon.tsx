export default function CrossIcon({
  size,
  height,
  width,
  className,
  ...props
}: {
  size: number;
  height: number;
  className? : string,
  width: number;
}){
  return (
    <svg
      fill="none"
      height={size || height || 24}
      className={className && className}
      width={size || width || 24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
           10-4.48 10-10S17.52 2 12 2zm4.3 13.3c.39.39.39 1.02 
           0 1.41-.39.39-1.02.39-1.41 0L12 13.41l-2.89 2.89c-.39.39-1.02.39-1.41 
           0-.39-.39-.39-1.02 0-1.41L10.59 12 7.7 
           9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 
           1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 
           1.41 0 .39.39.39 1.02 0 1.41L13.41 12l2.89 2.89z"
        fill="red"
      />
    </svg>
  );
};
