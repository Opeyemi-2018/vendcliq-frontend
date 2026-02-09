"use client";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type StoreSales = {
  name: string;
  amount: number;
  percentage: number;
  isHighlighted?: boolean;
};

type ProductSale = {
  name: string;
  image: string;
  amount: number;
  quantity: string;
  time: string;
};

const stores: StoreSales[] = [
  { name: "Adeola Store", amount: 95125000, percentage: 31.7 },
  {
    name: "Olaoluwa Store",
    amount: 87150250,
    percentage: 29,
    isHighlighted: true,
  },
  { name: "Hephzibah Store", amount: 72200500, percentage: 24 },
  { name: "Gods Glory Store", amount: 46025000, percentage: 15.3 },
];

const products: ProductSale[] = [
  {
    name: "Viju Orange",
    image: "/images/viju-orange.png",
    amount: 23000,
    quantity: "10 packs",
    time: "May 22nd, 15:12",
  },
  {
    name: "Coca-Cola",
    image: "/images/coca-cola.png",
    amount: 23000,
    quantity: "10 packs",
    time: "May 22nd, 15:12",
  },
  {
    name: "Viju Youghurt",
    image: "/images/viju-youghurt.png",
    amount: 95000,
    quantity: "5 packs",
    time: "May 22nd, 15:12",
  },
  {
    name: "Viju Orange",
    image: "/images/viju-orange.png",
    amount: 23000,
    quantity: "10 packs",
    time: "May 22nd, 15:12",
  },
  {
    name: "Pepsi",
    image: "/images/pepsi.png",
    amount: 95000,
    quantity: "5 packs",
    time: "May 22nd, 15:12",
  },
  {
    name: "Viju Youghurt",
    image: "/images/viju-youghurt.png",
    amount: 95000,
    quantity: "5 packs",
    time: "May 22nd, 15:12",
  },
];
const SalesBreakdown = () => {
  const totalSales = 300500750;
  const period = "Mar 30 - Apr 06";

  const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
  return (
    <div className="text-[#2F2F2F] font-dm-sans">
      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          Sales Breakdown by Store
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          See how your stores made the total sales{" "}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        <div className="md:p-6 lg:border border-[#E4E4E4] md:rounded-lg bg-white w-full lg:w-[40%]">
          <div className="mb-3 md:mb-5">
            <h2 className="font-semibold mb-2">
              Total Sales: {formatNaira(totalSales)} • {period}
            </h2>

            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
          </div>

          <div className="space-y-5">
            {stores.map((store) => (
              <div
                key={store.name}
                className={`p-4 rounded-lg transition-colors ${
                  store.isHighlighted
                    ? "bg-[#0A6DC012] border border-[#0A6DC0]"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex  justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/store.svg"
                      alt="store"
                      width={24}
                      height={24}
                      className=""
                    />
                    <div>
                      <p className="font-bold text-[13px] md:text-[16px] ">
                        {store.name}
                      </p>
                      <p className="text-[13px] text-[#9E9A9A]">
                        {store.percentage}% of total sales
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-[13px] md:text-[16px] ">
                    {formatNaira(store.amount)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0A6DC0] rounded-full"
                    style={{ width: `${store.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD - Top Products in Selected Store */}
        <div className="w-full lg:w-[60%] md:p-6 lg:border border-[#E4E4E4] md:rounded-lg bg-white">
          <div className="mb-3 md:mb-5">
            <h2 className="text-[13px] md:text-[16px] font-semibold font-clash mb-2">
              Products Sold In Store
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
          </div>
          <div className="">
            <h2 className="text-[18px] md:text-[25px] font-regular font-clash">
              Olaoluwa Store - {formatNaira(87150250)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              See what you sold to make profit in this store
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mt-3">
            {products.map((product, idx) => (
              <div
                key={idx}
                className="flex justify-between py-2 border border-[#D8D8D866] p-5 rounded-lg transition-colors"
              >
                {/* Product image placeholder */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      {product.name.charAt(0)}
                    </div>
                    {/* Example: <img src={product.image} alt={product.name} className="w-full h-full object-contain" /> */}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] md:text-[16px] truncate">
                      {product.name}
                    </p>
                    <p className="text-[13px] md:text-[16px]">
                      {product.quantity}
                    </p>
                    <p className="text-[13px] text-[#9E9A9A]">{product.time}</p>
                  </div>
                </div>

                <p className="font-medium ">{formatNaira(product.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesBreakdown;
