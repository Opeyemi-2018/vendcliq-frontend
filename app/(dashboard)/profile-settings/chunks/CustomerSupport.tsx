"use client";

import { Separator } from "@/components/ui/separator";
import { TbWorld } from "react-icons/tb";
import Image from "next/image";
import { BiLogoWhatsapp } from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const CustomerSupport = () => {
  return (
    <div className="">
      <div className="">
        <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
          Customer Support
        </h1>
        <Separator
          orientation="horizontal"
          className="h-[1px] mt-3"
          style={{ background: "#E0E0E0" }}
        />
        <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
          Get help easily through our live chat feature or message us on our
          social media platforms
        </p>
      </div>

      <div className="flex items-center justify-center flex-col">
        <Image
          src={"/call.svg"}
          width={30}
          height={30}
          alt="call center"
          className="w-[480px] h-[299px] -mt-10 -md:mt-0"
        />
        <h1 className="font-semibold -mt-10 font-clash text-[16px] md:text-[20px]">
          We are here to support you!
        </h1>
      </div>

      <div className="bg-[#E6E6E6AA] mt-6 p-5 rounded-lg flex flex-col  justify-center items-center gap-3">
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/vendcliq"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={22} color="#F35355" />
          </a>
          <a
            href="https://x.com/vendcliq"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter size={22} color="#000000c" />
          </a>
          <a
            href="https://www.facebook.com/groups/1080464810962647"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <FaFacebook size={22} color="#0866FF" />
          </a>
        </div>
        <div>
          <p className="font-medium text-[16px] font-dm-sans text-[#2F2F2F] flex items-center gap-2">
            <a
              href="https://vendcliq.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TbWorld size={22} color="#0A6DC0" />
            </a>{" "}
            Follow us on all social media
          </p>
        </div>
      </div>

      <a
        href="https://wa.me/2348130293442"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] p-6 flex gap-3 items-center mt-6 cursor-pointer hover:opacity-90 transition"
      >
        <div className="bg-white p-2 rounded-full">
          <BiLogoWhatsapp size={22} color="#25D366" />
        </div>

        <div>
          <h1 className="text-white font-medium font-dm-sans">
            WhatsApp Support
          </h1>
          <p className="text-[10px] font-dm-sans text-white">
            Chat with us on WhatsApp 
          </p>
        </div>
      </a>
    </div>
  );
};

export default CustomerSupport;
