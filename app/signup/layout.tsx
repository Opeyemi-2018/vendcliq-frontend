import Image from "next/image";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-smooth relative">
      <div className="text-black absolute left-20 top-10">
        <Image
          src={"/assets/logo/logo.png"}
          alt=""
          width={150}
          height={100}
          className="object-cover"
        />
      </div>
      <div className="">
        <main className="">{children}</main>
      </div>
    </div>
  );
}
