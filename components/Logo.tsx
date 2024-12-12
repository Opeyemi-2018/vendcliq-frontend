import Image from "next/image";

const Logo = () => {
  return (
    <Image
      src={"/assets/logo/logo.png"}
      alt="Logo"
      width={100}
      height={100}
      className="object-cover"
    />
  );
};

export default Logo;
