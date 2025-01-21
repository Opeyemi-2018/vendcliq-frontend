import Image from "next/image";
import Link from "next/link";
const Logo = () => {
  return (
    <Link href="/dashboard/home">
      <Image
        src={"/assets/logo/logo.png"}
        alt="Logo"
        width={100}
        height={100}
        className="object-cover"
      />
    </Link>
  );
};

export default Logo;
