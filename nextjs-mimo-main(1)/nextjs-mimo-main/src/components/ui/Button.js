import Link from 'next/link';

export default function Button({ children, href, variant = 'primary', onClick, className = '', ...props }) {
  const baseStyles = "font-medium py-2 px-4 rounded-md transition-colors";
  
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-indigo-600 hover:bg-indigo-50"
  };
  
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  if (href) {
    return (
      <Link href={href} className={buttonStyles} {...props}>
        {children}
      </Link>
    );
  }
  
  return (
    <button className={buttonStyles} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
