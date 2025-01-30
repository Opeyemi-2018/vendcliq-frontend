import Image from "next/image";
import Link from "next/link";
const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/dashboard/home">
      <Image
        src={"/assets/logo/logo.png"}
        alt="Logo"
        width={100}
        height={100}
        className={`object-cover ${className}`}
      />
    </Link>
  );
};

export default Logo;
